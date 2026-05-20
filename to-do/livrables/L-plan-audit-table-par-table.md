# Livrable L — Plan d'audit infaillible par table (méta-plan)

**Date :** 2026-05-12
**Statut :** ✅ Plan d'audit prêt à exécuter — chaque table sera ensuite auditée dans un fichier dédié `L-audit-<table>.md` au **format checklist `[ ]`** (cf. L.2).
**Format de sortie :** **TÂCHES ACTIONNABLES UNIQUEMENT** — chaque préoccupation = une case à cocher, à l'image de `to-do/to-do-2026-04-28-business-flow-gap-checklist.md`. Les tableaux d'analyse sont interdits sauf inventaire brut (Section 1).
**Source d'inspiration :** prompt `code-alignment-revew2.md` section "AUTRE TRAVAIL D'AUDIT A FAIRE" + retours `to-do-2026-04-28-business-flow-gap-checklist.md` (incomplets).

> 🎯 **Objectif** : pour CHAQUE table de la BD, produire un audit exhaustif détectant TOUT ce qui peut être cassé ou manquant — règles métier, parsing, UI, persistance — pour générer des tâches précises et actionnables. Ce livrable L est **le gabarit** ; il sera appliqué table par table dans des fichiers dérivés.

---

## L.0 — Pourquoi ce méta-plan

Les audits précédents (`business-flow-gap-checklist 2026-04-28`) ont **manqué** des défauts qui se sont révélés au runtime :
- problèmes de parsing (typage erroné backend ↔ JSON ↔ TypeScript)
- attributs ignorés silencieusement par le DTO (`@JsonIgnore`, getter manquant, mapping incomplet)
- fonctionnalités décrites mais sans page/bouton/onglet correspondant
- boîtes de dialogue manquantes (suppression sans confirmation, etc.)
- enums non validés côté backend (chaîne libre acceptée)
- liens FK existant mais pas exposés en front (impossible de sélectionner la cible)

Ce plan **standardise** la vérification de façon à ce qu'aucun de ces angles morts ne puisse plus être oublié.

---

## L.1 — Ordre topologique des tables (sans / peu de FK d'abord)

Justification : auditer une table dépend de la connaissance de ses FK. Donc on commence par les **feuilles du graphe** (aucune FK sortante), puis on monte.

### Niveau 0 — Aucune FK sortante (hors colonnes techniques `created_by/updated_by` → user)
1. `app_config` ⚠️ (peut référencer user pour audit, à confirmer)
2. `smtp_config` ⚠️
3. `legal_text`
4. `email_template_preset`
5. `business_group`
6. `pipeline_template`
7. `departments`
8. `user` (auto-référence created_by → user, traité comme niveau 0 racine)

### Niveau 1 — 1 FK sortante métier
9. `specialities` → `departments`
10. `pipeline_stage` → `pipeline_template`
11. `email_template` → `email_template_preset`
12. `invitation_code` → `business_group` (à vérifier)
13. `user_business_group` → `user` + `business_group` (table de jointure pure, 2 FK)
14. `business_group_permission` → `business_group`
15. `system_role_permission` → (rôle enum, pas table)
16. `email_verification_tokens` → `user`
17. `notifications` → `user` (+ polymorphisme `object_table_name/id`)
18. `candidate_ask` → `user`

### Niveau 2 — 2-3 FK
19. `campaigns` → `pipeline_template` + `user` (created_by) + `specialities`
20. `group_change_request` → `user` + `business_group`
21. `question` → user (created_by) — à vérifier si lien à `departments/specialities`
22. `answer` → `question`

### Niveau 3 — formulaires et leurs versions
23. `form` → `campaigns` (D-017 ajoute `is_timed`)
24. `form_version` → `form`
25. `form_questions` → `form_version` + `question`
26. `source_token` → `campaigns` + `form`

### Niveau 4 — candidature et son cycle de vie
27. `applications` → `campaigns` + `user` + `source_token`
28. `application_progress` → `applications` + `pipeline_stage`
29. `candidate_answer` → `applications` + `form_questions` + `answer`
30. `candidate_token` → `applications`
31. `decisions` → `applications` + `user`

### Niveau 5 — entretiens et évaluations
32. `interviews` → `campaigns` + `applications` (à confirmer)
33. `candidate_interview` → `interviews` + `applications`
34. `interview_participant` → `interviews` + `user`
35. `evaluations` → `interviews` + `user`

### Niveau 6 — permissions ciblées
36. `entity_permission` (post-D-019) → `user` + `business_group` + (`role_id` ou enum)
37. `user_permission_override` → `user`
38. `campaign_follow` (post-D-018) → `user` + `campaigns`

### Tables NOUVELLES (post-décisions)
39. `mail_log` (D-021) → `user` (recipient + sender) + `email_template`
40. `campaign_follow` (D-018) → cf. niveau 6

### Tables SUPPRIMÉES (post-décisions)
- ❌ `campaign_crud` (D-018)

---

## L.2 — Gabarit d'audit applicable à CHAQUE table (format TÂCHES `[ ]`)

> **Convention** : chaque table fait l'objet d'un fichier `L-audit-<table>.md` rempli **uniquement** avec des cases à cocher `- [ ]` (comme `to-do-2026-04-28-business-flow-gap-checklist.md`). **Pas de tableaux d'analyse, pas de prose.** Chaque préoccupation se traduit en **tâches précises et actionnables** qu'un dev doit pouvoir cocher après vérification dans le code.
>
> **Légende statuts** (réutilisée du gap-checklist) :
> `[x]` implémenté et vérifié — `[~]` partiel/divergent — `[ ]` non trouvé ou non orchestré — `[?]` à vérifier en base/démo.
>
> **Format d'identifiant** : `L<TABLE>-<n>` (ex. `LDEPT-001`, `LCAMP-042`). Chaque tâche cochée OU non cochée alimente le backlog v3 si elle reste `[ ]` ou `[~]`.
>
> **Règle d'or** : si une préoccupation ne peut PAS être exprimée sous forme de tâche vérifiable, elle ne va pas dans l'audit. Les tableaux descriptifs ne sont autorisés QUE pour l'inventaire brut (Section 1).

