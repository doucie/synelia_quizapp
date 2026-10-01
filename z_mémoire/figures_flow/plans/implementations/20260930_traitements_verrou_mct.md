# PLAN — Encadrement + verrou par traitement (MCT combinée)

Date : 2026-09-30
Référence : `plans/mct/nouveaux_mct.md` (découpage T0–T6 repris par
`src/diagrams/traitements/v2/mct_combine.ts`), et pour le motif de propagation du drag par
préfixe `src/components/DiagramCanvas.tsx:174-213` + `src/diagrams/mot/mot_organisationnel_v2.ts:41-55`.
Précédent : `plans/implementations/20260930_mct_combine_figure.md` (création de la figure combinée).

> **⚠️ Périmètre renommé le 2026-10-01.** `mct-v2-combine` n'existe plus : la figure est coupée en
> `mct-v2-parcours-1` (T0–T2) et `mct-v2-parcours-2` (T3–T5). L'encadrement et le verrou portent sur
> 3 sections au lieu de 7, mais **le code est inchangé** : `sections` est toujours dérivé des entries
> de la fabrique, et les sections sont calculées de la même façon. Voir
> `plans/implementations/20261001_decoupe_parcours_mct.md`. Les occurrences de `mct-v2-combine` et de
> « figure combinée » ci-dessous décrivent l'état à la date de ce plan.

## Statut

- Plan créé puis implémenté le 2026-09-30. Vérification automatique passée, **checklist manuelle
  à faire** (`npm run dev`).
- Périmètre : **`mct-v2-combine` uniquement**. Le MOT est explicitement **hors périmètre**.

## Contexte & décisions

- Dans `mct-v2-combine`, chaque « traitement » est un groupe de nœuds (3 à 5) partageant un
  préfixe `t0-` … `t6-`. Aujourd'hui, seul le MOT sait déplacer un traitement d'un bloc :
  `DiagramCanvas` active la propagation du drag sur `diagram.id === 'mot-organisationnel-v2'`, et
  le `MotEditToolbar` (bouton ÉDITER) bascule en élément par élément.
- On veut pour la MCT combinée un modèle **inverse et plus intuitif** : à l'état normal on
  déplace les éléments **un par un**, et c'est un **verrou** explicite qui transforme le
  traitement en bloc. D'où deux icônes sur l'encadrement au lieu d'un mode « édition ».
- **L'encadrement est une aide à l'édition, pas du contenu de figure.** Il n'apparaît donc pas dans
  le SVG exporté — même limitation que le fond de tableau `MotTableBg` aujourd'hui, et pour la même
  raison : `exportSvg.ts` ne capture que `.react-flow__node`, `.react-flow__edges` et
  `.react-flow__edgelabel-renderer` (cf. `exportSvg.ts:436,478,505`).
- **Les verrous sont mémorisés** dans le localStorage du diagramme, avec les positions.
- L'encadrement apparaît **au survol** et **persiste** sur le dernier traitement cliqué ou déplacé.
  Un seul traitement est focalisé à la fois.
- Aucun formatage de figure, aucun texte ajouté **dans la figure** (règle déjà actée pour
  `mct_combine`). Les libellés de l'overlay sont de l'UI d'édition, hors export.
- Icônes : `lucide-react` (`Move`, `Lock`, `LockOpen`) — le paquet est déjà une dépendance, utilisée
  par `SqlScriptBlock.tsx:2`, et la convention projet interdit les emojis.

## Modèle d'état

```
hoveredSectionId : string | null    transitoire    (survol)
focusedSectionId : string | null    persistant     (clic sur nœud, clic sur cadre, début de drag)
lockedSectionIds : Set<string>      persistant     (localStorage)
```

Cadre visible ⟺ `id === hoveredSectionId || id === focusedSectionId`.

- Chargement de la figure : aucun cadre.
- Survol de T2 → cadre + 2 icônes ; disparaît dès que le pointeur quitte T2.
- Clic sur un nœud de T3, ou drag d'un de ses éléments → T3 devient focalisé, son cadre reste ;
  survol de T1 → cadre de T1 en plus, puis disparaît.
