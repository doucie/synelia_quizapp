# Plan — Organigramme Synelia dans `figures_flow`

Remplacement de `z_mémoire/figures_html/organigramme_synelia_avec_ag.html` par une
figure React Flow, puis bascule du lien dans `figures_html/index.html`.

## Pourquoi la figure HTML ne pouvait pas être gardée

- les connecteurs étaient des `<line>` SVG **écrites à la main** (lignes 77-132) :
  elles ne suivent ni un déplacement de boîte, ni un changement de police, ni un
  zoom ;
- `preserveAspectRatio="none"` (ligne 77) étirait le tracé indépendamment des
  boîtes ;
- la police `Inter` était déclarée (ligne 25) mais **jamais chargée** — aucun
  `@font-face`, aucun lien : le rendu tombait sur la police système ;
- le titre de boîte était à `12.5px` sur une largeur de `1520px`, soit ~4 pt une
  fois réduit à la largeur d'une page A4.

## Décisions

- **Une seule figure**, pas une par direction : la barre de distribution ne se
  lit que si les 5 directions sont sur le même rang.
- **Les noms des personnes sont conservés** — c'est la demande explicite.
- **Barre horizontale sous le SG** : demandée, et de toute façon la seule forme
  lisible quand un parent a cinq enfants.
- Figure **portrait** (1300 × 1936) et non paysage comme l'original : le contenu
  est plus haut que large, et une figure portrait tient dans une page A4 pleine
  sans réduire les intitulés.
- **Figure rigide** (`rigidLayout`) : un organigramme n'a rien à arranger, au
  contraire d'un MCD ou d'un MLD.
- **Page A4 portrait pleine**, quitte à occuper une page entière : c'est ce qui
  autorise les corps retenus (30 / 24 / 20 px).
- **PMO latéral, au-dessus du gouttier entre les 4ᵉ et 5ᵉ directions** : l'original
  le plaçait à 73 % de la largeur (1110 px pour 1520), il a été poussé un peu plus à
  droite. `PMO_CX` est calculé depuis `colX(3)` et non comme un pourcentage, pour
  que la position ne se désynchronise pas si `COL_PITCH` change.

## Architecture

| Élément | Rôle |
|---|---|
| `src/components/Nodes/OrgNode.tsx` | boîte à 3 lignes : sur-titre / intitulé / titulaire |
| `src/components/Edges/OrgBusEdge.tsx` | tracé de barre + `trunkFraction`, `edgeTypes.orgBus` |
| `src/diagrams/organigramme/synelia_avec_ag.ts` | les 23 nœuds et 22 arêtes |
| `src/utils/color.ts` | `hsla()` extrait de `EntityNode` (partagé, plus dupliqué) |

`org-box` est une nouvelle `Variant`, dispatchée depuis `EntityNode` comme
`mpd-sql` l'est à `SqlScriptBlock` : le nœud reste `type: 'entity'`, donc rien
à changer dans `DiagramCanvas` ni dans la persistance.

## Quatre règles non négociables apprises à l'usage

### 1. La hauteur d'une boîte ne peut pas être fixée — mais elle a un plancher

`captureNodePadded` (`src/utils/exportSvg.ts`) applique `clone.style.height = 'auto'`
sur l'élément qu'il rasterise, **avant** de le capturer. Une hauteur posée sur la
boîte — en classe ou en style inline — est donc abandonnée dans le SVG : l'écran
montrait une figure et le mémoire une autre.

`min-height` est le seul plancher admis, parce que c'est un **longhand distinct**
de `height` : il survit au `clone.style.height = 'auto'`. Il est porté par
`EntityNodeData.minHeight` et non par `style`, car la cible de l'export est la
carte interne — le `style` du nœud s'applique au wrapper `react-flow__node`, qui
n'est pas rasterisé.

Effet secondaire : quand le contenu tient dans le plancher, les `NOM` de la
figure deviennent les hauteurs **réelles**. La géométrie devient calculée au
lieu d'estimée, et c'est ce qui fait tomber le milieu du tronc du SG exactement
sur le centre du PMO.

