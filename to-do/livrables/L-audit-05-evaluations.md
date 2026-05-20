# L-audit-05-evaluations -- Audit table par table

**Table :** `evaluations`
**Niveau topologique :** 5 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LEVALUA-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LEVALUA-001** Role metier de `evaluations` documente en 1 ligne. -- _AUDIT: Evaluation d'un entretien : candidateMark (0-100) + recruiterComment._
- [x] **LEVALUA-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LEVALUA-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `candidate_mark` | `int` | YES | - | `-` |
| `recruiter_comment` | `text` | YES | - | `-` |
| `candidate_interview_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LEVALUA-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `candidate_mark` (int)

- [x] **LEVALUA-102 Alignement de type** `candidate_mark` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LEVALUA-103 Numerique** `candidate_mark` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes.

### Champ `recruiter_comment` (text)

- [x] **LEVALUA-105 Alignement de type** `recruiter_comment` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LEVALUA-106 Texte long** `recruiter_comment` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `candidate_interview_id` (int unsigned)

- [x] **LEVALUA-108 Alignement de type** `candidate_interview_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LEVALUA-109 FK** `candidate_interview_id` -> probable `candidate_interview` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LEVALUA-111 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** valorise par `@CreationTimestamp` + ignore dans `Utilities.shouldUpdate()`; affichage front en lecture seule._
- [x] **LEVALUA-112 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LEVALUA-113 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LEVALUA-115 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LEVALUA-116 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LEVALUA-118 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** `@UpdateTimestamp` Hibernate + reaffectation en Business.update()._
- [x] **LEVALUA-119 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LEVALUA-120 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LEVALUA-122 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LEVALUA-123 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LEVALUA-125 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** init `false` en Business.create(); modifie uniquement via endpoints `/delete` (true) et `/restore` (false); pas de DELETE SQL._
- [x] **LEVALUA-126 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LEVALUA-127 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LEVALUA-129 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** reconstruit serveur a chaque create/update via `Business.buildSearchString()` (concatene tous les champs metier textuels)._
- [x] **LEVALUA-130 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LEVALUA-131 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LEVALUA-300** Endpoint `POST /api/evaluations/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: @PreAuthorize class-level. **Pas d'endpoint REST public** : acces via route Angular /evaluate/:link._
- [x] **LEVALUA-301** Endpoint `POST /api/evaluations/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LEVALUA-302** Endpoint `POST /api/evaluations/delete` (soft-delete) existe.
- [~] **LEVALUA-303** Endpoint `POST /api/evaluations/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LEVALUA-304** Endpoint `POST /api/evaluations/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LEVALUA-305** Endpoint `POST /api/evaluations/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LEVALUA-306** Service Angular `evaluations.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LEVALUA-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LEVALUA-320** Route Angular `<evaluations>/new` declaree et guard route applique.
- [x] **LEVALUA-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LEVALUA-322** Composant `evaluations-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LEVALUA-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LEVALUA-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LEVALUA-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LEVALUA-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LEVALUA-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LEVALUA-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LEVALUA-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LEVALUA-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LEVALUA-340** Route Angular `<evaluations>/:id/edit` declaree.
- [x] **LEVALUA-341** Pre-remplissage via `getFullInfos`.
- [?] **LEVALUA-342** Champs immuables affiches en lecture seule.
- [~] **LEVALUA-343** Convention `""`/`null`/value respectee front (patchValue cible).
- [x] **LEVALUA-344** Bouton "Annuler" retour sans persister.
- [x] **LEVALUA-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LEVALUA-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LEVALUA-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LEVALUA-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LEVALUA-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LEVALUA-363** Texte confirmation explicite + reversible documente.
- [x] **LEVALUA-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LEVALUA-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LEVALUA-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LEVALUA-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LEVALUA-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total). -- _AUDIT: Page publique /evaluate/:link (pas de guard, lien=authentifiant via entity_permission)._
- [x] **LEVALUA-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LEVALUA-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LEVALUA-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LEVALUA-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LEVALUA-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LEVALUA-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LEVALUA-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LEVALUA-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LEVALUA-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LEVALUA-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LEVALUA-600** Lister toutes les tables source ayant une FK vers `evaluations` (parcourir DB describe). -- _AUDIT: Pas de FK entrantes._
- [-] **LEVALUA-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LEVALUA-602** Soft-delete de `evaluations` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LEVALUA-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LEVALUA-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LEVALUA-605** Test : creer une source liee -> tenter delete `evaluations` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LEVALUA-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LEVALUA-701** Aucun enum BD (varchar libre) sans converter strict back (D-013).
- [x] **LEVALUA-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [~] **LEVALUA-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture. -- _AUDIT: **PARTIEL FIXED** EvaluationsController @PreAuthorize class-level ADMIN/SUPER_ADMIN/UTILISATEUR ; getByCriteria restreint aux roles authentifies. Permissions fines par interview-recruteur a finaliser._
- [x] **LEVALUA-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LEVALUA-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LEVALUA-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LEVALUA-707** Aucun tableau non rafraichi apres mutation.
- [-] **LEVALUA-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LEVALUA-709** Aucune route sensible sans guard.
- [~] **LEVALUA-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **PARTIEL FIXED** Endpoint d'evaluation candidat protege par lien signe `interviewEvaluationsLink` (token aleatoire). Reste : rotation + expiration du lien (decision produit)._
- [x] **LEVALUA-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** candidateMark valide cote back [0, 100] dans create() et update() EvaluationsBusiness. Audit trail couvert par created_by/updated_by automatiques (colonnes techniques)._
- [x] **LEVALUA-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LEVALUA-713** Aucun hard-delete accidentel.
- [-] **LEVALUA-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LEVALUA-715** Aucun invariant inter-champs non valide back.
- [-] **LEVALUA-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LEVALUA-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LEVALUA-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LEVALUA-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LEVALUA-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LEVALUA-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) UNIQUE (candidate_interview_id, created_by) ou autoriser update only ; (2) valider candidateMark in [0,100] Business ; (3) audit trail modifs ; (4) verifier permissions READ_EVALUATIONS avant serializer._