- Clic sur un élément de T2 → le focus passe de T3 à T2 ; seul T2 reste cadré en persistant.
- Clic sur le vide (`onPaneClick`) → plus aucun cadre persistant.

**Règle de déplacement**

| Situation | Glisser un nœud | Icône « déplacer » |
|---|---|---|
| Section déverrouillée | ce nœud seul (natif React Flow) | toute la section |
| Section verrouillée | toute la section | toute la section |

## Fichiers

| Action | Fichier |
|---|---|
| Créer | `src/components/TreatmentFrames.tsx` — overlay cadres + boutons |
| Créer | `src/hooks/useGroupMove.ts` — drag manuel du groupe (pointer events) |
| Créer | `src/hooks/useStickyHover.ts` — survol différé (voir §3) |
| Modifier | `src/types/index.ts` — `DiagramSection` + `sections?` sur `DiagramDefinition` |
| Modifier | `src/diagrams/traitements/v2/mct_combine.ts` — `MCT_COMBINE_SECTIONS` |
| Modifier | `src/hooks/useDiagramState.ts` — `lockedSections?` dans `DiagramState` |
| Modifier | `src/components/DiagramCanvas.tsx` — overlays, drag verrouillé, hover/focus |
| Modifier | `src/index.css` — `.treatment-frame`, `.treatment-btn` |

**Non modifiés** : `exportSvg.ts` (l'overlay n'est pas capturé), `MotTableBg.tsx`,
`MotEditToolbar.tsx`, `MotTableToolbar.tsx`, `TraitementEdge.tsx`, `RelationshipEdge.tsx`,
`edgeAnchors.ts`, `App.tsx`.

## 1. Le contrat `sections`

```ts
export interface DiagramSection {
  id: string      // 't0'
  prefix: string  // 't0-' — cohérent avec le préfixe d'aplatissement
  label: string   // 'MCT v2 — T0 · Créer la campagne'
}
```

Ajouté dans `src/types/index.ts`, avec `sections?: DiagramSection[]` sur `DiagramDefinition`.

`sections` est **optionnel** : les 56 autres diagrammes n'en déclarent pas, la feature reste
totalement inerte pour eux (pas de rendu, pas de handlers, pas de persistance).

`mct_combine.ts` exporte `MCT_COMBINE_SECTIONS` (7 entrées `id`/`prefix`/`label` dérivés de la
constante `sections` déjà présente dans le fichier) et le pose sur `mctCombine.sections`.

## 2. Géométrie des cadres

Bbox d'une section = union des boîtes de ses nœuds membres, **+ 16 px** de marge.

- Dimensions lues sur `node.measured` (renseigné par React Flow v12), défaut `220 × 80` si absent.
- Le prop `onNodesInitialized` est aujourd'hui un stub `() => {}` jamais lu
  (`DiagramCanvas.tsx:48`, `App.tsx:86`) et déclenche l'erreur TS6133 préexistante. Le câbler
  permet de récupérer les dimensions mesurées de façon fiable, et supprime l'erreur au passage.
- La bbox est recalculée dans un `useMemo` dépendant de `nodes` : le cadre suit donc le traitement
  pendant un drag de groupe, sans état supplémentaire.

## 3. Les deux couches d'overlay

Deux contraintes antagonistes :

1. Le **corps du cadre** doit capter le survol, sinon l'encadrement scintille dès qu'on traverse
   une gouttière entre deux nœuds d'une même rangée (les nœuds d'un traitement sont en colonne,
   séparés par ~100–180 px).
2. Les **boutons** doivent rester cliquables, donc au-dessus des cartes.

Un seul overlay ne peut pas satisfaire les deux : au-dessus des nœuds, le cadre BODY capterait les
clics destinés aux cartes ; en dessous, les boutons seraient masqués par les cartes.

D'où deux conteneurs frères, transformés ensemble par le viewport :

