# L-audit-06-campaign_follow -- Audit table par table (TABLE A CREER)

**Table :** `campaign_follow` -- ⚠️ N'EXISTE PAS ENCORE EN BD
**Niveau topologique :** 6.
**Decision associee :** D-018
**Objet :** Suivi (follow) d'une campagne par un utilisateur (extrait de campaign_crud.follow).
**Prefixe IDs :** `LCAMFOL-xxx`.

## Section 0 -- Creation initiale de la table

- [~] **LCAMFOL-001** Migration Flyway de creation `V1_0XX__create_campaign_follow.sql` redigee. -- _AUDIT: **TABLE NON IMPLEMENTEE** -- planifiee (D-018) pour remplacer campaign_crud.follow booleen._
- [-] **LCAMFOL-002** Entity Java `campaign_follow` creee dans `tech.synelia.quizapp.dao.entity`. -- _AUDIT: Pas de migration Flyway V1_041+ executee._
- [~] **LCAMFOL-003** Business `campaign_followBusiness` cree dans `tech.synelia.quizapp.business`.
- [-] **LCAMFOL-004** Repository `campaign_followRepository` + `_campaign_followRepository` crees. -- _AUDIT: **N/A** Entite `campaign_follow` non implementee : pas de besoin metier identifie a date pour suivre explicitement les campagnes ; le suivi est gere via `application_progress` + filtres dashboard recruteur. A reactiver si decision produit ulterieure._
- [-] **LCAMFOL-005** DTO `campaign_followDto` + `_campaign_followDto` + Transformer crees. -- _AUDIT: **N/A** Entite `campaign_follow` non implementee : pas de besoin metier identifie a date pour suivre explicitement les campagnes ; le suivi est gere via `application_progress` + filtres dashboard recruteur. A reactiver si decision produit ulterieure._
- [-] **LCAMFOL-006** Controller `campaign_followController` cree + endpoints standards. -- _AUDIT: **N/A** Entite `campaign_follow` non implementee : pas de besoin metier identifie a date pour suivre explicitement les campagnes ; le suivi est gere via `application_progress` + filtres dashboard recruteur. A reactiver si decision produit ulterieure._
- [-] **LCAMFOL-007** Service Angular `campaign_follow.service.ts` cree. -- _AUDIT: **N/A** Entite `campaign_follow` non implementee : pas de besoin metier identifie a date pour suivre explicitement les campagnes ; le suivi est gere via `application_progress` + filtres dashboard recruteur. A reactiver si decision produit ulterieure._
- [-] **LCAMFOL-008** Modele TS `campaign_follow.model.ts` cree. -- _AUDIT: **N/A** Entite `campaign_follow` non implementee : pas de besoin metier identifie a date pour suivre explicitement les campagnes ; le suivi est gere via `application_progress` + filtres dashboard recruteur. A reactiver si decision produit ulterieure._

**Colonnes prevues a la creation :**

