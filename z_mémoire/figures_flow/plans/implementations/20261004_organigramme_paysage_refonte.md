# Plan - Organigramme Synelia : refonte visuelle et passage en paysage A4

Suite de `20261003_organigramme_synelia.md`, qui avait produit la figure en
portrait. Ce plan reprend la figure pour la lisibilité et la page paysage.

## Pourquoi

Trois défauts, tous vérifiés dans la source de l'original
(`z_mémoire/figures_html/organigramme_synelia_avec_ag.html`).

### 1. Les couleurs de l'original ne sont pas arbitraires

L'original déclare 9 teintes nommées, une par entité, et les réemploie à trois
endroits : bordure gauche de la boîte, fond teinté, sur-titre — plus la couleur
des branches de sa direction. Notre table `C` en reprenait 5 à l'identique et
en approximait 4. Une seule diverge vraiment :

| | original | notre `C` |
|---|---|---|
`d1` | `#0284c7` = hsl(198, 95%, 39%) | hsl(180, 98%, 39%) — **cyan au lieu de ciel** |
`pmo` | `#0d9488` | hsl(175, 84%, 32%) |
`d2` | `#059669` | hsl(161, 94%, 30%) |
`d3` | `#7c3aed` | hsl(262, 83%, 58%) |
`dg` `ag` `sg` `d4` `d5` | — | exactes |

Décision : reprendre les **9 valeurs hexadécimales** de l'original, sans
approximation.

### 2. `OrgBusEdge` ne sait pas colorer une arête

`stroke-[var(--xy-edge-stroke-default)]` est figé dans le `className` de
`BaseEdge`. Or l'original a trois traitements de branche distincts :

| | original | avant |
|---|---|---|
chaîne de gouvernance + barre | `#64748b` **2,0 px** | gris, `isStrong` 2 px |
PMO | **teal `#0d9488` 1,7 px, tirets `6 3`** | gris, tirets `7 5` |
direction → services | **1,2 px, opacité .85, teinte de la direction** | 1,5 px gris |

Il faut un `data.stroke` par arête, et aligner le tiret sur `6 3`.

### 3. Les liens sous les directions ne décrivent pas la donnée

C'est le vrai défaut, et il est dans les deux figures.

**Original** : le connecteur de chaque direction est dessiné pour une disposition
**côte à côte** — tige, barre horizontale de la largeur de la colonne, puis trois
gouttes de 26 px en `cx−106`, `cx`, `cx+106`. Mais les services sont **empilés
verticalement au même x** : les trois portent `left: cx−106` à des `top`
différents. Les deux gouttes extérieures tombent donc sur les bords gauche et
droit de la seule boîte du haut, et sur rien d'autre. Aucun service n'est pointé.
`d3`, qui n'a que 2 services empilés, a hérité de la géométrie à 3 gouttes : les
siennes sont en `660` et `860` alors que ses boîtes sont centrées sur `760`.

**Notre figure** : 14 segments verticaux sur l'axe des colonnes, passant derrière
les boîtes, qui se lisent comme un tronc unique traversant les trois services.

Les deux tracés sont trompeurs. Décision : **retirer les liens**, et porter le
groupement par l'alignement et la couleur.

Conséquence directe, non négociable : sans liens, la géométrie porte seule le
groupement. Un service doit être **exactement aussi large et exactement centré**
sur sa direction, et porter **exactement sa teinte**. Si ces deux-ci lâchent, le
groupement disparaît et la figure ment.

## Les trois signaux de niveau

L'original distingue déjà les niveaux par la boîte, pas par le trait :

| | fond | bordure gauche | rayon | padding | intitulé | titulaire |
|---|---|---|---|---|---|---|
gouvernance | teinté | 5 px | 8 px | 8/12 | 12,5 | 9,5 |
directions | teinté | 5 px | 10 px | 10/13 | 12,5 | 9,5 |
**services** | **blanc** | **3 px** | **6 px** | **5/10** | **11** | **8,8** |

Les services n'ont pas de sur-titre — ce qui est déjà le cas dans nos données.
Aujourd'hui `OrgNode` applique un style unique (`rounded-lg`, `px-4 py-4`,
bordure 8 px, fond teinté) à tous les niveaux : il faut un discriminateur dans
`data` et un switch dans `OrgNode`.

Le corps des services est réduit à 0,875 de la base. Gardé pour trois raisons :
c'est un des trois signaux ; les services n'ont pas de sur-titre, donc leur
hiérarchie repose en partie sur le corps ; et ça économise de la hauteur, la
ressource rare.

## Décisions de mise en page

