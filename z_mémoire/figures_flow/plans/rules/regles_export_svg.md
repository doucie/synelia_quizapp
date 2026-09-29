# Règles — Export SVG : bordure des cartes au raster (Plan C)

Règle durable qui recense **comment** régler la bordure infidèle des cartes à
l'export SVG (figure + solo ⤓), pour ne pas oublier la solution si le problème
réapparaît. Code concerné : `src/utils/exportSvg.ts` (`ensureBottomBorder`,
docblock + boutons). Historique complet et options testées :
`plans/implementations/20260928_refonte_export_svg.md`.

## 1. Problème racine

`html-to-image` rastérise les nœuds de façon **non fiable pour la bordure** :

- la rangée basse d'une carte à hauteur fractionnaire est **clippée** (le canvas
  est dimensionné sur `clientHeight` arrondi à plat) → bordure-bas manquante ;
- les coins arrondis du bas sont rendus avec un rayon *légèrement différent*
  (renderer aux hauteurs fractionnaires) → un trait repeint au rayon CSS
  « déborde » du coin réel ;
- la couleur du trait lue via `getAttribute('stroke')` vaut `null` (CSS vars).

Conséquence : **ne jamais faire confiance à la bordure du raster** — ni sa
présence, ni sa position, ni sa couleur.

## 2. Approches écartées (et pourquoi)

| Approche | Gain | Pourquoi abandonnée |
|---|---|---|
| Rasteriser tel quel, ne rien toucher | zéro code | bordure-bas absente |
| `<rect>` vectoriel de repli par-dessus | bordure visible | **double bordure** haut/gauche/droite (2px vs 1px) |
| Plan B — repaint du bas seul (`fillRect` + arcs, sondes `inward/outward`) | bas + coins | coin gauche « 2px » en boucle : le raster peint déjà la courbure, sonder/effacer/réduire le rayon tourne en rond (Rév. 2→5) |
| Mesurer le rayon réel par coin | calage fin | mesure fausse (rangée `L` = bande basse, pas le coin) → **deux bordures** |
| **Plan C — redessiner tout le ring** | déterministe, uniforme | — (retenu) |

La leçon clé : comme le raster peint déjà les 3/4 de la bordure, tout patch
local se mord avec l'existant. **On efface tout le ring, puis on le repeint.**

## 3. Solution retenue (Plan C) — `ensureBottomBorder`

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
avant `inner`), et `box-shadow` vit hors boîte → jamais effacé. Nœuds sans
bordure (`bordered=false`, polygones MCT/SAT) → retour immédiat, intouchés.

## 4. Boutons de calage (en tête de `ensureBottomBorder`, px phys)

| Bouton | Défaut | Rôle |
|---|---|---|
| `radiusDelta` | `0` | `+N` grossit le rayon de coin (si le bg arrondit plus que la bordure peinte) |
| `outPad` | `2` | marge d'effacement au-delà du bord EXTERNE (anti-alias, coins) |
| `innerPad` | `0` | marge d'effacement AVANT le rebord intérieur (ligne d'anti-alias du raster en rebord) |

## 5. Checklist de validation (si un jour ça réapparaît)

- [ ] MCD : 4 côtés + 4 coins nets, verbes/cardinalités/rôles visibles ;
- [ ] MPD-SQL identique (bordure déjà parfaite → repaint invisible) ;
- [ ] Solo ⤓ sur une Entité et sur un bloc SQL ;
- [ ] Mode sombre ;
- [ ] Cartes carrées (`border-radius: 0`) → ring droit ;
- [ ] Polygones sans bordure (MCT/SAT) → non touchés ;
- [ ] `box-shadow` non effacée ;
- [ ] `npx tsc --noEmit` = 70 erreurs (baseline) ; `npx vite build` OK.

## 6. Prérequis connexes à l'export

- **Polices auto-hébergées** (`src/assets/fonts/` + `@font-face` dans
  `index.css`) : sans quoi `html-to-image` ne peut pas lire les feuilles remotes
  (`SecurityError cssRules`) → texte en fallback → métriques ≠ live → la
  bordure-bas tombe ailleurs que prévu.
- **Clone paddé** (`captureNodePadded`, pad 16 + `Math.ceil` + `height:auto`
  pour neutraliser `h-full`) + capture de la **carte interne** bordée
  (`resolveCaptureTarget`) : garder le pad transparent (jamais exporté, placement
  `−NODE_CAPTURE_PAD` à l'assemblage).