```
<div ref={framesRef}    z-index 0     />  AVANT  <ReactFlow>  → sous les nœuds
    MotTableBg (MOT)  +  cadres, corps pointer-events: auto
<div ref={controlsRef} z-index 1000  />  APRÈS  <ReactFlow>  → au-dessus des nœuds
    2 boutons par cadre visible, pointer-events: auto
```

Transformation partagée : `transform: translate(vx,vy) scale(z)` + `transformOrigin: 0 0`,
`position: absolute; top: 0; left: 0` — c'est le mécanisme `applyTableTransform` déjà en place
pour `MotTableBg` (`DiagramCanvas.tsx:155-164,310-318`), généralisé d'une ref à une liste de refs.

**Continuité du survol cadre → bouton** : les deux vivent dans des couches différentes, donc
`mouseleave` du cadre déclencherait un effacement de `hoveredSectionId` à l'instant du clic.
Corrigé par un effacement différé : `setHovered(null)` dans un `setTimeout(…, 60)` annulé si un
`mouseenter` survient entre-temps. Isolé dans `src/hooks/useStickyHover.ts` (plutôt que les
~6 lignes prévues dans `TreatmentFrames.tsx` : le même mécanisme est câblé sur les deux couches,
donc il deserved son propre hook testable).

Icônes placées en haut à droite du cadre, dans la gouttière entre deux rangées. Badge `T0`…`T6`
issu de `section.id` — **tranché** (cf. « Choix ouvert »).

**Conséquence à gérer : le cadre masque `panOnDrag`.** `panOnDrag` n'a de sens que sur le pane, et le
corps du cadre intercepte le `pointerdown` sur toute l'étendue d'un traitement — donc plus aucun
glisser-déplacer de la vue sur la figure (elle fait 4 480 px de haut). `DiagramCanvas.onPanStart`
relaye le geste au viewport (`setViewport` + `syncOverlays` + `persist`), avec un seuil de
3 px : au-delà, `panMoved` interdit au `click` qui suit de focaliser le traitement. Sans ce relais,
le seul moyen de naviguer reste la molette et les `<Controls>`.

## 4. Drag manuel via l'icône « déplacer »

L'icône vit dans l'overlay, donc **hors** du graphe de nœuds : React Flow ne peut pas la traîner.
`useGroupMove.ts` gère `pointerdown` → `setPointerCapture` → `pointermove` → `pointerup`.

- Delta écran → coordonnées flow : `delta / zoom`, `zoom` lu via `useReactFlow().getZoom()`.
- Positions **absolues** recalculées depuis les positions de départ (pas d'accumulation), puis
  snapées sur la grille de 10 px pour rester cohérent avec `snapToGrid={[10, 10]}`.
- `pointerup` → appel de `persist(viewport)`, sinon les positions ne sont pas sauvegardées.
- Focus : le drag d'une section la rend focalisée (cohérent avec « déplacer l'un de ses éléments
  ⇒ traitement sélectionné »).

**`persist` ne peut pas dépendre de `nodes`.** Le geste est piloté par des listeners natifs attachés
au `pointerdown` : la closure `persist` qu'ils retiennent date d'avant les `setNodes` du drag, et
sauvegarderait donc les positions de départ. `persist` lit désormais un miroir `nodesRef` synchronisé
par un effet — les positions écrites sont bien celles du dernier rendu.

`dragStartPositions` est remis à `null` au début d'un drag **isolé** : sinon les positions de départ
d'un glissement de bloc antérieur resteraient en mémoire (sans conséquence, `resolveDragGroup`
filtrant sur `group`, mais l'invariant vaut mieux qu'une garde).

## 5. Drag d'un nœud quand la section est verrouillée

Extension de la logique MOT existante (`onNodeDragStart` / `onNodeDrag`,
`DiagramCanvas.tsx:174-213`) : la condition devient « le nœud appartient à une section **et** cette
section est verrouillée ». Capture des positions de départ de toute la section, puis application du
delta à tous les membres à chaque `onNodeDrag`.

