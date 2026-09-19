# PLAN — Passage MCD → MLD (règles Merise `plans/rules/regles_mld.md`)

## Statut

- Plan créé ; **Règles 1 → 6 complètes** (25 entités → 25 relations ; CIF migrées en FK ;
  associations N,N → relations propres ; nullabilités fixées ; réflexive `e-annuler`
  traitée ; pas d'association n-aire).
- **Règles 7, 8, 9 complètes** (rien à traiter en amont ; notation et comptage arrêtés).
- Implémentation : réécriture des 4 fichiers `nouveau/mld/*.ts` + vérifs + commits.
- Méthode : on modifie ce plan règle par règle, puis on implémente la conversion du MCD.

## Contexte & décisions

- Conversion réalisée **à partir des MCD actuels** (`src/diagrams/nouveau/mcd/*.ts`),
  **pas à partir de la BD physique**.
- Conventions (règles 1 & 8) : le MLD reste **en français**, le nom de chaque relation
  reprend celui de l'entité MCD (aucune traduction/reformulation à ce stade) ; la bascule
  anglais/snake_case n'intervient qu'au passage MLD → MPD (plan ultérieur).
- Notation dans les fichiers `nouveau/mld/*.ts` : clé primaire = `isPK: true` (soulignée),
  clé étrangère = `isFK: true` (préfixée `#`), jamais soulignée.
- **Périmètre** : réécriture des **4 fichiers `nouveau/mld/{campagnes_pipeline,candidatures_suivi,entretiens_evaluation,utilisateurs_droits}.ts`**.
- **Hors périmètre** (plan ultérieur) : le passage MLD → MPD et la correspondance
  MCD↔MPD du README.

---

## Règle 1 — Passage des entités vers les relations

**Rappel** : chaque entité devient une relation (table) portant les mêmes attributs ;
l'identifiant devient la clé primaire, soulignée. Aucun attribut perdu ni ajouté.

### Campagnes & pipeline (`campagnes_pipeline.ts`)

- [ ] `CAMPAGNE(id_campagne)` : titre, description, statut, date_debut, date_fin,
      max_candidatures, max_tentatives, chronometree, est_publiee, est_archivee
- [ ] `MODELE_PIPELINE(id_modele_pipeline)` : libelle_modele, est_defaut, est_actif, est_verrouillé
- [ ] `ETAPE_PIPELINE(id_etape_pipeline)` : type_etape, libelle_etape, ordre_etape,
      est_requise, est_eliminatoire, est_active
- [ ] `REGLE_NOTIFICATION(id_regle_notification)` : code_declencheur, code_resultat,
      est_requise, est_automatique
- [ ] `FORMULAIRE(id_formulaire)` : nom, description, est_actif, chronometre
- [ ] `VERSION_FORMULAIRE(id_version_formulaire)` : numero_version, est_publiee,
      est_verrouillee, questions_aleatoires
- [ ] `QUESTION(id_question)` : enonce, type, score, chrono, difficulte, correction_manuelle
- [ ] `REPONSE(id_reponse)` : type_reponse, texte, ordre, est_correcte, commentaire_autorise

### Candidatures & suivi (`candidatures_suivi.ts`)

- [ ] `CANDIDATURE(id_candidature)` : prenom_candidat, nom_candidat, email, telephone, cv,
      lettre_motivation, date_naissance, email_verifie, est_abandonnee
- [ ] `AVANCEMENT(id_avancement)` : statut_progression, date_debut, date_fin, score, notes,
      date_validation, commentaire_validation, date_saut, raison_saut, date_reouverture,
      raison_reouverture
- [ ] `TOKEN_CANDIDAT(id_token_candidat)` : chaine_token
- [ ] `TOKEN_VERIFICATION_EMAIL(id_token_verification_email)` : chaine_token, type_token,
      date_expiration, est_utilise
- [ ] `DECISION(id_decision)` : type_decision, justification, mode_decision

### Entretiens & évaluation (`entretiens_evaluation.ts`)

- [ ] `ENTRETIEN(id_entretien)` : date, type, lieu, lien_visio, code_salle_evaluation,
      statut, notes, date_debut, date_fin, date_evaluation, date_fermeture,
      commentaire_fermeture
- [ ] `CANDIDAT_ENTRETIEN(id_candidat_entretien)` : statut_reponse, motif_refus, duree,
      date_reponse, date_alternative_demandee
- [ ] `EVALUATEUR_ENTRETIEN(id_evaluateur_entretien)` : peut_modifier, peut_supprimer,
      peut_evaluer, est_admin, suit, statut_evaluation, est_en_ligne, a_termine
- [ ] `EVALUATION(id_evaluation)` : statut, date_soumission, score_global,
      commentaire_global, date_validation
- [ ] `NOTE_CRITERE(id_note_critere)` : valeur_score, valeur_texte, coefficient_fige,
      note_max_figee
- [ ] `GRILLE_MODELE(id_grille_modele)` : libelle, description, est_active
- [ ] `VERSION_GRILLE(id_version_grille)` : numero_version, est_publiee, contenu_hashé,
      verrouillee_le
- [ ] `CRITERE(id_critere)` : ordre, libelle, type_critere, score_max, coefficient, est_requis

### Utilisateurs & droits (`utilisateurs_droits.ts`)

- [ ] `UTILISATEUR(id_utilisateur)` : nom, prenom, email, username, role_systeme
- [ ] `GROUPE_METIER(id_groupe_metier)` : libelle_groupe, description
- [ ] `PERMISSION_GROUPE(id_permission_groupe)` : fonctionnalite
- [ ] `NOTIFICATION(id_notification)` : type, lien, est_lue

### Vérifications règle 1

- [ ] Aucun attribut perdu ou ajouté (chaque relation reprend exactement les attributs de
      son entité MCD).
- [ ] Chaque clé primaire = identifiant de l'entité MCD (à côté de `const`).
- [ ] Nom de relation = nom de l'entité, sans traduction ni reformulation.

---

## Annexe — Inventaire des associations (préparatoire, servira aux règles 2 → 6)

| Diagramme | Association | Cardinalités (source → cible) | Attribut(s) propre(s) | Règle pressentie |
|---|---|---|---|---|
| Campagnes | e-utiliser (CAMPAGNE—MODELE_PIPELINE) | `0,1` → `0,n` | — | CIF |
| Campagnes | e-etablir (MODELE_PIPELINE—ETAPE_PIPELINE) | `0,n` → `1,1` | — | CIF |
| Campagnes | e-declencher (ETAPE_PIPELINE—REGLE_NOTIFICATION) | `0,n` → `1,1` | — | CIF |
| Campagnes | e-proposer (CAMPAGNE—FORMULAIRE) | `0,n` → `0,n` | ordre_affectation | 3 (N,N) |
| Campagnes | e-versionner (FORMULAIRE—VERSION_FORMULAIRE) | `1,n` → `1,1` | — | CIF |
| Campagnes | e-contenir (VERSION_FORMULAIRE—QUESTION) | `1,n` → `0,n` | ordre_question, chrono_personnalise | 3 (N,N) |
| Campagnes | e-proposer-rep (QUESTION—REPONSE) | `0,n` → `1,1` | — | CIF |
| Candidatures | e-progresser (CANDIDATURE—AVANCEMENT) | `1,n` → `1,1` | — | CIF |
| Candidatures | e-conclure (AVANCEMENT—DECISION) | `0,n` → `0,1` | — | CIF |
| Candidatures | e-generer-token (CANDIDATURE—TOKEN_CANDIDAT) | `0,n` → `1,1` | — | CIF |
| Candidatures | e-creer-token-verification (CANDIDATURE—TOKEN_VERIFICATION_EMAIL) | `0,n` → `0,1` | — | CIF |
| Candidatures | e-annuler (DECISION—DECISION, réflexive) | `0,1` → `0,1` | — | 5 (réflexive) |
| Entretiens | e-convoquer (ENTRETIEN—CANDIDAT_ENTRETIEN) | `0,n` → `1,1` | — | CIF |
| Entretiens | e-inclure (ENTRETIEN—EVALUATEUR_ENTRETIEN) | `0,n` → `1,1` | — | CIF |
| Entretiens | e-concerner (CANDIDAT_ENTRETIEN—EVALUATION) | `0,n` → `1,1` | — | CIF |
| Entretiens | e-soumettre (EVALUATEUR_ENTRETIEN—EVALUATION) | `0,n` → `0,1` | — | CIF |
| Entretiens | e-contenir-item (EVALUATION—NOTE_CRITERE) | `0,n` → `1,1` | — | CIF |
| Entretiens | e-versionner (GRILLE_MODELE—VERSION_GRILLE) | `0,n` → `1,1` | — | CIF |
| Entretiens | e-definir (VERSION_GRILLE—CRITERE) | `0,n` → `1,1` | — | CIF |
| Entretiens | e-noter (CRITERE—NOTE_CRITERE) | `0,n` → `1,1` | — | CIF |
| Utilisateurs | e-appartenir (UTILISATEUR—GROUPE_METIER) | `0,n` → `0,n` | est_moderateur | 3 (N,N) |
| Utilisateurs | e-beneficier-groupe-perm (GROUPE_METIER—PERMISSION_GROUPE) | `0,n` → `0,n` | — | 3 (N,N) |
| Utilisateurs | e-obtenir (UTILISATEUR—NOTIFICATION) | `0,n` → `1,1` | — | CIF |
| Utilisateurs | e-declencher (UTILISATEUR—NOTIFICATION) | `0,n` → `0,1` | — | CIF (2 FKs → même entité) |

> Note : NOTIFICATION reçoit **deux** clés étrangères vers UTILISATEUR (obtenir + déclencher) —
> levée d'ambiguïté par nom de rôle exigée (cf. règle 5, étendu).

---

## Règles 2 → 9 (squelettes — à compléter règle par règle)

### Règle 2 — La CIF pilote la migration de clé

**Rappel** : une patte est **CIF** si sa cardinalité a max = 1. L'entité qui porte cette
patte (`(1,1)` ou `(0,1)`) reçoit la **clé étrangère de l'entité située à l'autre bout**
de l'association. La FK est `NOT NULL` si la patte est `(1,1)`, `nullable` si `(0,1)`.
Aucune CIF ne porte d'attribut propre ici (tous les attributs propres sont portés par
des associations N,N → règle 3).

