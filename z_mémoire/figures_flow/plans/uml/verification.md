# UML — Vérification des exemples de Claude contre le code réel

> Original (`figures_uml_claude.md`, `exemples_claude_svg/`) intact : ce
> fichier ne fait qu’ajouter verdicts et corrections. Vérification menée
> sur le dépôt réel (backend `quizapp/`, front `quizapp_front/`,
> migrations, `docker-compose.yml`, config). Références fichier:ligne.
>
> Verdicts : CONFORME / À CORRIGER (liste) / À REPLANIFIER.

## Socle transversal (vrai pour tous les diagrammes)

- [x] **4 rôles, pas 3** : `UserRole.java:8-12` =
      `SUPER_ADMIN` (`super`), `ADMIN` (`admin`), `RECRUITER` (`recruiter`,
      alias `UTILISATEUR`), `CANDIDATE` (`candidate`). Claude n’a supposé
      que 3 — il manque le **Super admin** (bypass total, `V1_012`,
      `PermissionService:46-59`). Tout diagramme d’acteurs doit le montrer
      (cohérent avec nos fig. 1/6/11).
- [x] **Généralisation Admin→Recruteur : vraie ET fausse.** Vraie au niveau
      Spring-Security (`JwtAuthenticationFilter:51-57` : ADMIN hérite
      `ROLE_RECRUITER`, SUPER des trois). Fausse au niveau fonctionnel
      (`PermissionService:215-239` : ADMIN = plancher propre, pas d’union
      avec RECRUITER). La flèche du global est donc défendable, mais le
      mémoire doit dire dans quel sens (rôles techniques hérités,
      permissions métier séparées) — sinon un lecteur du code criera à
      l’erreur.
- [x] **Pas d’acteur Évaluateur** : aucun `UserRole.EVALUATOR`. Évaluer =
      permission d’entité (`EntityPermissionKey.EVALUATE`) OU participation
      à l’entretien (`EvaluationsBusiness:801-829`). Ne pas créer l’acteur
      (Claude le suggérait en option — à refuser).
- [x] **Emails 100 % synchrones** : aucun `@Async` dans le backend
      (`QuizappApplication` : seul `@EnableScheduling`). L’exemple de la
      règle 6 (message asynchrone « si ton API le fait en @Async ») est
      **faux pour ce projet** — les séquences doivent montrer des appels
      synchrones bloquants (+ `mail_log` en échec si pas de SMTP actif).
- [x] **SMTP externe configurable, inactif par défaut** : table
      `smtp_config` (`V1_004:30-52`, port défaut 587, STARTTLS), aucune
      ligne seedée, `HostingUtils:82-107` exige une config active sinon
      erreur. L’acteur « Serveur SMTP » est donc correct, mais tout scénario
      avec email doit mentionner la précondition « config SMTP active ».
- [x] **API tout-en-POST** (`POST /entity/action`, `{user, datas[]}`) :
      aucun `GET /quiz/start`, `POST /answers` façon REST classique.
- [x] **Backend port 8085, pas 8080** (`application-local.properties:54` ;
      8080 seulement dans un template générique). Front `:4200` proxifié
      vers `:8085`. ⚠️ **Impact croisé : notre fig. 16
      `memoire-deploiement-local` affiche `:8080` — à corriger en `:8085`
      (ou à confirmer si le mémoire vise un profil prod).**

## UC-1 — `cas_utilisation_syneliaquizapp.svg` (global) : À CORRIGER

- [x] Structure (frontière, gauche/droite, include/extend, généralisation)
      conforme aux règles.
- [x] Ajouter le **Super admin** (4ᵉ acteur, coquille bloquante pour la
      cohérence avec le reste du mémoire).
- [x] Généralisation Admin→Recruteur : garder + phrase d’accompagnement
      (cf. socle).
- [x] « Planifier un entretien » / « Prendre une décision » **incluent**
      « Envoyer une notification » : **faux, c’est conditionnel.**
      Invitation entretien envoyée seulement si la règle de notification
      l’exige ET est automatique (`InterviewsBusiness:728-738`) ;
      décision seulement si règle requise (+ automatique OU opt-in
      `sendDecisionEmail`, `DecisionBusiness:1047-1054`). En UML sans
      condition sur include → modéliser en **`extend` avec condition**
      `[notification requise]` (ou note). Même remarque pour les 4
      diagrammes détaillés qui reprennent ce lien.
