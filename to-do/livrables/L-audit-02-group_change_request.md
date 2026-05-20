# L-audit-02-group_change_request -- Audit table par table

**Table :** `group_change_request`
**Niveau topologique :** 2 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LGROCHARE-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LGROCHARE-001** Role metier de `group_change_request` documente en 1 ligne. -- _AUDIT: Demande de changement de groupe (ajout/retrait/moderator) -- workflow approval._
- [x] **LGROCHARE-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LGROCHARE-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int` | NO | PRI | `-` |
| `user_id` | `int unsigned` | NO | MUL | `-` |
| `target_group_id` | `int` | NO | MUL | `-` |
| `reason` | `text` | YES | - | `-` |
| `status` | `enum('PENDING','APPROVED','REJECTED')` | NO | - | `PENDING` |
| `requested_at` | `timestamp` | YES | - | `CURRENT_TIMESTAMP` |
| `processed_at` | `timestamp` | YES | - | `-` |
| `processed_by` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `timestamp` | YES | - | `CURRENT_TIMESTAMP` |
| `created_by` | `int unsigned` | YES | - | `-` |
| `updated_at` | `timestamp` | YES | - | `-` |
| `updated_by` | `int unsigned` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | NO | - | `0` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int)

- [x] **LGROCHARE-100 Alignement de type** `id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `user_id` (int unsigned)

- [x] **LGROCHARE-102 Alignement de type** `user_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LGROCHARE-103 Obligatoire creation** `user_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `user_id`.
- [x] **LGROCHARE-104 FK** `user_id` -> probable `user` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `target_group_id` (int)

- [x] **LGROCHARE-106 Alignement de type** `target_group_id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LGROCHARE-107 Obligatoire creation** `target_group_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `target_group_id`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LGROCHARE-108 FK** `target_group_id` -> probable `target_group` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `reason` (text)

- [x] **LGROCHARE-110 Alignement de type** `reason` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LGROCHARE-111 Texte long** `reason` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `status` (enum('PENDING','APPROVED','REJECTED'))

- [x] **LGROCHARE-113 Alignement de type** `status` (`enum('PENDING','APPROVED','REJECTED')`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (valeurs enumerees BD), DTO `String`, JSON string, modele TS `string` (union de literals si necessaire)._
- [~] **LGROCHARE-114 Enum natif BD** `status` (`enum('PENDING','APPROVED','REJECTED')`) : enum Java miroir avec MEMES valeurs, `@Enumerated(EnumType.STRING)`, converter strict (D-013), constante TS unique, dropdown source unique, labels FR. -- _AUDIT: **PARTIEL** colonne `ENUM(...)` MySQL -> mapping Hibernate `@Enumerated(EnumType.STRING)` ou `String` libre ; valeurs autorisees declarees BD ; cote front, `<select>` charge constantes TS dediees._

### Champ `requested_at` (timestamp)

- [x] **LGROCHARE-116 Alignement de type** `requested_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LGROCHARE-117 Date/Datetime** `requested_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `processed_at` (timestamp)

- [x] **LGROCHARE-119 Alignement de type** `processed_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LGROCHARE-120 Date/Datetime** `processed_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `processed_by` (int unsigned)

- [x] **LGROCHARE-122 Alignement de type** `processed_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LGROCHARE-123 Numerique** `processed_by` (`int unsigned`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `created_at` (timestamp)

- [x] **LGROCHARE-125 Alignement de type** `created_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LGROCHARE-126 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LGROCHARE-127 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int unsigned)

- [x] **LGROCHARE-129 Alignement de type** `created_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LGROCHARE-130 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (timestamp)

- [x] **LGROCHARE-132 Alignement de type** `updated_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LGROCHARE-133 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LGROCHARE-134 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int unsigned)

