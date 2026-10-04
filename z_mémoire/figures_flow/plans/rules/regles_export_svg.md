# Règles — Export SVG

Deux règles durables qui recense **comment** réfléchir à l'export SVG
(`src/utils/exportSvg.ts`), pour ne pas réinstaller un problème déjà payé :

1. **§1 — l'invariant de placement** : un raster doit être dimensionné *et*
   positionné d'après la boîte de l'élément réellement rasterisé ;
2. **§2 à §5 — la bordure des cartes au raster (Plan C)** : ne jamais faire
   confiance à la bordure peinte par `html-to-image`.

Historique complet et options testées :
`plans/implementations/20260928_refonte_export_svg.md`.

## 1. L'invariant de placement (le bug MCT du 2026-10-03)

> Le raster doit être **dimensionné et positionné** d'après la boîte de
> l'élément **réellement rasterisé**.

L'export dimensionne le canvas et calcule le ViewBox sur l'**enveloppe**
`.react-flow__node`, mais rasterise `resolveCaptureTarget(el)` — parfois un
**descendant**. Les deux ne coïncident que si la cible *est* l'enveloppe.

### 1.1 Symptôme

Export SVG des 4 figures `mct-v2-parcours-*` « sans dessus dessous » :

- les **pentagones de synchronisation disparaissent** (donc les libellés `ET`,
  `(RET OU REF) ET DA`) ;
- les rectangles d'opération sont **remontés** d'une hauteur de pentagone,
  chevauchant l'événement du dessus et les arêtes croisées ;
- les libellés d'arêtes et les arêtes, eux, sont **corrects** — d'où
  l'impression que « tout ce qui est visible a des positions aléatoires ». La
  hauteur de pentagone **varie** selon le libellé (9 px sur T7, 12 px ailleurs),
  donc le décalage variait d'un nœud à l'autre.

### 1.2 Cause

`mct-syncop` (T0–T8) est le seul nœud **composé de deux formes empilées** :

```
.react-flow__node                   ← sans bordure
└── div.flex.flex-col.items-center  ← sans bordure
    ├── pentagone  border:2px solid + borderBottom:'none'
    └── opération  border-2 border-solid  (4 côtés)
```

`resolveCaptureTarget` cherchait « la première carte bordée des 4 côtés » pour
reproduire le cas qui marche (MCD/MLD/MPD, où la carte **est** la racine). Or le
pentagone est écarté (`borderBottom: 'none'` ⇒ `borderBottomWidth: 0px`) et
**l'opération passe**. Résultat : le pentagone n'était pas rasterisé, et
l'opération était peinte en haut d'un canvas dimensionné sur
`pentagone + opération`, puis replacée au coin haut-gauche de l'enveloppe.

L'ancien docblock affirmait que les polygones MCT/SAT retombent sur le repli
« enveloppe ». C'était **faux depuis l'introduction de `MctSyncop`**, et c'est ce
faux postulat qui a laissé le bug s'installer sans rien lever.

### 1.3 Solution

1. **`[data-export-root]`** — contrat explicite, prioritaire sur toute
   heuristique. Le pose un nœud dont aucune forme n'est « la carte » ; ici le
   wrapper `MctSyncop`. Le composite entier est rasterisé d'un bloc.
2. **`dx`/`dy`** — `captureNodePadded` mesure le décalage de la cible dans
   l'enveloppe (mesures écran divisées par `zoom`) et le renvoie ; l'assemblage
   place le raster en `fx + dx − PAD`, `fy + dy − PAD`. Filet de sécurité : tout
   écart futur devient inoffensif au lieu de décaler la figure.
3. **`console.warn`** — déclenché uniquement si `|dx| > 0.5` ou `|dy| > 0.5`
   **et** cible non taguée, donc exactement dans le cas où le placement aurait
   été silencieusement faux. Silencieux pour les figures legacy, où la cible est
   legitimately décalée de ~0.

Ordre de résolution : `[data-export-root]` → première carte bordée 4 côtés →
enveloppe.

## 2. Problème racine (bordure)

`html-to-image` rastérise les nœuds de façon **non fiable pour la bordure** :

- la rangée basse d'une carte à hauteur fractionnaire est **clippée** (le canvas
  est dimensionné sur `clientHeight` arrondi à plat) → bordure-bas manquante ;
- les coins arrondis du bas sont rendus avec un rayon *légèrement différent*
  (renderer aux hauteurs fractionnaires) → un trait repeint au rayon CSS
  « déborde » du coin réel ;
- la couleur du trait lue via `getAttribute('stroke')` vaut `null` (CSS vars).

Conséquence : **ne jamais faire confiance à la bordure du raster** — ni sa
présence, ni sa position, ni sa couleur.

## 3. Approches écartées (et pourquoi)

| Approche | Gain | Pourquoi abandonnée |
|---|---|---|
| Rasteriser tel quel, ne rien toucher | zéro code | bordure-bas absente |
| `<rect>` vectoriel de repli par-dessus | bordure visible | **double bordure** haut/gauche/droite (2px vs 1px) |
| Plan B — repaint du bas seul (`fillRect` + arcs, sondes `inward/outward`) | bas + coins | coin gauche « 2px » en boucle : le raster peint déjà la courbure, sonder/effacer/réduire le rayon tourne en rond (Rév. 2→5) |
| Mesurer le rayon réel par coin | calage fin | mesure fausse (rangée `L` = bande basse, pas le coin) → **deux bordures** |
| **Plan C — redessiner tout le ring** | déterministe, uniforme | — (retenu) |