- [x] Notifications internes (`table notifications` : `NEW_APPLICATION`,
      `APPLICATION_WITHDRAWN`, `INTERVIEW_RESPONSE_*`,
      `EVALUATION_COMPLETED`) **absentes du diagramme** : les cas
      entretien/décision n’envoient que du SMTP, mais retrait de
      candidature et réponse d’entretien créent des notifications
      in-app — à ajouter (cas « Notifier » côté système ou associations).
- [x] `candidate_token` : c’est un **code de suivi à 6 majuscules**
      (`ApplicationsBusiness:4186-4207`) + email, pas un code
      d’authentification quiz à proprement parler. Reformuler
      « S’authentifier par code » en « Suivre sa candidature (code + email) »
      ou garder avec la bonne sémantique.

## UC-2 — `cas_utilisation_candidat.svg` : À CORRIGER (léger)

- [x] Vérifier le contenu réel contre : endpoints publics
      (`SecurityConfig:29-40` : create, verify-email, get-quiz,
      save-quiz-answer, complete-quiz, touch-quiz, withdraw, track,
      respond-interview, submit-ask), `verifyEmail:1005-1154` (crée la
      tentative + `quizToken`), `withdrawTrackedApplication:3838-3883`
      (abandon volontaire + notif interne aux recruteurs),
      `submitTrackedCandidateAsk` (demandes IDENTITY/EMAIL/PHONE).
- [x] À minima : postuler, vérifier email, passer quiz (+ code/suivi,
      anti-triche en extend), répondre invitation, demander modification,
      retirer candidature — tous réels. Corriger le lien notification
      (cf. UC-1) et la sémantique du code.

## UC-3 — `cas_utilisation_recruteur_configuration.svg` : À CORRIGER (léger)

- [x] « Gérer campagnes / formulaires / questions / versions / pipelines /
      grilles » : réels (`CampaignsBusiness`, `FormVersionBusiness`,
      `PipelineTemplateBusiness`, `EvaluationGridBusiness`).
- [x] « Publier une version » en extend : **à vérifier** —_exists
      `FormVersionBusiness`, publication ? Si l’action est obligatoire,
      passer en include (décision laissée par Claude elle-même).
- [x] Permissions recruteur : `UTILISATEUR` seed = lecture large + création
      campagnes/candidatures/entretiens/évaluations/décisions, **pas de
      DELETE_*, pas de PLANIFY/CORRECT_TEST/FOLLOW** (clés d’entité
      contextuelles : `EntityPermissionKey` ADMIN/CREATOR/UPDATE/DELETE/
      EVALUATE/CORRECT_TEST/PLANIFY/ADVANCE_PIPELINE/FOLLOW). Les cas
      « supprimer » du recruteur doivent refléter les droits contextuels,
      pas un droit global.

## UC-4 — `cas_utilisation_recruteur_suivi.svg` : À CORRIGER (léger)

- [x] Valider / sauter / rouvrir (`/applicationProgress/advance|fail|skip|
      rollback`, `ApplicationProgressController:116-167`) : réels.
      « Rouvrir » = rollback (`:553-590`), pas un état.
- [x] Correction manuelle réponse libre : réel
      (`manualCorrectionStatus` PENDING/COMPLETED, bloque la bascule QUIZ
      `:3502`).
- [x] Évaluer : réservé via permission/participation (cf. socle, pas de
      nouvel acteur).
- [x] Lien notification : même correction qu’UC-1.

## UC-5 — `cas_utilisation_entretiens_evaluation.svg` : CONFORME (réserve)

- [x] Invitation via SMTP : réel et conditionnel (cf. UC-1 — reporter la
      condition sur le lien).
- [x] Clôture (`finish` → CLOSED `:1346`) et `EVALUATION_COMPLETED`
      (notif interne aux ADMIN/CREATOR/FOLLOW/ADVANCE `:1466-1495`) :
      modéliser les **deux** canaux (email + notif interne).

## UC-6 — `cas_utilisation_administrateur.svg` : À CORRIGER (léger)

- [x] Utilisateurs / groupes / permissions (`UserBusiness`,
      `SystemRolePermissionBusiness`, `BusinessGroupPermissionBusiness`,
      overrides GRANT/DENY `V1_018:65-69`) : réels.
