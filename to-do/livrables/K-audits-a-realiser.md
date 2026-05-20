# Livrable K — Audits techniques à réaliser

**Date :** 2026-05-12
**Statut :** ✅ Liste cadrée des audits

> Ce fichier liste les audits qui ne peuvent être réalisés que par lecture de code ciblée, à exécuter dans une itération suivante. Chaque audit a son **scope**, sa **méthode** et son **livrable attendu**.

---

## K.1 — Audit : Colonnes BD potentiellement mortes

**Méthode** : grep récursif sur backend Java + frontend TS pour chaque colonne ciblée. Une colonne est "morte" si non lue ET non écrite ailleurs que dans la migration qui la crée.

**Colonnes à auditer (cf. G.1)** :
- `applications.search_string` ✅ **Confirmée utilisée** (full-text search ; voir Z-202)
- `applications.quiz_level` ✅ **Confirmée utilisée** (reprise quiz ; voir Q-001)
- `applications.application_abandoned` ✅ **Confirmée à compléter** (D-001 + UI)
- `applications.pre_screen_decision_mail_sent` ⚠️ **Obsolète** (voir Q-002)
- `applications.final_decision_mail_sent` ⚠️ **Obsolète** (voir Q-002)
- `campaigns.is_timed` ⚠️ **À compléter** (voir Q-003)
- `campaigns.max_apply` ⚠️ **À appliquer backend**
- `campaign_crud.*` ⚠️ **À auditer pour refonte** (voir Q-004)
- `notifications.object_table_name` / `object_table_id` ✅ confirmées
- `pipeline_stage.config_json` 🟡 schéma à documenter
- `question.question_ref` ✅ confirmé (UUID lignée)
- `user.admin_mode` ✅ confirmé (sidebar)
- `user.page_size_preference` ✅ confirmé

**Livrable attendu** : audit par colonne avec verdict.

---

## K.2 — Audit : Routes orphelines (frontend)

**Définition utilisateur** : route fonctionnelle mais non accessible naturellement par un lien dans l'UI.

**Méthode** :
1. Lister toutes les routes déclarées dans `app.routes.ts`.
2. Pour chaque route, grep dans tous les templates `.html` et code `.ts` pour `routerLink`, `router.navigate(['...'])`, `[href]`, `<a href>`.
3. Cocher chaque route trouvée. Routes restantes = orphelines.

**Cas connus** :
- `/connexion` — orpheline volontaire (cf. Q-006).
- `/merise` — debug, à protéger ou supprimer.

**Livrable attendu** : tableau routes × accessibles? × type d'accès.

---

## K.3 — Audit : Boutons / liens / actions UI sans effet

**Méthode** :
1. Lister tous les `(click)=`, `<button>`, `<a>` dans les templates.
2. Vérifier qu'ils ont un handler effectif (méthode existante, non-empty).
3. Vérifier que `routerLink` pointe vers route déclarée.
4. Détecter handlers vides (`onSomething() {}` ou `// TODO`).

**Livrable attendu** : liste des cliquables morts par fichier.

---

## K.4 — Audit : Pagination manquante

**Méthode** :
1. Lister toutes les pages métier qui affichent une liste (`*ngFor` sur une grande collection).
2. Pour chaque, vérifier présence d'un mécanisme de pagination (`paginator`, `mat-paginator`, `[pageSize]`, etc.).
3. Identifier les listes susceptibles de grossir en production (campaigns, applications, decisions, evaluations, interviews, notifications, candidate_answers, questions).

**Action liée** : Z-220 — créer composant pagination réutilisable + appliquer.

**Livrable attendu** : liste pages métier × pagination présente? × volume estimé.

---

## K.5 — Audit : Filtres de recherche fonctionnels

**Méthode** :
1. Lister tous les champs select / input search / checkbox de filtre dans pages métier.
2. Vérifier qu'ils sont câblés à un changement de critère + appel API.
3. Tester quelques cas manuellement (au moins 1 par page critique).

**Pages prioritaires** : campaigns, applications, interviews, decisions, evaluations, questions, users.

**Livrable attendu** : liste filtres × fonctionnels? × tests effectués.

---

## K.6 — Audit : Système de notifications complet

**Méthode** :
1. Lister tous les **événements métier** qui devraient générer une notification :
   - Nouvelle candidature sur campagne (→ recruteur + admin campagne)
   - Candidat termine quiz (→ recruteur)
   - Candidat fait demande candidate_ask (→ recruteur)
   - Décision approuvée / rejetée (→ candidat)
   - Entretien planifié (→ candidat + participants)
   - Entretien commence dans 1h (→ tous)
   - Évaluation reçue (→ candidat)
   - Demande de changement de groupe (→ admin groupe)
   - Nouveau message dans chat entretien (→ destinataires)
   - Campagne créée par un membre du groupe (→ admins groupe)
   - Mot de passe modifié (→ user)
   - Email validé (→ user)
   - Pipeline avancé (→ candidat)
   - Quiz expiré sans soumission (→ recruteur + candidat)
2. Vérifier pour chaque événement que la notif est bien créée backend.
3. Vérifier que `notifType` est cohérent avec un enum `NotificationType` à créer (Z-019).