**PMO : au-dessus du gouttier 4ᵉ/5ᵉ, en débordant dans les colonnes 4 et 5.**
C'est ce que fait l'original — son PMO (220 px) déborde déjà au-dessus de `d4` et
`d5` sans rien toucher, puisqu'il occupe la bande vide entre le SG et la barre.
Un bay à droite hors hiérarchie avait été envisagé, mais après recalage des
colonnes et suppression des 14 liens, le budget vertical tient sans lui : le bay
ne rachète plus de marge et casserait la symétrie du bloc de 5 colonnes sur une
page pleine. Il évite aussi d'écrire un cas d'arête horizontale dans
`OrgBusEdge`, qui reste un point ouvert.

**Marges 2,2 cm latéraux.** Le calcul tranche : 1,6 cm gagnerait 0,5 pt mais
rognerait la marge de reliure et coûterait du budget vertical. À 2,2 cm on obtient
10,9 pt contre 10,3 pt pour le portrait actuel — le paysage améliore la
lisibilité au lieu de la dégrader.

## Le dimensionnement

```
pt = largeur utile × 28,3465 / (w_px / B_px)
```

Le corps imprimé ne dépend pas de la page mais de la **densité** de la figure :
le nombre de corps de caractère qui tiennent en travers du canevas. C'est ce qui
commande tout le reste.

| | largeur utile | densité `w/B` | corps | hauteur |
|---|---|---|---|---|
portrait avant | 15,8 cm | 1300/30 = 43,3 | 10,3 pt | 25,3 cm |
paysage, même dessin | 25,3 cm | 43,3 | 16,0 pt | 37,3 cm — déborde |
paysage visé | 25,3 cm | **66,1** | **10,9 pt** | 15,0 cm |

Cibles :

| | avant | paysage |
|---|---|---|
`fontScale` | 1 | **4/3** → B = 40 px |
`COL_PITCH` | 255 | **500** |
`DIR_W` / `SVC_W` | 224 / 224 | **450 / 450** |
`GOV_W` / `PMO_W` | 340 / 260 | **500 / 450** |
canevas | 1300 × 1979 | **≈ 2644 × 1570** |
`V.link` / `V.drop` | 56 / 26 | **44 / 26** |
`V.dirToSvc` / `V.svc` | 64 / 22 | **40 / 18** |
arêtes | 22 | **8** |

`CANVAS_W` devient dérivé (`5 × COL_PITCH + 2 × 72`) : c'était une valeur en dur à
maintenir. `MARGIN` de 72 px pour que la figure respire au lieu de toucher les
bords.

Les colonnes à 450 px donnent ~14 caractères par ligne : les intitulés de
direction tiennent sur 2 lignes, ceux des services sur 2 ou 3. Les deux
libellés abrégés pour la version portrait **repassent en entier** —
`Production & Expérience Client` n'a plus besoin de tenir sur 3 lignes dans
182 px.

`Bureau de Gestion de Projets` reste à 3 lignes : c'est un intitulé de service,
pas un chapeau technique, on ne l'abrège pas. Le plancher de sa colonne absorbe
le surplus.

**Planchers de services par colonne**, pas globaux : sans liens, chaque colonne
est un groupe autonome et aucune ne doit hériter du défaut de sa voisine.
`NOM.svc` devient le maximum de la colonne.

## Séquence

1. Les 3 styles de niveau et les 9 teintes — **sans toucher à la géométrie**, pour
   valider le rendu du premier coup d'œil.
2. `data.stroke` + tiret, puis suppression des 14 liens de service.
3. Géométrie paysage, `NOM` **recalé sur le tableau DEBUG**.
4. Contrôle géométrique : alignement service/direction au px, dégagement PMO,
   `dY = 0`, aucun recouvrement.
5. `#landscape-figure`, `body.typ`, export SVG.
6. Compilation Typst.

Seul l'étape 3 demande un aller-retour navigateur, et il ne reste aucun contrat
de raccord à tenir puisqu'il n'y a plus qu'un angle dans la figure.

## Points à vérifier à l'exécution

- l'interprétation des marges par `page(flipped: true)` ;
- `counter(page).final()` sur une page de largeur différente — le pied
  `Page n / N` se déforme facilement sur une page pivotée ;
- `header: none` est obligatoire sur la page paysage : `body.typ` active
  `body-header`, un filet aligné à droite qui, sur 26 cm de zone, mange la marge
  et déforme la largeur ;
- le `min-height` dans le SVG exporté — toute la géométrie repose dessus.

## Méthode de mesure

Les planchers ne se calculent pas, ils se mesurent (tableau journalisé par
`OrgBusEdge`, bouton DEBUG). Rappel de la méthode, et de ses deux pièges :

