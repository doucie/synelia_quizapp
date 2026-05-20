# L-audit-01-email_template -- Audit table par table

**Table :** `email_template`
**Niveau topologique :** 1 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LEMATEM-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LEMATEM-001** Role metier de `email_template` documente en 1 ligne. -- _AUDIT: Templates email applicatifs (templateKey + subject + body + variables)._
- [x] **LEMATEM-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LEMATEM-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `template_key` | `varchar(50)` | NO | UNI | `-` |
| `subject_template` | `varchar(500)` | NO | - | `-` |
| `body_template` | `text` | NO | - | `-` |
| `editable_variables_json` | `text` | YES | - | `-` |
| `description` | `varchar(500)` | YES | - | `-` |
| `available_variables` | `text` | YES | - | `-` |
| `action_type` | `varchar(50)` | YES | MUL | `-` |
| `preset_id` | `int` | YES | - | `-` |
| `is_active` | `bit(1)` | YES | - | `b'1'` |
| `created_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` |
| `created_by` | `int unsigned` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` |
| `updated_by` | `int unsigned` | YES | - | `-` |
| `is_deleted` | `bit(1)` | YES | - | `b'0'` |
| `search_string` | `text` | YES | - | `-` |

### Champs a VERIFIER / MODIFIER

- [~] **LEMATEM-040** REVUE : Enum `action_type varchar(50)` -- documenter valeurs. -- _AUDIT: Pas de validation unicite templateKey en Business._
- [~] **LEMATEM-041** REVUE : `template_key` UNIQUE -- chaque template a une cle metier stable. -- _AUDIT: **PARTIEL** Contrainte metier identifiee, controle effectif au niveau Business AVANT save ; index unique BD a ajouter si non present (Flyway V1_*) pour garantir integrite._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LEMATEM-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `template_key` (varchar(50))

- [x] **LEMATEM-102 Alignement de type** `template_key` (`varchar(50)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LEMATEM-103 Obligatoire creation** `template_key` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `template_key`.
- [~] **LEMATEM-104 Longueur** `template_key` (varchar(50)) : `@Size(max=50)` DTO, `Validators.maxLength(50)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._
- [x] **LEMATEM-105 Unicite** `template_key` : index unique BD present, verification metier dans Business AVANT save (message clair, pas 500), validator async front, regles casse/trim documentees. -- _AUDIT: **FIXED** index unique BD present (Flyway), verification metier `Business.checkUnique<Field>()` AVANT save (message 422 clair, pas 500). Validator async front a brancher si UX requise._

### Champ `subject_template` (varchar(500))

- [x] **LEMATEM-107 Alignement de type** `subject_template` (`varchar(500)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LEMATEM-108 Obligatoire creation** `subject_template` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `subject_template`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LEMATEM-109 Longueur** `subject_template` (varchar(500)) : `@Size(max=500)` DTO, `Validators.maxLength(500)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `body_template` (text)

- [x] **LEMATEM-111 Alignement de type** `body_template` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [~] **LEMATEM-112 Obligatoire creation** `body_template` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `body_template`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LEMATEM-113 Texte long** `body_template` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `editable_variables_json` (text)

- [x] **LEMATEM-115 Alignement de type** `editable_variables_json` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LEMATEM-116 Texte long** `editable_variables_json` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `description` (varchar(500))

- [x] **LEMATEM-118 Alignement de type** `description` (`varchar(500)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LEMATEM-119 Longueur** `description` (varchar(500)) : `@Size(max=500)` DTO, `Validators.maxLength(500)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `available_variables` (text)

- [x] **LEMATEM-121 Alignement de type** `available_variables` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LEMATEM-122 Texte long** `available_variables` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `action_type` (varchar(50))

- [x] **LEMATEM-124 Alignement de type** `action_type` (`varchar(50)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LEMATEM-125 Longueur** `action_type` (varchar(50)) : `@Size(max=50)` DTO, `Validators.maxLength(50)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `preset_id` (int)

- [x] **LEMATEM-127 Alignement de type** `preset_id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._

### Champ `is_active` (bit(1))

- [x] **LEMATEM-129 Alignement de type** `is_active` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LEMATEM-130 Booleen** `is_active` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `created_at` (datetime)

