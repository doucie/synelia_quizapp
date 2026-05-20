# L-audit-00-app_config -- Audit table par table

**Table :** `app_config`
**Niveau topologique :** 0 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LAPPCON-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LAPPCON-001** Role metier de `app_config` documente en 1 ligne. -- _AUDIT: Configuration globale de l'app : nom, logo, theme couleurs, branding._
- [x] **LAPPCON-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant. -- _AUDIT: V1_005__add_app_config.sql (creation), V1_028 (candidate_accounts_enabled), V1_029 (app_link)._
- [~] **LAPPCON-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee). -- _AUDIT: `search_string` absent en BD -- table singleton de config, non concerne par recherche libre._

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | NO | PRI | `-` |
| `config_name` | `varchar(100)` | NO | - | `-` |
| `company_name` | `varchar(255)` | NO | - | `Synelia` |
| `app_link` | `varchar(500)` | YES | - | `-` |
| `logo_html` | `text` | YES | - | `-` |
| `primary_color` | `varchar(7)` | NO | - | `#7C3AED` |
| `color_scheme` | `varchar(30)` | NO | - | `violet` |
| `candidate_accounts_enabled` | `tinyint(1)` | NO | - | `0` |
| `is_active` | `bit(1)` | NO | - | `b'0'` |
| `created_at` | `datetime` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `created_by` | `bigint` | YES | - | `-` |
| `updated_by` | `bigint` | YES | - | `-` |
| `is_deleted` | `bit(1)` | NO | - | `b'0'` |

### Champs a VERIFIER / MODIFIER

- [x] **LAPPCON-040** REVUE : Une seule ligne `is_active=1` autorisee. -- _AUDIT: AppConfigBusiness.activateConfig() desactive toutes les autres avant d'activer la cible._
- [x] **LAPPCON-041** REVUE : `candidate_accounts_enabled` -- branche front pour activer/desactiver inscription candidat. -- _AUDIT: Champ present + UI checkbox dans settings.html et entities-app-config.html._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (bigint)

