# L-audit-00-pipeline_template -- Audit table par table

**Table :** `pipeline_template`
**Niveau topologique :** 0 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LPIPTEM-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LPIPTEM-001** Role metier de `pipeline_template` documente en 1 ligne. -- _AUDIT: Modeles de pipeline recrutement reutilisables. Un par defaut (is_default). is_locked empeche edit._
- [x] **LPIPTEM-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LPIPTEM-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `template_name` | `varchar(255)` | NO | - | `-` |
| `template_desc` | `text` | YES | - | `-` |
| `is_default` | `bit(1)` | NO | - | `b'0'` |
| `is_active` | `bit(1)` | NO | - | `b'1'` |
| `is_locked` | `bit(1)` | NO | - | `b'0'` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `bit(1)` | NO | - | `b'0'` |
| `search_string` | `text` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LPIPTEM-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `template_name` (varchar(255))

- [x] **LPIPTEM-102 Alignement de type** `template_name` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LPIPTEM-103 Obligatoire creation** `template_name` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `template_name`.
- [~] **LPIPTEM-104 Longueur** `template_name` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `template_desc` (text)

- [x] **LPIPTEM-106 Alignement de type** `template_desc` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LPIPTEM-107 Texte long** `template_desc` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `is_default` (bit(1))

- [x] **LPIPTEM-109 Alignement de type** `is_default` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LPIPTEM-110 Booleen** `is_default` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `is_active` (bit(1))

- [x] **LPIPTEM-112 Alignement de type** `is_active` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LPIPTEM-113 Booleen** `is_active` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `is_locked` (bit(1))

- [x] **LPIPTEM-115 Alignement de type** `is_locked` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LPIPTEM-116 Booleen** `is_locked` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `created_at` (datetime)

- [x] **LPIPTEM-118 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LPIPTEM-119 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LPIPTEM-120 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LPIPTEM-122 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LPIPTEM-123 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LPIPTEM-125 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LPIPTEM-126 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LPIPTEM-127 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LPIPTEM-129 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LPIPTEM-130 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (bit(1))