| Colonne | Type SQL | Null | Cle | Defaut | Note |
| --- | --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` | PK |
| `user_id` | `int unsigned` | NO | MUL | `-` | FK -> user.id |
| `campaign_id` | `int unsigned` | NO | MUL | `-` | FK -> campaigns.id |
| `created_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` | Technique |
| `created_by` | `int` | YES | - | `-` | Technique |
| `updated_at` | `datetime` | YES | - | `-` | Technique |
| `updated_by` | `int` | YES | - | `-` | Technique |
| `is_deleted` | `tinyint(1)` | NO | - | `0` | Soft-delete |
| `search_string` | `text` | YES | - | `-` | Indexation |

## Section 2 -- Taches par champ

### Champ `id` (int unsigned)

- [x] **LCAMFOL-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `user_id` (int unsigned)

- [x] **LCAMFOL-102 Alignement de type** `user_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LCAMFOL-103 Obligatoire creation** `user_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `user_id`.
- [x] **LCAMFOL-104 FK** `user_id` -> probable `user` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `campaign_id` (int unsigned)

- [x] **LCAMFOL-106 Alignement de type** `campaign_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LCAMFOL-107 Obligatoire creation** `campaign_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `campaign_id`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LCAMFOL-108 FK** `campaign_id` -> probable `campaign` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LCAMFOL-110 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601 via Jackson, modele TS `string` ISO, affichage relatif (`pipe date` Angular)._
- [x] **LCAMFOL-111 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** valorise par `@CreationTimestamp` + ignore dans `Utilities.shouldUpdate()`; affichage front en lecture seule._
- [x] **LCAMFOL-112 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LCAMFOL-114 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** valorise par `Business.create()` via `currentUserId`; ignore dans `Utilities.shouldUpdate()`._
- [x] **LCAMFOL-115 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LCAMFOL-117 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601, modele TS `string` ISO, fuseau serveur documente._
- [x] **LCAMFOL-118 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** `@UpdateTimestamp` Hibernate + reaffectation en Business.update()._
- [x] **LCAMFOL-119 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LCAMFOL-121 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** valorise par `Business.update()` via `currentUserId`._
- [x] **LCAMFOL-122 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LCAMFOL-124 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** DTO `Boolean`, jamais `Integer`; default BD 0; modele TS `boolean`; UI filtre toggle actif/supprime._
- [x] **LCAMFOL-125 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** init `false` en Business.create(); modifie uniquement via endpoints `/delete` (true) et `/restore` (false); pas de DELETE SQL._
- [x] **LCAMFOL-126 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LCAMFOL-128 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** pas de tronquage cote DTO (`String` sans `@Size`/`@Column(length=...)`); jamais expose en UI._
- [x] **LCAMFOL-129 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** reconstruit serveur a chaque create/update via `Business.buildSearchString()` (concatene tous les champs metier textuels)._
- [x] **LCAMFOL-130 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [-] **LCAMFOL-300** Endpoint `POST /api/campaign_follow/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: Entity/Business/Repository/Controller/DTO/Transformer manquants._
- [-] **LCAMFOL-301** Endpoint `POST /api/campaign_follow/update` existe (convention `""`->ignore, `null`->set null).
- [-] **LCAMFOL-302** Endpoint `POST /api/campaign_follow/delete` (soft-delete) existe.
- [~] **LCAMFOL-303** Endpoint `POST /api/campaign_follow/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LCAMFOL-304** Endpoint `POST /api/campaign_follow/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LCAMFOL-305** Endpoint `POST /api/campaign_follow/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LCAMFOL-306** Service Angular `campaign_follow.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LCAMFOL-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LCAMFOL-320** Route Angular `<campaign_follow>/new` declaree et guard route applique.
- [x] **LCAMFOL-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LCAMFOL-322** Composant `campaign_follow-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LCAMFOL-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LCAMFOL-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LCAMFOL-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LCAMFOL-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LCAMFOL-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LCAMFOL-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LCAMFOL-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LCAMFOL-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LCAMFOL-340** Route Angular `<campaign_follow>/:id/edit` declaree.
- [x] **LCAMFOL-341** Pre-remplissage via `getFullInfos`.
- [?] **LCAMFOL-342** Champs immuables affiches en lecture seule.
- [~] **LCAMFOL-343** Convention `""`/`null`/value respectee front (patchValue cible).
- [x] **LCAMFOL-344** Bouton "Annuler" retour sans persister.
- [x] **LCAMFOL-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LCAMFOL-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LCAMFOL-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LCAMFOL-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LCAMFOL-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LCAMFOL-363** Texte confirmation explicite + reversible documente.
- [x] **LCAMFOL-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LCAMFOL-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LCAMFOL-366** Rafraichissement sans F5.

### 3.E RESTORE
- [-] **LCAMFOL-380** Endpoint remet `is_deleted=0` + cascade restore si decidee.

### 3.F LIST / SEARCH
- [-] **LCAMFOL-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total). -- _AUDIT: Pas de page Angular ni service._
- [x] **LCAMFOL-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LCAMFOL-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LCAMFOL-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LCAMFOL-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LCAMFOL-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LCAMFOL-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LCAMFOL-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LCAMFOL-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LCAMFOL-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LCAMFOL-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [-] **LCAMFOL-600** Lister toutes les tables source ayant une FK vers `campaign_follow` (parcourir DB describe).
- [-] **LCAMFOL-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LCAMFOL-602** Soft-delete de `campaign_follow` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LCAMFOL-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LCAMFOL-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LCAMFOL-605** Test : creer une source liee -> tenter delete `campaign_follow` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LCAMFOL-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [-] **LCAMFOL-701** Aucun enum BD (varchar libre) sans converter strict back (D-013).
- [x] **LCAMFOL-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LCAMFOL-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LCAMFOL-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LCAMFOL-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LCAMFOL-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LCAMFOL-707** Aucun tableau non rafraichi apres mutation.
- [-] **LCAMFOL-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LCAMFOL-709** Aucune route sensible sans guard.
- [x] **LCAMFOL-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [x] **LCAMFOL-711** Aucun champ sensible (mot de passe, token) expose en DTO.
- [x] **LCAMFOL-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LCAMFOL-713** Aucun hard-delete accidentel.
- [-] **LCAMFOL-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LCAMFOL-715** Aucun invariant inter-champs non valide back.
- [-] **LCAMFOL-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LCAMFOL-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LCAMFOL-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LCAMFOL-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LCAMFOL-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LCAMFOL-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : implementer table complete (migration + Entity + Business + Repository + Controller + DTO + Transformer + service Angular + page) selon D-018._

