# Figure 4 — `memoire-arbre-sgbd` (2.4.4 Choix du SGBD)

- [x] Types : `Variant += 'decision'`, `decisionKind` (`question`/`out`/`kept`), `decisionNote`, `decisionLogo`
- [x] `DecisionNode.tsx` + dispatch `EntityNode` (variante `decision`)
- [x] Modèle `diagrams/memoire/arbre_sgbd.ts` + enregistrement (`memoireArbreSgbd`, Mémoire 4/4)
- [x] Validation navigateur (7 nœuds / 6 arêtes / 10 handles / 4 logos / 3 Oui + 3 Non)
- [x] Export SVG + mesure opaque + `inspect-svg`
- [x] Insert `body.typ` 2.4.4 + recompile PDF
- [x] `tsc` (baseline 76), commit

## Géométrie

- Colonne centrale `x=560`, questions 480 px (`Q_X`, `Q_WIDTH`, centre 800) ; feuilles
  écartées `x=60`, 420 px ; MySQL 8 `x=520`, 560 px (centre 800), carte ~1,3×.
- Rangées `y` : Q1 40 ; MongoDB + Q2 400 ; PostgreSQL + Q3 760 ; MariaDB + MySQL 1120.
- Export mesuré : rasters aux largeurs exactes du modèle (480/420/560), overlay
  labels 506–829. SVG 1101×1356, 8 images (7 nœuds + 1 surcouche labels).

## Arêtes

- `type: 'traitement'` **par arête** : le défaut `relationship` (catégorie `memoire`,
  `isTraitement = category === 'traitements'`) afficherait cartes de cardinalité + ↺.
- `data.label` = pastille Oui/Non native de `TraitementEdge` (rendue dans
  `EdgeLabelRenderer`, capturée dans la surcouche raster unique).
- Pas de `straight` : règle `startsWith('mct')` inchangée — en `smoothstep`, les
  descentes centrées restent droites, les sorties latérales font des coudes
  orthogonaux. `DiagramCanvas` non modifié.
- Handles tous déclarés (`bottom` source, `top` cible) : pas d’entrée dans les
  familles verticales d’`edgeAnchors.ts` (réservées MCT/orga).
- Wart assumé : clic sur arête → popover de changement d’ancrage (écrit en
  `edge_sides`, jamais dans l’export). Accepté, `TraitementEdge` intouché.
- Q3→MySQL porte « Oui » **provisoire** (décision live : trait nu ? « Non » des
  deux côtés ?) — voir modèle (`e-q3-mysql`).
- **Une seule réponse par question → nœud Réponse** : la pastille est un vrai
  nœud (`decisionKind: 'answer'`, 160 px, Oui/Non 22 px gras, bordure `muted`
  2 px), pas une étiquette d’arête. La question n’a qu’une liaison (vers sa
  réponse) ; la réponse porte les deux issues (`bottom` → suite, `left` →
  écart). 10 nœuds / 9 arêtes muettes / 0 pastille — plus aucun ancrage
  partagé, donc `noAnchorOffset`/`labelPx` sans usage (champs opt-in conservés).
  Export : 10 rasters aux largeurs exactes, sans surcouche labels.
- **Bordures écartées renforcées** : `1px border` (95 % de clarté, invisible sur
  blanc) → `2px solid hsl(var(--muted-foreground))`, même famille que le tag
  ÉCARTÉ. Cartes `bg-muted`, logos gris et notes inchangés.

## Logos (premier usage d’images du projet)

- SVG **inline** (paths Simple Icons, CC0, usage nominatif comparatif), jamais `<img>` :
  le raster clone du DOM, survie export garantie, zéro réseau/CORS.
- Couleurs de marque verbatim (`#4479A1`, `#4169E1`, `#47A248`, `#003545`) = données,
  justifiées ; gris des écartés = `currentColor` sous `text-muted-foreground`
  (token, pas de filtre CSS dont le rendu en capture n’est pas garanti).
- `downloadPath` de `Page.setDownloadBehavior` doit être **absolu** : un chemin
  relatif donne `taille: 0` sans erreur (Edge headless ignore silencieusement).