- [x] Invitations (`InvitationCodeBusiness`), modèles d’email
      (`email_template` seedé `V1_004:77-104`), textes légaux (`legal_text`),
      SMTP (`SmtpConfigController`), anti-triche (`AppConfigBusiness`,
      écran `settings.ts:440`), audit (`AuditEventService`) : réels.
- [x] Phrase d’accompagnement sur l’héritage recruteur si le global n’est
      pas gardé (avis Claude conservé).

## SEQ-1 — `sequence_passer_le_quiz.svg` : À REPLANIFIER (endpoints)

- [x] Participants OK (Candidat, Front Angular, API Spring, MySQL) ;
      ajouter **SMTP** (email de vérification synchrone à l’étape
      verify-email) si le scénario couvre l’inscription.
- [x] **Endpoints à remplacer intégralement** (tout-en-POST,
      `ApplicationsController:109-233`) :
      `POST /applications/verify-email` → `POST /applications/get-quiz`
      → `POST /applications/save-quiz-answer` (×N, `loop [pour chaque
      réponse]`) → `POST /applications/complete-quiz`, avec
      `POST /applications/touch-quiz` (activité + événements anti-triche).
      Les `/quiz/start`, `/answers`, `/quiz/submit` de Claude n’existent pas.
- [x] Fragments : `alt [code valide / invalide]` (verify-email),
      `opt [anti-triche déclenché]` (WARN/FLAG/FAIL, `ApplicationsBusiness:
      2763-2780`, 403 + clôture), `opt [email de vérification]`,
      retours pointillés pour « Tentative + quizToken » et « score ».
- [x] Pas de flèche async (cf. socle). Auto-message API : « calcule le
      score » (`refreshQuizScoringState :3464`, seuil défaut 50.0 `:207`).
- [x] Scénarios 2-4 de la liste Claude (candidature+email, validation
      étape+décision+notif, entretien→évaluation→décision) : à planifier
      sur le même patron après SEQ-1.

## ETATS-1 — `etats_etape_pipeline.svg` : À CORRIGER (états)

- [x] **Renommer vers l’enum réel** (`ProgressStatus.java:3-9`) :
      `PENDING, IN_PROGRESS, AWAITING_VALIDATION, COMPLETED, FAILED,
      SKIPPED`. « En attente / En cours / Validée / Sautée » sont des
      traductions acceptables **si** la légende donne les valeurs exactes ;
      « Terminée » (avec `entry / calculer score`) n’existe pas ;
      « Rouverte » n’est pas un état (rollback = transition).
- [x] `AWAITING_VALIDATION` défini mais **jamais posé en code** : le
      dessiner en pointillés/« non piloté » ou l’omettre (notre fig. 7
      mémoire `cycle-etape` l’omet déjà — s’aligner).
- [x] `EXPIRED` absent de l’enum (Claude l’avait déduit des colonnes) :
      l’abandon (inactivité 60 s `:2340`, `abandonInactiveQuizApplications`)
      mène à **FAILED** (`:3093`), pas à un état expiré. Retrait volontaire
      = `application_abandoned` **niveau candidature**, pas niveau étape.
- [x] Composite « Non terminée » (PENDING + IN_PROGRESS, skip/retrait
      depuis les deux) : conforme à l’esprit (`skipStage:482`,
      rollback `:553`).
- [x] Gardes : `passStage` sur score (`syncQuizProgressAfterScoring:3513`,
      `scorePercent >= passingScore`), skip refusé si étape obligatoire ou
      mail requis en attente (`:470-476`), cascade SKIPPED après FAILED
      éliminatoire (`:439`). Ce sont les vraies gardes à écrire, pas le
      « seuil / justification » supposé.
- [x] Évaluation (`DRAFT/SUBMITTED/VALIDATED/CANCELLED`, seul SUBMITTED
      posé `:156`) et tentative quiz (`PENDING/STARTED/COMPLETED`,
      EXPIRED/CANCELLED jamais posés) : **abandon confirmé** (avis Claude
      conservé) — linéaires, rien de plus que l’étape.

## ARCHI-1 — `composants_syneliaquizapp.svg` : À CORRIGER (léger)