- [x] **LAPPCON-100 Alignement de type** `id` (`bigint`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: Long cote Java, number cote TS._

### Champ `config_name` (varchar(100))

- [x] **LAPPCON-102 Alignement de type** `config_name` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: String <-> string._
- [~] **LAPPCON-103 Obligatoire creation** `config_name` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `config_name`. -- _AUDIT: Validation en Business (Validate.RequiredValue), pas d'@NotNull DTO._
- [x] **LAPPCON-104 Longueur** `config_name` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100. -- _AUDIT: **FIXED** input `maxlength="100"` + `required` cote settings.html; trim/required check cote saveConfig()._

### Champ `company_name` (varchar(255))

- [x] **LAPPCON-106 Alignement de type** `company_name` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [x] **LAPPCON-107 Longueur** `company_name` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **FIXED** input `maxlength="255"` + `required` cote settings.html._

### Champ `app_link` (varchar(500))

- [x] **LAPPCON-109 Alignement de type** `app_link` (`varchar(500)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [x] **LAPPCON-110 Longueur** `app_link` (varchar(500)) : `@Size(max=500)` DTO, `Validators.maxLength(500)` front, compteur de caracteres si >100. -- _AUDIT: **FIXED** input `type="url" maxlength="500"` cote settings.html._

### Champ `logo_html` (text)

- [x] **LAPPCON-112 Alignement de type** `logo_html` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [x] **LAPPCON-113 Texte long** `logo_html` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: Textarea + LogoHtmlSanitizerService cote front._

### Champ `primary_color` (varchar(7))

- [x] **LAPPCON-115 Alignement de type** `primary_color` (`varchar(7)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LAPPCON-116 Champ court** `primary_color` (varchar(7)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: Format hex attendu mais pas de @Pattern('^#[0-9A-Fa-f]{6}$'). Input type=color cote UI._

### Champ `color_scheme` (varchar(30))

- [x] **LAPPCON-118 Alignement de type** `color_scheme` (`varchar(30)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LAPPCON-119 Champ court** `color_scheme` (varchar(30)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: Valeurs UI : violet/blue/green/red/orange/teal/indigo/rose. Pas de converter strict, pas d'enum._

### Champ `candidate_accounts_enabled` (tinyint(1))

- [x] **LAPPCON-121 Alignement de type** `candidate_accounts_enabled` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [x] **LAPPCON-122 Booleen** `candidate_accounts_enabled` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: Boolean Java + boolean TS, JSON true/false._

### Champ `is_active` (bit(1))

- [x] **LAPPCON-124 Alignement de type** `is_active` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [x] **LAPPCON-125 Booleen** `is_active` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`.

### Champ `created_at` (datetime)

- [x] **LAPPCON-127 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LAPPCON-128 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: Transformer formate en `dd/MM/yyyy` (string) -- bien noter regle to-do-rules-front.md #12 (ne pas re-piper cote Angular)._
- [x] **LAPPCON-129 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: Business positionne createdAt a la creation, ignore en update._

### Champ `updated_at` (datetime)

- [x] **LAPPCON-131 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LAPPCON-132 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: Idem `dd/MM/yyyy`._
- [x] **LAPPCON-133 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: Business met a jour updatedAt sur update et delete._

### Champ `created_by` (bigint)

- [x] **LAPPCON-135 Alignement de type** `created_by` (`bigint`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [x] **LAPPCON-136 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front.

### Champ `updated_by` (bigint)

- [x] **LAPPCON-138 Alignement de type** `updated_by` (`bigint`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [x] **LAPPCON-139 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business).

### Champ `is_deleted` (bit(1))

- [x] **LAPPCON-141 Alignement de type** `is_deleted` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [x] **LAPPCON-142 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`.
- [x] **LAPPCON-143 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: Business.delete() met isDeleted=true uniquement._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LAPPCON-300** Endpoint `POST /api/app_config/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: POST /appConfig/create + @PreAuthorize SUPER_ADMIN._
- [x] **LAPPCON-301** Endpoint `POST /api/app_config/update` existe (convention `""`->ignore, `null`->set null). -- _AUDIT: POST /appConfig/update + @PreAuthorize SUPER_ADMIN._
- [x] **LAPPCON-302** Endpoint `POST /api/app_config/delete` (soft-delete) existe. -- _AUDIT: POST /appConfig/delete + soft-delete._
- [~] **LAPPCON-303** Endpoint `POST /api/app_config/restore` existe si necessaire metier. -- _AUDIT: Pas d'endpoint /restore dedie. Le front utilise update(isDeleted=false). A formaliser._
- [x] **LAPPCON-304** Endpoint `POST /api/app_config/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche). -- _AUDIT: POST /appConfig/getByCriteria volontairement sans @PreAuthorize (branding consomme par login non authentifie)._
- [~] **LAPPCON-305** Endpoint `POST /api/app_config/getFullInfos` retourne DTO complet (FK resolues). -- _AUDIT: Pas d'endpoint /getFullInfos -- pas necessaire ici (table singleton sans FK)._
- [~] **LAPPCON-306** Service Angular `app_config.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`. -- _AUDIT: AppConfigService a create/update/delete/getByCriteria/activate. Manque restore/getAllByCriteria/getFullInfos (mais non utilises ici)._
- [x] **LAPPCON-307** Modeles TS payload + reponse types (pas de `any`). -- _AUDIT: Interface AppConfig typee, pas de any._

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LAPPCON-320** Route Angular `<app_config>/new` declaree et guard route applique. -- _AUDIT: Pas de route /new : CRUD inline dans la page settings + entities-app-config (modal)._
- [x] **LAPPCON-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises. -- _AUDIT: Bouton 'Nouvelle config' / 'Modifier' present dans settings (SUPER_ADMIN only)._
- [x] **LAPPCON-322** Composant `app_config-form` contient TOUS les champs obligatoires (cf. Section 2). -- _AUDIT: Tous les champs editables presents dans le modal._
- [-] **LAPPCON-323** Dropdowns FK charges a `ngOnInit`, etat loading visible. -- _AUDIT: Pas de FK sortante._
- [?] **LAPPCON-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible. -- _AUDIT: Verifier qu'un click multiple en attente est bloque (signal isSaving ?)._
- [x] **LAPPCON-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`). -- _AUDIT: Payload front n'envoie pas createdBy/createdAt/isDeleted._
- [x] **LAPPCON-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5. -- _AUDIT: NotificationService.success + rafraichissement via signal._
- [?] **LAPPCON-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes. -- _AUDIT: Verifier traitement explicite des 4xx (400 / 403)._
- [?] **LAPPCON-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch). -- _AUDIT: Verifier que le DTO retour contient l'id genere._
- [x] **LAPPCON-329** `created_by` / `created_at` / `search_string` valorises serveur. -- _AUDIT: Business positionne createdBy a partir de request.getUser()._
- [-] **LAPPCON-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis. -- _AUDIT: Pas d'effet de bord mail._

### 3.C UPDATE
- [-] **LAPPCON-340** Route Angular `<app_config>/:id/edit` declaree. -- _AUDIT: Edit inline modal, pas de route /:id/edit._
- [x] **LAPPCON-341** Pre-remplissage via `getFullInfos`. -- _AUDIT: Modal pre-rempli avec la config selectionnee._
- [?] **LAPPCON-342** Champs immuables affiches en lecture seule. -- _AUDIT: Verifier que createdAt/createdBy/id sont en readonly cote UI._
- [x] **LAPPCON-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique partout en Business.update (AppConfigBusiness L117-130) ; `""`->ignore, `null`->set null, valeur->set. Convention general-rules respectee._
- [x] **LAPPCON-344** Bouton "Annuler" retour sans persister.
- [x] **LAPPCON-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LAPPCON-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Pas de @Version ni politique optimistic-lock documentee._

### 3.D SOFT_DELETE
- [x] **LAPPCON-360** Endpoint met `is_deleted=1` (jamais DELETE SQL). -- _AUDIT: Business.delete() met isDeleted=true._
- [x] **LAPPCON-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises. -- _AUDIT: Bouton corbeille visible SUPER_ADMIN._
- [x] **LAPPCON-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux). -- _AUDIT: Modal de confirmation overlay dans entities-app-config.html._
- [?] **LAPPCON-363** Texte confirmation explicite + reversible documente. -- _AUDIT: Verifier texte explicite + mention 'reversible'._
- [x] **LAPPCON-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis. -- _AUDIT: Filtre isDeleted=false par defaut._
- [-] **LAPPCON-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: Aucune FK entrante connue._
- [x] **LAPPCON-366** Rafraichissement sans F5. -- _AUDIT: Signal-based, pas de F5._

### 3.E RESTORE
- [~] **LAPPCON-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: performRestore() existe cote front mais passe par update(isDeleted=false). Pas d'endpoint dedie. Acceptable mais a documenter._

### 3.F LIST / SEARCH
- [x] **LAPPCON-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total). -- _AUDIT: Pagination serveur + page/size/total dans entities-app-config._
- [x] **LAPPCON-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`. -- _AUDIT: Recherche libre + filtres avances._
- [x] **LAPPCON-402** Filtres metier (statut, dates, FK) cote front + parametres back. -- _AUDIT: Filtres : isActive, isDeleted, dates._
- [x] **LAPPCON-403** Visibilite par persona : back filtre selon permissions effectives. -- _AUDIT: Route gardee par permissionGuard(['MANAGE_APP_CONFIG']) cote front. Back ouvert volontairement pour branding._
- [-] **LAPPCON-404** Pas de N+1 (logs SQL verifies). -- _AUDIT: Pas de FK lazy a craindre (table singleton)._


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LAPPCON-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: Matrice : SUPER_ADMIN = CRUD ; tous (meme non authentifie) = lecture branding via getByCriteria ; autres = read-only._
- [x] **LAPPCON-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie. -- _AUDIT: SUPER_ADMIN voit edit modal + bouton activate + delete._
- [x] **LAPPCON-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403. -- _AUDIT: Tous endpoints d'ecriture exigent SUPER_ADMIN._
- [?] **LAPPCON-503** Test bypass URL : persona non autorise tape URL directement -> 403 back. -- _AUDIT: Test manuel a effectuer : RECRUITER tente /appConfig/create -> 403 attendu._
- [x] **LAPPCON-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only). -- _AUDIT: Une seule config active globale._
- [x] **LAPPCON-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LAPPCON-600** Lister toutes les tables source ayant une FK vers `app_config` (parcourir DB describe). -- _AUDIT: Aucune FK entrante connue (verifier grep `app_config_id` -> vide)._
- [-] **LAPPCON-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LAPPCON-602** Soft-delete de `app_config` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LAPPCON-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LAPPCON-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LAPPCON-605** Test : creer une source liee -> tenter delete `app_config` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LAPPCON-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LAPPCON-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** Validation whitelist colorScheme alignee front COLOR_SCHEMES (violet/blue/green/red/orange/teal/indigo/rose) ajoutee dans AppConfigBusiness sur create + update avec normalisation toLowerCase. Converter BD reste a faire pour blindage complet._
- [x] **LAPPCON-702** Aucun champ entity absent du DTO (audit croise colonne par colonne). -- _AUDIT: Toutes colonnes mappees dans DTO._
- [x] **LAPPCON-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LAPPCON-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LAPPCON-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LAPPCON-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LAPPCON-707** Aucun tableau non rafraichi apres mutation. -- _AUDIT: Signal mis a jour apres mutation._
- [-] **LAPPCON-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LAPPCON-709** Aucune route sensible sans guard. -- _AUDIT: permissionGuard sur la route._
- [x] **LAPPCON-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: getByCriteria intentionnellement ouvert (branding)._
- [x] **LAPPCON-711** Aucun champ sensible (mot de passe, token) expose en DTO.
- [x] **LAPPCON-712** Aucun endpoint qui modifie `created_by`/`created_at`. -- _AUDIT: Business ne touche pas createdBy/createdAt en update._
- [x] **LAPPCON-713** Aucun hard-delete accidentel.
- [-] **LAPPCON-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LAPPCON-715** Aucun invariant inter-champs non valide back. -- _AUDIT: activateConfig garantit unicite is_active._
- [-] **LAPPCON-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LAPPCON-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LAPPCON-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LAPPCON-xxx`. -- _AUDIT: A faire au prochain rond de planning._
- [-] **LAPPCON-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: Tests unitaires Business (activateConfig, validateConfig), e2e Playwright sur le wizard SUPER_ADMIN._
- [-] **LAPPCON-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decision a remonter : adopter @Version ? Endpoint /restore dedie ? Converter enum color_scheme ?_