Le cas particulier du MOT (`diagram.id === 'mot-organisationnel-v2'`, propagation sauf en mode
édition) est **conservé tel quel**, derrière un `if` : les deux mécanismes cohabitent, aucune
régression possible sur le MOT.

## 6. Persistance du verrou

```ts
export interface DiagramState {
  positions: Record<string, { x: number; y: number }>
  viewport: { x: number; y: number; zoom: number }
  lockedSections?: string[]   // nouveau
}
```

`loadDiagramState` fait déjà un `JSON.parse` : les états existants, sans le champ, se chargent sans
erreur — **backward compatible, aucune migration**. `persist` fusionne le champ avant `saveState`,
et le basculement du verrou appelle `persist` pour l'écrire.

`App.tsx:37` (`handleResetPositions`) supprime la clé `figures_flow:diagram:<id>` → les verrous
tombent avec les positions. `MotTableToolbar` (redimensionnement) passe par `persist` également.

## 7. UI de l'encadrement : deux couches, deux espaces de coordonnées

**Constat.** Badge et icônes rétrécissaient avec le monde : les deux couches d'overlay portant
`scale(zoom)`, sur `mct-v2-combine` (figure de 640 × 4480 px, `fitView` à un zoom ≈ 0.16) des icônes de
24 px passaient à **~4 px écran**, illisibles et imprécis à cliquer.

**Solution retenue — sortir les commandes de l'espace monde.** La couche des cadres reste en
coordonnées *monde* ; celle du badge et des icônes passe en coordonnées *écran*, positionnée en JS.
Chaque traitement est rendu dans une **rangée unique** (badge `T0` à gauche, deux icônes à droite) dont
`width` et `transform` sont écrits par `applyControlsLayout` :

```ts
const right = v.x + (f.x + f.w) * v.zoom
const top = v.y + f.y * v.zoom
el.style.width = `${f.w * v.zoom}px`
el.style.transform = `translate(${right}px, ${top - CTRL_GAP}px) translate(-100%, -100%)`
```

`v.x + x * v.zoom` est **la formule dont React Flow se sert pour placer les nœuds** : les commandes
sont donc glutées au cadre par construction, et le `translate(-100%, -100%)` final pose le coin
bas-droit de la rangée sur le coin haut-droit du cadre sans avoir à connaître la largeur de la rangée
(les pourcentages se résolvent sur sa boîte non transformée). Un seul point de calcul, aucune
arithmétique répartie dans le CSS.

`applyFramesTransform` et `applyControlsLayout` sont enveloppés dans `syncOverlays`, seul point d'appel
(`onMove`, relais de pan, `onNodesInit`, branche `fitView`) : les deux couches n'ont ni la même unité
ni la même formule, il ne faut pas en oublier une. Un `useLayoutEffect` sans tableau de dépendances
resynchronise en plus après chaque rendu, car survol / focus / verrouillage montent et démontent des
overlays sans déplacer la vue.

**Reste en coordonnées monde, dans la couche 1.** L'épaisseur du trait et le rayon du cadre, seuls
éléments à épaisseur non nulle :

| Élément | Règle | Effet écran |
|---|---|---|
| `.treatment-frame` | `border-width: calc(1px * var(--treatment-inv-zoom))`, `border-radius` idem | trait 1 px constant, **boîte toujours en coordonnées monde** |
| badge + icônes | aucun `transform` CSS, position écrite en px écran | 24 px constants, ancrés par `applyControlsLayout` |

Le tout est écrit en impératif : faire passer le zoom par un état React re-rendererait le canvas à
chaque frame de panoramique.

### 7 bis. La règle à retenir, et le bug qu'elle explique

Dans un sous-arbre contre-échellé en `scale(1 / zoom)`, **une longueur CSS est déjà une longueur
écran**. Seul un décalage (`top`, `left`) est exprimé en px monde.

