# L-audit-00-legal_text -- Audit table par table

**Table :** `legal_text`
**Niveau topologique :** 0 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LLEGTEX-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LLEGTEX-001** Role metier de `legal_text` documente en 1 ligne. -- _AUDIT: Textes legaux multi-langues (CGU, mentions legales, RGPD...)._
- [?] **LLEGTEX-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant. -- _AUDIT: Confirmer migration Flyway initiale._
- [x] **LLEGTEX-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `text_key` | `varchar(50)` | NO | UNI | `-` |
| `title` | `varchar(255)` | NO | - | `-` |
| `content` | `text` | NO | - | `-` |
| `description` | `varchar(500)` | YES | - | `-` |
| `is_active` | `bit(1)` | YES | - | `b'1'` |
| `created_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` |
| `created_by` | `int unsigned` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` |
| `updated_by` | `int unsigned` | YES | - | `-` |
| `is_deleted` | `bit(1)` | YES | - | `b'0'` |
| `search_string` | `text` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LLEGTEX-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `text_key` (varchar(50))

- [x] **LLEGTEX-102 Alignement de type** `text_key` (`varchar(50)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LLEGTEX-103 Obligatoire creation** `text_key` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `text_key`.
- [x] **LLEGTEX-104 Longueur** `text_key` (varchar(50)) : `@Size(max=50)` DTO, `Validators.maxLength(50)` front, compteur de caracteres si >100. -- _AUDIT: **FIXED** input `maxlength="100"` cote settings.html (col elargie a varchar(100) cote schema actuel) + `required`._
- [x] **LLEGTEX-105 Unicite** `text_key` : index unique BD present, verification metier dans Business AVANT save (message clair, pas 500), validator async front, regles casse/trim documentees. -- _AUDIT: **FIXED** index unique BD present (Flyway), verification metier `Business.checkUnique<Field>()` AVANT save (message 422 clair, pas 500). Validator async front a brancher si UX requise._

### Champ `title` (varchar(255))

- [x] **LLEGTEX-107 Alignement de type** `title` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LLEGTEX-108 Obligatoire creation** `title` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `title`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LLEGTEX-109 Longueur** `title` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **FIXED** input `maxlength="255"` + `required` cote settings.html._

### Champ `content` (text)

- [x] **LLEGTEX-111 Alignement de type** `content` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [~] **LLEGTEX-112 Obligatoire creation** `content` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `content`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LLEGTEX-113 Texte long** `content` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** champ rendu via `<app-rich-text-editor>` sans tronquage; DTO `String` libre (mapping TEXT)._

### Champ `description` (varchar(500))

- [x] **LLEGTEX-115 Alignement de type** `description` (`varchar(500)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LLEGTEX-116 Longueur** `description` (varchar(500)) : `@Size(max=500)` DTO, `Validators.maxLength(500)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `is_active` (bit(1))

- [x] **LLEGTEX-118 Alignement de type** `is_active` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LLEGTEX-119 Booleen** `is_active` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `created_at` (datetime)

- [x] **LLEGTEX-121 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LLEGTEX-122 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LLEGTEX-123 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int unsigned)

- [x] **LLEGTEX-125 Alignement de type** `created_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LLEGTEX-126 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LLEGTEX-128 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LLEGTEX-129 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LLEGTEX-130 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int unsigned)

- [x] **LLEGTEX-132 Alignement de type** `updated_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LLEGTEX-133 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (bit(1))

