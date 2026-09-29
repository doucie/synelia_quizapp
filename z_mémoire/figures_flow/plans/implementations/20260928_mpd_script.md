# PLAN — Vue « script SQL » des figures MPD

Date : 2026-09-28
Précédent : `plans/implementations/20260928_passage_mld_mpd.md` (MPD en tables).
Règles : `plans/rules/regles_mpd.md` (§ Vue « script SQL »).

## Contexte & décisions

- Les 2 figures MPD (« tables ») gardent une privation : elles ne montrent ni les colonnes
  techniques (règle 7), ni les index (8), ni le moteur/charset (10), ni les unicités (6) —
  renvoyés à `plans/mpd/colonnes_techniques.sql`. La vue **script** les rend visibles, sans
  rien enlever aux figures « tables » : chaque bloc est un `CREATE TABLE` complet.
- **Source unique** : les 21 tables sont décrites une seule fois dans
  `src/diagrams/nouveau/mpd/schema.ts` ; les 2 vues (« tables » → `toTableFigure()`, « script » →
  `buildScriptFigure()`) sont générées. Impossible qu'elles divergent.
- **Sans dépendance de coloration** : tokeniseur maison (`src/utils/sqlTokens.ts`, 10 classes de
  jetons, aucune librairie de highlight ajoutée — poids de bundle pour 21 tableaux de mémoire inutile).
- **Rendu sobre et reproductible** : les 5 teintes de la coloration sont déjà dans `SAFE_HUES`
  (aucune couleur nouvelle au projet) ; la surface du bloc (`sql-block`) est indépendante du mode
  clair/sombre pour que l'export SVG d'un bloc (fond, gouttière, polices) soit identique.
- **Pas de nouveau type de nœud React Flow** : la variante `mpd-sql` est déléguée par `EntityNode`
  à `SqlScriptBlock`. Les helpers `loadPositions` / `applyEntityColors` / `autoLayout` n'ont rien
  vu changer → 0 nouvelle erreur de typage.
- **Groupe sidebar** : `Category = 'mpd-sql'`, libellé « MPD — Script SQL », juste après « MPD —
  Physique » (sous-catégorie frère, pas d'imbrication).
- **Exécutabilité honnête** : une FK dont la cible n'est pas créée dans la figure n'est **jamais**
  émise comme contrainte cassée. Elle devient un **commentaire SQL** qui explique le cas
  (cross-figure : table créée dans la figure voisine ; hors périmètre : l'une des 13 relations non
  figurées). Deux exceptions documentées : `created_by`/`updated_by` (différée en `ALTER TABLE`,
  exécutable dans la figure où `user` est créée), `user.company_id` (hors périmètre, commentée).

## Résultat implémenté (2026-09-28)

- [x] `schema.ts` : 21 tables (12 + 9) — types MySQL, PK/FK, `ON DELETE`, unicités, index, notes,
      colonnes externes/cross-figures marquées. Générateurs `toTableFigure`, `toCreateTable`,
      `toAuditConstraints`, `toScriptNode`, `toLegendNode`, `LEGEND`.
- [x] `sqlTokens.ts` : tokeniseur contextuel (après `REFERENCES` → table, `ON DELETE` → politique,
      `NOT NULL` → contrainte), 10 classes (`keyword`, `type`, `ident`, `constraint`, `policy`,
      `literal`, `audit`, `comment`, `punct`, `plain`), teintes dans `SQL_HUES`.
- [x] `SqlScriptBlock.tsx` : bloc code (numéros de ligne, gouttière), en-tête (pastille
      `CREATE TABLE`, nom, badge `TABLE`/`JONCTION`, origine MLD, nb de lignes, bouton export SVG
      `⤓`), pied (note, rappel règle 7), légende (variante sans `sql`).
- [x] `EntityNode.tsx` : délégation `mpd-sql` → `SqlScriptBlock` (cast à la frontière, `data`/`id`
      étant `unknown` à cause de l'erreur NodeProps préexistante — 0 nouvelle erreur).
- [x] `types/index.ts` : `Category`/`Variant` acceptent `mpd-sql` ; `EntityNodeData` porte `sql`,
      `mcd`, `lineCount`, `auditNote`, `sqlLegend` ; `SqlLegendItem` type.
- [x] `mpd_sql/layout.ts` : grille 2 colonnes remplie **colonne par colonne** (ordre d'exécution du
      script), Y accumulé par hauteur estimée (pas de pas constant — blocs de 8 à 35 lignes),
      légende en tête de la 2ᵉ colonne. Positions déplaçables + persistées localStorage.
- [x] `mpd_sql/script_campagnes.ts` (12 tables, ordre topologique) et `script_entretiens.ts`
      (9 tables) — enregistrées dans `diagrams/index.ts` (catégorie `mpd-sql`).
- [x] `Sidebar.tsx` + `useSidebarState.ts` : groupe `mpd-sql` (icône `▤`).
- [x] `exportSvg.ts` : `exportNodeSvg(id, filename)` — rasterise **un seul nœud** (html-to-image
      borné), padding 16 px, fond blanc, transparence préservée.
- [x] `index.css` : surface `sql-block` + jetons `sql-token-*` (clair & sombre cohérents car fond
      du bloc fixe), `print-color-adjust` pour les exports PDF.
- [x] Docs : `plans/rules/regles_mpd.md` (§ Vue « script SQL »), `README.md` (2 figures, types,
      architecture, design, features).
- [x] `npx tsc --noEmit` : **70 erreurs**, exactement le compte pré-existant
      (`git stash -u` → 70). `npx vite build` : **OK**.
- [x] Contrôle d'intégrité de la génération (script Node temporaire) : 23 noeuds, 2 colonnes,
      0 position dupliquée, légende présente, `CREATE TABLE` valides, FK invisible → commentaire.

## Reste à faire (validation visuelle)

- [ ] Vérification visuelle dans le navigateur (`npm run dev`) : rendu des 2 figures, drag des
      blocs, persistence, bouton `⤓` (export SVG isolé), mode sombre/clair du reste de l'app.
- [ ] Relecture mémoire : les blocs de 8–35 lignes sont-ils trop larges pour la page du mémoire
      (largeur 700 px) ? Ajuster `BLOCK_WIDTH` le cas échéant.
- [ ] Commit conventional dans la branche `figures-memoire` (ex. `feat(diagrams): vue script SQL du MPD`).

## Non fait (volontairement)

- **Refactor des 2 figures « tables »** vers `toTableFigure()` : faisable à tout moment (le
  générateur existe), mais changer leurs `edges`/positions actuelles risquerait de casser la mise
  en page persistée en localStorage. À faire seulement si on veut vraiment supprimer la saisie
  manuelle des `campagnes_candidatures.ts` / `entretiens_utilisateurs.ts`.
- **Différence trace `normalisées` en Unicode** : les commentaires SQL et le texte contiennent
  des accents/em-dash — les fichiers sont UTF-8, seul l'affichage console PowerShell les
  dénature. Rien à corriger.