#### Campagnes & pipeline

- [ ] `CAMPAGNE` + `#id_modele_pipeline` (nullable) — « exploiter »
- [ ] `ETAPE_PIPELINE` + `#id_modele_pipeline` (NOT NULL) — « constituer »
- [ ] `REGLE_NOTIFICATION` + `#id_etape_pipeline` (NOT NULL) — « déclencher »
- [ ] `VERSION_FORMULAIRE` + `#id_formulaire` (NOT NULL) — « versionner »
- [ ] `REPONSE` + `#id_question` (NOT NULL) — « proposer une réponse »
- [ ] *`e-contenir` (VERSION_FORMULAIRE (1,n) × QUESTION (0,n)) → pas de FK ici (règle 3).*

#### Candidatures & suivi

- [ ] `AVANCEMENT` + `#id_candidature` (NOT NULL) — « progresser »
- [ ] `TOKEN_CANDIDAT` + `#id_candidature` (NOT NULL) — « générer »
- [ ] `TOKEN_VERIFICATION_EMAIL` + `#id_candidature` (nullable) — « créer »
- [ ] `DECISION` + `#id_avancement` (NOT NULL) — « conclure », badge `(1,1)` ;
      *`e-annuler` (réflexive) → règle 5.*

#### Entretiens & évaluation