Le gabarit ci-dessous liste les **tâches systématiques à générer** dans chaque `L-audit-<table>.md`. Le rédacteur de l'audit instancie ces tâches en remplaçant `<X>`, `<champ>`, `<persona>` etc. par les valeurs réelles de la table.

---

### Section 1 — Identité & colonnes (inventaire brut)

> Seule section où un tableau est toléré, car c'est une **photo** du schéma, pas une décision.

- [ ] **L<T>-001** Identité documentée : nom de table, rôle métier (1 ligne), niveau topologique L.1, migration Flyway de création, migrations ultérieures la touchant.
- [ ] **L<T>-002** Tableau des colonnes rempli : `nom | type SQL | nullable | default | type Java entity | type Java DTO | type TS modèle | enum (valeurs) | description`.
- [ ] **L<T>-003** Colonnes techniques présentes / attendues confirmées : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string`. Toute absence justifiée.
- [ ] **L<T>-004** Convention nommage (singulier/pluriel) cohérente avec le reste du projet — sinon tâche backlog de renommage.

---

### Section 2 — Tâches **par champ** (à dupliquer pour CHAQUE colonne métier)

Pour CHAQUE champ `<champ>` de la table, instancier ce bloc. **Les tâches dépendent du profil du champ** : ne garder que celles qui s'appliquent, mais **toutes celles qui s'appliquent doivent figurer**.

#### 2.A — Alignement de type (toujours)

- [ ] **L<T>-<n> Type SQL ↔ Java entity** `<champ>` : type entity correspond exactement (ex. `tinyint(1)` → `Boolean`, pas `Integer` ; `BIGINT` → `Long` ; `DATETIME` → `LocalDateTime` ; `text` → `String` sans `@Column(length=255)`).
- [ ] **L<T>-<n> Type Java entity ↔ DTO** `<champ>Dto` : même type, getter/setter présents, pas de `@JsonIgnore` non voulu.
- [ ] **L<T>-<n> Type DTO ↔ Transformer** : `XTransformer.toDto/toEntity` mappe `<champ>` (pas d'oubli silencieux).
- [ ] **L<T>-<n> Type DTO ↔ TS** `<champ>` dans `<entity>.model.ts` : même type (`boolean`, pas `number 0/1` ; `string` ISO pour dates ; `number` pour `Long` si < 2^53 sinon `string`).
- [ ] **L<T>-<n> Parsing aller-retour** : tester `JSON → DTO → entity → JSON` sans perte (manuellement via Postman OU test unitaire).

#### 2.B — Si `<champ>` est **obligatoire à la création** (NOT NULL sans default métier)

- [ ] **L<T>-<n> Back validation** : annotation `@NotNull` / `@NotBlank` (selon type) présente sur `<Entity>Dto.<champ>`.
- [ ] **L<T>-<n> Back Business.create** : `Validate.RequiredValue(<champ>)` (ou équivalent) appelé dans `<Entity>Business.create()` AVANT le `save()`.
- [ ] **L<T>-<n> Back rejette payload sans `<champ>`** : POST `/api/<entity>/create` sans `<champ>` retourne 400 avec message clair (vérifié Postman).
- [ ] **L<T>-<n> Front formControl** : `<champ>` déclaré avec `Validators.required` dans `<entity>-form.component.ts`.
- [ ] **L<T>-<n> Front UX** : champ marqué visuellement obligatoire (astérisque, label) dans le template HTML.
- [ ] **L<T>-<n> Front message d'erreur** : message affiché sous le champ quand vide ET touché.
- [ ] **L<T>-<n> Front bouton submit** : désactivé tant que `formGroup.invalid` (ne laisse pas envoyer un payload incomplet).
- [ ] **L<T>-<n> E2E** : tenter de soumettre formulaire vide → erreur front + aucun appel HTTP émis ; tenter via Postman seul → 400 back.

#### 2.C — Si `<champ>` est **obligatoire à la modification**

- [ ] **L<T>-<n> Back convention `""` ignore / `null` set null** respectée dans `<Entity>Business.update()` pour `<champ>` (cf. règles back).
- [ ] **L<T>-<n> Back refuse `null` explicite** si le champ ne peut jamais être effacé : test Postman `{"<champ>": null}` → 400.
- [ ] **L<T>-<n> Front pré-remplit** la valeur actuelle dans le formulaire d'édition.
- [ ] **L<T>-<n> Front ne renvoie pas `""`** sur les champs non modifiés (sinon ils seraient écrasés à vide — vérifier `patchValue` vs `setValue`).

#### 2.D — Si `<champ>` est **immuable** (interdit en UPDATE — ex. `created_by`, `created_at`)

- [ ] **L<T>-<n> Back `<Entity>Business.update()`** ignore explicitement `<champ>` du payload (pas de réaffectation).
- [ ] **L<T>-<n> Back test** : POST `/update` avec `<champ>` modifié → valeur en BD inchangée.
- [ ] **L<T>-<n> Front formulaire d'édition** : `<champ>` en lecture seule (`readonly` ou non affiché en mode update).
- [ ] **L<T>-<n> Front service.update()** : payload ne contient PAS `<champ>` (vérifier `pick()` ou DTO d'édition séparé).

#### 2.E — Si `<champ>` est une **chaîne avec longueur min/max**

- [ ] **L<T>-<n> Back `@Size(min=…, max=…)`** sur DTO.
- [ ] **L<T>-<n> Back colonne SQL** taille suffisante (`varchar(N)` >= max).
- [ ] **L<T>-<n> Front `Validators.minLength/maxLength`** sur formControl.
- [ ] **L<T>-<n> Front compteur de caractères** affiché si max significatif (> 100).
- [ ] **L<T>-<n> Test dépassement** : envoyer N+1 caractères → 400 back ET erreur front avant submit.

#### 2.F — Si `<champ>` est un **enum** (liste fermée de valeurs)

- [ ] **L<T>-<n> Back enum Java** déclaré dans `tech.synelia.quizapp.enums.<NomEnum>` (ou package dédié) avec **toutes** les valeurs métier.
- [ ] **L<T>-<n> Back entity** utilise `@Enumerated(EnumType.STRING)` (jamais `ORDINAL`).
- [ ] **L<T>-<n> Back DTO** type = String OU enum, mais **converter strict** rejette valeur inconnue (D-013).
- [ ] **L<T>-<n> Back rejette valeur hors enum** : POST avec `<champ>: "INVALID"` → 400.
- [ ] **L<T>-<n> Front constante** : valeurs déclarées dans un seul fichier (`<entity>.enums.ts` ou équivalent) — **pas de hardcode dispersé**.
- [ ] **L<T>-<n> Front dropdown** alimenté par cette constante unique (vérifier qu'aucun composant ne réinvente la liste).
- [ ] **L<T>-<n> Front labels traduits** (FR) pour chaque valeur.
- [ ] **L<T>-<n> Cohérence BD ↔ Java ↔ TS** : nombre de valeurs et orthographe identiques (test : itérer enum Java, comparer à la liste TS).

#### 2.G — Si `<champ>` est un **booléen**

- [ ] **L<T>-<n> Back DTO** type `Boolean` (pas `Integer`).
- [ ] **L<T>-<n> Back default BD** explicite (`DEFAULT 0` ou `DEFAULT 1`) ET reflété dans entity (`@Column(columnDefinition=…)` ou init Java).
- [ ] **L<T>-<n> Front modèle TS** type `boolean` strict.
- [ ] **L<T>-<n> Front UI** : checkbox/toggle (pas un input texte 0/1).
- [ ] **L<T>-<n> Sérialisation JSON** : valeur arrive comme `true`/`false`, jamais `0`/`1` (test Postman + DevTools réseau).

#### 2.H — Si `<champ>` est un **nombre avec range**

- [ ] **L<T>-<n> Back `@Min` / `@Max`** sur DTO.
- [ ] **L<T>-<n> Front `Validators.min/max`** sur formControl.
- [ ] **L<T>-<n> Front input type=number** avec attributs `min` / `max` / `step`.
- [ ] **L<T>-<n> Test borne** : envoyer min-1 et max+1 → 400 back + erreur front.

#### 2.I — Si `<champ>` est une **date / datetime**

- [ ] **L<T>-<n> Back type** : `LocalDate` (date seule) ou `LocalDateTime` (date+heure) ou `Instant` (UTC) — cohérent avec colonne SQL.
- [ ] **L<T>-<n> Sérialisation ISO 8601** (Jackson configuré, pas de timestamps numériques).
- [ ] **L<T>-<n> Front modèle TS** : `string` ISO (jamais `Date` natif dans le modèle réseau).
- [ ] **L<T>-<n> Front composant** : date picker (pas input texte libre).
- [ ] **L<T>-<n> Fuseau horaire** : convention projet documentée (UTC en base ? heure locale serveur ?) et respectée.
- [ ] **L<T>-<n> Invariant inter-dates** si applicable (ex. `<champ_début> < <champ_fin>`) : validator back + front.

#### 2.J — Si `<champ>` est une **FK sortante** (lien vers table cible)

- [ ] **L<T>-<n> BD FK active** : `SHOW CREATE TABLE` confirme `FOREIGN KEY (<champ>_id) REFERENCES <cible>(id)` — pas orpheline.
- [ ] **L<T>-<n> Politique `ON DELETE`** documentée et cohérente métier (CASCADE / RESTRICT / SET NULL).
- [ ] **L<T>-<n> Entity Java** : `@ManyToOne(fetch=LAZY)` + `@JoinColumn(name="<champ>_id")`.
- [ ] **L<T>-<n> DTO sortant** : expose `<champ>Id` (Long) ET/OU `<champ>` (DTO complet via `getFullInfos`) selon besoin métier.
- [ ] **L<T>-<n> DTO entrant** : accepte `<champ>Id` à la création.
- [ ] **L<T>-<n> Back vérifie existence cible** : si `<champ>Id` fourni mais introuvable (ou `is_deleted=1`) → 400/404 explicite.
- [ ] **L<T>-<n> Front dropdown/autocomplete** : composant `<entity>-form` charge la liste via `<Cible>Service.getAllByCriteria()` ou autocomplete.
- [ ] **L<T>-<n> Front dropdown filtré** : seuls les enregistrements valides (non supprimés, accessibles à l'utilisateur courant) sont proposés.
- [ ] **L<T>-<n> Front affiche libellé** lisible (pas l'ID brut) dans listes / détails.
- [ ] **L<T>-<n> Création inline** : décision métier prise (peut-on créer la cible depuis le formulaire courant ?). Si OUI → tâche d'implémenter le bouton/dialog.
- [ ] **L<T>-<n> Permissions cible** : récupération de la liste cible respecte les permissions de l'utilisateur connecté.

#### 2.K — Si `<champ>` a une **contrainte d'unicité**

- [ ] **L<T>-<n> Index unique BD** présent (`UNIQUE KEY`) — sinon migration à créer.
- [ ] **L<T>-<n> Back vérification métier** dans `<Entity>Business.create()` AVANT save (évite l'exception SQL brute).
- [ ] **L<T>-<n> Back message d'erreur** spécifique (`<champ> déjà utilisé`) — pas une 500 générique.
- [ ] **L<T>-<n> Front validator async** ou vérification au blur sur le formulaire.
- [ ] **L<T>-<n> Casse / espaces** : règle d'unicité documentée (case-insensitive ? trim ?) et appliquée des deux côtés.

#### 2.L — Si `<champ>` a un **format spécifique** (email, regex, téléphone…)

- [ ] **L<T>-<n> Back `@Email`** ou `@Pattern(regexp=…)` sur DTO.
- [ ] **L<T>-<n> Front `Validators.email` / `Validators.pattern`** sur formControl.
- [ ] **L<T>-<n> Front masque** d'input ou placeholder explicite.
- [ ] **L<T>-<n> Test valeur invalide** : 400 back + erreur front avant submit.

#### 2.M — Si `<champ>` dépend d'un autre champ (invariant inter-champs)

- [ ] **L<T>-<n> Invariant énoncé** clairement (ex. `if statut = OPEN then start_date <= now`).
- [ ] **L<T>-<n> Back validator custom** (class-level `@AssertTrue` ou check dans Business) — pas seulement front.
- [ ] **L<T>-<n> Front formGroup validator** ou disable conditionnel.
- [ ] **L<T>-<n> Test combinatoire** : envoyer combinaison interdite → 400 back + blocage front.

#### 2.N — Cas spécial **colonnes techniques**

- [ ] **L<T>-<n> `created_by` / `created_at`** : positionnés serveur uniquement, jamais acceptés du payload, immuables (cf. 2.D).
- [ ] **L<T>-<n> `updated_by` / `updated_at`** : positionnés serveur à chaque update (`@PreUpdate` ou Business).
- [ ] **L<T>-<n> `is_deleted`** : toujours `0` à la création, modifié uniquement via endpoint `delete` (soft-delete).
- [ ] **L<T>-<n> `search_string`** : reconstruit serveur à chaque create/update (méthode `buildSearchString()` dans Business) avec **tous** les champs métier textuels.

---

### Section 3 — Tâches **par opération** (à dupliquer pour CHAQUE opération supportée)

Opérations à instancier : `CREATE`, `UPDATE`, `SOFT_DELETE`, `RESTORE`, `HARD_DELETE`, `READ_ONE`, `LIST`, `SEARCH`, `EXPORT`, plus toute **action métier** spécifique (`PUBLISH`, `CLOSE`, `ASSIGN`, etc.).

#### 3.A — Tâches communes à toute opération

- [ ] **L<T>-<n> Endpoint REST** existe : `POST /api/<entity>/<op>` (convention POST-only).
- [ ] **L<T>-<n> Méthode contrôleur** : `<Entity>Controller.<op>(@RequestBody @Valid <Entity>Dto dto)` présente.
- [ ] **L<T>-<n> `@PreAuthorize`** posé et correct (cf. matrice persona section 4).
- [ ] **L<T>-<n> Business** : méthode `<Entity>Business.<op>()` existe, transactionnelle si écriture.
- [ ] **L<T>-<n> Repository** : query custom dans `_<Entity>Repository` si besoin, sinon JPA standard.
- [ ] **L<T>-<n> Service Angular** : `<entity>.service.ts` expose méthode `<op>(payload)` qui POST sur le bon URL.
- [ ] **L<T>-<n> Modèles TS** : payload et réponse typés (pas `any`).
- [ ] **L<T>-<n> Intercepteur HTTP** : token JWT injecté automatiquement.

#### 3.B — Spécifique CREATE (l'utilisateur clique « Enregistrer » dans un formulaire de création)

- [ ] **L<T>-<n> Page existe** : route Angular `<entity>/new` (ou équivalent) déclarée dans `app.routes.ts`.
- [ ] **L<T>-<n> Lien d'accès** : bouton « Nouveau » visible depuis la page liste, OU entrée de menu accessible aux personas autorisés.
- [ ] **L<T>-<n> Guard route** : seuls les personas autorisés peuvent atteindre l'URL (test : connexion CANDIDATE → /admin/<entity>/new → 403/redirect).
- [ ] **L<T>-<n> Composant formulaire** : `<entity>-form.component.ts` existe, contient TOUS les champs obligatoires de la table.
- [ ] **L<T>-<n> Tous les `<champ>` obligatoires** ont leur formControl + leur input HTML correspondant (audit croisé section 2).
- [ ] **L<T>-<n> Dropdowns FK** : chargés à `ngOnInit` (loading state visible).
- [ ] **L<T>-<n> Bouton « Enregistrer »** : présent, libellé clair, désactivé si `formGroup.invalid` OU si appel en cours.
- [ ] **L<T>-<n> Spinner / état chargement** : visible pendant l'appel API.
- [ ] **L<T>-<n> Payload envoyé** : contient bien tous les champs requis et **pas** les champs immuables (vérifier DevTools réseau).
- [ ] **L<T>-<n> Succès** : toast vert affiché, redirection vers liste OU détail, liste rafraîchie (pas de F5 nécessaire).
- [ ] **L<T>-<n> Échec 400 back** : toast rouge avec message back, formulaire reste rempli, champs en erreur surlignés.
- [ ] **L<T>-<n> Échec 401/403** : redirection login OU toast permission.
- [ ] **L<T>-<n> Échec 500** : toast erreur générique, log console, formulaire conservé.
- [ ] **L<T>-<n> Back retourne DTO complet** : la réponse inclut l'ID généré + tous les champs via `getFullInfos` (le front peut afficher le détail sans re-fetch).
- [ ] **L<T>-<n> `created_by` / `created_at`** valorisés serveur (pas dans payload).
- [ ] **L<T>-<n> `search_string`** reconstruit serveur.
- [ ] **L<T>-<n> Effets de bord** déclenchés si applicable : mail envoyé (cf. `mail_log` D-021), notification créée, cache invalidé.

#### 3.C — Spécifique UPDATE

- [ ] **L<T>-<n> Page édition** : route `<entity>/:id/edit` accessible.
- [ ] **L<T>-<n> Pré-remplissage** : tous les champs chargés depuis `getById` ou équivalent.
- [ ] **L<T>-<n> Champs immuables** affichés en lecture seule (cf. 2.D).
- [ ] **L<T>-<n> Convention `""`/`null`/value** respectée côté front (ne renvoyer `""` que pour ignorer, `null` pour effacer explicitement).
- [ ] **L<T>-<n> Bouton « Annuler »** : retour sans persister.
- [ ] **L<T>-<n> `updated_by` / `updated_at`** valorisés serveur.
- [ ] **L<T>-<n> Concurrence** : décision prise (optimistic lock `@Version` ? last-write-wins ?) et documentée.
- [ ] **L<T>-<n> Succès / échec** : mêmes garanties qu'en CREATE.

#### 3.D — Spécifique SOFT_DELETE

- [ ] **L<T>-<n> Endpoint `/delete`** met `is_deleted=1` (pas `DELETE` SQL).
- [ ] **L<T>-<n> Bouton corbeille** visible sur ligne de liste ET/OU page détail.
- [ ] **L<T>-<n> `<app-confirm-dialog>`** déclenchée AVANT l'appel (jamais de suppression silencieuse).
- [ ] **L<T>-<n> Texte confirmation** explicite (« Supprimer <nom> ? Cette action est réversible. »).
- [ ] **L<T>-<n> Liste filtrée** : `is_deleted=1` exclu par défaut.
- [ ] **L<T>-<n> Page « corbeille »** existe si métier le requiert.
- [ ] **L<T>-<n> Cascade** : FK entrantes (cf. section 4 FK entrantes) traitées (cascade soft-delete ? bloquer ? laisser orphelin ?).
- [ ] **L<T>-<n> Refresh liste** sans F5.

#### 3.E — Spécifique RESTORE

- [ ] **L<T>-<n> Endpoint `/restore`** remet `is_deleted=0`.
- [ ] **L<T>-<n> Accessible** depuis la page corbeille.
- [ ] **L<T>-<n> Cascade restore** décidée et documentée.

#### 3.F — Spécifique HARD_DELETE (rare — généralement SUPER only)

- [ ] **L<T>-<n> Endpoint protégé** SUPER uniquement.
- [ ] **L<T>-<n> Double confirmation** (saisir le nom pour confirmer).
- [ ] **L<T>-<n> FK entrantes** : `ON DELETE` cohérent OU vérification métier bloquante.

#### 3.G — Spécifique LIST / SEARCH

- [ ] **L<T>-<n> Page liste** existe et accessible aux personas autorisés.
- [ ] **L<T>-<n> Pagination serveur** : front envoie `page` + `pageSize`, back retourne `total`.
- [ ] **L<T>-<n> Tri** : colonnes triables identifiées + paramètres `sortBy` + `sortDir` envoyés au back.
- [ ] **L<T>-<n> Recherche** : champ libre déclenche requête (debounced) qui filtre côté back via `search_string`.
- [ ] **L<T>-<n> Filtres avancés** : pour chaque filtre métier (statut, dates, FK), composant + paramètre back présents.
- [ ] **L<T>-<n> Visibilité par persona** : la liste retournée respecte les permissions (ex. RECRUITER ne voit que ses campagnes).
- [ ] **L<T>-<n> Performance** : pas de N+1 (vérifier logs SQL en dev).

#### 3.H — Spécifique ACTIONS MÉTIER (`PUBLISH`, `CLOSE`, `ASSIGN`, etc.)

> Une sous-section par action.

- [ ] **L<T>-<n> Transitions de statut** autorisées documentées (machine à états).
- [ ] **L<T>-<n> Back rejette** les transitions interdites avec message clair.
- [ ] **L<T>-<n> Bouton conditionnel** : visible uniquement si transition autorisée pour le statut courant.
- [ ] **L<T>-<n> Effets de bord** : mails, notifications, mises à jour cascade — chacun = une tâche.
- [ ] **L<T>-<n> Idempotence** : appeler 2× la même action → comportement défini (no-op ? erreur ?).

---

### Section 4 — Tâches **par persona** (matrice persona × opération)

> Personas : **SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR**.

Pour CHAQUE couple (persona, opération) attendu :

- [ ] **L<T>-<n> `<persona>` × `<opération>` — attendu ?** Oui/Non documenté.
- [ ] **L<T>-<n> `<persona>` × `<opération>` — point d'accès UI** : page + bouton + lien menu identifiés.
- [ ] **L<T>-<n> `<persona>` × `<opération>` — guard route** : test avec persona non autorisé → blocage.
- [ ] **L<T>-<n> `<persona>` × `<opération>` — endpoint back** : `@PreAuthorize` cohérent avec la matrice.
- [ ] **L<T>-<n> `<persona>` × `<opération>` — test bypass URL** : persona non autorisé tape l'URL directement → 403 back même si front bloque.
- [ ] **L<T>-<n> `<persona>` × `<opération>` — visibilité données** : ne voit QUE les enregistrements qu'il a le droit de voir (filtrage back).

Tout couple `[ ]` non couvert = item de backlog.

---

### Section 5 — Tâches **FK entrantes** (qui pointe vers cette table)

Pour CHAQUE table source qui a une FK vers la table auditée :

- [ ] **L<T>-<n> FK entrante recensée** : table `<source>`, colonne `<champ>_id`, politique `ON DELETE`.
- [ ] **L<T>-<n> Soft-delete de la table auditée** : impact sur `<source>` documenté (cascade ? orphelin ? bloquant ?).
- [ ] **L<T>-<n> Restore** : enregistrements `<source>` à restaurer aussi ? décidé.
- [ ] **L<T>-<n> Hard-delete** : `ON DELETE` SQL cohérent OU vérification métier bloquante.
- [ ] **L<T>-<n> Test** : créer un `<source>` lié → tenter delete de l'enregistrement auditée → comportement attendu confirmé.

---

### Section 6 — Tâches **anti-régression** (check-list "bugs classiques")

À cocher systématiquement pour la table :

- [ ] **L<T>-<n>** Aucun `tinyint(1)` mappé en `Integer` côté Java.
- [ ] **L<T>-<n>** Aucun enum BD = `varchar` sans converter strict back (D-013).
- [ ] **L<T>-<n>** Aucun champ entity absent du DTO (audit croisé colonne par colonne).
- [ ] **L<T>-<n>** Aucun `@JsonIgnore` involontaire bloquant l'écriture.
- [ ] **L<T>-<n>** Aucun bouton « Supprimer » sans `<app-confirm-dialog>`.
- [ ] **L<T>-<n>** Aucun bouton « Enregistrer » sans état `disabled` pendant l'appel.
- [ ] **L<T>-<n>** Aucun toast d'erreur manquant sur 4xx/5xx.
- [ ] **L<T>-<n>** Aucun tableau non rafraîchi après mutation.
- [ ] **L<T>-<n>** Aucun dropdown FK vide à cause d'une API non appelée.
- [ ] **L<T>-<n>** Aucune route Angular sans guard pour endpoint sensible.
- [ ] **L<T>-<n>** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [ ] **L<T>-<n>** Aucun champ sensible (mot de passe hashé, token) exposé en DTO.
- [ ] **L<T>-<n>** Aucun endpoint qui modifie `created_by` / `created_at`.
- [ ] **L<T>-<n>** Aucun hard-delete accidentel à la place du soft-delete.
- [ ] **L<T>-<n>** Aucune action métier sans propagation cascade attendue (notifs, mails, dénormalisés).
- [ ] **L<T>-<n>** Aucun invariant inter-champs non validé back (ex. `start < end`).
- [ ] **L<T>-<n>** Aucun compteur dénormalisé (`total_questions`, etc.) jamais recalculé.

---

### Section 7 — Synthèse de l'audit (à compléter en fin de fichier)

- [ ] **L<T>-<n>** Toutes les tâches ci-dessus traitées (cochées `[x]`, `[~]`, `[ ]` ou `[?]`).
- [ ] **L<T>-<n>** Items restant à `[ ]` ou `[~]` recopiés dans le backlog v3 sous leur ID `L<T>-<n>`.
- [ ] **L<T>-<n>** Tests à écrire listés (unitaires Business, intégration contrôleur, e2e Playwright).
- [ ] **L<T>-<n>** Questions ouvertes (rares) remontées dans le livrable J (décisions).

---

## L.2bis — Exemple intégral (mini, sur table fictive `departments`)

> But : montrer **concrètement** ce qu'un `L-audit-departments.md` ressemble une fois le gabarit instancié. Les IDs `LDEPT-xxx` sont indicatifs.

```markdown
# L-audit-departments — Audit table par table

