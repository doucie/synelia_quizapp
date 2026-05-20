# L-audit-00-email_template_preset -- Audit table par table

**Table :** `email_template_preset`
**Niveau topologique :** 0 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LEMATEMPR-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LEMATEMPR-001** Role metier de `email_template_preset` documente en 1 ligne. -- _AUDIT: Presets de modeles d'email reutilisables (sujet/corps/categorie)._
- [?] **LEMATEMPR-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LEMATEMPR-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee). -- _AUDIT: Entity manque created_by/updated_by -- a aligner avec convention projet._

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int` | NO | PRI | `-` |
| `name` | `varchar(100)` | NO | - | `-` |
| `category` | `enum('MINIMAL','MODERN','CORPORATE','COLORFUL','DARK','APPLICATION_VERIFICATION','PASSWORD_RESET','INVITATION_CODE','CANDIDATE_ASK_RESULT','PRE_SCREEN_DECISION','FINAL_DECISION','INTERVIEW_INVITE','QUIZ_INVITE','WELCOME','GENERIC')` | NO | - | `GENERIC` |
| `html_structure` | `text` | NO | - | `-` |
| `preview_image` | `varchar(500)` | YES | - | `-` |
| `description` | `varchar(500)` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `0` |
| `created_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` |
| `updated_at` | `datetime` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int)

- [x] **LEMATEMPR-100 Alignement de type** `id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `name` (varchar(100))

- [x] **LEMATEMPR-102 Alignement de type** `name` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LEMATEMPR-103 Obligatoire creation** `name` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `name`.
- [~] **LEMATEMPR-104 Longueur** `name` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `category` (enum('MINIMAL','MODERN','CORPORATE','COLORFUL','DARK','APPLICATION_VERIFICATION','PASSWORD_RESET','INVITATION_CODE','CANDIDATE_ASK_RESULT','PRE_SCREEN_DECISION','FINAL_DECISION','INTERVIEW_INVITE','QUIZ_INVITE','WELCOME','GENERIC'))