La leçon clé : comme le raster peint déjà les 3/4 de la bordure, tout patch
local se mord avec l'existant. **On efface tout le ring, puis on le repeint.**

## 4. Solution retenue (Plan C) — `ensureBottomBorder`

1. **Boîte de la carte par pixels** (seule géométrie qu'on tient du raster) :
   - `top`/`bottom` = 1re/dernière **rangée** opaque au centre du canvas ;
   - `left`/`right` = 1re/dernière **colonne** opaque à mi-hauteur (hors coins).
2. **Ring `Path2D` evenodd** = `outer roundRect` − `inner roundRect` :
   - rayons extérieurs = `border-*-radius × 2` (px phys, canvas pixelRatio 2) ;
   - rayons **intérieurs** = extérieurs − épaisseurs de bordure des côtés
     adjacents (CSS) ;
   - construit à la main (`arcTo`), pas de dépendance à `ctx.roundRect`.
3. **Erase** `destination-out` du ring élargi de `outPad` au-delà du bord externe
   (absorbe anti-alias + coins du raster) → la bordure du raster disparaît.
4. **Paint** `source-over` du ring exact en `borderColor` (du `getComputedStyle`).

Le **fond de carte n'est jamais touché** (le trou interior du ring est creusé
avant `inner`), et `box-shadow` vit hors boîte → jamais effacé.

Deux gardes de sortie immédiate, `bordered=false` et **`clipPath !== 'none'`** :

- sans bordure (wrapper de composite, `mot-matrix`…) → rien à repeindre ;
- **pentagone clippé** (`MctSync`, `MctSyncop`, `MotSync`) → un ring rectangulaire
  à coins arrondis **aplatirait la pointe**, et la sonde de boîte (dernière
  rangée opaque au centre) tombe sur la bande horizontale, pas sur la pointe. La
  bordure du raster est alors laissée telle quelle.

Conséquence assumée : un composite capturé d'un bloc (`mct-syncop`) ne voit pas
son rectangle d'opération repeint. Le défaut historique qui motivait le Plan C
venait de `h-full`, neutralisé par `height: auto` — à revérifier à l'export si
la bordure basse de l'opération sort mal (variante : une raster par carte).

## 5. Boutons de calage (en tête de `ensureBottomBorder`, px phys)

| Bouton | Défaut | Rôle |
|---|---|---|
| `radiusDelta` | `0` | `+N` grossit le rayon de coin (si le bg arrondit plus que la bordure peinte) |
| `outPad` | `2` | marge d'effacement au-delà du bord EXTERNE (anti-alias, coins) |
| `innerPad` | `0` | marge d'effacement AVANT le rebord intérieur (ligne d'anti-alias du raster en rebord) |

## 6. Checklist de validation (si un jour ça réapparaît)

- [ ] **Les 4 figures `mct-v2-parcours-*`** : pentagones présents, libellés `ET`
      et `(RET OU REF) ET DA` lisibles, opérations alignées sur leurs arêtes ;
- [ ] Une figure **MCT legacy** (pentagone autonome) : pointe non aplatie,
      vignette `DEBUG` étiquetée `pentagone` ;
- [ ] Console : **aucun** `warn` `[exportSvg]` sur les figures saines ;
- [ ] MCD : 4 côtés + 4 coins nets, verbes/cardinalités/rôles visibles ;
- [ ] MLD et MPD-SQL identiques (bordure déjà parfaite → repaint invisible) ;
- [ ] Solo ⤓ sur une Entité et sur un bloc SQL ;
- [ ] Mode sombre ;
- [ ] Cartes carrées (`border-radius: 0`) → ring droit ;
- [ ] `box-shadow` non effacée ;
- [ ] `npx tsc --noEmit` = 75 erreurs (baseline) ; `npx vite build` OK ;
- [ ] `dist/` (versionné) restauré après le build.

## 7. Prérequis connexes à l'export

- **Polices auto-hébergées** (`src/assets/fonts/` + `@font-face` dans
  `index.css`) : sans quoi `html-to-image` ne peut pas lire les feuilles remotes
  (`SecurityError cssRules`) → texte en fallback → métriques ≠ live → la
  bordure-bas tombe ailleurs que prévu.
- **Clone paddé** (`captureNodePadded`, pad 16 + `Math.ceil` + `height:auto`
  pour neutraliser `h-full`) : garder le pad transparent (jamais exporté,
  placement `−NODE_CAPTURE_PAD` à l'assemblage).
- **Cible de capture** (§1) : `[data-export-root]` pour tout nœud composite,
  sinon le repli « première carte bordée 4 côtés » — et `dx`/`dy` doivent
  toujours accompagner le raster.
- **Variables CSS** : le clone est inséré sous `document.body`, hors du
  sous-arbre de `DiagramCanvas` où sont déclarées les `--mct-*-scale`. Elles
  sont donc recopiées explicitement sur le wrapper (racine capturée) — noms
  dérivés de `DEFAULT_MOT_TABLE_CONFIG.mctFontScales`, valeurs lues sur le nœud
  live. Sans dépendre du fait que `html-to-image` énumère ou non les custom
  properties dans `getComputedStyle`.
- **Encadrements de traitements** : hors périmètre. `TreatmentFrames` est un
  frère de `<ReactFlow>`, donc hors de `.react-flow__renderer` : ils ne sont pas
  exportés, décision assumée (2026-10-03).