## Section 1 — Identité & colonnes
- [ ] LDEPT-001 Table `departments` (niveau 0 L.1). Rôle : référentiel des départements métier. Migration : V1_005__create_departments.sql. Aucune migration ultérieure.
- [ ] LDEPT-002 Colonnes : `id BIGINT PK`, `name VARCHAR(120) NOT NULL UNIQUE`, `code VARCHAR(20) NOT NULL UNIQUE`, `description TEXT NULL`, + colonnes techniques standard.
- [ ] LDEPT-003 Colonnes techniques : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` — toutes présentes.
- [ ] LDEPT-004 Nommage `departments` (pluriel) — cohérent avec convention projet.

## Section 2 — Champ `name`
- [ ] LDEPT-010 Type SQL `VARCHAR(120) NOT NULL` ↔ entity `String` ↔ DTO `String` ↔ TS `string`.
- [ ] LDEPT-011 Transformer mappe `name` aller-retour.
- [ ] LDEPT-012 Obligatoire création : `@NotBlank` sur DTO.
- [ ] LDEPT-013 Obligatoire création : `Validate.RequiredValue("name")` dans `DepartmentsBusiness.create()`.
- [ ] LDEPT-014 Front : `name` formControl avec `Validators.required` + `Validators.maxLength(120)`.
- [ ] LDEPT-015 Front : astérisque visuel + message d'erreur sous le champ.
- [ ] LDEPT-016 Bouton submit disabled si formGroup invalid.
- [ ] LDEPT-017 Unicité : index unique SQL `uk_departments_name` présent.
- [ ] LDEPT-018 Back vérifie unicité dans Business avant save → message « Nom déjà utilisé ».
- [ ] LDEPT-019 Front validator async (optionnel) ou vérification au blur.

## Section 2 — Champ `code`
- [ ] LDEPT-020 ... (idem name, plus `@Pattern("[A-Z0-9_]{2,20}")`).

## Section 3 — Opération CREATE
- [ ] LDEPT-040 Endpoint `POST /api/departments/create` existe.
- [ ] LDEPT-041 `@PreAuthorize("hasAnyRole('SUPER','ADMIN')")` posé.
- [ ] LDEPT-042 Route Angular `/admin/departments/new` déclarée.
- [ ] LDEPT-043 Lien « Nouveau département » sur page liste pour ADMIN/SUPER.
- [ ] LDEPT-044 Composant `departments-form.component.ts` contient `name`, `code`, `description`.
- [ ] LDEPT-045 Bouton « Enregistrer » disabled si invalid OU loading.
- [ ] LDEPT-046 Succès : toast vert + redirection vers `/admin/departments`.
- [ ] LDEPT-047 Échec 400 (nom déjà utilisé) : toast rouge + champ `name` surligné.
- [ ] LDEPT-048 Back retourne DTO complet via `getFullInfos`.
- [ ] LDEPT-049 `created_by` / `search_string` valorisés serveur.

## Section 3 — Opération SOFT_DELETE
- [ ] LDEPT-060 Endpoint `POST /api/departments/delete` met `is_deleted=1`.
- [ ] LDEPT-061 Bouton corbeille sur chaque ligne pour ADMIN/SUPER.
- [ ] LDEPT-062 `<app-confirm-dialog>` : « Supprimer le département <name> ? Les spécialités liées resteront mais ne pourront plus être créées sous ce département. »
- [ ] LDEPT-063 Liste filtre `is_deleted=0` par défaut.
- [ ] LDEPT-064 FK entrante `specialities.department_id` : décision = bloquer si spécialités actives existent.
- [ ] LDEPT-065 Back vérifie l'existence de spécialités non supprimées → 409 si présentes.

## Section 4 — Persona × opération
- [ ] LDEPT-080 SUPER × tout : autorisé.
- [ ] LDEPT-081 ADMIN × CRUD : autorisé.
- [ ] LDEPT-082 RECRUITER × LIST/READ : autorisé (besoin référentiel).
- [ ] LDEPT-083 RECRUITER × CREATE/UPDATE/DELETE : refusé back + bouton caché front.
- [ ] LDEPT-084 EVALUATOR / CANDIDATE / VISITEUR × tout : refusé.

## Section 5 — FK entrantes
- [ ] LDEPT-100 `specialities.department_id` recensée, `ON DELETE RESTRICT`.
- [ ] LDEPT-101 Soft-delete departments : spécialités gardent la FK mais création nouvelle spécialité interdite si département supprimé.

## Section 6 — Anti-régression
- [ ] LDEPT-120 Pas de tinyint(1) → Integer (N/A).
- [ ] LDEPT-121 Pas d'enum (N/A).
- [ ] LDEPT-122 Bouton supprimer a confirm dialog : OK.
- ... etc.

## Section 7 — Synthèse
- [ ] LDEPT-140 Items `[ ]` restants reportés dans backlog v3.
```

