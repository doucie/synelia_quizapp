# Tour de la pile — Figure 5 (2026-10-07)

- [x] `logos.tsx` : extraction depuis `DecisionNode` + `angular`/`springboot`/`flyway`
- [x] Types : `Variant += 'stack'`, champs `stackKind`/`stackLogo`/`stackColor`/`stackReason`/`stackGhosts`, `decisionLogo` étendu
- [x] `StackNode.tsx` + dispatch `EntityNode` (variante `stack`)
- [x] Modèle `diagrams/memoire/tour_stack.ts` + enregistrement (Mémoire 5/5)
- [x] Validation navigateur (6 nœuds / 0 arête / 0 handle / 4 logos recolorés)
- [x] Export SVG + mesure + `inspect-svg`
- [x] Insert `body.typ` 2.4.5 + recompile PDF
- [x] `tsc` (baseline 76, via `node_modules/.bin` — `npx tsc` sert un farceur), commit

## Géométrie

- Bandeau 72 px à `x=0`, couches 1060 px à `x=96`, rangées `y = i × 170`
  (`LAYER_MIN_HEIGHT 150` + `GAP 20`). Légende 1156 px à `y=700`.
- Export mesuré : rasters aux largeurs exactes (72/1060×4/1060). SVG 1237×821,
  6 images, 0 arête. Les 4 couches mesurent exactement leur plancher (contenus
  calibrés : raison ≤ 2 lignes, fantômes ≤ 2 rangées).
- Le bandeau tient sa hauteur (660 = 4×150 + 3×20) par `minHeight`, pas `height`
  (l’export abandonne les hauteurs posées) — même invariant que les planchers
  de l’organigramme.

## Couleurs (accents validés : 335/100/0/128)

- Logos recolorés uniformément en accent de couche (jamais mélange
  marque/noir) ; noms colorés comme les tags de la figure 3 ; raisons en
  encre `/85` ; fantômes en puces `muted` sans bordure, **sans barré**.
- Raisons raccourcies du tableau 2.4.5 sans changer le sens ; fantômes verbatim.
