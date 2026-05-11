# Plan d'analyse global — Cartographie complète BD ↔ Backend ↔ Frontend

**Date :** 2026-05-11
**Objectif :** Produire un **inventaire exhaustif** de tout ce qui doit exister dans le projet pour qu'il soit **complet, cohérent et terminé**, en comparant systématiquement :
- la **base de données actuelle** (`to-do/bd_actuelle/quizapp_db_described.md` — **source de vérité**)
- le **backend** (`/quizapp`, Spring Boot + Telosys)
- le **frontend** (`/quizapp_front`, Angular)

> ⚠️ **Ce fichier n'est PAS la liste des corrections.** C'est la **méthodologie** à exécuter. Chaque phase produit un **livrable** (cartographie / gap-list). La Phase Z agrège tout en backlog actionnable.

---

## 0. Contexte & justification

État connu du projet :
- Le schéma BD a été refondu (nouvelles tables `form`, `form_version`, `form_questions` ; tables potentiellement obsolètes comme `campaign_questions` ; nouveaux champs sur tables existantes comme `campaigns.form_assignment_strategy`).
- Le backend contient probablement des **résidus** d'entités/DTO/services pour des tables supprimées.
- Le backend **manque probablement** d'entités/business/controllers/DTO pour des tables récentes.
- Le frontend contient probablement des **services morts**, des **modèles désynchronisés**, des **pages métier manquantes**, et des **fonctionnalités sans backend correspondant**.
- Des **relations BD ne sont pas exposées en UI** (ex : `form.campaign_id`).
- Des **champs BD ne sont pas éditables** depuis l'UI métier.
- Des **enums BD ou métier** n'ont pas leur équivalent côté code.
- Des **APIs existent mais ne sont consommées nulle part**, et inversement.