- [ ] `CANDIDAT_ENTRETIEN` + `#id_entretien` (NOT NULL) — « convoquer »
- [ ] `EVALUATEUR_ENTRETIEN` + `#id_entretien` (NOT NULL) — « intégrer »
- [ ] `EVALUATION` + `#id_candidat_entretien` (NOT NULL) — « concerner »
- [ ] `EVALUATION` + `#id_evaluateur_entretien` (nullable) — « soumettre »
- [ ] `NOTE_CRITERE` + `#id_evaluation` (NOT NULL) — « contenir »
- [ ] `NOTE_CRITERE` + `#id_critere` (NOT NULL) — « noter »
- [ ] `VERSION_GRILLE` + `#id_grille_modele` (NOT NULL) — « versionner » (grille)
- [ ] `CRITERE` + `#id_version_grille` (NOT NULL) — « définir »

#### Utilisateurs & droits

- [ ] `NOTIFICATION` + `#id_utilisateur_destinataire` (NOT NULL) — « obtenir »
- [ ] `NOTIFICATION` + `#id_utilisateur_declencheur` (nullable) — « déclencher »
  → **deux FKs vers UTILISATEUR**, nom de rôle **validé** : `destinataire` / `declencheur`.

#### Relations sans FK ajoutée sur cette règle

