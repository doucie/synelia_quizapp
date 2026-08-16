# Note — Règles anti-triche du quiz & fluidité du parcours candidat

**Date :** 2026-08-12
**Statut :** Vague 1 implémentée et testée (chantiers A.1, A.2, A.3 + reliquats 420) — Vague 2 (anti-triche paliers 1+2, chantiers B/C) implémentée et testée (§ 8bis), doc BD + cahier des charges + spec `QuizComponent` faits, reste recette manuelle (§ 8).
**Périmètre :** `SecurityConfig`, `ApplicationsController` / `ApplicationsBusiness`, `ApplicationQuizAttempt`, `app_config`, `campaigns`, `QuizComponent`, page `/campagnes` et `/postuler/campagne/:campaignId`, cartographie `public/*`, migrations Flyway, mini-BD

> Cette note complète la 440 (pipeline personnalisable) : elle couvre le **parcours candidat côté public** — corrections de sécurité/fluidité, règles anti-triche du quiz activables depuis la configuration générale, et mise à jour des écarts cartographie.

## 1. Verdict actuel du parcours candidat

Le parcours est **fonctionnel dans son architecture** et vérifié dans le code :

- **Postulation** : libre (campagne publique via `/campagnes` → `/postuler/campagne/:campaignId`) ou par code recruteur (`/postuler/:sourceToken`, 6 caractères). Endpoint `POST /applications/create` public (`SecurityConfig.java:41`).
- **Formulaire** : identité, email, téléphone, date de naissance, CV (≤ 5 Mo, optionnel back), lettre de motivation, consentement légal obligatoire pour un public (`ApplicationsBusiness.create` L195-431).
- **Vérification d'email** : lien `/verify-email/:token` (48 h, `ApplicationsBusiness.java:820-914`), `POST /applications/verify-email` (`ApplicationsController.java:117-125`), pose `emailVerified` + crée la tentative quiz.
- **Pipeline** : piloté par la donnée (template → étapes). Sans quiz, aucune tentative n'est créée et la progression se fait par `advanceToNextStage`/`passStage` + `InterviewsBusiness`/`DecisionBusiness`.
- **Suivi** : portail public `/suivre-candidature` (code de suivi + email) — timeline des étapes, reprise du quiz, réponse aux entretiens, demandes de correction, retrait.
- **Quiz chronométré** : durée = somme des `question_chrono` (+ `chrono_override`), snapshot figé sur la tentative, countdown front, soumission automatique à expiration.

**Quatre faiblesses + un trou anti-triche complet** font l'objet de cette note :

1. **Gap de sécurité critique** : plusieurs endpoints candidats ne sont pas dans la liste publique → vérification d'email et quiz cassés en réel (chantier A.1).
2. **Friction `verify-email` sans quiz** : réponse `hasError=true` avec un message inadapté (A.2).
3. **Aucune limite de tentatives quiz** : le front dit « une seule tentative », rien ne l'applique (A.3).
4. **Expiration du chrono « paresseuse »** : pas de job planifié, statut `EXPIRED` jamais écrit (A.4, backlog).
5. **Zéro anti-triche** : ni front ni back ; champs `screening_*` et statut `EXPIRED` dormeurs (chantier B).

## 2. Décisions retenues