La première version de la couche 2 enfreignait cette règle : `.treatment-controls` portait
`height: calc(24px * var(--treatment-inv-zoom))`, qui compensait **deux fois** la contre-échelle. La
boîte du bloc ne mesurait donc plus 24 px écran mais `24 × inv`, et comme `align-items: center` centre
les icônes **dans cette boîte**, leur centre se déplaçait avec le zoom — elles rentraient dans le
cadre au dézoom alors que leur décalage paraissait constant. C'est ce défaut, et non le seul
mélange marges monde / décalage écran, qui a fausser le premier diagnostic.

La version actuelle supprime le problème par construction : plus aucune taille n'est multipliée par
`--treatment-inv-zoom` dans la couche 2, et plus aucun `calc()` n'y sert de décalage.

**Les commandes ne sont jamais masquées.** Une variante `COMPACT_ZOOM = 0.8` + `data-compact` avait été
essayée (le bloc de 2 icônes fait 52 px pour un cadre `T0` de 39 px au zoom par défaut) puis rejetée :
faire disparaître une action selon le zoom oblige à rezoomer pour la retrouver. Le recouvrement du
traitement **du dessus** au dézoom est le compromis retenu. Alternatives écartées : barre fixe en
espace écran (comme `MotEditToolbar` pour le MOT) et taille adaptative `clamp(16px, …, 24px)` — les
deux ont été arbitrées en faveur des icônes in-place à 24 px constants, pour ne pas voir le bloc
rétrécir sous les doigts ni disparaître.

**Initialisation obligatoire.** Le placement en px écran n'a de sens qu'une fois le viewport définitif,
donc `syncOverlays` est appelé à deux endroits : la branche `fitView` de l'effet de changement de
figure (`fitView` ne déclenche pas toujours `onMove`) **et** `onNodesInit`, seul moment où le viewport
et les cadres sont tous deux connus.

**Non concerné** : `MotEditToolbar` et `MotTableToolbar` sont déjà en espace écran (`top`/`right` sur
le div racine non transformé) donc ils ne rétrécissent pas. Laissés tels quels.

## Vérification

- [x] `npm run lint` : 70 erreurs avant, **69 après** ; l'erreur TS6133 `onNodesInitialized`
      disparaît (elle était la seule gagnée). Aucune nouvelle, en particulier rien dans
      `TreatmentFrames.tsx`, `useGroupMove.ts`, `useStickyHover.ts`, `mct_combine.ts`.
- [x] `npx vite build` : OK.
- [x] `git diff src/components/DiagramCanvas.tsx` : les suppressions sont des refactorisations
      (`tableRef` → `overlays`, `applyTableTransform` → `applyFramesTransform`,
      `diagram.id === 'mot-organisationnel-v2'` → `isMot`, handlers MOT factorisés dans
      `resolveDragGroup`). Rien de perdu côté MOT.
- [x] `exportSvg.ts` lit `.react-flow__renderer` / `.react-flow__node` / `.react-flow__edges` /
      `.react-flow__edgelabel-renderer` : les overlays sont des frères de `<ReactFlow>`, donc hors
      périmètre de capture.
- [x] `npm run lint` : 69 erreurs avant §7, **69 après**, aucune nouvelle.
- [x] `npx vite build` : OK.
- [x] `sectionFrames` remonté avant les fonctions de placement : `applyControlsLayout` le référence
      dans son tableau de dépendances, il devait être initialisé (TDZ) avant.

Manuel (`npm run dev`, figure « MCT v2 — Parcours complet (T0 → T6) ») :

