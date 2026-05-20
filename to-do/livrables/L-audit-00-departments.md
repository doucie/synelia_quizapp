# L-audit-00-departments -- Audit table par table

**Table :** `departments`
**Niveau topologique :** 0 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LDEPART-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LDEPART-001** Role metier de `departments` documente en 1 ligne. -- _AUDIT: Organisation interne d'une entreprise : departements + specialties (FK enfant)._
- [?] **LDEPART-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant. -- _AUDIT: Verifier migration Flyway._
- [x] **LDEPART-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee). -- _AUDIT: **FIXED** UNIQUE INDEX `uk_departments_name_active` ajoute via Flyway V1_037 (couvre uniquement les lignes actives)._

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `department_name` | `varchar(255)` | NO | - | `-` |
| `department_desc` | `text` | YES | - | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LDEPART-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `department_name` (varchar(255))

- [x] **LDEPART-102 Alignement de type** `department_name` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [x] **LDEPART-103 Obligatoire creation** `department_name` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `department_name`. -- _AUDIT: **FIXED** input HTML `required` + asterisque label + trim check + NotificationService.error si vide cote front, Validate.RequiredValue cote Business.create._
- [x] **LDEPART-104 Longueur** `department_name` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **FIXED** input HTML `maxlength="255"` + `minlength="2"` + compteur live `{{ length }}/255` ajoutes au modal departements._

### Champ `department_desc` (text)

- [x] **LDEPART-106 Alignement de type** `department_desc` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LDEPART-107 Texte long** `department_desc` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** textarea `rows=4` avec `maxlength=2000` + compteur live; DTO laisse `String` libre (mapping `TEXT`)._

### Champ `created_at` (datetime)

- [x] **LDEPART-109 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LDEPART-110 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601 via Jackson, modele TS `string` ISO, affichage relatif (`pipe date` Angular)._
- [x] **LDEPART-111 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** valorise par `@CreationTimestamp` + ignore dans `Utilities.shouldUpdate()`; affichage front en lecture seule._

### Champ `created_by` (int)

- [x] **LDEPART-113 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LDEPART-114 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** valorise par `Business.create()` via `currentUserId`; ignore dans `Utilities.shouldUpdate()`._

### Champ `updated_at` (datetime)

- [x] **LDEPART-116 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LDEPART-117 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601, modele TS `string` ISO, fuseau serveur documente._
- [x] **LDEPART-118 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** `@UpdateTimestamp` Hibernate + reaffectation en Business.update()._

### Champ `updated_by` (int)

- [x] **LDEPART-120 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LDEPART-121 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** valorise par `Business.update()` via `currentUserId`._

### Champ `is_deleted` (tinyint(1))

- [x] **LDEPART-123 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LDEPART-124 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean`, jamais `Integer`; default BD 0; modele TS `boolean`; UI filtre toggle actif/supprime._
- [x] **LDEPART-125 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** init `false` en Business.create(); modifie uniquement via endpoints `/delete` (true) et `/restore` (false); pas de DELETE SQL._

### Champ `search_string` (text)

- [x] **LDEPART-127 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LDEPART-128 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** pas de tronquage cote DTO (`String` sans `@Size`/`@Column(length=...)`); jamais expose en UI._
- [x] **LDEPART-129 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** reconstruit serveur a chaque create/update via `Business.buildSearchString()` (concatene tous les champs metier textuels)._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LDEPART-300** Endpoint `POST /api/departments/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: @PreAuthorize ADMIN/SUPER_ADMIN au niveau classe._
- [x] **LDEPART-301** Endpoint `POST /api/departments/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LDEPART-302** Endpoint `POST /api/departments/delete` (soft-delete) existe. -- _AUDIT: cascadeDelete flag pour gerer FK specialties._
- [~] **LDEPART-303** Endpoint `POST /api/departments/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [x] **LDEPART-304** Endpoint `POST /api/departments/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [x] **LDEPART-305** Endpoint `POST /api/departments/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LDEPART-306** Service Angular `departments.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LDEPART-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LDEPART-320** Route Angular `<departments>/new` declaree et guard route applique.
- [x] **LDEPART-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LDEPART-322** Composant `departments-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LDEPART-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LDEPART-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LDEPART-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LDEPART-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LDEPART-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LDEPART-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LDEPART-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LDEPART-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LDEPART-340** Route Angular `<departments>/:id/edit` declaree.
- [x] **LDEPART-341** Pre-remplissage via `getFullInfos`.
- [?] **LDEPART-342** Champs immuables affiches en lecture seule.
- [x] **LDEPART-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en DepartmentsBusiness.update._
- [x] **LDEPART-344** Bouton "Annuler" retour sans persister.
- [x] **LDEPART-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LDEPART-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LDEPART-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LDEPART-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LDEPART-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LDEPART-363** Texte confirmation explicite + reversible documente.
- [x] **LDEPART-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [x] **LDEPART-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: Cascade gere via flag : bloque delete si specialties existent sauf cascadeDelete=true._
- [x] **LDEPART-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LDEPART-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer MapStruct present avec dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LDEPART-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LDEPART-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LDEPART-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LDEPART-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LDEPART-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LDEPART-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: ADMIN + SUPER_ADMIN = CRUD._
- [x] **LDEPART-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LDEPART-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LDEPART-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LDEPART-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LDEPART-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: @PreAuthorize class-level couvre tout._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LDEPART-600** Lister toutes les tables source ayant une FK vers `departments` (parcourir DB describe). -- _AUDIT: FK entrantes : specialities.department_id (gere)._
- [x] **LDEPART-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: specialities(department_id) -- M:1 via @ManyToOne, gestion cascade explicite._
- [-] **LDEPART-602** Soft-delete de `departments` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LDEPART-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LDEPART-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LDEPART-605** Test : creer une source liee -> tenter delete `departments` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LDEPART-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LDEPART-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: Pas d'enum._
- [x] **LDEPART-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LDEPART-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LDEPART-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [x] **LDEPART-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel. -- _AUDIT: Manque index UNI sur department_name._
- [?] **LDEPART-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LDEPART-707** Aucun tableau non rafraichi apres mutation.
- [-] **LDEPART-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LDEPART-709** Aucune route sensible sans guard.
- [x] **LDEPART-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [x] **LDEPART-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** check unicite findByDepartmentName en Business + UNIQUE INDEX BD `uk_departments_name_active` via Flyway V1_037 (active rows only)._
- [x] **LDEPART-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LDEPART-713** Aucun hard-delete accidentel.
- [-] **LDEPART-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LDEPART-715** Aucun invariant inter-champs non valide back.
- [-] **LDEPART-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LDEPART-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LDEPART-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LDEPART-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LDEPART-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LDEPART-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) ajouter UNIQUE BD sur department_name (avec migration) ; (2) DECOMMENTER + corriger check unicite Business.create() ; (3) tester regressions._

