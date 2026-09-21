# PLAN — MLD : format tableau (badge | nom | type | nullabilité) par attribut

## Statut

- **Objectif** : faire ressembler chaque bloc de relation MLD à un tableau à 3 colonnes
  (`[PK|FK] nom | type SQL | NOT NULL/NULL`), avec **type** et **nullabilité**
  renseignés **par attribut** (y compris attributs métier), sur les **29 relations** des
  4 diagrammes MLD.
- **Périmètre** : **MLD seul** — les figures MCD (pas de types, PK soulignée uniquement)
  et MPD (format actuel : badges + nom + type, sans colonne nullabilité) sont **inchangées**.
- **Captures mémoire** : hors périmètre (ré-export manuel ultérieur, déjà reporté).
- Méthode : ce plan est détaillé en amont de l'implémentation ; on le coche règle par
  étape puis on exécute (data → rendu → doc → build → commits).

## Problème

Le rendu actuel des entités MLD est une **ligne souple** (`flex` + gaps) :
`[PK][FK] nom` suivi d'un texte `NOT NULL`/`NULL` non aligné (`EntityNode.tsx:57-73`).
Les attributs ne portent **ni type SQL ni nullabilité par attribut** (seules 5 FK
nullables sont marquées via `description: 'nullable'`).

Cible (exemple utilisateur, illustratif — la forme, pas le jeu exact) :

```
+-----------------------------------------------------+
|                      EVALUATION                      |
+--------------------+--------------+------------------+
| PK  id_evaluation  | INT          | NOT NULL          |
| FK  #id_candidat   | INT          | NOT NULL          |
|     statut         | VARCHAR(50)  | NOT NULL          |
|     score_global   | DECIMAL(4,2) | NULL              |
|     commentaire_g..| TEXT         | NULL              |
+--------------------+--------------+------------------+
```

Décisions utilisateur :
1. **MLD seulement** (MPD garde son rendu actuel ; les types restent au MPD pour le
   périmètre « plans ultérieurs » du passage MLD → MPD).
2. **Conforme à l'exemple** : badge + nom dans la même première colonne, pas d'en-têtes.
3. **Nullabilité par attribut** (étendue aux attributs métier, pas seulement aux FK).

---

## Étape 1 — Modèle de données (`src/types/index.ts`)

- [x] Ajouter `nullable?: boolean` à `Attribute` :
      `nullable: true` → affiche `NULL` ; absent/`false` → affiche `NOT NULL`.
- [x] `type?: string` existe déjà (utilisé par MPD) — réutilisé pour le MLD.
- [x] `description?: string` reste dans le type (plus utilisé pour la nullabilité) —
      le sentinelle `'nullable'` est retiré des données.

Rappel interface cible :

```ts
export interface Attribute {
  name: string
  type?: string
  isPK?: boolean
  isFK?: boolean
  isNew?: boolean
  isDeleted?: boolean
  nullable?: boolean
  description?: string
}
```

## Étape 2 — Rendu (`src/components/Nodes/EntityNode.tsx`, variante `mld`)

- [x] Passer la ligne d'attribut en grille pour `variant === 'mld'` :
      `grid grid-cols-[minmax(0,1fr)_auto_auto]` avec `gap`.
      - **col1** : badges `PK`/`FK` (si présents) + nom — le soulignement PK
        (`boxShadow` inset) et la couleur sont conservés (conforme exemple).
      - **col2** : `type` en `text-muted-foreground` (même style que le MPD).
      - **col3** : `attr.nullable ? 'NULL' : 'NOT NULL'` en `text-muted-foreground`.
- [x] Remplacer l'ancien span de fin de ligne (rendu `description === 'nullable'`) par la
      colonne 3 de la grille.
- [x] `variant === 'mpd'` garde son rendu actuel (badges + nom + type), MCD inchangé
      (nom + soulignement PK).
- [x] Aucun changement de géométrie des nœuds (largeur pilotée par le contenu des
      colonnes `auto` ; `minmax(0,1fr)` pour la colonne nom).

## Étape 3 — Données : typage + nullabilité par attribut (4 fichiers `mld/*.ts`)

### Conventions de types