`MODELE_PIPELINE`, `FORMULAIRE`, `QUESTION`, `CANDIDATURE`, `ENTRETIEN`, `GRILLE_MODELE`,
`UTILISATEUR`, `GROUPE_METIER`, `PERMISSION_GROUPE` — référencées ou enrichies en règle 3.

#### Vérifications règle 2

- [ ] Chaque CIF de l'inventaire produit une FK dans l'entité à patte max = 1.
- [ ] NOT NULL ⇔ patte `(1,1)` ; nullable ⇔ patte `(0,1)`.
- [ ] Aucun attribut propre d'association perdu (aucun ici → règle 3).
- [ ] NOTIFICATION : les deux rôles vers UTILISATEUR sont nommés (`destinataire`, `declencheur`).

### Règle 3 — Sans CIF (N,N) → relation à part entière

**Rappel** : une association dont les deux pattes ont max = n ne porte pas de FK ; elle
devient une **relation propre** (table de liaison), de clé primaire **composite** = la paire
des deux clés étrangères. Les attributs propres migrent tels quels (nom, type, nullable,
défaut) dans cette relation.

- [ ] `PROPOSER(#id_campagne, #id_formulaire)` : PK composite `(id_campagne, id_formulaire)`,
      attribut propre **`ordre_affectation`**
      (`e-proposer`, CAMPAGNE (0,n) × FORMULAIRE (0,n))
- [ ] `REGROUPER(#id_version_formulaire, #id_question)` : PK composite
      `(id_version_formulaire, id_question)`, attributs propres **`ordre_question`** et
      **`chrono_personnalise`**
      (`e-contenir`, VERSION_FORMULAIRE (1,n) × QUESTION (0,n))
- [ ] `APPARTENIR(#id_utilisateur, #id_groupe_metier)` : PK composite
      `(id_utilisateur, id_groupe_metier)`, attribut propre **`est_moderateur`**
      (`e-appartenir`, UTILISATEUR (0,n) × GROUPE_METIER (0,n))
- [ ] `BENEFICIER(#id_groupe_metier, #id_permission_groupe)` : PK composite
      `(id_groupe_metier, id_permission_groupe)`, sans attribut propre
      (`e-beneficier-groupe-perm`, GROUPE_METIER (0,n) × PERMISSION_GROUPE (0,n))

#### Vérifications règle 3

- [ ] Chaque N,N de l'inventaire produit une relation propre, jamais une FK enfouie.
- [ ] PK composite = paire `(id_X, id_Y)` en `isPK` — aucune mono-clé inventée.
- [ ] Attributs propres migrés à l'identique depuis le MCD (nombre, noms, types).
- [ ] Les entités sources de ces N,N ne portent aucune FK issue de ces associations.

### Règle 4 — Cardinalités « molles » et valeurs nulles

**Rappel** : la nullabilité d'une FK découle de la **cardinalité conceptuelle validée au
MCD**, jamais de la structure physique. Min `0` sur la patte porteuse → FK *nullable* ;
min `1` → FK *obligatoire (NOT NULL)*.