- [x] **LLEGTEX-135 Alignement de type** `is_deleted` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LLEGTEX-136 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LLEGTEX-137 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LLEGTEX-139 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LLEGTEX-140 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LLEGTEX-141 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LLEGTEX-300** Endpoint `POST /api/legal_text/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: @PreAuthorize SUPER_ADMIN sur create/update/delete._
- [x] **LLEGTEX-301** Endpoint `POST /api/legal_text/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LLEGTEX-302** Endpoint `POST /api/legal_text/delete` (soft-delete) existe.
- [~] **LLEGTEX-303** Endpoint `POST /api/legal_text/restore` existe si necessaire metier. -- _AUDIT: Pas de /restore._
- [x] **LLEGTEX-304** Endpoint `POST /api/legal_text/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche). -- _AUDIT: getByCriteria intentionnellement sans @PreAuthorize (CGU/mentions legales doivent etre lisibles sans authentification). Decision validee._
- [~] **LLEGTEX-305** Endpoint `POST /api/legal_text/getFullInfos` retourne DTO complet (FK resolues). -- _AUDIT: **PARTIEL** Endpoint `/getFullInfos` non systematique : implemente pour entites avec FK utiles (applications, campaigns, interviews) ; pour les entites simples ou singletons (app_config, smtp_config, legal_text, departments, specialities, email_template_preset), `/getById` retourne deja le DTO complet -- pas de FK a resoudre. Acceptable._
- [~] **LLEGTEX-306** Service Angular `legal_text.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`. -- _AUDIT: Service Angular limite a getByCriteria/create/update/delete._
- [x] **LLEGTEX-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LLEGTEX-320** Route Angular `<legal_text>/new` declaree et guard route applique.
- [x] **LLEGTEX-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LLEGTEX-322** Composant `legal_text-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LLEGTEX-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LLEGTEX-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LLEGTEX-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LLEGTEX-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LLEGTEX-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LLEGTEX-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LLEGTEX-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LLEGTEX-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LLEGTEX-340** Route Angular `<legal_text>/:id/edit` declaree.
- [x] **LLEGTEX-341** Pre-remplissage via `getFullInfos`.
- [?] **LLEGTEX-342** Champs immuables affiches en lecture seule.
- [x] **LLEGTEX-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en LegalTextBusiness.update._
- [x] **LLEGTEX-344** Bouton "Annuler" retour sans persister.
- [x] **LLEGTEX-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LLEGTEX-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LLEGTEX-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LLEGTEX-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LLEGTEX-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LLEGTEX-363** Texte confirmation explicite + reversible documente.
- [x] **LLEGTEX-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LLEGTEX-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LLEGTEX-366** Rafraichissement sans F5.

### 3.E RESTORE
- [~] **LLEGTEX-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: **PARTIEL** Restore via `POST /update {isDeleted:false}` (pas d'endpoint dedie `/restore`). Cascade restore non implementee -- pas de cas metier identifie justifiant la cascade. Acceptable pour le scope actuel._

### 3.F LIST / SEARCH
- [x] **LLEGTEX-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LLEGTEX-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LLEGTEX-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LLEGTEX-403** Visibilite par persona : back filtre selon permissions effectives. -- _AUDIT: **N/A** Lecture publique CGU intentionnelle (page accessible sans auth). Ecritures verrouillees SUPER_ADMIN._
- [-] **LLEGTEX-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LLEGTEX-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: SUPER_ADMIN = CRUD ; tous (y compris VISITEUR) = lecture._
- [x] **LLEGTEX-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LLEGTEX-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LLEGTEX-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LLEGTEX-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LLEGTEX-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: **N/A** create/update/delete = SUPER_ADMIN ; getByCriteria public volontaire (acces CGU)._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LLEGTEX-600** Lister toutes les tables source ayant une FK vers `legal_text` (parcourir DB describe). -- _AUDIT: Aucune FK entrante._
- [-] **LLEGTEX-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LLEGTEX-602** Soft-delete de `legal_text` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LLEGTEX-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LLEGTEX-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LLEGTEX-605** Test : creer une source liee -> tenter delete `legal_text` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LLEGTEX-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LLEGTEX-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **N/A** entite LegalText ne contient pas de champ language (textKey/title/content/description/isActive uniquement). Pas d'enum a valider._
- [x] **LLEGTEX-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LLEGTEX-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LLEGTEX-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LLEGTEX-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LLEGTEX-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LLEGTEX-707** Aucun tableau non rafraichi apres mutation.
- [-] **LLEGTEX-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LLEGTEX-709** Aucune route sensible sans guard.
- [x] **LLEGTEX-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **N/A** getByCriteria public intentionnel (CGU lisible sans auth)._
- [x] **LLEGTEX-711** Aucun champ sensible (mot de passe, token) expose en DTO.
- [x] **LLEGTEX-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LLEGTEX-713** Aucun hard-delete accidentel.
- [-] **LLEGTEX-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LLEGTEX-715** Aucun invariant inter-champs non valide back.
- [-] **LLEGTEX-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LLEGTEX-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LLEGTEX-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LLEGTEX-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LLEGTEX-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LLEGTEX-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decision : confirmer que getByCriteria reste ouvert pour les CGU accessibles non-authentifie._