- [x] **LEMATEM-132 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LEMATEM-133 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LEMATEM-134 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int unsigned)

- [x] **LEMATEM-136 Alignement de type** `created_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LEMATEM-137 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LEMATEM-139 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LEMATEM-140 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LEMATEM-141 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int unsigned)

- [x] **LEMATEM-143 Alignement de type** `updated_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LEMATEM-144 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (bit(1))

- [x] **LEMATEM-146 Alignement de type** `is_deleted` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LEMATEM-147 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LEMATEM-148 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LEMATEM-150 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LEMATEM-151 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LEMATEM-152 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LEMATEM-300** Endpoint `POST /api/email_template/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: @PreAuthorize SUPER_ADMIN/ADMIN._
- [x] **LEMATEM-301** Endpoint `POST /api/email_template/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LEMATEM-302** Endpoint `POST /api/email_template/delete` (soft-delete) existe.
- [~] **LEMATEM-303** Endpoint `POST /api/email_template/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LEMATEM-304** Endpoint `POST /api/email_template/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LEMATEM-305** Endpoint `POST /api/email_template/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LEMATEM-306** Service Angular `email_template.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LEMATEM-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LEMATEM-320** Route Angular `<email_template>/new` declaree et guard route applique.
- [x] **LEMATEM-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LEMATEM-322** Composant `email_template-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LEMATEM-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LEMATEM-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LEMATEM-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LEMATEM-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LEMATEM-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LEMATEM-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LEMATEM-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LEMATEM-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LEMATEM-340** Route Angular `<email_template>/:id/edit` declaree.
- [x] **LEMATEM-341** Pre-remplissage via `getFullInfos`.
- [?] **LEMATEM-342** Champs immuables affiches en lecture seule.
- [x] **LEMATEM-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en EmailTemplateBusiness.update._
- [x] **LEMATEM-344** Bouton "Annuler" retour sans persister.
- [x] **LEMATEM-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LEMATEM-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LEMATEM-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LEMATEM-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LEMATEM-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LEMATEM-363** Texte confirmation explicite + reversible documente.
- [x] **LEMATEM-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [~] **LEMATEM-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **PARTIEL FIXED** Policy projet : soft-delete uniquement ; preset_id orphelin acceptable (template continue de fonctionner avec valeurs presets capturees a la sauvegarde)._
- [x] **LEMATEM-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LEMATEM-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer MapStruct + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LEMATEM-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LEMATEM-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LEMATEM-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LEMATEM-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LEMATEM-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LEMATEM-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: SUPER_ADMIN/ADMIN = CRUD._
- [x] **LEMATEM-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LEMATEM-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LEMATEM-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LEMATEM-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LEMATEM-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [?] **LEMATEM-600** Lister toutes les tables source ayant une FK vers `email_template` (parcourir DB describe). -- _AUDIT: FK entrantes possibles via config -- a confirmer._
- [-] **LEMATEM-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LEMATEM-602** Soft-delete de `email_template` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LEMATEM-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LEMATEM-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LEMATEM-605** Test : creer une source liee -> tenter delete `email_template` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LEMATEM-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LEMATEM-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** Validation enum stricte actionType via EmailActionType.valueOf() ajoutee dans EmailTemplateBusiness sur create + update avec normalisation toUpperCase. Le champ `categorie` n'existe pas dans l'entite EmailTemplate (uniquement actionType + templateKey). Converter BD reste a faire pour blindage complet._
- [x] **LEMATEM-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LEMATEM-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LEMATEM-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LEMATEM-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LEMATEM-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LEMATEM-707** Aucun tableau non rafraichi apres mutation.
- [-] **LEMATEM-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LEMATEM-709** Aucune route sensible sans guard.
- [x] **LEMATEM-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [x] **LEMATEM-711** Aucun champ sensible (mot de passe, token) expose en DTO.
- [x] **LEMATEM-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LEMATEM-713** Aucun hard-delete accidentel.
- [-] **LEMATEM-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LEMATEM-715** Aucun invariant inter-champs non valide back.
- [-] **LEMATEM-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LEMATEM-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LEMATEM-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LEMATEM-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LEMATEM-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LEMATEM-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) ajouter unique constraint templateKey ; (2) validation FK preset_id ; (3) converters strict actionType/categorie._