Corollaire à surveiller : un intitulé qui déborderait sur une quatrième ligne
passerait **par-dessus** la rangée suivante. Les `NOM` sont dimensionnés pour le
pire cas (sur-titre 1 ligne, intitulé 3, titulaire 2) ; les seuls leviers sont
`COL_PITCH` et `fontScale`.

### 2. `busGap` ne dépend que de la source

C'est ce qui fait la barre : plusieurs enfants d'un même parent en déduisent le
même `busY` **sans se coordonner**, et leurs segments horizontaux se recouvrent.
Il en découle que `OrgBusEdge` n'applique **ni `edgePathOffset` ni le décalage de
`TraitementEdge`** — un éventail d'ancrages est exactement ce qu'un organigramme
ne veut pas.

### 3. `trunkFraction` déplace le point de départ le long de la descente

`runY = sourceY + busGap × trunkFraction`, `1` par défaut (la barre). À `0.5`,
l'arête part du **milieu du tronc** : c'est ainsi que le PMO s'accroche à la
liaison qui descend du SG plutôt qu'à la boîte. `busGap` doit rester aligné sur
celui des directions — c'est cette valeur qui donne la longueur du tronc, donc la
position du milieu. Le coude qui suit absorbe l'écart entre la hauteur supposée et
la hauteur réelle de la cible, donc la figure n'a rien à caler au px près.

### 4. Les services sont empilés, pas répartis

Une colonne fait 255 px d'entraxe ; trois services de 224 px n'y tiennent pas de
côté. Leurs arêtes sont donc verticales et **confondues** : le trait passe
derrière les boîtes (les arêtes sont sous les nœuds) et réapparaît dans les
intervalles. On lit un tronc avec des boîtes accrochées.

Le PMO, lui, est latéral et n'a pas ce problème. Son dégagement sous la barre
n'est pas un choix mais une **conséquence** : `bar / 2 − NOM.pmo / 2`. À
`NOM.pmo = 199` (mesuré) et `V.bar = 253`, il vaut 27 px. C'est aussi le seul
levier du canevas qui ne serve à rien d'autre — donc le premier à resserrer si la
page A4 déborde.

### 5. Le plancher du PMO est un contrat de raccord, pas une marge

Le PMO est le seul nœud dont la course horizontale est à une hauteur **fixe** —
`V.bar / 2`, imposé par `trunkFraction: 0.5`. Pour que l'arrivée soit un segment
horizontal unique, il faut que le milieu de la face gauche tombe exactement là :
`roundedPolyline` retire les points confondus, donc un dernier point égal à
l'avant-dernier disparaît, et il ne reste que deux angles droits.

Si la boîte dépasse son plancher, son centre descend sous `V.bar / 2` et l'arête
se raccorde par un décrochement vertical de quelques px — avec le rayon par défaut,
cela se lit exactement comme un arrondi sur la face du PMO. **Un plancher trop
bas ne se voit pas sur la boîte, il se voit sur le tracé.**

`Y_PMO` est donc recentré sur le milieu du tronc, et l'écart résiduel s'écrit
ainsi, toutes hauteurs réelles `h` connues :

```
dY = (NOM.gov − h_sg) + (h_pmo − NOM.pmo) / 2
```

Les deux termes doivent être nuls, et pour deux raisons distinctes : `NOM.gov`
cale la course (elle part du bas **réel** du SG), `NOM.pmo` cale l'arrivée
(elle vise le centre **réel** du PMO). Un seul des deux suffit à casser l'arrivée,
et le symptôme ne désigne pas la cause — seul le tableau de `OrgBusEdge` la
trouve. Avec `NOM.gov = h_sg = 204` et `NOM.pmo = h_pmo = 199`, `dY = 0`.

La largeur du PMO n'y peut rien : c'est la hauteur qui compte.

`busRadius: 0` sur cette arête, pour la même raison : les deux seuls angles
possibles sont des coudes à 90°, la courbe de 12 px n'a rien à arrondir. Les cinq
barres de directions gardent le rayon par défaut.

### 6. `NOM` est un relevé, pas un calcul

Les planchers ne se dérivent pas, ils se **mesurent**. Le calcul « pire cas de la
rangée » s'est trompé : sur les 23 boîtes, 21 tenaient à l'estimation et deux ont
débordé.