- [ ] « Reset » préalable : `figures_flow:diagram:mct-v2-combine` a pu être écrit par les essais.
- [ ] Au chargement, aucun cadre visible.
- [ ] Survol de T2 → cadre + les 2 icônes ; disparaît en sortant de T2.
- [ ] Clic sur un nœud de T3 → cadre de T3 persistant ; le survol de T1 s'affiche en parallèle.
- [ ] Clic sur un nœud de T2 → le focus passe de T3 à T2, T3 n'est plus cadré.
- [ ] Clic sur le vide → plus de cadre persistant.
- [ ] Déverrouillé : glisser un nœud déplace ce nœud seul ; l'icône « déplacer » déplace tout T.
- [ ] Verrouillé (icône cadenas fermée) : glisser n'importe quel nœud de T déplace tout T.
- [ ] Rechargement de la page : le verrou survit, les positions sont restaurées.
- [ ] « Reset » de la barre d'outils : positions **et** verrous repartent de zéro.
- [ ] Export SVG : 28 nœuds + 28 arêtes, **aucun cadre, aucun bouton**.
- [ ] Dézoom jusqu'à `minZoom` (0.1) : les deux icônes **restent visibles** et à 24 px, trait visible,
      badge `T0` au bord gauche du cadre. Le bloc peut recouvrir le traitement du dessus : assumé.
- [ ] Zoom 1 : le bloc d'icônes est **entièrement au-dessus** de la ligne haute, à 6 px près, et
      collé au bord droit du cadre. Badge `T0` aligné verticalement sur les icônes.
- [ ] Zoom 2 : rien ne grossit ni ne rétrécit à l'écran.
- [ ] MOT : comportement inchangé (glisser = groupe, ÉDITER = élément par élément).
- [ ] Les 7 MCT individuelles : aucun cadre, drag natif inchangé.
- [ ] Glisser sur un cadre (fond du traitement) déplace la vue, sans focaliser le traitement.

## Écarts assumés par rapport au plan

- ~~**État au repos.** Le cadre est dessiné en `border-color: transparent` au repos […] Exception :
  **un traitement verrouillé garde son trait** (et son badge, et son cadenas) même au repos — sinon
  plus rien ne signalerait que son glissement déplace le bloc entier, ce qui rend le mode verrouillé
  indétectable sans interagir avec la figure. `TreatmentFrameControls` filtre sur
  `hovered || focused || locked`, pour la même raison.~~ → **tranché le 2026-10-01, dans l'autre sens.**

### Encadrement : un seul traitement à la fois, rien au repos (2026-10-01)

Retour utilisateur : verrouiller un traitement laissait son encadrement figé en permanence, sur
tous les traitements verrouillés à la fois. L'encadrement doit suivre le traitement qu'on édite ou
qu'on utilise, **pas** figer ceux qui sont verrouillés.

- [x] Le cadre est piloté **uniquement** par `[data-hovered]` et `[data-focused]`. La règle
      `.treatment-frame[data-locked]` et l'attribut `data-locked` ont été supprimés : un traitement
      verrouillé n'a plus aucun trait au repos.
- [x] `TreatmentFrameControls` filtre sur `hovered || focused`. Une variante « puce cadenas » au repos
      (badge et bouton Déplacer masqués) avait été envisagée puis écartée : sans encadrement, un
      cadenas isolé se lit comme un élément à part entière, sans lien visible avec son traitement.
- [x] **Un seul encadrement à la fois** : `focusedSectionId` et `hoveredSectionId` ne contiennent
      chacun qu'une valeur, mais survoler B pendant que A est focalisé dessinait les deux cadres.
      `focused` vaut désormais `focusedSectionId === prefix && hoveredSectionId === null` — le focus
      reste mémorisé, il est masqué tant qu'un autre traitement est survolé, et revient à la sortie du
      pointeur.
- [x] **Pas de blocage de déverrouillage** : `.treatment-frame` est en `pointer-events: auto` et
      `TreatmentFrames` rend *tous* les cadres sans filtre, avec `onMouseEnter`. Survoler une carte
      d'un traitement verrouillé fait donc réapparaître cadre, badge et les deux icônes — exactement
      comme pour un traitement déverrouillé.
- **Contrepartie assumée** : au repos, un traitement verrouillé est indiscernable d'un déverrouillé.
  Relire le plan initial : on acceptait que l'absence de trait rende le mode indétectable sans
  interagir ; la demande est l'inverse de ce compromis. Deux atténuations restent : `toggleLock`
  focalise le traitement (cadre 2 px + rangée complète juste après le verrouillage), et
  `resolveDragGroup` ne se manifeste qu'au moment du glissement. `FrameBox.locked` est conservé — il
  ne sert plus qu'à l'icône et à son `data-variant`.
