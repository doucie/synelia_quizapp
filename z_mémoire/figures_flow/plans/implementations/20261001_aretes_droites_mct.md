# PLAN — Arêtes droites pour les figures MCT

Date : 2026-10-01
Précédent : `plans/implementations/20260830_points_ancrage_edges.md` (ancrages et offsets),
`plans/implementations/20261001_decoupe_parcours_mct.md` (découpe du parcours).

## Contexte

Les arêtes des figures MCT étaient tracées en escalier : `TraitementEdge.tsx` calculait son chemin
avec `getSmoothStepPath({ borderRadius: 8 })`. Sur un MCT — où l'événement et le nœud d'opération sont
superposés verticalement, et les résultats étalés en dessous — ce tracé orthogonal fait beaucoup de
coudes et de courses horizontales pour des liaisons qui, elles, sont diagonales par nature.

Demande : **des liaisons droites sur les MCT**.

## Décision de périmètre

`TraitementEdge` n'est pas réservé au MCT. Il rend toute arête dont le type est `traitement`, ce qui
comprend, via le `defaultEdgeOptions` de `DiagramCanvas.tsx` et des `type: 'traitement'` explicites
dans les données :

| Famille | Figures | Tracé retenu |
|---|---|---|
| MCT v2 | 9 (`mct-v2-*`) | **droit** |
| MCT archive | 9 (`mct-*`) | **droit** |
| SAT archive | 2 (`sat-*`) | escalier |
| MPT archive | 2 (`mpt-*`) | escalier |
| MOT, MCD, MLD, MPD | 39 | escalier |

SAT et MPT restent en escalier : l'orthogonal y est la convention habituelle, et ces figures n'ont
rien demandé. `RelationshipEdge.tsx` n'est **pas** modifié.

Le critère est l'**id de figure** : `diagram.id.startsWith('mct')`. Les ids sont `mct-*` / `mct-v2-*`
pour les MCT, `sat-*` / `mpt-*` / `mot-*` / `mcd-*` … pour les autres — pas d'ambiguïté possible.

## Résultat implémenté

- [x] `src/types/index.ts:91` — `straight?: boolean` dans `RelationshipEdgeData`, avec le rappel que
      la règle est posée par `DiagramCanvas` et non par le composant d'arête.
- [x] `src/components/DiagramCanvas.tsx:136` — `straight: diagram.id.startsWith('mct')` dans
      `initialEdges`, à côté du `diagramId` déjà injecté. **C'est le seul endroit qui décide du style.**
- [x] `src/components/Edges/TraitementEdge.tsx:133` — branche entre `getStraightPath` et
      `getSmoothStepPath`. `sx` / `sy` / `tx` / `ty` (lignes 120-124) sont **inchangés**.
- [x] `npm run lint` : **68 erreurs, baseline exacte, 0 nouvelle**.
- [x] `npx vite build` : OK — 641.12 kB / 174.35 kB gzip.

## Fichiers

| Action | Fichier |
|---|---|
| Modifier | `src/types/index.ts` |
| Modifier | `src/components/DiagramCanvas.tsx` |
| Modifier | `src/components/Edges/TraitementEdge.tsx` |

Aucune modification de `edgeAnchors.ts`, `ProcessNode.tsx`, `RelationshipEdge.tsx` ni des figures.

## Pourquoi ça marche sans toucher aux ancres

Trois raisons, qui font que le changement est local :

1. **L'éventail est déjà physique.** Les poignées de règles d'émission sont réparties le long du bord
   inférieur des nœuds d'opération (`ProcessNode.tsx`, `left: ((i + 0.5) / rules.length) * 100 %`).
   Les arêtes partent donc déjà de points distincts : en diagonale elles forment un éventail naturel,
   et le coude orthogonal n'était plus là pour les distinguer.
2. **`edgePathOffset` est indépendant de la forme du chemin.** Il renvoie un nombre, pas une chaîne
   (`edgeAnchors.ts`). L'offset décale l'ancre le long du côté du handle : il produisait des marches
   parallèles, il produit désormais des diagonales parallèles. Aucun réglage (pas de base `28`) à
   reprendre, et l'overlay `DEBUG` continue d'afficher les mêmes valeurs.
3. **Aucun élément de rendu n'est perdu.** `markerEnd` n'est utilisé nulle part et `BaseEdge` ne le
   reçoit pas : il n'y a pas de flèche à réorienter. Les deux fonctions renvoient
   `[path, labelX, labelY, …]`, donc le label (quand il y en a un), le popover de cotation et l'overlay
   de debug restent alignés sur le milieu de l'arête. Le popover réécrit `data` avec `...e.data`
   (`TraitementEdge.tsx:172`), donc `straight` y survit à une cotation.

## Choix assumés

- **L'escalier disparaît aussi comme repère d'orientation.** En orthogonal, le coude disait où
  l'arête allait ; en diagonale, deux arêtes qui se croisent peuvent se lire ambiguëment.
- **Le critère est un préfixe d'id**, pas une propriété de `DiagramDefinition`. C'est cohérent avec
  l'existant (`diagram.id === 'mot-organisationnel-v2'` en `DiagramCanvas.tsx:116`) et cela évite de
  toucher à 18 fichiers de figures. Le jour où une famille non-MCT veut des droites, le préfixe suffit.

## Points de vigilance

- **Le cas le plus à surveiller est la figure de parcours 2** : T4 envoie **trois** résultats vers le
  `top` unique du nœud d'opération de T5. Ces trois arêtes partagent le même ancrage résolu, donc
  l'offset les écarte — mais trois diagonales convergentes sont plus denses à lire que trois marches.
- **Une diagonale peut accrocher une carte.** Comme `position.x` est le coin haut-gauche des nœuds,
  le `top` d'un nœud d'opération est décentré vers la droite par rapport au résultat qui l'alimente.
  Dans le gouttier entre deux rangées, la diagonale peut donc passer sur l'événement du traitement
  suivant. Les deux leviers propres, si cela arrive : augmenter `ROW_HEIGHT` (`mct_combine.ts:36`,
  actuellement `640`) ou décaler vers la gauche la `position.x` des nœuds d'opération dans les MCT
  individuels.
- **Le cas le plus risqué a disparu avec la découpe** : la couture T2→T3, qui traversait toute la
  hauteur de l'ancienne figure, n'est plus représentée (cf. `20261001_decoupe_parcours_mct.md`).
- **Validation manuelle** : un MCT v2 et un MCT d'archive en segment droit, un SAT et un MPT
  d'archive **toujours en escalier**, un MCD/MLD inchangé, et le popover de cotation toujours
  positionné sur le milieu de l'arête.