---

## L.3 — Méthodologie d'exécution

### Étapes pour auditer UNE table (durée estimée : 30–90 min selon complexité)

1. **Lire le schéma BD** : `SHOW CREATE TABLE <table>` + comparer à `to-do/bd_actuelle/quizapp_db_described.md`.
2. **Lire l'entity Java** : `quizapp/src/main/java/tech/synelia/quizapp/bean/<Entity>.java`.
3. **Lire le DTO** (s'il existe) : `quizapp/src/main/java/tech/synelia/quizapp/dto/<Entity>Dto.java`.
4. **Lire le contrôleur** : `quizapp/src/main/java/tech/synelia/quizapp/api/<Entity>Api.java` (ou `Controller`).
5. **Lire le service** : `quizapp/src/main/java/tech/synelia/quizapp/service/<Entity>Service.java`.
6. **Lire le repository** : `quizapp/src/main/java/tech/synelia/quizapp/repository/<Entity>Repository.java`.
7. **Lire le service Angular** : `quizapp_front/src/app/core/services/<entity>.service.ts`.
8. **Lire les modèles TS** : `quizapp_front/src/app/core/models/<entity>.model.ts`.
9. **Lister les composants front consommateurs** : `grep_search` `<entity>Service` dans `quizapp_front/src/app/`.
10. **Lister les pages** : composants `<entity>-list`, `<entity>-form`, `<entity>-detail`, plus pages métier.
11. **Vérifier les routes Angular** : `quizapp_front/src/app/app.routes.ts` + sub-routes.
12. **Vérifier les guards** : qui peut accéder à quelle page ?
13. **Remplir les 8 sections du gabarit** dans `L-audit-<table>.md`.
14. **Générer les tâches** dans le backlog v3.

### Outils recommandés
- `grep_search` (texte exact, regex).
- `read_file` (lecture ciblée).
- `runSubagent` "Explore" pour explorations transverses (ex : "Liste tous les composants qui appellent CampaignService.update et indique la page/bouton qui les déclenche").

### Critères de qualité d'un audit (DoD — Definition of Done)
- ✅ Les 8 sections sont remplies.
- ✅ Chaque champ a été tracé du SQL au TS.
- ✅ Chaque FK (sortante + entrante) a été examinée.
- ✅ Pour chaque (persona, opération) attendu, l'audit a confirmé OU généré une tâche.
- ✅ Pour chaque opération critique, le pipeline complet est tracé sans trou.
- ✅ Toute anomalie ⇒ tâche numérotée dans le backlog v3.
- ✅ Le fichier d'audit cite explicitement les **chemins de fichiers** et numéros de ligne quand pertinent.

---

## L.4 — Matrice d'anomalies type (check-list à parcourir mentalement pour chaque champ)

> Cette liste résume les **bugs classiques** observés lors du round précédent (gap-checklist 2026-04-28 incomplet) pour ne plus les manquer.

### Parsing / typage
- [ ] `tinyint(1)` BD mais `Integer` côté Java → front reçoit `0`/`1` au lieu de `true`/`false`.
- [ ] `BIGINT UNSIGNED` BD mais `int` côté Java → overflow potentiel.
- [ ] `DATETIME` BD mais `String` côté Java → comparaisons cassées.
- [ ] `text` BD mais `varchar(255)` côté DTO → troncature silencieuse.
- [ ] Énum BD = `varchar` libre mais Java = `@Enumerated(EnumType.STRING)` → valeur en BD hors enum casse le mapping.
- [ ] DTO ↔ entity : champ présent en entity, absent du DTO → ignoré silencieusement à l'écriture.

### UI / UX
- [ ] Bouton "Supprimer" sans `<app-confirm-dialog>`.
- [ ] Bouton "Enregistrer" sans état `disabled` pendant l'appel API.
- [ ] Pas de toast d'erreur sur 4xx/5xx (échec silencieux).
- [ ] Tableau non rafraîchi après création/suppression.
- [ ] Pagination front qui ne demande pas la page suivante au back (tout en mémoire).
- [ ] Recherche front qui ne filtre pas vraiment (input ignoré).
- [ ] Dropdown FK vide parce que l'API n'est pas appelée ou retourne erreur.
- [ ] Page route définie mais pas de lien dans la sidebar (page orpheline).
- [ ] Lien dans la sidebar mais page absente (route brisée).
- [ ] Guard manquant → URL accessible à des rôles non autorisés.

### Permissions / sécurité
- [ ] Endpoint sans `@PreAuthorize` ou avec `@PreAuthorize("isAuthenticated()")` trop large.
- [ ] DTO retourne des champs sensibles (mot de passe hashé, token, etc.).
- [ ] Endpoint qui modifie `created_by`/`created_at` (immuables).
- [ ] Soft-delete contourné par un endpoint qui fait un hard delete par erreur.
- [ ] Action métier (ex : "publier campagne") sans vérification de permission cible.

### Métier
- [ ] Statut/enum modifié sans vérifier les transitions autorisées.
- [ ] Action persistée sans déclencher la notification / mail attendue.
- [ ] Action qui devrait propager un changement (cascade) ne le fait pas.
- [ ] Validation invariant inter-champs absente (ex : `campaign_start < campaign_end`).
- [ ] Compteur dénormalisé (`total_questions`, `applications_count`) jamais recalculé.

---

## L.5 — Livraison

### Fichiers à produire (un par table, dans l'ordre L.1)
- `to-do/livrables/L-audit-app_config.md`
- `to-do/livrables/L-audit-smtp_config.md`
- `to-do/livrables/L-audit-legal_text.md`
- `to-do/livrables/L-audit-email_template_preset.md`
- `to-do/livrables/L-audit-business_group.md`
- `to-do/livrables/L-audit-pipeline_template.md`
- `to-do/livrables/L-audit-departments.md`
- `to-do/livrables/L-audit-user.md`
- … *(40 fichiers au total)* …
- `to-do/livrables/L-audit-campaigns.md` (cas pédagogique du prompt — sera fait après le niveau 0 et 1)

### Backlog
- Chaque audit table alimente `to-do/to-do-2026-05-13-db-code-alignment-backlog-v3.md` avec des items préfixés `L<TABLE>-<n>`.

### Estimation effort
- Tables niveau 0 (8) : ~30 min chacune = 4h.
- Tables niveau 1 (10) : ~45 min chacune = 7h30.
- Tables niveau 2 (4) : ~75 min chacune = 5h.
- Tables niveau 3 (4) : ~60 min chacune = 4h.
- Tables niveau 4 (5) : ~90 min chacune = 7h30.
- Tables niveau 5 (4) : ~75 min chacune = 5h.
- Tables niveau 6 (3) : ~60 min chacune = 3h.
- Nouvelles tables (2) : ~45 min = 1h30.

**Total estimé : ~38h d'audit pour 40 tables.** À répartir sur plusieurs sessions / agents Explore en parallèle.

---

## L.6 — Étapes suivantes (séquence proposée)

1. ✅ **Plan validé** (ce livrable L). ← *vous êtes ici*
2. **Audit table par table** dans l'ordre L.1 :
   - 1re table à auditer pour valider le gabarit : `departments` (niveau 0, petit, peu de risque).
   - Confirmation utilisateur ⇒ déroulement sur les 39 autres.
3. **Consolidation backlog v3** au fil de l'eau.
4. **Exécution backlog** par priorité (P0 d'abord — items bloquants en prod).

---

## L.7 — Garde-fous pour ne plus revivre l'expérience gap-checklist 2026-04-28

| Problème historique | Garde-fou L |
|---|---|
| Tâches faites mais système toujours cassé | Section 7 (pipeline complet) **obligatoire** par opération |
| Parsing silencieux | Section 2 (alignement SQL ↔ Java ↔ TS) **obligatoire** par champ |
| Pages manquantes pour fonctionnalités décrites | Section 6 (matrice persona × opération) **obligatoire** |
| Boîtes de dialogue oubliées | Section 7 check : actions destructives → confirm dialog |
| Boutons sans handler | Section 7 trace bouton → méthode TS → endpoint |
| Enums non validés back | D-013 + Section 3 ligne enum |
| FK orphelines en front | Section 4 : FK exposée + dropdown alimenté |
| Permissions mal posées | Section 6 par persona + D-019 résolution permissions |

---

## L.8 — Confirmation utilisateur attendue avant déroulement

**Avant d'exécuter ce plan sur les 40 tables**, l'utilisateur valide :

- [ ] L'ordre topologique L.1 est correct (ou propose un autre ordre).
- [ ] Le gabarit L.2 (8 sections) est complet (ou ajouter des sections).
- [ ] La liste des personas (SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR) est complète.
- [ ] La granularité 1 fichier `L-audit-<table>.md` par table est OK (vs fichier unique gigantesque).
- [ ] Le checklist anomalies L.4 couvre les cas problématiques connus (sinon en ajouter).
- [ ] Quelle est la **première table** à auditer pour valider le gabarit ?
  - Recommandation : `departments` (niveau 0, simple) OU `campaigns` (niveau 2, mais cas pédagogique du prompt).