| boîte | plancher estimé | mesuré | écart |
|---|---|---|---|
| `pmo` | 168 | **199** | +31 |
| `d2` | 238 | **273** | +35 |
| les 21 autres | — | au plancher | 0 |

`pmo` : le sur-titre « PMO Gouvernance » et l'intitulé « Mme. Seynabou Diagne »
prennent chacun plus de lignes que prévu (199 = 54 + 111,5 + 32 + 2). `d2` :
`Production & Expérience Client` prend **4** lignes et non 3 — 34,5 px de plus,
soit exactement l'écart mesuré.

Levier retenu pour `d2` : abréger l'intitulé en `Prod. & Expérience Client`, même
convention que `Admin. & Capital Humain` et `Performance Financière & Fis.` déjà
présentes sur la figure. L'alternative était de porter `NOM.dir` à 273, ce qui
ajoutait 35 px de vide intérieur aux quatre autres directions.

**Conséquence sur la méthode** : après un rechargement, les hauteurs ne se lisent
qu'une fois la fonte chargée (`font-display: swap`). Un relevé fait au moment où
le fallback est actif donne 3 px de trop sur le SG, et un `runY` faux. Il faut
donc comparer `runY` au `targetY` affiché dans l'overlay **et** au tableau, et
prendre le second.

Le tableau journalise deux fois au démarrage — une passe avant que React Flow
n'ait mesuré (tout à `non mesuré`), une passe dès que les hauteurs existent.
Seule la dernière compte.

## Rigidité

`DiagramDefinition.rigidLayout` n'est lu que par `DiagramCanvas` :

- il **saute `loadPositions`**, et `clearPositions` efface au montage les
  positions périmées en **conservant le viewport** (`resetState` aurait tout
  vidé, zoom compris) ;
- il coupe `nodesDraggable`, `edgesReconnectable`, `elementsSelectable` et
  `deleteKeyCode` — Backspace ne peut donc plus supprimer une boîte ;
- `Toolbar` masque `Export` et `↺` via `fixedLayout`, ces deux commandes ne
  portant que sur des positions qui n'existent pas.

Le panoramique et le zoom restent actifs : sans eux la figure ne serait
consultable qu'en export.

**Piège rencontré.** Appeler `useDiagramState` dans le callback de `useEffect`
fait tomber tout l'arbre en `Invalid hook call` — React n'installe son dispatcher
que pendant le rendu, et le résultat est un écran blanc. Le hook est donc appelé
au corps de `DiagramCanvas`, et l'effet ne fait que rappeler `clearPositions`.

## Polices

Corps via `--org-font-scale` (`fontScale` de la figure), comme `--mct-sync-scale`
pour le MCT. Les trois corps sont posés en **`style` inline**, pas en classe
utilitaire arbitraire : Tailwind ne génère pas une valeur `calc()` contenant une
virgule de `var()`, la classe est ignorée sans un mot.

La taille utile ne dépend que du **rapport corps / largeur du canevas** : la
figure est réduite à 16,6 × 25,3 cm. D'où 30 / 24 / 20 px pour 10,9 / 8,7 / 7,2 pt.

Le titulaire est en `text-foreground/70` et non `text-muted-foreground` : ce
dernier est un gris slate-500, illisible à l'impression sur le fond teinté des
cartes de service.

## Liste de contrôle

- [x] `src/types/index.ts` : `Variant` `'org-box'`, `Category` `'organigramme'`,
      `eyebrow`, `person`, `minHeight`, `busGap`, `busRadius`, `trunkFraction`,
      `fontScale`, `rigidLayout`
- [x] `src/utils/color.ts` : `hsla()` partagé, retiré de `EntityNode`
- [x] `src/components/Nodes/OrgNode.tsx` — dont le contournement de
      `NodeProps<EntityNodeData>`, identique à celui d'`EntityNode` et
      `ProcessNode`
- [x] `src/components/Nodes/EntityNode.tsx` : dispatch `org-box`
- [x] `src/components/Edges/OrgBusEdge.tsx` : `trunkFraction`
- [x] `src/components/Edges/edgeAnchors.ts` : `ORG_VERTICAL_VARIANTS`,
      `VERTICAL_SOURCE/TARGET_HANDLES` (renommés, plus seulement MCT)