| Relation + FK | Badge porteuse | Nullabilité |
|---|---|---|
| `CAMPAGNE.#id_modele_pipeline` | `(0,1)` | nullable — une campagne peut ne pas exploiter de modèle |
| `ETAPE_PIPELINE.#id_modele_pipeline` | `(1,1)` | NOT NULL — toute étape appartient à un modèle |
| `REGLE_NOTIFICATION.#id_etape_pipeline` | `(1,1)` | NOT NULL |
| `VERSION_FORMULAIRE.#id_formulaire` | `(1,1)` | NOT NULL |
| `REPONSE.#id_question` | `(1,1)` | NOT NULL |
| `AVANCEMENT.#id_candidature` | `(1,1)` | NOT NULL |
| `TOKEN_CANDIDAT.#id_candidature` | `(1,1)` | NOT NULL |
| `TOKEN_VERIFICATION_EMAIL.#id_candidature` | `(0,1)` | nullable |
| `DECISION.#id_avancement` | `(1,1)` | NOT NULL — toute décision conclut un avancement |
| `DECISION.#id_decision_annulee` | `(0,1)` | nullable — FK réflexive (règle 5) |
| `CANDIDAT_ENTRETIEN.#id_entretien` | `(1,1)` | NOT NULL |
| `EVALUATEUR_ENTRETIEN.#id_entretien` | `(1,1)` | NOT NULL |
| `EVALUATION.#id_candidat_entretien` | `(1,1)` | NOT NULL |
| `EVALUATION.#id_evaluateur_entretien` | `(0,1)` | nullable — une évaluation peut être sans évaluateur attitré |
| `NOTE_CRITERE.#id_evaluation` | `(1,1)` | NOT NULL |
| `NOTE_CRITERE.#id_critere` | `(1,1)` | NOT NULL |
| `VERSION_GRILLE.#id_grille_modele` | `(1,1)` | NOT NULL |
| `CRITERE.#id_version_grille` | `(1,1)` | NOT NULL |
| `NOTIFICATION.#id_utilisateur_destinataire` | `(1,1)` | NOT NULL |
| `NOTIFICATION.#id_utilisateur_declencheur` | `(0,1)` | nullable |

#### Vérifications règle 4

- [ ] Chaque FK nullable/NOT NULL correspond au **min** de sa patte porteuse au MCD.
- [ ] Aucune nullabilité justifiée par la BD physique (la logique métier commande).
- [ ] Uniquement **5 FKs *nullables*** : CAMPAGNE, TOKEN_VERIFICATION_EMAIL,
      DECISION (`#id_decision_annulee`), EVALUATION (`#id_evaluateur_entretien`),
      NOTIFICATION (`#id_utilisateur_declencheur`).

### Règle 5 — Associations réflexives

**Rappel** : une association reliant une entité à elle-même produit une FK qui référence
la **même relation**, avec un **nom de rôle explicite** (la colonne ne peut pas reprendre
le nom de la PK).

- [ ] `DECISION` + `#id_decision_annulee` (nullable) — `e-annuler`, réflexive `(0,1)`
      des deux côtés : chaque décision référence **au plus une** autre décision qu'elle
      annule. Nullable car badge min `0` (cohérent règle 4). Rôle : « décision annulée ».
- [ ] Cas « étendu » acté en règle 2 : `NOTIFICATION` porte **deux FKs vers
      `UTILISATEUR`** → nom de rôle `destinataire` (NOT NULL) / `declencheur` (nullable).

#### Vérifications règle 5

- [ ] Aucune colonne FK ne porte un nom déjà utilisé comme PK dans `DECISION` ni
      `NOTIFICATION`.