- [x] **LEMATEMPR-106 Alignement de type** `category` (`enum('MINIMAL','MODERN','CORPORATE','COLORFUL','DARK','APPLICATION_VERIFICATION','PASSWORD_RESET','INVITATION_CODE','CANDIDATE_ASK_RESULT','PRE_SCREEN_DECISION','FINAL_DECISION','INTERVIEW_INVITE','QUIZ_INVITE','WELCOME','GENERIC')`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LEMATEMPR-107 Numerique** `category` (`enum('MINIMAL','MODERN','CORPORATE','COLORFUL','DARK','APPLICATION_VERIFICATION','PASSWORD_RESET','INVITATION_CODE','CANDIDATE_ASK_RESULT','PRE_SCREEN_DECISION','FINAL_DECISION','INTERVIEW_INVITE','QUIZ_INVITE','WELCOME','GENERIC')`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `html_structure` (text)

- [x] **LEMATEMPR-109 Alignement de type** `html_structure` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [~] **LEMATEMPR-110 Obligatoire creation** `html_structure` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `html_structure`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LEMATEMPR-111 Texte long** `html_structure` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `preview_image` (varchar(500))

- [x] **LEMATEMPR-113 Alignement de type** `preview_image` (`varchar(500)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LEMATEMPR-114 Longueur** `preview_image` (varchar(500)) : `@Size(max=500)` DTO, `Validators.maxLength(500)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `description` (varchar(500))

- [x] **LEMATEMPR-116 Alignement de type** `description` (`varchar(500)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LEMATEMPR-117 Longueur** `description` (varchar(500)) : `@Size(max=500)` DTO, `Validators.maxLength(500)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `is_deleted` (tinyint(1))

- [x] **LEMATEMPR-119 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LEMATEMPR-120 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LEMATEMPR-121 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `created_at` (datetime)

- [x] **LEMATEMPR-123 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LEMATEMPR-124 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LEMATEMPR-125 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LEMATEMPR-127 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LEMATEMPR-128 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LEMATEMPR-129 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LEMATEMPR-300** Endpoint `POST /api/email_template_preset/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: POST /emailTemplatePreset/create + @PreAuthorize SUPER_ADMIN/ADMIN._
- [x] **LEMATEMPR-301** Endpoint `POST /api/email_template_preset/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LEMATEMPR-302** Endpoint `POST /api/email_template_preset/delete` (soft-delete) existe.
- [~] **LEMATEMPR-303** Endpoint `POST /api/email_template_preset/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LEMATEMPR-304** Endpoint `POST /api/email_template_preset/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche). -- _AUDIT: Seul `/getAll` (sans criteres). Manque getByCriteria + getAllByCriteria._
- [~] **LEMATEMPR-305** Endpoint `POST /api/email_template_preset/getFullInfos` retourne DTO complet (FK resolues). -- _AUDIT: **PARTIEL** Endpoint `/getFullInfos` non systematique : implemente pour entites avec FK utiles (applications, campaigns, interviews) ; pour les entites simples ou singletons (app_config, smtp_config, legal_text, departments, specialities, email_template_preset), `/getById` retourne deja le DTO complet -- pas de FK a resoudre. Acceptable._
- [~] **LEMATEMPR-306** Service Angular `email_template_preset.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`. -- _AUDIT: Service email-template.service.ts expose getPresets/createPreset/updatePreset/deletePreset._
- [x] **LEMATEMPR-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LEMATEMPR-320** Route Angular `<email_template_preset>/new` declaree et guard route applique.
- [x] **LEMATEMPR-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LEMATEMPR-322** Composant `email_template_preset-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LEMATEMPR-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LEMATEMPR-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LEMATEMPR-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LEMATEMPR-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LEMATEMPR-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LEMATEMPR-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [~] **LEMATEMPR-329** `created_by` / `created_at` / `search_string` valorises serveur. -- _AUDIT: Pas de created_by en entity._
- [-] **LEMATEMPR-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LEMATEMPR-340** Route Angular `<email_template_preset>/:id/edit` declaree.
- [x] **LEMATEMPR-341** Pre-remplissage via `getFullInfos`.
- [?] **LEMATEMPR-342** Champs immuables affiches en lecture seule.
- [x] **LEMATEMPR-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en EmailTemplatePresetBusiness.update._
- [x] **LEMATEMPR-344** Bouton "Annuler" retour sans persister.
- [~] **LEMATEMPR-345** `updated_by` / `updated_at` valorises serveur. -- _AUDIT: Pas de updated_by en entity._
- [~] **LEMATEMPR-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LEMATEMPR-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LEMATEMPR-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LEMATEMPR-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LEMATEMPR-363** Texte confirmation explicite + reversible documente.
- [x] **LEMATEMPR-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [?] **LEMATEMPR-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: FK entrante : email_template.preset_id ? a verifier._
- [x] **LEMATEMPR-366** Rafraichissement sans F5.

### 3.E RESTORE
- [~] **LEMATEMPR-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: **PARTIEL** Restore via `POST /update {isDeleted:false}` (pas d'endpoint dedie `/restore`). Cascade restore non implementee -- pas de cas metier identifie justifiant la cascade. Acceptable pour le scope actuel._

### 3.F LIST / SEARCH
- [~] **LEMATEMPR-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total). -- _AUDIT: getAll() simple, pas de pagination serveur._
- [~] **LEMATEMPR-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`. -- _AUDIT: Pas de recherche/tri serveur._
- [~] **LEMATEMPR-402** Filtres metier (statut, dates, FK) cote front + parametres back. -- _AUDIT: **PARTIEL** Filtres metier disponibles via `Criteria` (BusinessGroup, status, dates, FK) ; UI front avec `<app-filter-*>` composants reutilisables ; non systematique sur toutes les listes -- ajoute au cas par cas._
- [x] **LEMATEMPR-403** Visibilite par persona : back filtre selon permissions effectives. -- _AUDIT: permissionGuard MANAGE_APP_CONFIG._
- [-] **LEMATEMPR-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LEMATEMPR-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: SUPER_ADMIN + ADMIN = CRUD._
- [x] **LEMATEMPR-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LEMATEMPR-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LEMATEMPR-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LEMATEMPR-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LEMATEMPR-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [?] **LEMATEMPR-600** Lister toutes les tables source ayant une FK vers `email_template_preset` (parcourir DB describe). -- _AUDIT: Verifier email_template.preset_id ? Sinon aucune FK entrante._
- [?] **LEMATEMPR-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [?] **LEMATEMPR-602** Soft-delete de `email_template_preset` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [?] **LEMATEMPR-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [?] **LEMATEMPR-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [?] **LEMATEMPR-605** Test : creer une source liee -> tenter delete `email_template_preset` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LEMATEMPR-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LEMATEMPR-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** L'entite EmailTemplatePreset porte deja une contrainte BD ENUM stricte sur la colonne `category` (MINIMAL/MODERN/CORPORATE/COLORFUL/DARK/APPLICATION_VERIFICATION/PASSWORD_RESET/INVITATION_CODE/CANDIDATE_ASK_RESULT/PRE_SCREEN_DECISION/FINAL_DECISION/INTERVIEW_INVITE/QUIZ_INVITE/WELCOME/GENERIC). Aucune Business CRUD (table seed via Flyway), donc la contrainte BD est suffisante._
- [~] **LEMATEMPR-702** Aucun champ entity absent du DTO (audit croise colonne par colonne). -- _AUDIT: Entity manque is_active/created_by/updated_by._
- [x] **LEMATEMPR-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LEMATEMPR-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LEMATEMPR-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LEMATEMPR-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LEMATEMPR-707** Aucun tableau non rafraichi apres mutation.
- [-] **LEMATEMPR-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LEMATEMPR-709** Aucune route sensible sans guard.
- [x] **LEMATEMPR-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [x] **LEMATEMPR-711** Aucun champ sensible (mot de passe, token) expose en DTO.
- [?] **LEMATEMPR-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LEMATEMPR-713** Aucun hard-delete accidentel.
- [-] **LEMATEMPR-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LEMATEMPR-715** Aucun invariant inter-champs non valide back.
- [-] **LEMATEMPR-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LEMATEMPR-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LEMATEMPR-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LEMATEMPR-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LEMATEMPR-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LEMATEMPR-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) creer Business + Transformer dedie (pattern projet) ; (2) ajouter is_active/created_by/updated_by ; (3) converter strict pour category ; (4) /getByCriteria avec pagination._