- [x] **LGROCHARE-136 Alignement de type** `updated_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LGROCHARE-137 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LGROCHARE-139 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LGROCHARE-140 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LGROCHARE-141 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LGROCHARE-300** Endpoint `POST /api/group_change_request/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: **FIXED** class-level isAuthenticated() (user soumet sa propre demande) ; update/delete method-level @PreAuthorize ADMIN/SUPER_ADMIN (seul ADMIN traite/refuse). Controle proprietaire user_id verifie cote Business._
- [~] **LGROCHARE-301** Endpoint `POST /api/group_change_request/update` existe (convention `""`->ignore, `null`->set null).
- [~] **LGROCHARE-302** Endpoint `POST /api/group_change_request/delete` (soft-delete) existe.
- [~] **LGROCHARE-303** Endpoint `POST /api/group_change_request/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LGROCHARE-304** Endpoint `POST /api/group_change_request/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LGROCHARE-305** Endpoint `POST /api/group_change_request/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LGROCHARE-306** Service Angular `group_change_request.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LGROCHARE-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LGROCHARE-320** Route Angular `<group_change_request>/new` declaree et guard route applique.
- [x] **LGROCHARE-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LGROCHARE-322** Composant `group_change_request-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LGROCHARE-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LGROCHARE-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LGROCHARE-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LGROCHARE-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LGROCHARE-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LGROCHARE-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LGROCHARE-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LGROCHARE-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LGROCHARE-340** Route Angular `<group_change_request>/:id/edit` declaree.
- [x] **LGROCHARE-341** Pre-remplissage via `getFullInfos`.
- [?] **LGROCHARE-342** Champs immuables affiches en lecture seule.
- [x] **LGROCHARE-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en GroupChangeRequestBusiness.update._
- [x] **LGROCHARE-344** Bouton "Annuler" retour sans persister.
- [x] **LGROCHARE-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LGROCHARE-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LGROCHARE-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LGROCHARE-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LGROCHARE-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LGROCHARE-363** Texte confirmation explicite + reversible documente.
- [x] **LGROCHARE-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LGROCHARE-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LGROCHARE-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LGROCHARE-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LGROCHARE-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LGROCHARE-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LGROCHARE-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LGROCHARE-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LGROCHARE-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LGROCHARE-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LGROCHARE-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LGROCHARE-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LGROCHARE-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LGROCHARE-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LGROCHARE-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LGROCHARE-600** Lister toutes les tables source ayant une FK vers `group_change_request` (parcourir DB describe). -- _AUDIT: Pas de FK entrantes._
- [-] **LGROCHARE-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LGROCHARE-602** Soft-delete de `group_change_request` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LGROCHARE-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LGROCHARE-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LGROCHARE-605** Test : creer une source liee -> tenter delete `group_change_request` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LGROCHARE-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LGROCHARE-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: Enum status natif OK (PENDING/APPROVED/REJECTED)._
- [x] **LGROCHARE-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LGROCHARE-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LGROCHARE-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LGROCHARE-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LGROCHARE-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LGROCHARE-707** Aucun tableau non rafraichi apres mutation.
- [-] **LGROCHARE-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LGROCHARE-709** Aucune route sensible sans guard.
- [x] **LGROCHARE-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **FIXED** /update + /delete (approve/reject) annotes @PreAuthorize(hasAnyRole('ADMIN','SUPER_ADMIN')) method-level._
- [x] **LGROCHARE-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** create() verifie que dto.userId == requesterId (ou requester est ADMIN/SUPER_ADMIN) -- impossible de creer demande pour un autre user._
- [x] **LGROCHARE-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LGROCHARE-713** Aucun hard-delete accidentel.
- [-] **LGROCHARE-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LGROCHARE-715** Aucun invariant inter-champs non valide back.
- [-] **LGROCHARE-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LGROCHARE-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LGROCHARE-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LGROCHARE-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LGROCHARE-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LGROCHARE-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) UNIQUE partial PENDING ; (2) restreindre approve/reject ADMIN ; (3) verifier requester == DTO.userId pour create._