- [x] Corriger le gap de sécurité du parcours candidat **en priorité** (avant toute autre livraison).
- [x] Implémenter les règles anti-triche **paliers 1 + 2** (détection onglet, blocages d'interface, fullscreen) — **pas de proctoring** caméra/capture (palier 3 exclu).
- [x] Politique anti-triche **globale dans `app_config`** + **override par campagne** (cohérent avec `is_timed`/`time_all_forms` déjà sur `campaigns`).
- [x] **Journalisation de chaque événement** anti-triche, visible côté recruteur ; réutiliser les champs dormeurs `screening_mode`/`screening_threshold`/`screening_result`.
- [x] Appliquer une **politique prudente par défaut** (`WARN`) pour ne pas pénaliser les mobiles / nav web.
- [x] Mettre à jour les **écarts cartographie** du parcours candidat (chantier D, fait dans cette note).

## 3. Chantier A — Sécurité et fluidité

### A.1 Sécurité : endpoints candidats publics (critique)

**Problème constaté.** `SecurityConfig.java:37-52` : `.anyRequest().authenticated()` (L52) avec un filtre JWT qui n'authentifie que les requêtes portant un `Bearer` valide (`JwtAuthenticationFilter.java:38-72`). Un visiteur public (sans JWT) est donc refusé sur tout endpoint hors liste `permitAll`. Or la liste publique (L41) ne couvre qu'une partie des endpoints réellement utilisés par le candidat :

| Endpoint réel (contrôleur) | Statut actuel |
|---|---|
| `/applications/create` | ✅ public |
| `/applications/verifyEmail/**` (L41) | ❌ mauvais pattern — le vrai endpoint est **`/verify-email`** (`ApplicationsController.java:117`) → non public |
| `/applications/get-quiz`, `/save-quiz-answer`, `/complete-quiz`, `/touch-quiz` | ❌ absents de la liste (seul `/candidateanswer/**` est public) |
| `/applications/progress` | ❌ absent |
| `/applications/withdraw` | ❌ absent |
| `/applications/track`, `/respond-interview`, `/submit-ask` | ✅ public |

**Checklist :**

- [x] Liste publique extraite dans la constante `SecurityConfig.PUBLIC_APPLICATION_ENDPOINTS` (source de vérité) : `/applications/create`, `/verify-email`, `/get-quiz`, `/save-quiz-answer`, `/complete-quiz`, `/touch-quiz`, `/withdraw`, `/track`, `/respond-interview`, `/submit-ask`.
- [x] Pattern mort `verifyEmail/**` supprimé (le vrai endpoint est `/verify-email`).
- [x] **Arbitrage `/applications/progress`** : reste **protégé** (back-office) — le portail public lit le progress via la réponse de `/track`.
- [x] **Recette** : recette manuelle obligatoire (lien de vérification par email → page quiz → soumission → suivi sans connexion) — prévue avant livraison Vague 1.

### A.2 Message `verify-email` sans étape quiz

`ApplicationsBusiness.java:1039-1053` : quand le template n'a pas d'étape QUIZ, `verifyEmail` répond `hasError=true` avec « Email vérifié, mais aucune étape quiz exploitable pour cette candidature. ».

- [x] Backend (`ApplicationsBusiness.verifyEmail`) : branche « aucune étape QUIZ » → réponse de succès propre (`hasError=false`, `StatusCode.SUCCESS`, message « Email vérifié avec succès »), `trackingCode` posé, `quizToken=null` + flag `hasQuizStage=false`.
- [x] Front (`VerifyEmailComponent`) : lit `application.quizToken ?? application.searchString` (fallback legacy), signal `hasQuizStage` ; redirection `/quiz/:id/:token` si quiz, sinon `/suivre-candidature` (délai 3 s). Spec couverte (`verify-email.spec.ts`).

### A.3 Limite de tentatives quiz

Structure multi-tentatives existante (`application_quiz_attempt` + `createAdditionalQuizAttempt` `ApplicationsBusiness.java:3336-3393`), **politique absente** (aucun `maxAttempts` ; `campaigns.max_apply` limite les candidatures, pas les tentatives). Le texte front « Une seule tentative » (`quiz.html:65`) n'est pas appliqué.

- [x] **Source arbitrée : nouvelle colonne `campaigns.max_attempts`** (défaut 1, migration `V1_083`) — `max_apply` reste le plafond de candidatures (non renommé) ; pas de colonne dupliquée sur l'attempt ; validation `>= 1` au create/update campagne (`CampaignsBusiness`).
- [x] Appliquée dans `createAdditionalQuizAttempt` (`ApplicationsBusiness`, action `CREATE_QUIZ_ATTEMPT`) : tentatives **réellement lancées** (hors reprises) ≥ `max_attempts` → rejet `InvalidEntityException` (« Limite de tentatives quiz atteinte (X). Aucune nouvelle tentative ne peut etre creee. »). Valeur par défaut 1 si la campagne n'en définit pas.
- [x] Affichage côté recruteur : `attemptsUsed`/`maxAttempts` exposés dans le DTO (`applyAttemptLimits` sur `getFullInfos`), badge « Tentatives : X / max » dans la vue candidatures + champ maxAttempts dans la fiche campagne.

### A.4 Backlog (signalé, non prioritaire)

- Expiration du chrono **paresseuse** : détectée sur les prochains appels API seulement (`ApplicationsBusiness.java:1303-1307, 1938-1942, 2234-2238`) ; **aucun job planifié** (seul job : inactivité 15 min, L2257-2277). Envisager un job d'expiration.
- `QuizStatus.EXPIRED` (`QuizStatus.java:23-25`) déclaré mais **jamais assigné** — le réutiliser pour le job d'expiration.

## 4. Chantier B — Règles anti-triche (paliers 1 + 2)

### B.1 Détection de changement d'onglet / fenêtre

- **Front** (`QuizComponent`) : écouter `visibilitychange` (document) + `blur`/`focus` (window) **en plus** du heartbeat existant (`quiz.ts:54-61, 450-503`) ; sur sortie → incrément local + envoi d'un événement au backend (fusionné avec `touch-quiz` ou endpoint dédié).
- **Journalisation** : compteur `tab_switch_count` sur l'attempt + ligne d'événement (`quiz_anti_cheat_event`).
- **Politique configurable** :
  - après **N sorties** (`tabSwitchMaxWarnings`) → **avertissement affiché** au candidat (modal/bandeau « Vous avez quitté le quiz. Cela est journalisé. ») ;
  - après **M sorties** (`tabSwitchMaxActions`) → **soumission automatique** (`completeQuizRequest(true)`) selon la politique (`WARN`/`FLAG`/`FAIL`).
- **Backend** : chaque `get-quiz`/`save-quiz-answer`/`touch-quiz` valide les compteurs et applique la politique ; réutiliser les champs dormeurs `screening_mode`/`screening_threshold`/`screening_result` (`ApplicationQuizAttempt.java:38-45`).

### B.2 Blocage copier-coller / clic droit / raccourcis

- **Front** : pendant la session, bloquer `contextmenu`, `copy`/`paste`/`cut` (et sélection si `blockCopyPaste`), raccourcis `Ctrl+C/V/X/P` (`blockShortcuts`), compat mobile (`touchstart`).
- **Prudence** : ne pas bloquer le cœur du formulaire — uniquement l'écran de quiz ; respecter l'accessibilité (éviter de bloquer la sélection si possible, ou le rendre configurable).

### B.3 Fullscreen demandé + détection de sortie

- **Front** : à l'ouverture du quiz, demander le plein écran (`fullscreenRequired`) ; détecter `fullscreenchange` → sortie = événement journalisé, avertissement, puis politique (comme B.1).
- **Backend** : compteur `fullscreen_exit_count` (optionnel) — peut être fusionné dans le même flux d'événements.

### B.4 Détection multi-onglets (une seule session de tentative)

- **Front** : marquer la session active (ex. `sessionStorage` / `localStorage` partagé par tentative) ; si un second onglet ouvre la même tentative → flag/avertissement (ou blocage).
- **Backend** : `lastActivityAt` déjà suivi (`touchQuizLastActivity`) → un second appareil/onglet actif sur la même tentative = événement `MULTI_SESSION`, appliquer la politique.

### B.5 Journalisation (table `quiz_anti_cheat_event`)

- Colonnes proposées : `id`, `application_quiz_attempt_id` FK, `event_type` (TAB_SWITCH / FULLSCREEN_EXIT / COPY_PASTE / MULTI_SESSION / …), `occurred_at`, `metadata` (page/question, durée d'absence…), `is_deleted`, audit.
- Compteurs dénormalisés sur `application_quiz_attempt` (`tab_switch_count`, `fullscreen_exit_count`, `cheat_flag_count`) pour lecture rapide recruteur.
- **Visibilité recruteur** : liste des événements + drapeau sur la tentative dans le dashboard candidature (vue « tentative » existante `buildApplicationQuizAttemptSummaries`).

### B.6 Réaction backend et politique

- Politiques : `WARN` (avertir), `FLAG` (marquer pour revue, aucune pénalité), `FAIL` (soumission automatique + note sur le progress). Défaut **`WARN`**.
- La soumission forcée doit repasser par le flux `completeQuizInternal` existant (`ApplicationsBusiness.java:2958-2982`) pour conserver score/statuts.

## 5. Chantier C — Configuration générale (activation depuis l'app)

La table `app_config` et la page Settings (onglet « config ») existent (`AppConfig.java`, `settings.html:499-562`) mais **sans aucun réglage anti-triche**.

- [x] **Colonnes `app_config`** :
  - `anti_cheat_enabled` bit — interrupteur global ;
  - `screening_policy` varchar — `WARN` / `FLAG` / `FAIL` (défaut `WARN`) ;
  - `tab_switch_max_warnings` int (défaut 3) ;
  - `tab_switch_max_actions` int (défaut 5) ;
  - `fullscreen_required` bit ;
  - `block_shortcuts` bit ; `block_copy_paste` bit.
- [x] **Override `campaigns`** : `anti_cheat_enabled` bit nullable (null → suit le global), cohérent avec `is_timed`/`time_all_forms` déjà sur la campagne (`Campaigns.java:78-91`).
- [x] **UI** : onglet « config » de Settings + section dans la fiche campagne ; libellés explicites côté candidat pour les avertissements.
- [x] Couplage avec la 440 Lot C (règles de notification éditables) : aucun impact direct, les deux restent orthogonaux.

## 6. Chantier D — Mise à jour cartographie parcours candidat (fait dans cette note)

Écart constaté : le code public a **dépassé la doc** — `/campagnes` liste désormais les campagnes publiques avec postulation directe, alors que la fiche 20 affirmait « la page ne liste aucune campagne ».

- [x] `_inventaire-routes.md` : ajouter la route `/postuler/campagne/:campaignId` (absente, seul `/postuler/:sourceToken` était listé).
- [x] `public/20-campagnes-publiques.md` : réécrire l'état constaté (catalogue + badge Ouverte/Code requis + bouton Postuler + panneau code recruteur + suivi).
- [x] `public/70-postuler-source-token.md` : aligner sur le composant partagé `ApplyPositionComponent` (deux modes d'entrée) et documenter le mode campagne ouverte.

## 7. Schéma / migrations

Script SQL de référence : `quizapp/src/main/resources/db/migration/V1_084__add_quiz_anti_cheat_schema.sql` (`V1_083` est pris par la Vague 1 `max_attempts`).

- [x] **Vague 1** : `ALTER TABLE campaigns` : ADD `max_attempts` int NOT NULL DEFAULT 1 (`V1_083__add_campaigns_max_attempts.sql`, migration séparée de la Vague 2).
- [x] **Vague 2** : `CREATE TABLE quiz_anti_cheat_event` (B.5) — `V1_084__add_quiz_anti_cheat_schema.sql` (`search_string` TEXT pour compatibilité utf8mb4, entrée corrigée).
- [x] **Vague 2** : `ALTER TABLE application_quiz_attempt` : `tab_switch_count`, `fullscreen_exit_count`, `cheat_flag_count` (politique portée par les `screening_*` existants).
- [x] **Vague 2** : `ALTER TABLE app_config` : colonnes anti-triche (C).
- [x] **Vague 2** : `ALTER TABLE campaigns` : `anti_cheat_enabled` nullable (C).
- [x] Aucune migration pour les chantiers A.1/A.2 (code + config de sécurité uniquement).

## 8. Checklist transverse

- [x] Builds Vague 1 : `mvnw compile` + tests spring-boot ciblés OK ; `ng build` OK (warnings budgets pré-existants).
- [x] Tests Vague 1 : `ApplicationsBusinessTest` (17/17 : verify-email sans quiz, verify-email avec quiz, `createAdditionalQuizAttempt` rejet/succès, `applyAttemptLimits`), `SecurityConfigTest` (3/3 : endpoints candidats publics, pas d'exposition recruiter/interne, aucun pattern legacy), `verify-email.spec.ts` (6/6 : succès sans quiz, quiz, fallback legacy, erreurs).
- [x] Tests Vague 2 : `ApplicationsBusinessTest` 20/20 — 3 tests `applyAntiCheatPolicy_*` (désactivé, WARN persist/incrémente, FAIL soumission forcée) ; `QuizappApplicationTests` (contexte Spring+Flyway) 1/1 ; `ng build` OK. Spec `QuizComponent` : `quiz.spec.ts` 9/9 — anti-triche désactivé, TAB_SWITCH enregistré + envoyé (`touchQuiz`), décompte avertissements WARN → 0, bandeaux WARN/FLAG/FAIL, session bloquée sur erreur `touchQuiz`, copier-coller et raccourcis bloqués (COPY_PASTE).
- [ ] Recette manuelle : parcours candidat complet sans JWT (A.1) ; quiz chronométré à expiration (A.4) ; sorties d'onglet en WARN puis en FAIL (B).
- [x] Documentation : mettre à jour `quizapp_db_documentation_20260810.md` (table `quiz_anti_cheat_event`, colonnes attempt/app_config/campaigns) ; mini-BD `exemples/data.js` (table + colonnes, bloc `cles`) ; cocher les points cahier des charges (`z_mémoire/template_cahier_des_charges/index.html:1293,1311` — détection onglet journalisée + avertissement après N).
- [x] Postman : collections v1/v2 alignées sur les contrats DTO actuels — `interviewStart`→`interviewDate` (9× chaqu'un), `candidateMark`→`globalScore`, `recruiterComment`→`globalComment`, `interviewEnd` supprimé ; JSON valides.
- [x] Note 420 : repointage des reliquats absorbés (lignes 764/784/791/796 → 450, cochées « FAIT dans l'évolution 450 ») ; le scénario d'acceptation multi-occurrences (795) reste un gate de la 420.

## 8bis. Plan d'implémentation détaillé (2 vagues)

Budget acté : **6,5 j backend + 3,5 j frontend**. La correction de sécurité A.1 est prioritaire avant toute autre livraison.

### Vague 1 — Chantier A + reliquats 420 (livrable intermédiaire testable) — ✅ livré

1. **A.1 `SecurityConfig`** — ✅ constante `PUBLIC_APPLICATION_ENDPOINTS` (source de vérité) avec `/verify-email`, `/get-quiz`, `/save-quiz-answer`, `/complete-quiz`, `/touch-quiz`, `/withdraw` (+ `/track`, `/respond-interview`, `/submit-ask`) ; pattern mort `verifyEmail/**` supprimé ; `/applications/progress` reste protégé (back-office). Test : `SecurityConfigTest` (3/3).
2. **A.2 `verify-email` sans quiz** (`ApplicationsBusiness.verifyEmail`) — ✅ succès propre (`hasError=false`, `StatusCode.SUCCESS`, « Email vérifié avec succès »), `trackingCode` posé, `quizToken=null` + `hasQuizStage=false` ; `VerifyEmailComponent` redirige vers `/suivre-candidature` (3 s) au lieu du quiz. Test : `verify-email.spec.ts` (6/6).
3. **A.3 `max_attempts`** — ✅ migration `V1_083__add_campaigns_max_attempts.sql` (`campaigns.max_attempts` NOT NULL DEFAULT 1) ; validation `>= 1` au create/update (`CampaignsBusiness`) ; application dans `createAdditionalQuizAttempt` (rejet si atteint, défaut 1) ; DTO `attemptsUsed`/`maxAttempts` + affichage recruteur (fiche campagne + badge candidatures). Tests : 4 cas dans `ApplicationsBusinessTest`.
4. **Reliquat 420 (token quiz explicite, lignes 764/791)** — ✅ champ `quizToken` sur `ApplicationsDto` (backend `resolveQuizToken` + 4 endpoints quiz) ; front `application.service.ts`/`verify-email.ts`/`apply-position.ts`/`entities-applications.ts` envoient et lisent `quizToken` (fallback `searchString` legacy conservé) ; `quiz.ts` lit `quizData ?? searchString`.
5. **Reliquat 420 (Postman, lignes 784/796)** — ✅ collections v1/v2 alignées sur les contrats DTO : `interviewStart`→`interviewDate`, `candidateMark`→`globalScore`, `recruiterComment`→`globalComment`, `interviewEnd` supprimé.
6. **Tests** — ✅ `ApplicationsBusinessTest` 17/17, `SecurityConfigTest` 3/3, `verify-email.spec.ts` 6/6 ; builds `mvnw compile` + tests spring-boot + `ng build` OK.

### Vague 2 — Chantiers B/C (anti-triche paliers 1 + 2) — ✅ livré

1. **Migration `V1_084`** — ✅ `quiz_anti_cheat_event` (B.5) ; colonnes attempt `tab_switch_count`/`fullscreen_exit_count`/`cheat_flag_count` ; `app_config` (`anti_cheat_enabled` défaut 0, `screening_policy` WARN, `tab_switch_max_warnings` 3, `tab_switch_max_actions` 5, `fullscreen_required` 0, `block_shortcuts` 0, `block_copy_paste` 0) ; `campaigns.anti_cheat_enabled` nullable (null → global). `search_string` en `TEXT` (utf8mb4), entrée d'échec purgée de l'historique Flyway.
2. **Backend B** — ✅ entité/repo/DTO/service `QuizAntiCheatEvent` + journalisation ; résolution de politique (global → override campagne) ; validation des compteurs dans get/save/touch (`applyAntiCheatPolicyOnAccess`) ; soumission forcée via `completeQuizInternal` + 403 `FUNC_REQUEST_FAIL` ; politiques WARN/FLAG/FAIL (défaut WARN) ; `quizData.antiCheat` au client ; `touchQuiz` renvoie les `quizAttempts` rafraîchis.
3. **Backend C** — ✅ `AppConfig` (+8 champs, défauts au create, `validateScreeningPolicy`, update si non null) + Settings onglet config (toggle global, politique, seuils, pleins écran/raccourcis/copier-coller) ; `Campaigns.antiCheatEnabled` + fiche campagne (select tri-état : suit le global / activé / désactivé).
4. **Frontend B** — ✅ `quiz.ts` : `visibilitychange`→`TAB_SWITCH`, sortie fullscreen→`FULLSCREEN_EXIT`+re-tentative, blocage copier-coller/raccourcis selon `blockCopyPaste`/`blockShortcuts`, événements accumulés → `pendingAntiCheatEvents` flushés dans get/save/touch (debounce 2 s), bandeau d'avertissement avec décompte `antiCheatWarningsLeft` (danger à 0), soumission forcée FAIL via `handleBlockingQuizError`.
5. **Visibilité recruteur** — ✅ compteurs + `screeningResult` dans `buildApplicationQuizAttemptSummaries` (vue tentative `entities-applications.html` : badge Anti-triche conforme/signalé/échec + compteurs onglets/plein écran/signalements).
6. **Tests** — ✅ `ApplicationsBusinessTest` 20/20 (3 tests `applyAntiCheatPolicy_*` : désactivé, WARN persist/incrémente, FAIL soumission forcée), `QuizappApplicationTests` 1/1, `ng build` OK. Spec `QuizComponent` (compteurs/avertissement/soumission) et recette manuelle (sorties d'onglet WARN puis FAIL) restent à faire.

### Ordre de livraison

1. Vague 1 → livrable intermédiaire testable (parcours candidat réparé : email, quiz, retrait, suivi).
2. Vague 2 → recette anti-triche complète.
3. **460** (bibliothèque de grilles) ensuite ; le scénario d'acceptation multi-occurrences de la 420 (ligne 795) reste un gate de la 420, pas de la 450.

## 9. Points d'attention

- **Ne pas confondre heartbeat et triche** : le heartbeat 30 s (`quiz.ts`) est fait pour l'abandon (inactivité 15 min) ; la détection d'onglet est un signal distinct — ne pas pénaliser un utilisateur qui revient après un simple changement de fenêtre système.
- **Politique par défaut prudente** (`WARN`) : le changement d'onglet est fréquent (chat, documents de recette) ; ne soumettre automatiquement qu'en `FAIL` ou après `tab_switch_max_actions`.
- **Mobile / tablette** : `visibilitychange` et `blur` se déclenchent à la réception d'un appel ou d'une notification — les seuils doivent en tenir compte.
- **Sécurité côté backend avant tout** : le front est contournable ; le backend doit revalider compteurs et politique à chaque requête quiz.
- **`screening_*` dormeurs** : ne pas créer de colonnes redondantes ; réutiliser `screening_mode/threshold/result` pour porter la politique appliquée.
- **`verify-email` sans quiz** : ne plus renvoyer d'erreur (A.2) — c'est un flux normal pour les pipelines CANDIDATURE → INTERVIEW → DECISION (440 Lot A).
- **Limite de tentatives** : ne pas casser la reprise légitime (non-aléatoire) ni la création admin de tentative ; `max_attempts` compte les tentatives **réellement lancées**, pas les reprises.

## 10. Fichiers cartographie liés

- `cartographie-fonctionnelle-front/evolution/440-evolution-pipeline-personnalisation.md` : pipeline, règles email, permissions — note soeur.
- `cartographie-fonctionnelle-front/_inventaire-routes.md`, `public/20-campagnes-publiques.md`, `public/70-postuler-source-token.md` : mis à jour dans cette note (chantier D).
- `quizapp/src/main/java/tech/synelia/quizapp/config/SecurityConfig.java`, `security/JwtAuthenticationFilter.java`
- `quizapp/src/main/java/tech/synelia/quizapp/rest/api/ApplicationsController.java`, `business/ApplicationsBusiness.java`
- `quizapp/src/main/java/tech/synelia/quizapp/dao/entity/ApplicationQuizAttempt.java`, `AppConfig.java`, `Campaigns.java`, `FormBusiness.java`, `utils/enums/QuizStatus.java`
- `quizapp_front/src/app/pages/quiz/quiz.ts`, `quiz.html`, `pages/verify-email/`, `pages/track-application/`, `pages/campaigns/`, `pages/apply-position/`
- `quizapp_front/src/app/core/services/campaign.service.ts`, `core/services/app-config.service.ts`, `app.routes.ts`
- `quizapp/src/main/resources/db/migration/` : `V1_083__add_quiz_anti_cheat_schema.sql` (à créer à l'implémentation)
- `cartographie-fonctionnelle-front/bd_documentee/quizapp_db_documentation_20260810.md`, `bd_documentee/exemples/data.js`
- `z_mémoire/template_cahier_des_charges/index.html` (L1293, L1311 : exigences anti-triche à cocher)