| Famille d'attributs | Convention |
|---|---|
| Identifiants (PK, FK, composés) | `INT` |
| Booléens (`est_*`, `peut_*`, `suit`, `a_termine`, `email_verifie`, `est_lue`, `chronometre`, `questions_aleatoires`, `correction_manuelle`, `commentaire_autorise`, `est_correcte`, `est_utilise`, `est_moderateur`…) | `BOOLEAN` |
| Dates (`date_*`, `verrouillee_le`) | `DATETIME` |
| Date de naissance | `DATE` |
| Statuts / codes / types (`statut`, `type`, `type_etape`, `code_*`, `role_systeme`, `fonctionnalite`…) | `VARCHAR(20–50)` |
| Moyens longs (`notes`, `commentaire*`, `justification`, `enonce`, `texte`, `cv`, `lettre_motivation`, `contenu_hashé`, `description`…) | `TEXT` (ou `VARCHAR(500)` si court) |
| Libellés courts (`nom`, `prenom`, `libelle*`, `titre`, `type_reponse`…) | `VARCHAR(100–255)` |
| Contacts / liens (`email` → `VARCHAR(255)`, `telephone` → `VARCHAR(20)`, `lien_visio` → `VARCHAR(500)`, `lien` → `VARCHAR(255)`) | `VARCHAR(n)` |
| Jetons (`chaine_token`) | `VARCHAR(64–100)` |
| Scores / nums (`score`, `score_global`, `valeur_score`, `scorer_…`, `max_*`, `coefficient*`, `duree`, `chrono`, `ordre*`, `numero_version`, `note_max_figee`) | `INT` ou `DECIMAL(5,2)` (scores décimaux) |

Adaptation possible au cas par cas ; chaque choix est revue en contrôle visuel.

### Règle de nullabilité par attribut

- FK : `nullable: true` ⇔ patte min 0 au MCD (**5 FK**), sinon NOT NULL → inchangé.
- Attributs métier : `nullable: true` quand le cycle de vie le permet (ex. `score_global`,
  `commentaire_global`, `date_validation`, `lieu`, `lien_visio`, `motif_refus`,
  `date_fermeture`, `notes`, `telephone`, `cv`…) ; sinon NOT NULL.
- Référence BD physique (`cartographie-fonctionnelle-front/bd_actuelle/*.md`
  `quizapp_db_described_*.md`, `quizapp_db_cible_post_420_migration.md`) **quand une
  correspondance existe** — la logique métier restant décisive (FK NOT NULL ⇔ min=1).

### Travail par fichier

- [x] `mld/campagnes_pipeline.ts` (10 relations, 61 attributs + 1 suff.)
- [x] `mld/candidatures_suivi.ts` (5 relations, 38 attributs)
- [x] `mld/entretiens_evaluation.ts` (8 relations, 61 attributs + 1 suff.)
- [x] `mld/utilisateurs_droits.ts` (6 relations, 22 attributs)
- [x] Migration des **5** `description: 'nullable'` → `nullable: true` :
      `CAMPAGNE.#id_modele_pipeline`, `TOKEN_VERIFICATION_EMAIL.#id_candidature`,
      `DECISION.#id_decision_annulee`, `EVALUATION.#id_evaluateur_entretien`,
      `NOTIFICATION.#id_utilisateur_declencheur`.
- [x] Vérif grep : chaque attribut dispose d'un `type` (184/184 typés, aucun attribut « nu »).

## Étape 4 — Règles & plans

- [x] `plans/rules/regles_mld.md` :
      - §8 « Notation graphique (figure) » → format **3 colonnes**
        (`[PK|FK] nom | type | NOT NULL/NULL`, sans en-têtes) ;
      - §4 « Cardinalités molles et valeurs nulles » → nullabilité **par attribut**
        (extension des 5 FK aux attributs métier), et reformulation de
        « jamais la BD physique » (le typage/nullabilité des figures s'appuie sur la BD
        cible, la logique métier restant décisive pour les FK : NOT NULL ⇔ min=1).
- [x] Ce plan (nouveau fichier `20260921_typage_nullabilite_attributs_mld.md`).
- [x] Plan `20260919_passage_mcd_mld.md` : ajouter une ligne d'ajustement 20260921
      (typage + nullabilité par attribut au MLD).

## Étape 5 — Vérifications & livraison

- [ ] `npx tsc --noEmit` : non-régression (référentiel actuel : 70 erreurs
      préexistantes connues — `DiagramCanvas.tsx`/`EntityNodeData`/etc., à ne pas
      augmenter).
- [ ] `npx vite build` : OK.
- [ ] Contrôle visuel navigateur : les 4 diagrammes MLD affichent les colonnes
      alignées `[PK|FK] nom | type | NOT NULL/NULL`.

### Commits (conventional commits)

1. `feat(diagrams): colonnes type | nullabilité dans les entités (mld)` —
   `src/types/index.ts` + `src/components/Nodes/EntityNode.tsx`.
2. `feat(mld): types SQL + nullabilité par attribut (29 relations)` —
   les 4 fichiers `mld/*.ts`.
3. `docs(diagrams): règles MLD — typage + nullabilité par attribut, format colonnes` —
   `plans/rules/regles_mld.md` + plan 20260919 (+ ce plan).
4. `build(diagrams): artefacts dist (typage + nullabilité MLD)` — `dist/`.

## Hors périmètre (rappel)

- MPD (types/noms anglais, format actuel conservé) ; correspondance MCD↔MPD exhaustive
  (noms anglais) = plan ultérieur.
- MCD (pas de types ni nullabilité dans les blocs).
- Captures mémoire (`z_mémoire/template_memoire/typst/captures/3-mld-domaines/*.png`) :
  ré-export manuel différé.