- [x] Découpage en couches **correct** : le backend est organisé par
      entité Telosys (Entity/Business/Repository/Controller/Dto), pas par
      domaine — l’alternative « modules domaine » de Claude est à refuser.
      Granularité : Contrôleurs REST (47) → Services métier (50) → Accès
      données JPA (47 repos) + transverse (`HostingUtils`, sécurité JWT,
      WebSocket).
- [x] Annoter les vraies technos : `JPA/Hibernate` (`spring-boot-starter-
      data-jpa`, `MySQLDialect`, `ddl-auto=validate`), `Flyway`
      (`flyway-core/mysql`, ~85 migrations), `JavaMail/Thymeleaf`,
      `spring-security + JJWT`, `spring-data-redis + Jedis`, `minio:8.6.0`,
      `spring-websocket`. JDBC seul est trop vague.
- [x] Front Angular : requiert API REST (`:8085`, proxy `proxy.conf.json`),
      servi par `ng serve` (pas de serveur front dédié).

## ARCHI-2 — `deploiement_cible_syneliaquizapp.svg` : CIBLE, conservé

Décision 20261025 (règle « les figures montrent la cible »,
`archi_regles.md` addenda 20261025) : **ce n'est pas un doublon** de la fig. 16.
`memoire-deploiement-local` montre le déploiement **existant** (un seul poste,
§ 6.6) ; ce diagramme montre le déploiement **cible** (serveur web nginx,
applicatif, données, CI/CD). Deux points de vue, deux figures, les deux restent.

- [x] Notation de statut retirée (20261025) : contours pleins partout, mentions
      « proposé » supprimées, légende existant/cible supprimée, note de bas de
      figure déplacée en légende du mémoire, `viewBox` recadré (680 × 656).
- [x] Contenu aligné sur la cible, pas sur l'état du dépôt : nginx (reverse proxy
      + build Angular), CI/CD, MinIO pour les CV. Aucun de ces éléments n'existe
      aujourd'hui — c'est admis, c'est l'objet de la figure.
- [x] Ports : 443 (HTTPS), 8085 (API), 3306, 6379, 9000, 587/STARTTLS —
      cohérents avec le code (8085, pas 8080). ⚠️ Le conflit `:8080` vs `:8085`
      relevé sur la fig. 16 se traite dans la figure du mémoire, pas ici.
- [x] Pas de fusion avec ARCHI-1 : un composant n'est pas un nœud de déploiement.
- [ ] Légende à mettre sous la figure dans `body.typ` (elle quitte le SVG et
      reste porteuse de l'écart réel/cible) : « Déploiement cible ; aujourd'hui,
      un seul poste de développement (figure 16). »

## Audit des pointillés (20261025)

**58** éléments pointillés relevés sur les 15 SVG livrés (chaque élément porte
`stroke-dasharray` en attribut **et** en `style` → 116 occurrences brutes).
Après nettoyage : **49**, tous conventionnels.

| Famille | Avant | Après | Verdict |
|---|---|---|---|
| `«include»`/`«extend»` (7 UC) | 16 | 16 | convention |
| Dépendances (`composants_v3`) | 10 | 10 | règle 5, aucune forme pointillée |
| Séquences (8 lifelines, 4 séparateurs `alt`/`opt`, 11 retours) | 23 | 23 | convention |
| UC cerclés + puces « droit contextuel » (2 UC recruteur) | 6 | 0 | notation inventée → contours pleins |
| Filets séparateurs (2 états) | 3 | 0 | mise en page → supprimés |

Les 4 notes de bas de figure qui commentaient le code (« défini dans le code
mais jamais utilisé », « l'endpoint update contourne la matrice ») sont
supprimées : la figure montre la cible, pas les trous de l'existant. Détail,
provenance (Claude, pas Muse Spark) et `viewBox` :
`plans/implementations/20261025_uml_pointilles_audit.md`.

## Prochaine étape (triage, après validation demandeur)

- Corps probables : UC global (+ Super admin), UC candidat, SEQ quiz
  (replanifiée), ÉTATS étape (corrigée), COMPOSANTS (corrigé), DÉPLOIEMENT
  cible (20261025 : plus un doublon, cf. ARCHI-2).
- Annexe/abandon à trancher : UC ×3 restantes, classes (abandon déjà acté par
  Claude), états évaluation/quiz
  (abandon confirmé).