- Le verrou reste **fonctionnel** : `lockedSections` est toujours persisté (`useDiagramState.ts`,
  `DiagramCanvas.tsx` `persist` / rechargement) et pilote toujours le glissement groupé.

### Ids de figures dupliqués (2026-10-01)

Deux paires de figures partageaient le même id, ce qui cassait le changement de figure.

- [x] Renommage des **figures d'archive uniquement** : `mcd-campagnes-pipeline` →
      `mcd-campagnes-pipeline-archive`, `mld-campagnes-pipeline` → `mld-campagnes-pipeline-archive`.
      Les figures de `src/diagrams/nouveau/` sont **inchangées**.
- [x] `key={activeDiagram?.id}` sur `<DiagramCanvas>` (`App.tsx`) : force le remontage au changement
      de figure. Sans elle, l'effet de réinitialisation de `DiagramCanvas` dépend de `diagram?.id` et
      ne se rejoue pas quand deux figures partagent le même id — les nœuds, le viewport et les
      verrous de la figure précédente restaient affichés.
- Effets corrigés : double allumage dans la sidebar (`activeId === d.id` ne compare que l'id),
  `getDiagram()` (`.find` sur le tableau plat) qui renvoyait toujours la figure `nouveau` au
  rechargement, et la clé localStorage `figures_flow:diagram:*` partagée entre les deux figures.
- ⚠️ Conséquence : la clé localStorage de l'archive change, ses positions repartent des valeurs en
  dur ; et si `figures_flow:sidebar` pointait sur l'archive, la figure active redevient la première
  au prochain chargement.

## Points de vigilance

- **Motif de pile (z-index)** : c'est la partie la plus fragile du plan. `.react-flow` et les deux
  overlays doivent être dans le bon ordre de pile, sinon soit le cadre avale les clics, soit les
  boutons sont masqués. À vérifier en premier, sur la figure MOT comme sur la figure MCT.
- **Positions initiales de la MCT combinée** : `figures_flow:diagram:mct-v2-combine` a pu être
  écrit par les essais de la figure combinée (positions modifiées, identifiants `t0-`…`t6-`). Un
  « Reset » avant les tests manuels de placement est recommandé.
- **Bordure d'encadrement vs cartes** : 16 px de marge, l'encadrement ne devrait pas recouvrir les
  cartes. Si la marge s'avère insuffisante pour un traitement à 3 résultats (`mct4`, x 30 → 410),
  l'augmenter.
- ~~**Reliquat `getValidHandles`**~~ : **clos le 2026-10-01** — factorisé dans `validHandles`
  (`edgeAnchors.ts`). Voir l'Option B de `plans/implementations/20260830_points_ancrage_edges.md`.
- **Placement écrit en JS** : `applyControlsLayout` est la seule source de vérité pour la position
  des commandes. Toute retouche d'alignement se fait là (ou sur `CTRL_GAP`), pas dans le CSS : y
  remettre un `calc()` sur `--treatment-inv-zoom` réintroduirait le bug décrit en §7 bis.

## Choix ouvert

- ~~**Texte sur l'encadrement**~~ : **tranché le 2026-09-30 — badge `T0`…`T6` seulement**
  (`section.id`), au bord gauche du cadre, sur la même rangée que les deux icônes. Pas de libellé
  complet : au zoom par défaut de la figure combinée, `T0` ne fait que ~39 px de large. `shortLabel()`
  a été supprimé ; `section.label` reste dans les données sans être lu par l'UI.
- ~~**Taille des icônes au dézoom**~~ : **tranché le 2026-09-30 — 24 px constants**. La variante
  adaptative (`clamp(16px, 26 % de la largeur écran, 24px)`) a été écartée : elle fait changer la
  taille des icônes sous le pointeur.
- ~~**Barre de commandes fixe hors figure**~~ : **écartée le 2026-09-30**, les commandes restent
  in-place sur l'encadrement.