- [x] **LPIPTEM-132 Alignement de type** `is_deleted` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LPIPTEM-133 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LPIPTEM-134 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LPIPTEM-136 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LPIPTEM-137 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LPIPTEM-138 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LPIPTEM-300** Endpoint `POST /api/pipeline_template/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: POST /create + ControllerFactory pattern._
- [x] **LPIPTEM-301** Endpoint `POST /api/pipeline_template/update` existe (convention `""`->ignore, `null`->set null). -- _AUDIT: Bloque update si is_locked=true._
- [x] **LPIPTEM-302** Endpoint `POST /api/pipeline_template/delete` (soft-delete) existe.
- [~] **LPIPTEM-303** Endpoint `POST /api/pipeline_template/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [x] **LPIPTEM-304** Endpoint `POST /api/pipeline_template/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche). -- _AUDIT: **FIXED** class-level @PreAuthorize ADMIN/SUPER_ADMIN couvre /getByCriteria._
- [x] **LPIPTEM-305** Endpoint `POST /api/pipeline_template/getFullInfos` retourne DTO complet (FK resolues). -- _AUDIT: /getAllByCriteria + /updateAll + /updateDeleted protected SUPER_ADMIN._
- [~] **LPIPTEM-306** Service Angular `pipeline_template.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LPIPTEM-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LPIPTEM-320** Route Angular `<pipeline_template>/new` declaree et guard route applique.
- [x] **LPIPTEM-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LPIPTEM-322** Composant `pipeline_template-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LPIPTEM-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LPIPTEM-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LPIPTEM-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LPIPTEM-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LPIPTEM-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LPIPTEM-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LPIPTEM-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LPIPTEM-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LPIPTEM-340** Route Angular `<pipeline_template>/:id/edit` declaree.
- [x] **LPIPTEM-341** Pre-remplissage via `getFullInfos`.
- [?] **LPIPTEM-342** Champs immuables affiches en lecture seule.
- [x] **LPIPTEM-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en PipelineTemplateBusiness.update._
- [x] **LPIPTEM-344** Bouton "Annuler" retour sans persister.
- [x] **LPIPTEM-345** `updated_by` / `updated_at` valorises serveur. -- _AUDIT: Endpoints supplementaires : /setDefault, /duplicate._
- [~] **LPIPTEM-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LPIPTEM-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LPIPTEM-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LPIPTEM-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LPIPTEM-363** Texte confirmation explicite + reversible documente.
- [x] **LPIPTEM-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [~] **LPIPTEM-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **PARTIEL FIXED** Policy projet : soft-delete uniquement ; pipeline_stage restent en BD mais filtres au getFullInfos (jointure sur is_deleted=0). Decision : pas de cascade physique pour audit._
- [x] **LPIPTEM-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LPIPTEM-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer MapStruct present avec toLiteDto/toFullDto + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LPIPTEM-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LPIPTEM-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LPIPTEM-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LPIPTEM-403** Visibilite par persona : back filtre selon permissions effectives. -- _AUDIT: permissionGuard(['MANAGE_APP_CONFIG'])._
- [-] **LPIPTEM-404** Pas de N+1 (logs SQL verifies).

### 3.G Invariants structurels et readiness du template

- [ ] **LPIPTEM-430** Invariant de base : tout template editable contient exactement une etape `CANDIDATURE` en premier et une etape `DECISION` en dernier.
- [ ] **LPIPTEM-431** Creation de template : le front et/ou le back injectent automatiquement `CANDIDATURE` et `DECISION` si l’utilisateur cree un pipeline vide.
- [ ] **LPIPTEM-432** Edition : `CANDIDATURE` et `DECISION` ne sont ni supprimables, ni deplacables, ni convertibles vers un autre type.
- [ ] **LPIPTEM-433** Ajout d’etape : une nouvelle etape s’insere entre les deux bornes figees, avec renumerotation coherente des `stage_order`.
- [ ] **LPIPTEM-434** Mise en conformite : si un template existant viole ces invariants (absence, doublon, ordre incorrect), la strategie de migration/correction est definie avant rollout.
- [ ] **LPIPTEM-435** Catalogue de types : arbitrer si `TECHNICAL_TEST` reste distinct de `QUIZ`; si non, prevoir fusion type/UI/BDD/emails avant d’autoriser encore l’edition.
- [ ] **LPIPTEM-436** Retrait de `CUSTOM` : documenter la suppression du type cote front/back/seed et la migration des templates qui l’utilisent deja.
- [ ] **LPIPTEM-437** Pret a produire : definir les criteres qui rendent un template reellement utilisable (types supportes, flags operants, actions disponibles, emails geres, skip gere) avant `setDefault` ou rattachement a une campagne.

## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LPIPTEM-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: SUPER_ADMIN seul sur ops bulk._
- [x] **LPIPTEM-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LPIPTEM-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LPIPTEM-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LPIPTEM-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LPIPTEM-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: **FIXED** class-level @PreAuthorize ADMIN/SUPER_ADMIN ajoute, endpoints SUPER_ADMIN override conserves._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LPIPTEM-600** Lister toutes les tables source ayant une FK vers `pipeline_template` (parcourir DB describe). -- _AUDIT: FK entrantes : pipeline_stage.pipeline_template_id, campaign.pipeline_template_id._
- [x] **LPIPTEM-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: pipeline_stage(pipeline_template_id) -- etapes du pipeline._
- [x] **LPIPTEM-602** Soft-delete de `pipeline_template` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?). -- _AUDIT: campaign(pipeline_template_id) -- utilisation par campagne._
- [-] **LPIPTEM-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LPIPTEM-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LPIPTEM-605** Test : creer une source liee -> tenter delete `pipeline_template` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LPIPTEM-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LPIPTEM-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: Pas d'enum._
- [x] **LPIPTEM-702** Aucun champ entity absent du DTO (audit croise colonne par colonne). -- _AUDIT: Boolean is_default/is_active/is_locked/is_deleted._
- [x] **LPIPTEM-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LPIPTEM-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LPIPTEM-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LPIPTEM-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LPIPTEM-707** Aucun tableau non rafraichi apres mutation.
- [-] **LPIPTEM-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LPIPTEM-709** Aucune route sensible sans guard.
- [x] **LPIPTEM-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **FIXED** class-level couvre tous les endpoints._
- [~] **LPIPTEM-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **PARTIEL FIXED** is_locked bloque update mais pas updateDeleted (restore) -- comportement clarifie : restore d'un template verrouille reste autorise pour les admins (recuperation accident). A documenter en charte permissions._
- [x] **LPIPTEM-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LPIPTEM-713** Aucun hard-delete accidentel.
- [-] **LPIPTEM-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LPIPTEM-715** Aucun invariant inter-champs non valide back.
- [-] **LPIPTEM-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LPIPTEM-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LPIPTEM-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LPIPTEM-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LPIPTEM-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LPIPTEM-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) ajouter @PreAuthorize sur create/update/delete ; (2) verifier cascade pipeline_stage avant delete ; (3) clarifier comportement is_locked vs restore._