**Double exigence :**
1. **Détecter les résidus** (code mort, références cassées, fichiers orphelins).
2. **Détecter les manques** (entités/APIs/pages/champs/enums qui devraient exister mais n'existent pas).

---

## 1. Pré-requis, conventions & standards à appliquer

### 1.1 Source de vérité
- `to-do/bd_actuelle/quizapp_db_described.md` (référentiel BD).
- `to-do/rules/general-rules.md` (conventions projet).
- `to-do/rules/to-do-rules-front.md` (conventions frontend).

### 1.2 Conventions API du projet
- Tout en `POST` (jamais GET/PUT/DELETE).
- Convention update partiel : `""` ignoré, `null` met à null, autre valeur met à jour.
- Frontend envoie `null` au lieu de `""`.

### 1.3 Standard backend obligatoire **par table métier**
Chaque table métier doit posséder :
- **Entity** : `<Entity>.java` dans `dao/entity/`
- **Repository** : `<Entity>Repository.java` dans `dao/repository/`
- **DTO de sortie** : `<Entity>Dto.java` (vue complète)
- **DTO d'entrée / partiel** : `_<Entity>Dto.java` (édition / création / criteria)
- **Business** : `<Entity>Business.java` dans `business/`
- **Controller** : `<Entity>Controller.java` dans `controller/` avec, **au minimum**, les endpoints :
  - `create`
  - `update`
  - `updateAll` *(batch)*
  - `delete` *(soft delete `deleted_at`)*
  - `getByCriteria` *(retourne 1 résultat avec critères)*
  - `getAllByCriteria` *(retourne N résultats paginés)*
  - `getFullInfos` *(retourne l'agrégat complet : entité + relations)*

### 1.4 Standard frontend obligatoire **par table métier**
- **Model TS** dans `core/models/`
- **Service** dans `core/services/` avec une méthode par endpoint backend
- **Page CRUD brute super-admin** sous `/dashboard/entities/<table>/` *(pattern `EntityCrudBase`)*
- **Page métier** sous `/dashboard/<feature>/` *(quand la table porte une vraie fonctionnalité utilisateur final)*
- **Route Angular** déclarée
- **Permissions** vérifiées (`FunctionalityEnum`, `system_role_permission`, `business_group_permission`)

### 1.5 Standard enums
- Toute colonne `*_status`, `*_type`, `*_strategy`, `*_policy`, `*_role`, `*_state`, `*_kind`, ou colonne SQL `ENUM(...)` doit avoir :
  - Un **enum Java** dans `dao/entity/enums/` (ou équivalent)
  - Un **enum / union type TS** dans `core/models/enums/`
  - Les valeurs **strictement identiques** entre BD / Java / TS

### 1.6 Format des livrables
- Checklist `- [ ] 🔵`
- Sections `**[BD — X]**` / `**[BACK — X]**` / `**[FRONT — X]**` / `**[FULL-STACK — X]**`
- Français, code en backticks, notes en *italique*

---

## 2. Phases d'analyse

### 🔍 Phase A — Inventaire exhaustif de la BD

**But :** produire le référentiel maître de toutes les tables, colonnes, FK, index, enums.

- [ ] 🔵 Lister toutes les tables depuis `bd_actuelle/quizapp_db_described.md`.
- [ ] 🔵 Pour chaque table extraire : `colonnes (nom, type SQL, nullable, default)`, `PK`, `FK (table.col cible + ON DELETE/UPDATE)`, `index uniques`, `colonnes ENUM + valeurs`.
- [ ] 🔵 Catégoriser chaque table : **métier** / **jointure** / **configuration** / **système-permission** / **token-auth** / **journal-audit** / **notification**.
- [ ] 🔵 Identifier les **enums implicites** : colonnes nommées `*_status`, `*_type`, `*_strategy`, `*_policy`, `*_role`, `*_state`, `*_kind`, `*_visibility`, `*_mode`.
- [ ] 🔵 Identifier les colonnes **candidates à devenir enum** mais actuellement en `VARCHAR` libre *(valeurs probablement énumérables — à confronter aux usages applicatifs)*.
- [ ] 🔵 Lister les **FK et leur cardinalité** (1:1, 1:N, N:N via table de jointure).
- [ ] 🔵 Lister les colonnes techniques attendues par convention : `id`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`.
- [ ] 🔵 Repérer les tables **sans `deleted_at`** *(soft-delete absent — à vérifier si volontaire)*.

**Livrable A :** `to-do/livrables/A-inventaire-bd.md`

---

### 🔧 Phase B — Cartographie & complétude backend

**But :** pour **chaque table métier**, vérifier l'existence et la conformité de tous les fichiers obligatoires (cf. §1.3). Détecter résidus ET manques.

#### B.1 Entities (`dao/entity/`)
- [ ] 🔵 Lister tous les `*.java` du dossier.
- [ ] 🔵 Pour chaque entité : extraire `@Table(name=...)`, `@Column(name=...)`, `@JoinColumn`, `@Enumerated`, relations `@OneToMany/@ManyToOne/@ManyToMany`.
- [ ] 🔵 **Confronter à Phase A** : marquer `OBSOLÈTE` (table absente), `MANQUANTE` (table sans entité), `DIVERGENTE` (colonnes en désaccord), `OK`.
- [ ] 🔵 Vérifier les types Java ↔ types SQL.
- [ ] 🔵 Vérifier que toutes les FK BD sont matérialisées par une relation JPA.

#### B.2 Repositories (`dao/repository/`)
- [ ] 🔵 Pour chaque entité valide, vérifier la présence d'un repo.
- [ ] 🔵 Lister les `@Query` et vérifier que les colonnes/entités référencées existent.
- [ ] 🔵 Marquer `MANQUANT` les repos absents, `OBSOLÈTE` les repos orphelins.

#### B.3 DTO (`dao/dto/`)
- [ ] 🔵 Pour chaque entité valide, vérifier la présence de **`<Entity>Dto`** ET **`_<Entity>Dto`**.
- [ ] 🔵 Marquer `MANQUANT` les DTO absents, `OBSOLÈTE` les DTO orphelins, `DIVERGENT` les DTO avec champs incohérents vs entité.
- [ ] 🔵 Vérifier que les types des champs DTO sont cohérents avec l'entité.

#### B.4 Business (`business/`)
- [ ] 🔵 Pour chaque entité valide, vérifier la présence d'un `<Entity>Business`.
- [ ] 🔵 Vérifier que les **7 méthodes standard** existent : `create`, `update`, `updateAll`, `delete`, `getByCriteria`, `getAllByCriteria`, `getFullInfos`.
- [ ] 🔵 Lister les **méthodes business supplémentaires** (logique métier spécifique) et noter leur but.
- [ ] 🔵 Marquer `MANQUANT` les Business absents, `INCOMPLET` ceux à qui il manque des méthodes standard, `OBSOLÈTE` les orphelins.

#### B.5 Controllers (`controller/`)
- [ ] 🔵 Lister tous les `@PostMapping` (rappel : tout en POST).
- [ ] 🔵 Pour chaque entité valide, vérifier la présence d'un `<Entity>Controller` exposant les **7 endpoints standard**.
- [ ] 🔵 Construire la **table d'endpoints backend** : `URL`, `méthode HTTP`, `business appelé`, `entité`, `table BD`, `permissions requises`.
- [ ] 🔵 Marquer `MANQUANT` / `INCOMPLET` / `OBSOLÈTE`.
- [ ] 🔵 Lister les **endpoints métier spécifiques** (hors CRUD standard) et leur rôle.
- [ ] 🔵 Vérifier que chaque endpoint applique la convention update partiel (`""` ignoré, `null` set null).

#### B.6 Enums applicatifs (`dao/entity/enums/` ou équivalent)
- [ ] 🔵 Lister tous les enums Java.
- [ ] 🔵 Pour chaque enum BD listé en A : vérifier l'existence d'un enum Java équivalent avec **valeurs identiques**.
- [ ] 🔵 Pour chaque colonne **candidate à enum** (A) : décider si un enum doit être créé.
- [ ] 🔵 Marquer `ENUM_MANQUANT`, `ENUM_DIVERGENT`, `ENUM_ORPHELIN`.
- [ ] 🔵 Auditer `FunctionalityEnum` : repérer les valeurs liées à des tables/features obsolètes ; lister les fonctionnalités présentes en BD mais absentes de l'enum.

#### B.7 Permissions (`system_role_permission`, `entity_permission`, `business_group_permission`)
- [ ] 🔵 Lister toutes les `entity_name` / `functionality` enregistrées en BD.
- [ ] 🔵 Vérifier que chacune correspond à une table/fonctionnalité existante.
- [ ] 🔵 Pour chaque table métier, vérifier qu'au moins une entrée de permission existe.

#### B.8 Migrations / Flyway
- [ ] 🔵 Lister les fichiers de migration présents.
- [ ] 🔵 Repérer les scripts créant des tables supprimées (à archiver) ou modifiant des colonnes absentes.
- [ ] 🔵 Identifier les colonnes / tables ajoutées sans migration *(divergence schema-vs-migrations)*.

#### B.9 Tests backend
- [ ] 🔵 Lister les tests existants (`src/test/`).
- [ ] 🔵 Marquer les tests référençant des classes obsolètes.
- [ ] 🔵 Identifier les Business/Controllers sans aucun test.

**Livrables Phase B :**
- `to-do/livrables/B1-entities-gap.md`
- `to-do/livrables/B2-repositories-gap.md`
- `to-do/livrables/B3-dto-gap.md`
- `to-do/livrables/B4-business-gap.md`
- `to-do/livrables/B5-controllers-gap.md` *(inclut la table d'endpoints)*
- `to-do/livrables/B6-enums-gap.md`
- `to-do/livrables/B7-permissions-gap.md`
- `to-do/livrables/B8-migrations-gap.md`
- `to-do/livrables/B9-tests-back-gap.md`

---

### 🎨 Phase C — Cartographie & complétude frontend

**But :** pour **chaque table métier**, vérifier model + service + pages + routes + permissions ; détecter résidus ET manques.

#### C.1 Models (`core/models/`)
- [ ] 🔵 Lister toutes les interfaces/types.
- [ ] 🔵 Pour chaque model : identifier le DTO backend cible.
- [ ] 🔵 Marquer `OBSOLÈTE` / `MANQUANT` / `DIVERGENT` (champ par champ vs DTO et colonnes BD).
- [ ] 🔵 Vérifier que les `null`/`optional` matchent les `nullable` BD.

#### C.2 Enums frontend (`core/models/enums/` ou équivalent)
- [ ] 🔵 Lister les enums/union types TS.
- [ ] 🔵 Confronter aux enums Java (B.6) et BD (A) → marquer `MANQUANT` / `DIVERGENT` / `ORPHELIN`.

#### C.3 Services (`core/services/`)
- [ ] 🔵 Lister tous les services et leurs méthodes.
- [ ] 🔵 Extraire toutes les URL appelées (`http.post('/api/...')`).
- [ ] 🔵 Confronter à la table d'endpoints (B.5) → marquer `URL_MORTE` (pas de controller), `ENDPOINT_NON_CONSOMMÉ` (controller sans appel front).
- [ ] 🔵 Vérifier que chaque entité métier a un service avec les **7 méthodes standard** (miroir des endpoints).
- [ ] 🔵 Marquer `MANQUANT` / `INCOMPLET` / `OBSOLÈTE`.

#### C.4 Pages (`pages/dashboard/` et `pages/`)
- [ ] 🔵 Lister tous les sous-dossiers.
- [ ] 🔵 Pour chaque page identifier : entité ciblée, services appelés, formulaires, champs édités, champs affichés.
- [ ] 🔵 Marquer `OBSOLÈTE` si dépend exclusivement d'un service mort.
- [ ] 🔵 Pour chaque table métier vérifier l'existence de :
  - Page CRUD brute super-admin `/dashboard/entities/<table>/` ;
  - Page métier `/dashboard/<feature>/` si la table porte une vraie fonctionnalité.
- [ ] 🔵 Marquer `PAGE_BRUTE_MANQUANTE` / `PAGE_MÉTIER_MANQUANTE`.

#### C.5 Champs UI vs colonnes BD
- [ ] 🔵 Pour chaque table métier, lister les colonnes hors techniques.
- [ ] 🔵 Pour chaque colonne, chercher son nom dans templates `.html` + `FormGroup` `.ts`.
- [ ] 🔵 Marquer `NON_EXPOSÉ_MÉTIER` si absente des pages métier mais présente uniquement dans le CRUD brut.
- [ ] 🔵 Marquer `NON_EXPOSÉ_DU_TOUT` si totalement absente.
- [ ] 🔵 Cas connu : `campaigns.form_assignment_strategy`, `campaigns.form_assignment_exhaustion_policy`.

#### C.6 Relations FK vs UI
- [ ] 🔵 Pour chaque FK (A), vérifier qu'une UI permet de :
  - Sélectionner le parent lors de la création de l'enfant ;
  - Afficher la liste des enfants depuis la page parent ;
  - Naviguer entre parent et enfant.
- [ ] 🔵 Marquer `RELATION_NON_IMPLÉMENTÉE_UI`.
- [ ] 🔵 Cas prioritaire : `form.campaign_id` → impossible d'attacher des formulaires à une campagne depuis l'UI.

#### C.7 Routes (`app.routes.ts` + sous-routings)
- [ ] 🔵 Extraire toutes les routes.
- [ ] 🔵 Marquer `MORTE` (composant obsolète), `MANQUANTE` (page existante non routée), `ROUTE_SANS_PAGE` (route déclarée vers composant inexistant).
- [ ] 🔵 Vérifier la cohérence `/dashboard/entities/<x>` ↔ tables BD réelles.

#### C.8 Guards & permissions frontend
- [ ] 🔵 Lister les guards d'authentification / autorisation.
- [ ] 🔵 Vérifier que chaque route métier est protégée par le bon guard / la bonne `FunctionalityEnum`.
- [ ] 🔵 Marquer `GUARD_MANQUANT` / `GUARD_INCORRECT`.

#### C.9 Tests frontend
- [ ] 🔵 Lister les tests existants (`*.spec.ts`).
- [ ] 🔵 Marquer ceux référençant des composants/services obsolètes.

**Livrables Phase C :**
- `to-do/livrables/C1-models-gap.md`
- `to-do/livrables/C2-enums-front-gap.md`
- `to-do/livrables/C3-services-gap.md`
- `to-do/livrables/C4-pages-gap.md`
- `to-do/livrables/C5-champs-ui-gap.md`
- `to-do/livrables/C6-relations-ui-gap.md`
- `to-do/livrables/C7-routes-gap.md`
- `to-do/livrables/C8-guards-gap.md`
- `to-do/livrables/C9-tests-front-gap.md`

---

### 🔁 Phase D — Réconciliation API : consommation & exposition

**But :** détecter les **APIs orphelines** (backend sans front), les **appels orphelins** (front sans backend), et les **APIs sous-consommées** (utilisées à un endroit alors qu'elles devraient l'être à plusieurs).

- [ ] 🔵 Construire deux ensembles : `ENDPOINTS_BACK` (depuis B.5) et `URL_FRONT` (depuis C.3).
- [ ] 🔵 `ENDPOINTS_BACK \ URL_FRONT` → `API_NON_CONSOMMÉE` (backend orphelin).
- [ ] 🔵 `URL_FRONT \ ENDPOINTS_BACK` → `URL_MORTE` (front orphelin).
- [ ] 🔵 Pour chaque API consommée à un seul endroit, vérifier s'il y a d'autres pages qui devraient logiquement l'appeler.
- [ ] 🔵 Pour chaque page identifier les **fonctionnalités prévues** (boutons, formulaires) qui n'appellent **aucune** API alors qu'elles devraient.
- [ ] 🔵 Cas typique à détecter : bouton "Créer X" présent mais sans handler ; formulaire affiché mais sans submit fonctionnel.

**Livrable D :** `to-do/livrables/D-api-reconciliation.md`

---

### 🧭 Phase E — Cartographie des parcours métier

**But :** s'assurer qu'on peut **réaliser de bout en bout** chaque parcours utilisateur attendu.

- [ ] 🔵 Lister les **personas** : super-admin, admin, recruteur, candidat, évaluateur, etc. *(à confirmer depuis `system_role` et `business_group`)*.
- [ ] 🔵 Pour chaque persona, lister les **parcours métier attendus** (login → action → résultat).
- [ ] 🔵 Pour chaque parcours, vérifier que toutes les étapes ont :
  - Page UI ;
  - Service ;
  - API backend ;
  - Permission ;
  - Table BD avec colonnes nécessaires.
- [ ] 🔵 Marquer chaque étape `OK` / `PARTIEL` / `BLOQUANT`.
- [ ] 🔵 Parcours prioritaires à auditer :
  - **Recruteur** : créer une campagne → attacher formulaires → publier → recevoir candidatures → corriger quiz → planifier entretien → décider.
  - **Candidat** : recevoir invitation → s'inscrire / vérifier email → postuler → passer quiz → suivre statut → recevoir décision.
  - **Évaluateur** : recevoir lien entretien → évaluer → soumettre.
  - **Super-admin** : gérer utilisateurs / permissions / groupes / templates emails / configuration SMTP / textes légaux.

**Livrable E :** `to-do/livrables/E-parcours-metier-gap.md`

---

### 🛣️ Phase F — Matrice de traçabilité globale

**But :** tableau unique reliant chaque ligne BD ↔ Java ↔ TS ↔ UI.

- [ ] 🔵 Construire le tableau avec colonnes :
  `Table BD | Entity | Repository | Dto | _Dto | Business | Controller | Endpoints (liste) | Service front | Model front | Page CRUD brute | Page métier | Route | Guard | Permission | Statut global`
- [ ] 🔵 Statut global = `OK` / `INCOMPLET` / `OBSOLÈTE` / `MANQUANT_TOTAL`.
- [ ] 🔵 Inclure une ligne par table BD + une ligne par fichier orphelin (table absente).

**Livrable F :** `to-do/livrables/F-matrice-traceabilite.md`

---

### 🧮 Phase G — Audit qualité transverse

**But :** détecter les violations de conventions et la dette technique transverse.

- [ ] 🔵 Vérifier la convention API POST : toute route non-`POST` → `VIOLATION_CONVENTION_API`.
- [ ] 🔵 Vérifier la convention update partiel (`""` ignoré, `null` set null) dans chaque Business `update`.
- [ ] 🔵 Vérifier l'utilisation de variables de couleur (jamais de couleur en dur) côté SCSS.
- [ ] 🔵 Vérifier la responsivité des pages métier (media queries présentes / `flex` / `grid`).
- [ ] 🔵 Vérifier la duplication de code (composants ou services qui devraient être factorisés).
- [ ] 🔵 Vérifier l'usage cohérent du pattern `EntityCrudBase` côté front.
- [ ] 🔵 Vérifier l'usage cohérent des conventions Telosys côté back.

**Livrable G :** `to-do/livrables/G-qualite-transverse.md`

---

### 📦 Phase H — Cas spéciaux & fonctionnalités transverses

**But :** auditer les sous-systèmes qui ne suivent pas le pattern CRUD standard.

- [ ] 🔵 **Système de notifications** (`notifications`, `candidate_ask`) : émission, réception, affichage temps réel, badge non-lu.
- [ ] 🔵 **Système d'emails** (`email_template`, `email_template_preset`, `smtp_config`) : édition templates, envoi, logs, gestion erreurs.
- [ ] 🔵 **Vérification email & tokens** (`email_verification_tokens`, `candidate_token`, `source_token`, `invitation_code`) : génération, validation, expiration, sécurité.
- [ ] 🔵 **Pipeline de candidature** (`pipeline_template`, `pipeline_stage`, `application_progress`) : édition pipeline, avancement, transitions autorisées.
- [ ] 🔵 **Permissions** (`business_group*`, `system_role_permission`, `entity_permission`, `user_permission_override`, `group_change_request`) : UI d'administration, requêtes de changement de groupe, override par utilisateur.
- [ ] 🔵 **Upload de fichiers** (CV, etc.) : limites, sécurité, antivirus, types autorisés.
- [ ] 🔵 **Quiz & correction** (`question`, `answer`, `candidate_answer`, `form_questions`) : passage, correction manuelle, scoring auto.
- [ ] 🔵 **Entretiens** (`interviews`, `interview_participant`, `candidate_interview`, `evaluations`, `decisions`) : planification, participants multiples, évaluation, décision finale.
- [ ] 🔵 **Configuration applicative** (`app_config`, `legal_text`) : UI admin, versioning, validation.

**Livrable H :** `to-do/livrables/H-sous-systemes-gap.md`

---

### 🔐 Phase I — Sécurité & OWASP

**But :** audit sécurité avant clôture.

- [ ] 🔵 Vérifier que chaque endpoint POST est protégé par authentification + autorisation appropriée.
- [ ] 🔵 Vérifier l'absence d'IDOR (vérification de propriété sur chaque accès à ressource).
- [ ] 🔵 Vérifier la validation côté serveur (jamais de confiance front).
- [ ] 🔵 Vérifier la protection des uploads (taille, type MIME, chemin).
- [ ] 🔵 Vérifier la rate-limitation des endpoints sensibles (login, reset password, email send).
- [ ] 🔵 Vérifier l'absence de secrets en dur (utilisation de variables d'environnement).
- [ ] 🔵 Vérifier la configuration CORS / CSRF.
- [ ] 🔵 Vérifier les logs (pas de données sensibles loguées).

**Livrable I :** `to-do/livrables/I-securite-gap.md`

---

### 📦 Phase Z — Synthèse, priorisation & backlog final

**But :** consolider A→I en un **backlog actionnable**.

- [ ] 🔵 Agréger tous les items des livrables A→I.
- [ ] 🔵 Catégoriser chaque item : `À SUPPRIMER` / `À COMPLÉTER` / `À CRÉER` / `À MIGRER` / `À CORRIGER` / `À DOCUMENTER` / `À TESTER`.
- [ ] 🔵 Prioriser :
  - `P1` — Bloquant métier (parcours utilisateur cassé / sécurité critique)
  - `P2` — Incohérence visible (UI vs BD, API morte côté front)
  - `P3` — Résidu invisible (code mort backend, dette technique)
  - `P4` — Cosmétique / qualité
- [ ] 🔵 Identifier les **dépendances inter-items** (ex : créer entité Java AVANT le service TS qui la consomme).
- [ ] 🔵 Regrouper par **lots cohérents** (un lot = une table ou un sous-système entier).
- [ ] 🔵 Produire le backlog final : `to-do/to-do-2026-05-11-db-code-alignment-backlog.md`.

**Livrable Z :** `to-do/to-do-2026-05-11-db-code-alignment-backlog.md` *(le vrai backlog d'exécution)*

---

## 3. Outillage recommandé

- `grep_search` regex pour noms de tables / colonnes / classes (ex : `Campaign[A-Z]\w*`, `campaign_questions`, `form_assignment_`).
- `file_search` glob :
  - `quizapp/src/main/java/**/dao/entity/*.java`
  - `quizapp/src/main/java/**/dao/repository/*.java`
  - `quizapp/src/main/java/**/dao/dto/*.java`
  - `quizapp/src/main/java/**/business/*.java`
  - `quizapp/src/main/java/**/controller/*.java`
  - `quizapp_front/src/app/core/models/**/*.ts`
  - `quizapp_front/src/app/core/services/**/*.ts`
  - `quizapp_front/src/app/pages/**/*.{ts,html,scss}`
- `list_dir` sur chaque sous-dossier de `pages/dashboard/`.
- Build Maven (`mvnw clean compile`) → toute erreur révèle un résidu.
- Build Angular (`ng build`) → idem côté front.
- `npx tsc --noEmit` pour le check de types pur.
- Script optionnel : extracteur JSON `{table → {entity, repo, dto, _dto, business, controller, endpoints[], service, model, pages[], route}}` à partir d'AST/regex pour générer la matrice F automatiquement.

---

## 4. Critères de fin (Definition of Done)

- [ ] 🔵 Tous les livrables A→I existent et sont remplis.
- [ ] 🔵 Chaque table BD apparaît au moins une fois dans la matrice F.
- [ ] 🔵 Chaque fichier Java / TS apparaît dans au moins un livrable (valide ou marqué).
- [ ] 🔵 Chaque endpoint backend apparaît dans la réconciliation D (consommé ou orphelin).
- [ ] 🔵 Chaque persona a au moins un parcours audité en E.
- [ ] 🔵 Le backlog Z est revu et validé par l'utilisateur avant exécution.

---

## 5. Ordonnancement & dépendances

```
A (BD inventaire)  ──┬──► B (back) ──┐
                     ├──► C (front) ─┼──► D (réconciliation API)
                     ├──► E (parcours métier)
                     ├──► H (sous-systèmes)
                     └──► G (qualité) ──► I (sécurité)

B + C ──► F (matrice traçabilité)

A + B + C + D + E + F + G + H + I ──► Z (backlog final)
```

- **A est strictement préalable** à tout le reste.
- **B et C peuvent s'exécuter en parallèle** une fois A terminé.
- **D dépend de B.5 et C.3**.
- **F dépend de B et C**.
- **Z est le dernier livrable**.

---

## 6. Notes & garde-fous

- *Ne lancer aucune correction de code avant la validation explicite du backlog Z par l'utilisateur.*
- *Si une phase produit > 50 items, la subdiviser par table / sous-système.*
- *Tenir à jour les livrables au fur et à mesure (ne pas attendre la fin pour écrire).*
- *Toute hypothèse non vérifiable doit être marquée `À CONFIRMER` plutôt que tranchée arbitrairement.*
- *En cas de doute sur l'intention métier d'une table/colonne, poser la question à l'utilisateur avant de classer en `OBSOLÈTE`.*