- les hauteurs ne se lisent **qu'après chargement de la fonte** (`font-display:
  swap`) : un relevé au moment du fallback donne 3 px de trop ;
- le tableau journalise deux fois au démarrage, seule la dernière passe compte ;
- le dépassement est la seule colonne qui compte : il vaut `mesuré − plancher`, et
  une rangée dont le plancher dépasse l'entraxe fait chevaucher ses boîtes.

## Observation hors périmètre

`Inter-400/500/600/700.woff2` sont le même fichier (48256 o, MD5 identique), et
pareil pour les quatre `PlusJakartaSans` (27348 o). Seuls Poppins et Cabinet
Grotesk ont quatre poids réellement distincts : les gras sont donc factices sur
Inter et Plus Jakarta Sans. Sans effet sur l'organigramme, qui utilise Cabinet
Grotesk. Noté, pas corrigé.

## Liste de contrôle

- [x] Diagnostic des trois défauts, sourcé sur l'original
- [x] `types/index.ts` : `EntityNodeData.orgLevel`
- [x] `Nodes/OrgNode.tsx` : 3 styles + corps par niveau
- [x] `Edges/OrgBusEdge.tsx` : `data.stroke`, tiret `6 3`
- [x] `diagrams/organigramme/synelia_avec_ag.ts` : teintes, largeurs, `fontScale`,
      suppression des 14 arêtes, libellés en entier, planchers par colonne
- [x] `NOM` recalé sur le tableau, `dY = 0`
- [x] Contrôle géométrique : alignement, dégagements, recouvrements
- [x] `theme.typ` : `#landscape-figure`
- [x] `body.typ` : figure de la ligne 93
- [x] Export SVG : `min-height` survécu au clone
- [x] `npx tsc --noEmit` : **76** erreurs de référence, soit la baseline de
      `20261003`, et aucune dans les trois fichiers de la figure
- [x] `npx vite build`
- [x] Compilation Typst de la page paysage
- [x] `figures_html/index.html` : lien vers le SVG

## Ce que la vérification a donné

Le contrôle n'a pas été visuel : les libellés sont rasterisés dans l'export, on
ne peut donc pas les inspecter depuis le SVG. Il a été **structurel**, par un
script CDP (`%TEMP%\opencode\verify-org.mjs`) qui relit le DOM et le SVG exporté.

| contrôle | résultat |
|---|---|
| libellés dans le DOM | 23/23, aucun `Ã`/`â€` (mojibake) |
| boîtes au-dessus de leur plancher | 0/23 |
| rasters : position et taille | 23/23 à ≤ 1 px |
| pages paysage dans le PDF | 1 sur 135, A4 paysage 841,9 × 595,3 pt |
| emprise imprimée | 25,26 cm de large, 15,08 cm de haut d'encre |

Deux résultats méritent d'être notés parce qu'ils invaliderent des estimations :

- **`d2` ne déborde pas.** Les 23 boîtes mesurent *exactement* leur plancher, donc
  `NOM.dir = 204` est une valeur mesurée, et les 238 px du plan `20261003`
  n'étaient qu'une hypothèse. Les 5 colonnes de services se lisent
  `[140, 140, 140, 61, 100]` — la 4ᵉ n'a aucun titulaire, sa colonne est courte.
- **`min-height` survit au clone.** C'était l'hypothèse dont dépendait toute la
  géométrie (`clone.style.height = 'auto'` dans `captureNodePadded`). Elle est
  confirmée par le fait que chaque raster retrouve la taille de sa carte.

Un défaut d'ancrage a été trouvé au passage : `@xyflow/react` impose des handles
de 6 px dans une feuille **non mise en couche**, qui bat Tailwind. Les ancres
étaient donc décalées de 3 px vers l'intérieur de chaque boîte, et les pastilles
étaient visibles à l'impression. `OrgNode` pose désormais un style inline de
taille nulle. `ProcessNode` n'a pas été touché — hors périmètre.

### Écart assumé sur le corps imprimé

Le plan visait 10,9 pt, calculé sur un canevas de 2644 px. L'export fait
**2531 px**, parce que `exportSvg` recadre sur la boîte englobante réelle des
rasters. À 25,3 cm de large, le corps sort donc à **11,3 pt** et non 10,9.

Ce n'est pas un défaut : la zone utile est la même et le corps est plus lisible.
Deux leviers si l'on veut revenir à 10,9 pt : réduire la largeur de l'image à
24,26 cm dans `body.typ`, ou refondre le canevas pour que le recadrage soit nul.
Le second est le bon, mais il déplace toute la géométrie.