- [ ] `#id_decision_annulee` référence `DECISION.id_decision`.
- [ ] Seule association réflexive du schéma : `e-annuler` (confirmée à l'inventaire).

### Règle 6 — Associations n-aires (3 entités ou plus)

- [x] Aucune association n-aire dans les MCD actuels : les 24 associations vérifiées dans
      les fichiers `mcd/*.ts` sont toutes strictement binaires (un `source` + un `target`).
      Rien à convertir.

### Règle 7 — Cas déjà réglés en amont (au MCD)

- [x] **Attributs multivalués** : aucun extrait en entité séparée au MCD — pas d'entité
      « conteneur » (TEL, EMAIL…) ; les multivalués potentiels (téléphone, cv) restent
      des attributs simples monovalués. Aucune règle spéciale : tout suit les règles 1–3.
- [x] **Spécialisation / héritage** : aucune dans les MCD actuels — `role_systeme`
      (UTILISATEUR) est un attribut simple, pas une sous-entité `RECRUTEUR`/`CANDIDAT_UTILISATEUR`.

#### Vérifications règle 7

- [x] Grep `specialis|heritage|parent|extends|isSubtype` → aucune occurrence dans
      `mcd/*.ts`.
- [x] Les 25 relations de la règle 1 sont autant d'entités métier ; aucune table de
      multivalués, aucune clé partagée mère/fille à prévoir.

### Règle 8 — Notation et conventions du MLD

**Rappel** : français conservé ; clé primaire = `isPK: true` (soulignée) ; clé étrangère =
`isFK: true` (préfixée `#`), jamais soulignée ; clé composée = éléments regroupés en tête,
séparés par une virgule.

- [ ] **10 relations** dans `campagnes_pipeline.ts` : CAMPAGNE, MODELE_PIPELINE,
      ETAPE_PIPELINE, REGLE_NOTIFICATION, FORMULAIRE, VERSION_FORMULAIRE, QUESTION,
      REPONSE + **PROPOSER** (PK composite `(id_campagne, id_formulaire)`),
      **REGROUPER** (PK composite `(id_version_formulaire, id_question)`).
- [ ] **5 relations** dans `candidatures_suivi.ts` : CANDIDATURE, AVANCEMENT,
      TOKEN_CANDIDAT, TOKEN_VERIFICATION_EMAIL, DECISION (+ `#id_decision_annulee`).
- [ ] **8 relations** dans `entretiens_evaluation.ts` : ENTRETIEN, CANDIDAT_ENTRETIEN,
      EVALUATEUR_ENTRETIEN, EVALUATION (2 FKs), NOTE_CRITERE (2 FKs), GRILLE_MODELE,
      VERSION_GRILLE, CRITERE.
- [ ] **6 relations** dans `utilisateurs_droits.ts` : UTILISATEUR, GROUPE_METIER,
      PERMISSION_GROUPE, NOTIFICATION (2 FKs nommées) + **APPARTENIR** (PK composite
      `(id_utilisateur, id_groupe_metier)`), **BENEFICIER** (PK composite
      `(id_groupe_metier, id_permission_groupe)`).
- [ ] Nullabilité reconduite : les **5 FK nullables** (règle 4) sont marquées
      `description: 'nullable'` (le type `Attribute` ne supporte pas de champ `nullable` —
      la nullabilité est documentée ici et portée en `description`) ; les autres FKs sont
      NOT NULL (aucun marqueur). Attributs métier reconduits tels quels (règle 1).
- [ ] Aucune FK soulignée : même une FK qui est aussi PK (relations N,N) reste marquée
      `isFK: true` (sa composante PK reste `isPK: true`).

### Règle 9 — Vérifications finales de cohérence

- [ ] Chaque FK référence une **PK existante** (correspondance FK → PK de l'inventaire).
- [ ] Aucune relation **sans clé primaire** (`id_*` ou PK composite).
- [ ] **29 relations** au total : 25 entités (règle 1) + 4 associations N,N (règle 3) —
      égalité avec le décompte de l'inventaire.
- [ ] `DECISION` et `NOTIFICATION` : aucun doublon de nom PK/FK (noms de rôle).
- [ ] `EVALUATION`, `NOTE_CRITERE`, `NOTIFICATION` : leurs FKs multiples pointent chacune
      vers la bonne relation.

### Règle 7 — Cas déjà réglés en amont (au MCD)

- [ ] À vérifier : multivalués extraits / spécialisation-héritage éventuels.

### Règle 8 — Notation et conventions du MLD

- [ ] À appliquer dans les fichiers (français, `isPK`/`isFK`).

### Règle 9 — Vérifications finales de cohérence

- [ ] Chaque FK référence une PK existante.
- [ ] Aucune relation sans PK.
- [ ] Nombre de relations cohérent : **29** = 25 entités (règle 1) + 4 associations N,N
      (règle 3 : PROPOSER, REGROUPER, APPARTENIR, BENEFICIER).

---

## Fichiers concernés

- `src/diagrams/nouveau/mld/campagnes_pipeline.ts` (réécriture)
- `src/diagrams/nouveau/mld/candidatures_suivi.ts` (réécriture)
- `src/diagrams/nouveau/mld/entretiens_evaluation.ts` (réécriture)
- `src/diagrams/nouveau/mld/utilisateurs_droits.ts` (réécriture)
- Ce fichier de plan.

## Commits proposés (conventional commits)

1. `docs(plan): plan passage MCD → MLD (règles 1 à 9)` — plan complet, point de rollback.
2. `feat(mld): conversion MCD → MLD (29 relations) depuis les MCD` — réécriture des 4
   fichiers `nouveau/mld/*.ts` (noms français, `isPK`/`isFK`, FKs et nullabilités).
3. `build(diagrams): artefacts dist (MLD converti)`.