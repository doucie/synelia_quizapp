# PLAN â€” Refonte de l'export de figure entiÃ¨re (bouton SVG)

Date : 2026-09-28
Fichier : `src/utils/exportSvg.ts`
RÃ¨gles : `to-do/rules/general-rules.md` (rÃ©utiliser l'existant, pas de couleurs en dur).

## Contexte & dÃ©cisions

### Essais successifs (et pourquoi abandonnÃ©s)

1. **Reconstruction piÃ¨ce par piÃ¨ce (d'origine)** : nÅ“uds rasterisÃ©s un Ã  un, arÃªtes
   rÃ©-extraites du DOM, labels capturÃ©s individuellement. DÃ©fauts :
   - couleur des liens via `getAttribute('stroke')` â†’ `null` (le trait est une classe
     CSS `stroke-[var(--xy-edge-stroke-default)]`) â†’ tout en `#666` ;
   - labels (verbes/cardinalitÃ©s/rÃ´les) clippÃ©s dans la boÃ®te 36Ã—36 des badges
     (leurs `<span>` dÃ©bordent en `position:absolute`) ;
   - bordure basse des entitÃ©s absente.
2. **Capture unique du viewport** : `html-to-image` ne restitue pas fidÃ¨lement le
   `<svg>` imbriquÃ© des arÃªtes dans un `foreignObject` â†’ liens disparus ; et la
   capture Ã©tait bornÃ©e au viewport â†’ figure incomplÃ¨te.
3. **Hybride manuel (retenu)** â€” chaque couche avec une technique fiable :
   - **ArÃªtes** : rÃ©-Ã©mises en `<path>` vectoriels, couleurs via
     `getComputedStyle()` (rÃ©sout les CSS vars â†’ vraie couleur WYSIWYG) ;
   - **NÅ“uds** : raster individuel robuste via clone paddÃ© (voir Ã©tude ci-dessous) ;
   - **Labels** : UNE seule surcouche raster du `.react-flow__edgelabel-renderer`
     entier, recadrÃ©e sur l'union des boÃ®tes (plus de clipping) ;
   - figure complÃ¨te indÃ©pendante du viewport/zoom (`onlyRenderVisibleElements`
     dÃ©sactivÃ© â†’ tout est dans le DOM).

### Structure DOM confirmÃ©e (React Flow v12.11.1)

- `div.react-flow__edges` â†’ `svg.react-flow__marker` (dÃ©fs de flÃ¨ches) + `svg` (1
  par arÃªte, `style.zIndex`) â†’ `g.react-flow__edge` â†’ `path.react-flow__edge-path`
  (+ `.react-flow__edge-interaction` Ã  ignorer).
- Tous les labels sont des enfants **directs** de `.react-flow__edgelabel-renderer`,
  en coordonnÃ©es flow (`position:absolute; left/top`), conteneur dans le viewport
  transformÃ© â†’ on peut les capturer en une fois aux positions flow exactes.

## Ã‰tude approfondie (cause racine bordure-bas + arÃªtes coupÃ©es)

### Pourquoi la bordure-bas disparaÃ®t (et pourquoi le solo Â« marchait Â»)

`html-to-image` dimensionne le canvas depuis la valeur mesurÃ©e du **nÅ“ud racine**
passÃ© Ã  `toCanvas` :

- `es/util.js:67-80` â€” `getNodeWidth/Height()` = `clientWidth/Height + borderWidths`,
  et `clientWidth/Height` sont des **entiers** (arrondi navigateur vers la valeur
  infÃ©rieure pour les hauteurs sub-pixel).
- Or `.react-flow__node` n'a **pas de bordure** â†’ canvas haut = `clientHeight` de
  l'enveloppe **arrondi Ã  plat**, alors que les cartes EntitÃ©/Process ont des
  hauteurs **fractionnaires** (line-height normal + padding 12px) :
  le pixel fractionnaire du bas (oÃ¹ vit la bordure 1px) tombe **hors du canvas**
  â†’ coupÃ© au raster, irrÃ©cupÃ©rable ensuite (l'Ã©tirement Ã  l'assemblage ne recrÃ©e
  pas le pixel).
- LÃ©gende compensÃ©e : **l'export solo (`exportNodeSvg`) utilise le mÃªme moteur et
  la mÃªme mesure** â†’ il coupe aussi dÃ¨s qu'il s'agit d'une **EntitÃ©** ; le bloc
  SQL/script (hauteurs entiÃ¨res, line-heights fixes) passe Ã  travers â†’ impression
  que seul le solo marchait. VÃ©rifiÃ© mentalement, Ã  confirmer au navigateur
  (â¤“ sur une entitÃ© coupait la bordure avant correctif).
- Le `<rect>` vectoriel de repli (ajoutÃ© Ã  la passe prÃ©cÃ©dente, **puis rejetÃ© par
  le client**) : correct dans le principe mais redoublait les bordures
  haut/gauche/droite dÃ©jÃ  prÃ©sentes dans le raster (largeurs entiÃ¨res) â†’ rendu
  inÃ©gal 2px/1px.

### Pourquoi les arÃªtes semblaient coupÃ©es aux extrÃ©mitÃ©s

La bbox du viewBox ne couvrait que **nÅ“uds + labels** ; les `d` des arÃªtes
(boucles rÃ©flexives, arcs) dÃ©bordent et Ã©taient **recoupÃ©s par le `viewBox`** du
SVG plat (le `foreignObject` n'est pas en cause â€” ancrÃ© en (0,0), `es/util.js:168-183`,
et le contenu est ancrÃ© top-left ; aucune dÃ©pendance au viewport).

### Bug latent dÃ©couvert (labels)

`labelImage.w = canvas.width/2` = la **surface du renderer** (â‰¥ fenÃªtre), pas la
zone des labels â†’ le PNG embarquÃ© reprÃ©sentait tout le renderer (transparent
ailleurs) â†’ **fichier SVG alourdi inutilement** (base64 du canvas complet).

### Correctif post-test : masquage du clone replacÃ© sur un hÃ´te non capturÃ©

PremiÃ¨re implÃ©mentation de `captureNodePadded` : le wrapper (root du `toCanvas`)
portait `opacity:0` et `left:-10000px` pour Ãªtre invisible Ã  l'Ã©cran. **RÃ©sultat :
entitÃ©s invisibles partout, export solo vierge** â€” car `clone-node.js:82-91`
(`cloneCSSStyle`) recopie intÃ©gralement le style calculÃ© du root dans le clone
`foreignObject` (`targetStyle.cssText = getComputedStyle(nativeNode).cssText`) :
`opacity:0` â†’ contenu transparent, et `left:-10000px` (`position:fixed`) â†’ contenu
repositionnÃ© hors du canvas. LeÃ§on : **aucun style de masquage ne peut vivre sur le
root capturÃ©**. Correctif : le masquage positionnel est portÃ© par un **hÃ´te**
`position:fixed; left:-100000px` parent du wrapper ; le root capturÃ© (wrapper)
reste neutre (`position:relative; display:inline-block; padding:4px`,
`pointer-events:none`) et rend son clone en (0,0) du foreignObject.

## Correctifs (faits)

1. **`captureNodePadded(el, { width?, height? })`** â€” rasterisation via un **clone
   dÃ©tachÃ© dans un wrapper paddÃ©** :
   - `clone = el.cloneNode(true)` ; `transform none`, `left/top 0`,
     `position relative` (inline) â†’ contenu ancrÃ© en haut-gauche ;
   - hÃ´te `position:fixed; left:-100000px` (masquage, **non capturÃ©**) â†’
     wrapper `position:relative; display:inline-block; padding:16px;
     pointer-events:none` â†’ clone (styles calculÃ©s rÃ©solus, aucun flicker
     sur le diagramme) ;
   - `toCanvas(wrapper, { pixelRatio:2, skipAutoScale:true, width:?, height:?,
     style:{ boxShadow:'none' } })` â€”
     `width/height` **facultatifs** : passÃ©s par la figure en **`Math.ceil`**
     (`ceil(nw)+32`/`ceil(nh)+32` â†’ canvas/SVG entiers, plus d'arrondi
     navigateur), omis par le solo (mesure naturelle du wrapper, padding inclus) ;
   - `wrapper.remove()` dans un `finally` (rÃ©tabli un `host` parent retirÃ© en
     `finally`, cf. correctif ci-dessus).
   - **Diagnostic temporaire** : `console.info('[captureNodePadded]')` Ã©chantillonne
     les 5 rangÃ©es du bas (RGBA au centre) â†’ confirme que la bordure est dans le
     raster ; Ã  retirer une fois validÃ©.
   La marge (16px) encaisse toute perte de rangÃ©e en rasterisation â†’
   **bordure-bas toujours incluse** (image placÃ©e ancrÃ©e en haut : `âˆ’NODE_CAPTURE_PAD`,
   aucun dÃ©calage).
2. **Figure** â€” nÅ“uds placÃ©s en `x: fxâˆ’4, y: fyâˆ’4, w/h: canvas.width/2` : la marge
   transparente est recompensÃ©e, la carte raste remonte exactement sur sa bbox
   layout. Suppression de `findBorderedCard` + du champ `border` + de l'Ã©mission
   du `<rect>` (plus de double bordure).
3. **ArÃªtes** â€” Ã  chaque chemin Ã©mis, `p.getBBox()` (coord. locales = coord. flow,
   le `d` rÃ©-Ã©mis le prouve) est fusionnÃ© dans la bbox â†’ **plus d'arÃªtes recoupÃ©es**
   en bord de figure. PAD 40 conserve les pointes de flÃ¨ches.
4. **Labels** â€” `toCanvas` avec `width:lw, height:lh` + `w:lw, h:lh` â†’ image
   exactement bornÃ©e Ã  la zone des labels, **SVG allÃ©gÃ©**.
5. **Solo (`exportNodeSvg`)** â€” bascule sur `captureNodePadded` â†’ bordure-bas des
   EntitÃ©s nette aussi en â¤“ (choix utilisateur : recommandÃ©).
6. Docblock d'en-tÃªte `exportSvg` rÃ©Ã©crit (description des 3 couches Ã  jour).

## Correctif post-test 4 : polices auto-hÃ©bergÃ©es (cause racine â€” les mÃ©triques)

**Ã‰VIDENCE (console utilisateur)** : les exports logguaient
`SecurityError: Failed to read the 'cssRules' â€¦ Cannot access rules` sur les 2
feuilles **remotes** (Fontshare Cabinet Grotesk, Google Poppins/Inter/Plus Jakarta
Sans). `html-to-image` (embedWebFonts) ne peut pas lire les feuilles
cross-origin â†’ ne peut pas embarquer les polices en data-URI dans le
`foreignObject` â†’ le texte y est rendu en **police de fallback** â†’ mÃ©triques â‰ 
live â†’ hauteur de la carte clonÃ©e â‰  `nh` mesurÃ© â†’ la bordure-bas tombe ailleurs
que lÃ  oÃ¹ pad/ceil/`height:auto` la supposent. Les blocs SQL (stack **locale**
`ui-monospace/â€¦`) et les labels monospace n'Ã©taient pas affectÃ©s â†’ Â« parfaits Â».

**Fix appliquÃ©** :
- TÃ©lÃ©chargement des woff2 (via les CSS server, UA desktop) â†’ `src/assets/fonts/`
  (Cabinet Grotesk 400/500/700/800 ; Inter, Plus Jakarta Sans, Poppins 400-700).
  Inter/PJS sont servis en **fonts variables** (mÃªme fichier pour tous les poids).
- `index.css` : bloc `@font-face` locaux (noms identiques au live, `display: swap`).
- `index.html` : suppression des 2 `<link>` remotes.
- Debug : `getContext('2d', { willReadFrequently: true })` (supprime le warning).

**Note** : Lightning CSS dÃ©duplique au build les rÃ¨gles `@font-face` dont la source
rÃ©solue est identique (Inter/PJS 500-700 variables â†’ seule la 400 reste) â†’ live et
raster partagent la mÃªme feuille â‡’ **export WYSIWYG**. Cabinet Grotesk (dÃ©faut) et
Poppins gardent leurs 4 poids distincts. Ã€ re-regarder seulement si le faux-gras
systÃ©mique d'Inter/PJS 500+ gÃªnait.

## Correctif post-test 3 (CAUSE RACINE rÃ©elle) : `h-full` mange la marge de sÃ©curitÃ©

MalgrÃ© pad 16 + `Math.ceil` + capture de la carte interne, la bordure-bas des
entitÃ©s restait coupÃ©e. MÃ©canisme (source `html-to-image` relue) :

- `toCanvas` force `options.height` sur le root clonÃ© (`apply-style.js:6-11` â†’
  `style.height = height px`) ; on passe `height = ceil(nh)+32` â†’ **wrapper**
  (padding 16px, `box-sizing: content-box`) dont la **hauteur de contenu** devient
  `ceil(nh)+32` ;
- la carte `h-full` (`height:100%`) vaut alors `ceil(nh)+32` â€” le pad n'est PAS une
  marge, il est **ajoutÃ© Ã  la hauteur de la carte** ;
- le foreignObject fait `ceil(nh)+32` de haut (`util.js:168-183`) â†’ bordure-bas de
  la carte Ã  `16 + (ceil(nh)+32) = ceil(nh)+48` : **hors viewBox, dÃ©coupÃ©e**.
  Augmenter le pad ne change rien (la bordure reste rejetÃ©e `PAD` px sous le
  viewport) â†’ Â« toujours coupÃ© Â» malgrÃ© pad 4â†’16 (et le clone de la carte gardait
  `h-full` â†’ mÃªme bug).
- Bloc **MPD-SQL** : pas de `h-full`, racine `w-full` Ã  hauteur de **contenu** â†’ la
  carte n'absorbe pas le pad â†’ bordure Ã  `16+nh < ceil(nh)+32` : visible. C'est LA
  diffÃ©rence (pas Â« carte vs enveloppe Â»).

**Fix appliquÃ©** :
- `captureNodePadded` : `clone.style.height = 'auto'` aprÃ¨s le clone â€” neutralise
  `h-full`. La carte se dimensionne au contenu (layout identique au live : l'enveloppe
  RF n'a aucune hauteur fixe â†’ `100%` vaut dÃ©jÃ  `auto`), la bordure reste dans le
  canvas avec â‰¥ 16px de marge. S'applique Ã  toutes les cartes `h-full` (entitÃ©s,
  process/MCTâ€¦). `exportNodeSvg` solo rÃ©glÃ© pareil.
- `borderProbe` recentrÃ© sur la rangÃ©e de bordure rÃ©elle (`canvas.height âˆ’ 2Â·PAD`,
  Â±4 px physiques).

## Correctif post-test 2 : capturer la CARTE interne, pas l'enveloppe `.react-flow__node`

MalgrÃ© pad 16 + `Math.ceil`, la bordure-bas des **entitÃ©s** restait coupÃ©e en figure,
alors que le **MPD-SQL** (blocs `SqlScriptBlock`) sortait parfait. Diagnostic : ce
n'est pas la hauteur, c'est **l'objet capturÃ©** qui diffÃ¨re :

| | SqlScriptBlock (parfait) | EntityNode (coupÃ© bas) |
|---|---|---|
| Racine clonÃ©e | `w-full overflow-hidden` (hauteur = contenu) | `h-full` (height:100% de l'enveloppe RF) + `min-w-[200px]` |
| Enfants | aucun | 8 `Handle` absolus |

CorrÃ©lation : ce qui marche â‰ˆ une carte simple Ã  hauteur de contenu. On n'avait
jamais clonÃ© la **carte seule** (la 1Ã¨re passe rastÃ©risait dÃ©jÃ  l'enveloppe).

**Fix appliquÃ©** :
- `resolveCaptureTarget(el)` : premier descendant Ã  bordure 4 cÃ´tÃ©s **uniforme** +
  style non-`none` (`getComputedStyle`, robuste aux classes Tailwind) ; sinon
  fallback enveloppe (nÅ“uds polygonaux MCT/SATâ€¦) â†’ comportement inchangÃ©.
- `captureNodePadded` clone `target` (la carte) au lieu de `el`, + `position:
  relative` sur le clone â†’ les Handles absolus se rÃ©-ancrent sur la carte (= sa
  boÃ®te live), le padding du wrapper ne les dÃ©cale pas. La carte remplit
  l'enveloppe avec la mÃªme origine â†’ **gÃ©omÃ©trie/placement inchangÃ©s** (top-anchored
  `âˆ’NODE_CAPTURE_PAD`, `canvas/2`). Handles (descendants de la carte) toujours inclus.
- Debug renommÃ© en `borderProbe` : Ã©chantillonne la **rangÃ©e de la bordure**
  (`canvas.height âˆ’ 2*PAD âˆ’ 1` Â± 2) au centre au lieu des 5 derniÃ¨res rangÃ©es
  (zone de padding transparente).

## VÃ©rification

- `npx tsc --noEmit` : 70 erreurs (baseline, aucune nouvelle) âœ“
- `npx vite build` : OK (629 kB JS) âœ“

### Ã€ vÃ©rifier au navigateur (`npm run dev`)
- [ ] MCD : couleurs des liens = `#b1b1b7` (clair), verbes + cardinalitÃ©s + rÃ´les
      visibles et bien placÃ©s, **bordure basse nette**, pointillÃ©s des associations
      faibles, cas **rÃ©flexives** (boucles non recoupÃ©es en bord de figure).
- [ ] MLD / MPD (tables) : mÃªmes contrÃ´les.
- [ ] MCT/MPT : labels de `TraitementEdge` (verbes traitÃ©s).
- [ ] MPD â€” Script SQL : grande figure, texte lisible.
- [ ] Mode sombre : fond du SVG en sombre, liens `#3e3e3e`, labels lisibles.
- [ ] Export solo â¤“ sur une **EntitÃ©** (bordure-bas OK) et sur un bloc SQL.
- [ ] Pas d'overlay debug dans l'export (bouton DEBUG activÃ© puis export).
## Plan B — bordure-bas déterministe tout-en-un (coins compris)

État constaté : le orderProbe montrait la ligne peinte par html-to-image mais
les coins arrondis du bas restaient coupés (la ligne s'arrêtait avant les arcs).

**Implémenté dans ensureBottomBorder(canvas, target)** (appelé par
captureNodePadded après 	oCanvas, garde si orderTopWidth = 0) :
- **Boîte de la carte dans le raster** : dernière rangée peinte L (centre, alpha
  = 60) + cardLeft/cardRight (rangée centrale du contenu).
- **Détection ligne droite** : échantillons ˜ orderColor entre les coins.
- **Peinture si absente** : un seul path — remontée lift le long des côtés ?
  arc bas-gauche ? ligne basse ? arc bas-droit ? remontée côté droit, lineWidth
  = 2×(épaisseur bordure), strokeStyle = orderColor calculée.
- **Corners a posteriori** : sondes à 45° (diagonales des coins) ? un coin manquant
  seul n'est peint que lui (paintSide).
- **Garde**  = 0 : simple ligne droite pleine ; nœuds sans bordure inchangés.

DEBUG : panneau <img> + bande du bas ×12 rangées ; verdict
peinte ? / + coins ? (log corners: left|right|both).

## Vérification
- [x] 
px tsc --noEmit : 70 erreurs (baseline, aucune nouvelle).
- [x] 
px vite build : OK.
- [ ] Navigateur : MCD (coins bas nets, l'arc suit l'arrondi), MPD-SQL inchangé
      (« déjà présente », aucun double-tracé), solo Entité + SQL, mode sombre.

### Rév. 2 — Repaint systématique (erase + paint)

Le coin bas-gauche se doublait : les sondes à 45° (détection du « déjà présent »)
étaient fragiles — html-to-image avait peint un arc partiel légèrement décalé, on
repaint par-dessus ? fragment en double.

**Nouvelle logique ensureBottomBorder** (suppression detection/probes/lift) :
1. Garde orderTopWidth = 0 ? inchangé.
2. Repérage L + cardLeft/cardRight +  (inchangés).
3. **Erase** destination-out du chemin (droite + arcs, mêmes largeur et géométrie).
4. **Paint** du même chemin en orderColor, même largeur.

Les deux passes partagent la même géométrie ? rien d'effacé sans être repeint,
fond de carte intact (plus de remontée latérale lift). Sur MPD-SQL déjà parfait :
bande effacée puis replacée à l'identique ? invisible.

## Vérification
- [x] 
px tsc --noEmit : 70 erreurs (baseline, aucune nouvelle).
- [x] 
px vite build : OK.
- [ ] Navigateur : MCD (coin gauche plus doublé, arc net), MPD-SQL identique,
      solo Entité + SQL, mode sombre, MCT/SAT (polygones sans bordure ? rien).

### Rév. 3 — Résidu externe (coin gauche) : erase ×2 + peinture séparée

Le coin gauche restait « 2px » : l'arc peinte par html-to-image est décalé de ~1px
(plus souvent vers l'EXTÉRIEUR du coin), la passe d'effacement unique (bande 2px
alignée sur notre géométrie) ne l'avalaît pas ? résidu + notre trait = doublé.
À droite le décalage tombait dans la bande, d'où la symétrie.

**Nouvelle logique ensureBottomBorder** :
- **Erase en 2 passes destination-out** : passe exacte + passe décalée de +2px
  vers le bas et ±1px vers l'extérieur (arcs) ? union [path-1 … path+2],
  jamais -2 (fond de carte intact).
- **Paint en formes séparées** (fini le lineJoin='round' uni arc?droite qui
  pouvait surépaissir) : illRect 2px pour la droite basse + 2 stroke d'arcs
  lineCap='butt', raccord arc/droite recolvrant ~1px.
- **Instrumentation** : esidual (inward | outward | none) mesuré AVANT
  effacement sur la diagonale du coin gauche ? en DEBUG (log + panneau). Si
  inward persiste (résidu AU-DESSUS de notre bande) ? variante « refill bg »
  (repaint ackgroundColor sur [yb-2 … yb-1] puis bordure) à partir de là.

## Vérification
- [x] 
px tsc --noEmit : 70 erreurs (baseline, aucune nouvelle).
- [x] 
px vite build : OK.
- [ ] Navigateur : coin gauche net (plus de 2px), coin droit toujours parfait,
      MPD-SQL identique, solo Entité + SQL, mode sombre, MCT/SAT (polygones
      sans bordure ? rien).

### Rév. 4 — Résidu INTÉRIEUR : passe symétrique + refill bg (coins inward)

Le coin gauche restait « 2px » même après la passe extérieure : l'arc du raster se
trouvait 1-2px PLUS HAUT (intérieur) que notre géométrie, hors de la bande
[path-1 … path+2]. Le résidu se déplace de côté en fonction du layout fractionnaire
(observé gauche ? droite ? gauche).

**Ajout dans ensureBottomBorder** :
- **Sondes des DEUX coins** (diagonales 45°, avant effacement) ? esidualL/
  esidualR (inward | outward | none) loggés et affichés (DEBUG).
- Si un coin est inward ET la carte a un fond non transparent :
  - efface destination-out des ARC SEULS décalés de -2px vers le haut / vers
    l'intérieur (largeur bordure) ? avale l'arc du raster plus haut ;
  - **refill immédiat source-over de la même frange en ackgroundColor**
    calculée ? aucun seam transparent, aucun trou au coin ;
  - limite l'érosion du contenu (bande = ~1 px logique, arcs uniquement).
- Passes existantes (exact / extérieur / paint) inchangées.

## Vérification
- [x] 
px tsc --noEmit : 70 erreurs (baseline, aucune nouvelle).
- [x] 
px vite build : OK.
- [ ] Navigateur (DEBUG) : résidu gauche inward ? coin net, droite toujourn
      parfaite, MPD-SQL identique, solo Entité + SQL, mode sombre, cartes carrées,
      polygones MCT/SAT (garde orderTopWidth = 0 intouchés).

### Rév. 5 — Rayon réel par coin (fin du « dépassement » d'arc)

Le coin gauche faisait encore un petit dépassement : on peignait l'arc au rayon
CALCDULÉ (2 × border-radius = 32 px phys) alors que le rayon réellement rendu par
html-to-image est légèrement inférieur (renderer aux hauteurs fractionnaires) ? le
trait ne « s'arrête pas à temps » au coin.

**Ajout dans ensureBottomBorder** :
- **Mesure l/r** sur la rangée L (bande basse du FOND, intacte même si la
  bordure est clippée) : première/dernière colonne opaque depuis cardLeft/
  cardRight ? l = xFirst - cardLeft, r = cardRight - xLast, clampés à
  [8, r], repli sur .
- **Toutes les géométries utilisent l/r** (probes 45°, and erase/paint,
  refill innerArcs : centres (cardEdge ± rayon, yb - rayon), extrémités du
  illRect cardLeft+rl-1 … cardRight-rr+1) ? l'arc s'arrête au coin réel.
- Log + panneau DEBUG : adius: "r 16css · mesuré rl/rr px" et **vignette zoomée
  ×4 du coin bas-gauche** (40 cols × 12 rows, contour rouge) pour vérifier
  visuellement l'arrêt de l'arc.

## Vérification
- [x] 
px tsc --noEmit : 70 erreurs (baseline, aucune nouvelle).
- [x] 
px vite build : OK.
- [ ] Navigateur (DEBUG) : measuré < 32 sur le coin gauche ? plus de dépassement,
      droite toujours parfaite, vignette rouge : l'arc se termine au coin sans
      excéder ; MPD-SQL identique, solo, sombre, cartes carrées, polygones MCT/SAT.

### Rév. 6 — Plan C : bordure ENTIÈRE redessinée (ring evenodd)

Abandon du rafistolage bas (plan B : erase ×2 + arcs + résidus inward/outward,
qui se mordait le coin gauche). L'expérience « sans arc gauche » a prouvé que le
raster peint déjà la courbure ? on redessine donc TOUT le ring, sans tenir compte
de sa bordure.

**ensureBottomBorder (exportSvg.ts) réécrit** :
- Boîte de la carte par pixels : top/bottom = 1re/dernière rangée opaque au
  centre, left/right = 1re/dernière colonne opaque à mi-hauteur (hors coins) ;
  couleur/épaisseurs/rayons venus du getComputedStyle.
- Ring = Path2D evenodd (outer roundRect - inner roundRect, rayons intérieurs
  = extérieurs - épaisseurs adjacentes ; pas de dépendance à ctx.roundRect).
- Erase destination-out (± outPad vers l'extérieur, ± innerPad intérieur)
  puis Paint source-over exact en orderColor.
- Boutons : adiusDelta (rayon de coin), outPad (2), innerPad (0).
- Supprimés : and, sondes/classify, innerArcs, refill gColor,
  paintLeftArc, l, esidualL/R, call site simplifié (verdict « redessinée ? »).

## Vérification
- [x] 
px tsc --noEmit : 70 erreurs (baseline, aucune nouvelle).
- [x] 
px vite build : OK.
- [ ] Navigateur (DEBUG) : MCD (les 4 côtés + 4 coins propres), MPD-SQL identique,
      solo ?, mode sombre, cartes carrées (order-radius:0), nœuds sans bordure
      (polygones MCT/SAT) intouchés, box-shadow hors boîte ? jamais effacé.
- [ ] Si un pixel subsiste : régler adiusDelta ou innerPad (commentaires in situ).
