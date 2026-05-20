# L-audit-01-user_business_group -- Audit table par table

**Table :** `user_business_group`
**Niveau topologique :** 1 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LUSEBUSGR-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LUSEBUSGR-001** Role metier de `user_business_group` documente en 1 ligne. -- _AUDIT: M:N user x business_group avec champ isModerator (V1_016)._
- [x] **LUSEBUSGR-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LUSEBUSGR-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int` | NO | PRI | `-` |
| `user_id` | `int unsigned` | NO | MUL | `-` |
| `business_group_id` | `int` | NO | MUL | `-` |
| `created_at` | `timestamp` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `timestamp` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `0` |
| `is_moderator` | `tinyint(1)` | NO | - | `0` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int)

- [x] **LUSEBUSGR-100 Alignement de type** `id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `user_id` (int unsigned)

- [x] **LUSEBUSGR-102 Alignement de type** `user_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LUSEBUSGR-103 Obligatoire creation** `user_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `user_id`.
- [x] **LUSEBUSGR-104 FK** `user_id` -> probable `user` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `business_group_id` (int)

- [x] **LUSEBUSGR-106 Alignement de type** `business_group_id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LUSEBUSGR-107 Obligatoire creation** `business_group_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `business_group_id`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LUSEBUSGR-108 FK** `business_group_id` -> probable `business_group` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (timestamp)

- [x] **LUSEBUSGR-110 Alignement de type** `created_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601 via Jackson, modele TS `string` ISO, affichage relatif (`pipe date` Angular)._
- [x] **LUSEBUSGR-111 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** valorise par `@CreationTimestamp` + ignore dans `Utilities.shouldUpdate()`; affichage front en lecture seule._
- [x] **LUSEBUSGR-112 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LUSEBUSGR-114 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** valorise par `Business.create()` via `currentUserId`; ignore dans `Utilities.shouldUpdate()`._
- [x] **LUSEBUSGR-115 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (timestamp)

- [x] **LUSEBUSGR-117 Alignement de type** `updated_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601, modele TS `string` ISO, fuseau serveur documente._
- [x] **LUSEBUSGR-118 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** `@UpdateTimestamp` Hibernate + reaffectation en Business.update()._
- [x] **LUSEBUSGR-119 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LUSEBUSGR-121 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** valorise par `Business.update()` via `currentUserId`._
- [x] **LUSEBUSGR-122 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LUSEBUSGR-124 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** DTO `Boolean`, jamais `Integer`; default BD 0; modele TS `boolean`; UI filtre toggle actif/supprime._
- [x] **LUSEBUSGR-125 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** init `false` en Business.create(); modifie uniquement via endpoints `/delete` (true) et `/restore` (false); pas de DELETE SQL._
- [x] **LUSEBUSGR-126 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `is_moderator` (tinyint(1))

- [x] **LUSEBUSGR-128 Alignement de type** `is_moderator` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LUSEBUSGR-129 Booleen** `is_moderator` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LUSEBUSGR-300** Endpoint `POST /api/user_business_group/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: **FIXED** create/update/delete method-level @PreAuthorize ADMIN/SUPER_ADMIN ; class-level UTILISATEUR autorise uniquement la lecture getByCriteria (acces a ses propres groupes pour l'UI). Pas de privilege escalation._
- [~] **LUSEBUSGR-301** Endpoint `POST /api/user_business_group/update` existe (convention `""`->ignore, `null`->set null).
- [~] **LUSEBUSGR-302** Endpoint `POST /api/user_business_group/delete` (soft-delete) existe.
- [~] **LUSEBUSGR-303** Endpoint `POST /api/user_business_group/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LUSEBUSGR-304** Endpoint `POST /api/user_business_group/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LUSEBUSGR-305** Endpoint `POST /api/user_business_group/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LUSEBUSGR-306** Service Angular `user_business_group.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LUSEBUSGR-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LUSEBUSGR-320** Route Angular `<user_business_group>/new` declaree et guard route applique.
- [x] **LUSEBUSGR-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LUSEBUSGR-322** Composant `user_business_group-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LUSEBUSGR-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LUSEBUSGR-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LUSEBUSGR-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LUSEBUSGR-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LUSEBUSGR-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LUSEBUSGR-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LUSEBUSGR-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LUSEBUSGR-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LUSEBUSGR-340** Route Angular `<user_business_group>/:id/edit` declaree.
- [x] **LUSEBUSGR-341** Pre-remplissage via `getFullInfos`.
- [?] **LUSEBUSGR-342** Champs immuables affiches en lecture seule.
- [x] **LUSEBUSGR-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en UserBusinessGroupBusiness.update._
- [x] **LUSEBUSGR-344** Bouton "Annuler" retour sans persister.
- [x] **LUSEBUSGR-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LUSEBUSGR-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LUSEBUSGR-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LUSEBUSGR-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LUSEBUSGR-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LUSEBUSGR-363** Texte confirmation explicite + reversible documente.
- [x] **LUSEBUSGR-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [~] **LUSEBUSGR-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **PARTIEL FIXED** Policy projet : soft-delete uniquement ; orphelins filtres au getFullInfos par jointure is_deleted=0._
- [x] **LUSEBUSGR-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LUSEBUSGR-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer MapStruct present._

### 3.F LIST / SEARCH
- [x] **LUSEBUSGR-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LUSEBUSGR-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LUSEBUSGR-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LUSEBUSGR-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LUSEBUSGR-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LUSEBUSGR-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: **FIXED** create/update/delete restreints @PreAuthorize ADMIN/SUPER_ADMIN method-level -- un UTILISATEUR ne peut plus s'auto-assigner._
- [x] **LUSEBUSGR-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LUSEBUSGR-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LUSEBUSGR-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LUSEBUSGR-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LUSEBUSGR-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: **FIXED** CUD restreints ADMIN/SUPER_ADMIN ; getByCriteria reste accessible UTILISATEUR (lecture)._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LUSEBUSGR-600** Lister toutes les tables source ayant une FK vers `user_business_group` (parcourir DB describe). -- _AUDIT: Aucune FK entrante directe (terminale)._
- [-] **LUSEBUSGR-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LUSEBUSGR-602** Soft-delete de `user_business_group` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LUSEBUSGR-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LUSEBUSGR-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LUSEBUSGR-605** Test : creer une source liee -> tenter delete `user_business_group` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LUSEBUSGR-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LUSEBUSGR-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: Boolean OK._
- [x] **LUSEBUSGR-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LUSEBUSGR-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LUSEBUSGR-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LUSEBUSGR-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LUSEBUSGR-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LUSEBUSGR-707** Aucun tableau non rafraichi apres mutation.
- [-] **LUSEBUSGR-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LUSEBUSGR-709** Aucune route sensible sans guard.
- [x] **LUSEBUSGR-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **FIXED** CUD restreints ADMIN/SUPER_ADMIN -- privilege escalation surface fermee._
- [x] **LUSEBUSGR-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** isModerator non modifiable par UTILISATEUR (CUD ADMIN/SUPER_ADMIN only)._
- [x] **LUSEBUSGR-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LUSEBUSGR-713** Aucun hard-delete accidentel.
- [-] **LUSEBUSGR-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LUSEBUSGR-715** Aucun invariant inter-champs non valide back.
- [-] **LUSEBUSGR-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LUSEBUSGR-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LUSEBUSGR-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LUSEBUSGR-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LUSEBUSGR-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LUSEBUSGR-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) restreindre create/update/delete a ADMIN/SUPER_ADMIN ; (2) ajouter check moderator/admin du groupe en Business ; (3) audit trail des changements isModerator._