- [x] `src/components/DiagramCanvas.tsx` : `orgBus` dans `edgeTypes`,
      `--org-font-scale` sur la racine, `rigidLayout`
- [x] `src/hooks/useDiagramState.ts` : `clearPositions`
- [x] `src/components/Toolbar.tsx`, `FullscreenOverlay.tsx`, `App.tsx` :
      `fixedLayout`
- [x] `src/utils/exportSvg.ts` : `--org-font-scale` dans `CAPTURE_CSS_VARS`
- [x] `src/components/Sidebar.tsx` : catégorie « Organigramme »
- [x] `src/diagrams/organigramme/synelia_avec_ag.ts`
- [x] `src/diagrams/index.ts` : enregistrement
- [x] `npx tsc --noEmit` : 76 erreurs, **aucune nouvelle** — après avoir repris le
      contournement de `NodeProps` déjà en place deux fois dans le dépôt
- [x] `npx vite build` : OK
- [x] Géométrie vérifiée par calcul (module compilé puis inspecté), **sur les
      hauteurs mesurées** : `dY = 0`, arrivée sur le PMO = un seul segment
      horizontal, dégagement sous la barre, gouttière 4/5, aucun recouvrement
      sur les 23 boîtes.
      **Périmé** — ces chiffres décrivent la version portrait
      (canevas 1300 × 1979, raccord `M650,724 L650,850.5 L902.5,850.5`).
      La version livrée est en paysage : canevas 2644 × 1582, raccord
      `M1322,550 L1322,655 L1847,655`. Voir `20261004`.
- [ ] **Contrôlé par `20261004_organigramme_paysage_refonte.md`** — les quatre
      points ci-dessous sont résolus, mais **les chiffres de cette section sont
      périmés** : la figure est passée en paysage (`COL_PITCH` 500,
      `fontScale` 4/3, canevas 2644 × 1582, 8 arêtes au lieu de 22). Voir le plan
      suivant pour l'état réel.
- [x] ~~Confirmer `d2`~~ : mesuré à 204 px, pas 238. Les 23 boîtes sont
      *exactement* à leur plancher, donc `NOM` est un relevé, non une estimation.
- [x] ~~Contrôle visuel par l'utilisateur~~ : non fait, et **remplacé** par un
      contrôle structurel automatisé. Les libellés sont rasterisés dans l'export,
      donc illisibles depuis le SVG — un coup d'œil à l'écran reste utile mais ne
      peut pas valider la géométrie.
- [x] ~~Export SVG : `min-height` a survécu au clone~~ : confirmé, chaque raster
      retrouve la taille de sa carte à ≤ 1 px.
- [x] ~~Basculer la carte de `figures_html/index.html`~~ : faite, la carte pointe
      désormais sur le SVG exporté.

## Points laissés ouverts

- `font-display: swap` sur les 14 polices (`src/index.css`) : la police de repli
  s'affiche avant la vraie. Avec `min-height` la géométrie ne bouge plus, mais le
  texte est brièvement à l'autre corps. Non corrigé, car le réglage est global aux
  40 figures.
- `OrgBusEdge` ne gère pas les arêtes **horizontales** (ancrage gauche/droite) :
  le PMO utilise `targetHandle: 'left'`, mais la course part du même plan vertical
  que la source, ce qui reste dans le domaine « descente puis coude ». Aucune
  arête entièrement horizontale n'est utilisée ici.
- La taille imprimée dépend des marges réelles du gabarit Typst ; les valeurs
  10,9 / 8,7 / 7,2 pt supposent une page A4 portrait pleine. La figure mesure
  25,27 cm de haut, il reste donc 4,43 cm sur les 29,7 d'une page A4 pour l'en-tête,
  la légende et la source. Leviers si le gabarit déborde, par ordre de rendement :
  `V.bar` (253, ne sert qu'au dégagement du PMO), puis `V.dirToSvc` (64), puis
  `SVC_PITCH` — **pas** `NOM.pmo`, qui est la garantie de droiture du raccord.
  **Tranché par `20261004`** : la figure est passée en paysage A4 via
  `#landscape-figure`, plus aucun de ces leviers n'est nécessaire. Le cadrage de
  l'export et le corps imprimé qui en découle (11,3 pt, pas 10,9) sont documentés
  dans le plan suivant.