**Livrable attendu** : tableau événement × notif créée? × destinataire correct? × `notifType`.

---

## K.7 — Audit : Récupération mot de passe

**Question utilisateur** : la récupération de mot de passe est-elle gérée ?

**Méthode** :
1. Grep `password-reset`, `forgot-password`, `reset-password` dans backend + frontend.
2. Vérifier la chaîne complète :
   - Endpoint backend `POST /auth/forgot-password` (génère token).
   - Email avec lien expirable.
   - Endpoint `POST /auth/reset-password` (validate token + new password).
   - Page frontend `/mot-de-passe-oublie` + `/reinitialiser-mot-de-passe`.

**Livrable attendu** : statut complet (présent/incomplet/absent) avec actions.

---

## K.8 — Audit : Validation backend des enums

**Méthode** :
1. Pour chaque controller acceptant un champ typé enum dans le body, vérifier :
   - Soit le type Java est l'enum lui-même (Jackson refuse les valeurs non-membres).
   - Soit annotation `@Pattern(regexp="^(VAL1|VAL2|VAL3)$")` sur String.
2. Tester avec valeur invalide → doit retourner 400.

**Endpoints critiques** : `applications/create` (`application_status`, `quiz_status`, `interview_status`), `campaigns/create` (`campaign_status`, `form_assignment_strategy`, `form_assignment_exhaustion_policy`), `decisions/create` (`decision_type`), `interviews/create` (`interview_status`, `interview_type`), `pipeline_stage/create` (`stage_type`), `candidate_ask/create` (`request_type`, `ask_status`), `notifications/create` (`notif_type`), `user/create` (`user_role`).

**Livrable attendu** : tableau endpoint × champ × validation présente?

---

## K.9 — Audit : `EntityCrudBase` héritage

**Méthode** :
1. Lister toutes les pages `/dashboard/entities/solo/*`.
2. Vérifier que le component principal hérite de `EntityCrudBase` ou utilise le pattern défini dans `RULES.md`.
3. Lister les divergences.

**Livrable attendu** : liste 38 pages × pattern respecté?

---

## K.10 — Audit : `cleanFormData()` systématique

**Méthode** :
1. Grep tous les `http.post` qui envoient un payload `form.value` ou `formGroup.value`.
2. Vérifier que `cleanFormData()` est appelé juste avant.
3. Cas particuliers : si payload custom-built, vérifier conversion `""` → `null` manuellement.

**Livrable attendu** : liste appels POST × cleanFormData appelé?

---

## K.11 — Audit : `legal_text` settings fonctionnement

**Méthode** : tester manuellement le flow CRUD legal_text dans `/dashboard/settings` :
- Création nouveau texte légal.
- Modification.
- Versionning (si applicable).
- Affichage public.

**Livrable attendu** : statut OK / KO avec bugs identifiés.

---

## K.12 — Audit : source-tokens dans campaign-form

**Méthode** : tester manuellement la création d'une campagne :
- Création de source tokens à la création campagne.
- Visualisation des tokens existants.
- Régénération / désactivation d'un token.

**Livrable attendu** : statut OK / KO avec gaps.

---

## K.13 — Audit : `/qeel/*` toujours utilisé ?

**Méthode** : grep `qeel` dans frontend (`.ts`, `.html`). Si aucune référence active hors comments → supprimer côté backend.

**Livrable attendu** : statut + action.

---

## K.14 — Audit : Minio vs uploads local

**Méthode** :
1. Vérifier où `/files/upload/cv` écrit effectivement (Minio client ou disk write).
2. Vérifier où le frontend lit le CV (URL Minio ou path local).
3. Identifier conflits.

**Livrable attendu** : choix recommandé + plan migration.

---

## K.15 — Audit : Quiz reprise (Q-001)

**Méthode** :
1. Lire `ApplicationsBusiness.get-quiz` + `save-quiz-answer`.
2. Identifier comment `quiz_level` est utilisé pour la reprise.
3. Vérifier comportement quand `form_assignment_strategy = RANDOM/RANDOM_NO_REPEAT`.
4. Lister les champs manquants éventuels (random questions, snapshot séquence).

**Livrable attendu** : analyse + recommandation pour Q-001.

---

## K.16 — Synthèse audits

| # | Audit | Effort | Priorité |
|---|---|---|---|
| K.1 | Colonnes BD mortes | M | P2 |
| K.2 | Routes orphelines | S | P1 |
| K.3 | Boutons morts | M | P1 |
| K.4 | Pagination manquante | M | P1 |
| K.5 | Filtres recherche | M | P1 |
| K.6 | Notifications complètes | L | P1 |
| K.7 | Récupération mot de passe | S | P0 |
| K.8 | Validation enums backend | M | P0 |
| K.9 | EntityCrudBase héritage | S | P3 |
| K.10 | cleanFormData systématique | S | P3 |
| K.11 | legal_text settings | S | P2 |
| K.12 | source-tokens campaign-form | S | P2 |
| K.13 | qeel/* utilisé ? | S | P3 |
| K.14 | Minio vs uploads | S | P2 |
| K.15 | Quiz reprise | M | P1 |

Légende effort : S=small (<1h), M=medium (1-3h), L=large (>3h).
