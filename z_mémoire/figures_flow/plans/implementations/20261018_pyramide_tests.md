# 20261018 — Pyramide des tests (remplace la fig. 63 « niveaux-tests »)

Source : `figures_html/pyramide_tests.html` (§7.1). Décisions utilisateur :
effectifs **estimés du source** (~15/45/120, ordres de grandeur assumés), légende
HTML supprimée (~180/JaCoCo/CI-CD portés par le texte), bandes « nom + effectif »,
**liaisons pointillées et annotations Coût/Volume maintenues** (demande explicite).
La figure remplace `memoire-niveaux-tests.svg` dans `body.typ` ; `niveaux_tests.ts`
(LevelsNode, bandes égales) reste au catalogue.

## Fait
- [x] `types/index.ts` : `Variant` + `'tpyramid'`, `TPyramidLevel`
      (bande + callout), champ `tpyramidLevels`
- [x] `src/components/Nodes/TestsPyramidNode.tsx` (pattern `MoscowNode`) :
      - 3 bandes `clip-path` en % aux **ratios du source 147/110/150**
        (`bandClip` par fractions cumulées) — contrairement aux bandes
        égales de fig. 23 ; apex x=50 %/y=0 (marge haute + pied mort jetés) ;
      - racine `items-stretch` → hauteur du triangle = hauteur exacte de la
        colonne de callouts (idem fig. 23, écran comme export) ;
      - jetons `--fig-danger/warning/success`, texte bande = `--fig-soft` +
        effectif 80 %, libellé ancré ~56 % de bande (zone large du polygone) ;
      - **liaisons pointillées** : div absolu par niveau, `top` = `bandCenter`
        en %, départ `AXIS_W+GAP+PYRAMID_W*(0.5+0.5*depth)` (dot posé sur le
        flanc, comme le source), arrivée bord callouts (`CALLOUT_LEFT`) —
        statique, suit l'étirement (callouts aux mêmes ratios `flex: BAND_WEIGHTS`) ;
      - axe CRITICITÉ : colonne `<w>26 px` — flèche en haut + trait **coupé en
        2 segments `flex:1`** et libellé entre eux (centré verticalement,
        jamais sur la flèche — demande utilisateur) ; annotations `Coût ↑` /
        `Volume ↑` à droite du trait (danger/success), colonne élargie à 76 px ;
      - callouts : cartes Gouvernance (`border-left 5` + `tinted(color-mix)`,
        titre + 3 lignes `foreground/85` + caractéristiques italiques) ;
      - panneau légende et connecteurs SVG du source non repris (CSS complet).
- [x] `src/diagrams/memoire/pyramide_tests.ts` — `W = 1248`
      (76+30+520+30+592), `PYRAMID_W = 520`, export `memoire-pyramide-tests.svg`
      (377 Ko, raster embarqué), `body.typ:1317` substitué + caption
      « Pyramide des tests — volume, criticité et outillage par niveau dans
      SyneliaQuizApp. », `git rm` non applicable (PNG intact), compile sans
      warning. Commits `20878b8` (feat) / `06ccf41` (docs typst).

## Invariants rappelés
- jamais `height` (seul `minHeight` en `data`) ; `exportWidth` px inline ;
  racine `[data-export-root]` ; `tinted()` (color-mix) et jamais `hsla` sur
  `var()` ; jetons `--fig-*` clair + sombre.
