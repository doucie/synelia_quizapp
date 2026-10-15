import { toCanvas } from 'html-to-image'
import { DEFAULT_MOT_TABLE_CONFIG } from '../types'
import { isEdgeDebugEnabled } from './edgeDebug'
import { saveSvgBlob } from './saveWithPicker'

/**
 * Exporte un nœud isolé en SVG.
 *
 * Rasterisation bornée au nœud via `captureNodePadded` (clone paddé) : c'est
 * ce qui permet de droper un seul `CREATE TABLE` dans le mémoire sans avoir à
 * recadrer la figure, bordure-bas comprise.
 */
export async function exportNodeSvg(nodeId: string, filename: string): Promise<void> {
  const el = document.querySelector(`.react-flow__node[data-id="${nodeId}"]`) as HTMLElement | null
  if (!el) return

  const pr = 2
  const { canvas } = await captureNodePadded(el)

  const w = canvas.width / pr
  const h = canvas.height / pr
  const PAD = 16
  const svg =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w + PAD * 2}" height="${h + PAD * 2}" ` +
    `viewBox="${-PAD} ${-PAD} ${w + PAD * 2} ${h + PAD * 2}">\n` +
    `  <rect x="${-PAD}" y="${-PAD}" width="${w + PAD * 2}" height="${h + PAD * 2}" fill="white"/>\n` +
    `  <image href="${canvas.toDataURL('image/png')}" x="0" y="0" width="${w}" height="${h}"/>\n` +
    `</svg>`

  download(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), filename)
}

function download(blob: Blob, filename: string) {
  // Dialogue OS « Enregistrer sous » (dossier au choix, mémorisé) quand le
  // navigateur l'expose, sinon téléchargement silencieux historique.
  void saveSvgBlob(blob, filename)
}

const TRANSLATE_RE = /translate\(([-\d.]+)px?,\s*([-\d.]+)px?\)/

/**
 * Variables CSS à recopier sur le wrapper de capture.
 *
 * Le clone est inséré sous `document.body`, donc **hors** du sous-arbre de
 * `DiagramCanvas` où ces variables sont déclarées, et les nœuds MCT écrivent
 * leurs tailles en `calc(var(--mct-*-scale, 1) * Npx)`. `html-to-image` les
 * recopie élément par élément (`cloneCSSStyle` énumère les longhands de
 * `getComputedStyle`, ce qui inclut ou non les custom properties selon le
 * navigateur) — on ne veut pas dependre de ce détail : les valeurs sont donc
 * recopiées explicitement sur le wrapper, qui est la racine capturée.
 * Lues sur le nœud live, elles y sont déjà résolues par héritage. Les noms
 * sont dérivés de la config, source unique.
 */
const CAPTURE_CSS_VARS = [
  ...Object.keys(DEFAULT_MOT_TABLE_CONFIG.mctFontScales).map((k) => `--mct-${k}-scale`),
  // L'organigramme n'a pas de table de config : son échelle est le champ
  // `fontScale` de `DiagramDefinition`, posé sur la racine dans `DiagramCanvas`.
  // Elle se déclare donc en dur ici, et le nom doit rester aligné sur celui-là.
  '--org-font-scale',
]

interface NodeCapture {
  canvas: HTMLCanvasElement
  /** Décalage de la cible dans l'enveloppe `.react-flow__node`, en unités monde. */
  dx: number
  dy: number
}

interface NodePlacement {
  href: string
  x: number
  y: number
  w: number
  h: number
}

/**
 * Marge de sécurité (px) ajoutée autour du nœud lors de sa rasterisation.
 *
 * `html-to-image` dimensionne le canvas depuis `clientWidth/clientHeight`
 * (entiers, `util.js:getNodeSize`) puis tronque `canvas.height` à l'entier
 * (`index.js`) : la bordure-bas d'une carte à hauteur fractionnaire peut
 * tomber hors du canvas et être perdue définitivement. En capturant un clone
 * de la carte dans un wrapper garni de cette marge (voir `resolveCaptureTarget`),
 * la bordure est toujours incluse ; la marge (transparente) est ensuite
 * recompensée à l'assemblage (`-NODE_CAPTURE_PAD`, placement ancré en haut →
 * aucune dérive visuelle).
 */
const NODE_CAPTURE_PAD = 16

/**
 * Cible de capture : l'élément à rasteriser pour ce nœud.
 *
 * **Invariant à ne jamais casser** : le raster doit être dimensionné *et*
 * positionné d'après la boîte de l'élément **réellement rasterisé**. Les deux
 * ne coïncident que si la cible est l'enveloppe elle-même — d'où les deux
 * résolutions ci-dessous, et le décalage `dx`/`dy` que `captureNodePadded`
 * mesure pour que tout écart ultérieur soit inoffensif.
 *
 * 1. `[data-export-root]` — contrat explicite, prioritaire. Le pose un nœud
 *    composé de plusieurs formes, dont aucune n'est « la carte ».
 * 2. Repli : la première carte bordée des 4 côtés. C'est le cas MCD / MLD /
 *    MPD-SQL, où la carte **est** la racine du nœud (cible == enveloppe).
 * 3. Repli final : l'enveloppe.
 *
 * `mct-syncop` (T0–T8) est le cas qui rend le contrat explicite nécessaire :
 * son nœud empile pentagone + opération, l'opération est bordée des 4 côtés
 * alors que le pentagone porte `borderBottom: 'none'`. Le repli (2) renvoyait
 * donc **l'opération seule** — le pentagone disparaissait du SVG et le
 * rectangle d'opération était peint au sommet d'un PNG dimensionné sur
 * `pentagone + opération`, donc remonté d'une hauteur de pentagone. Cette
 * hauteur *variable* selon le libellé (9 px sur T7, 12 px ailleurs) est ce qui
 * donnait l'impression de positions aléatoires.
 */
function resolveCaptureTarget(el: HTMLElement): { target: HTMLElement; explicit: boolean } {
  if (el.hasAttribute('data-export-root')) return { target: el, explicit: true }

  const findTagged = (node: HTMLElement): HTMLElement | null => {
    if (node.hasAttribute('data-export-root')) return node
    for (const child of node.children as HTMLCollection) {
      const found = findTagged(child as HTMLElement)
      if (found) return found
    }
    return null
  }
  const tagged = findTagged(el)
  if (tagged) return { target: tagged, explicit: true }

  const walk = (node: HTMLElement, depth: number): HTMLElement | null => {
    if (depth > 0) {
      const cs = getComputedStyle(node)
      const bw = [
        cs.borderTopWidth,
        cs.borderRightWidth,
        cs.borderBottomWidth,
        cs.borderLeftWidth,
      ]
      const isBordered =
        bw.every((w) => parseFloat(w) > 0) &&
        bw[0] === bw[1] &&
        bw[1] === bw[2] &&
        bw[2] === bw[3] &&
        cs.borderTopStyle !== 'none'
      if (isBordered) return node
    }
    for (const child of node.children as HTMLCollection) {
      const found = walk(child as HTMLElement, depth + 1)
      if (found) return found
    }
    return null
  }
  return { target: walk(el, 0) ?? el, explicit: false }
}

/**
 * Plan C — bordure ENTIÈRE redessinée, sans tenir compte de celle du raster.
 *
 * `html-to-image` peint de façon non fiable la bordure des cartes (rangée basse
 * clippée, coins rendus avec un rayon légèrement différent du CSS). Plutôt que
 * de rafistoler le bas (= plan B) — erase/arcs/sondes inward|outward qui se
 * mordent le coin gauche à chaque itération — on **redessine le ring complet**
 * (top + droite + bas + gauche + les 4 coins) de façon déterministe.
 *
 * On ne réutilise du raster que sa GÉOMÉTRIE (boîte de la carte détectée par
 * pixels : top/bottom = 1re/dernière rangée opaque au centre, left/right =
 * 1re/dernière colonne opaque à mi-hauteur, loin des coins arrondis) ;
 * couleur, épaisseurs et rayons de coin viennent de `getComputedStyle`.
 *
 * Passes sur le ring (chemin `Path2D` evenodd = outer arrondi − inner arrondi,
 * sans dépendre de `ctx.roundRect`) :
 * - **Effacement** `destination-out`, ring élargi de `outPad` au-delà du bord
 *   externe (absorbe anti-alias + coins) → la bordure du raster disparaît.
 * - **Peinture** `source-over`, ring exact en `borderColor`.
 *
 * Boutons de calage (px phys) si un pixel subsiste en test : `radiusDelta`
 * (corrige le rayon de coin) et `innerPad` (avale l'anti-alias intérieur).
 * Fond de carte jamais touché → plus de refill `bgColor`, plus de `bgAlpha`.
 */
function ensureBottomBorder(canvas: HTMLCanvasElement, target: HTMLElement) {
  const cs = getComputedStyle(target)
  const rgb = (css: string) => {
    const m = css.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
    return m ? ([Number(m[1]), Number(m[2]), Number(m[3])] as const) : null
  }
  const color = cs.borderTopColor || '#000000'
  const borderColor = rgb(color)
  const toPhys = (css: string) => Math.max(0, Math.round((parseFloat(css) || 0) * 2))
  const bw = {
    top: toPhys(cs.borderTopWidth),
    right: toPhys(cs.borderRightWidth),
    bottom: toPhys(cs.borderBottomWidth),
    left: toPhys(cs.borderLeftWidth),
  }
  const info = {
    bordered: bw.top > 0 || bw.bottom > 0 || bw.left > 0 || bw.right > 0,
    clipped: cs.clipPath !== 'none',
    edgeRow: null as number | null,
    painted: false,
    color,
  }
  // Forme clippée (pentagones MCT / SAT / MOT) : le ring rectangulaire repeint
  // à coins arrondis **aplatirait la pointe**, et la sonde de boîte (dernière
  // rangée opaque au centre) tombe sur la bande horizontale, pas sur la pointe.
  // On laisse donc la bordure du raster telle quelle.
  // Bordure en tirets (dossier et fantôme du cycle, figure 4.3.3) : le ring
  // repeint est PLEIN par construction — il transformerait les pointillés en
  // trait continu. On garde le raster tel quel (quitte à conserver un éventuel
  // rognage d’1 px sur ces cartes, vérifié absent à la mesure).
  // Seules les bordures pleines sont repeintes.
  if (!borderColor || !info.bordered || info.clipped) return info
  const borderStyle = cs.borderTopStyle
  if (borderStyle === 'dashed' || borderStyle === 'dotted') return info

  // Boutons de calage (px phys), valables pendant les tests :
  const radiusDelta = 0 // +N => coins grossis (si le bg arrondit plus que nous)
  const outPad = 2 // marge d'effacement au-delà du bord EXTERNE du ring
  const innerPad = 0 // marge d'effacement AVANT le rebord intérieur (anti-alias)

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return info
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const alpha = (x: number, y: number) => data[(y * canvas.width + x) * 4 + 3]

  // Boîte de la carte détectée par pixels (géométrie du raster seulement).
  const cx = Math.floor(canvas.width / 2)
  let top = -1
  for (let y = 0; y < canvas.height; y++) {
    if (alpha(cx, y) >= 60) { top = y; break }
  }
  let bottom = -1
  for (let y = canvas.height - 1; y >= 0; y--) {
    if (alpha(cx, y) >= 60) { bottom = y; break }
  }
  if (top < 0 || bottom <= top) return info
  info.edgeRow = bottom

  const rowY = top + ((bottom - top) >> 1)
  let left = -1
  let right = -1
  for (let x = 0; x < canvas.width; x++) {
    if (alpha(x, rowY) >= 60) { left = x; break }
  }
  for (let x = canvas.width - 1; x >= 0; x--) {
    if (alpha(x, rowY) >= 60) { right = x; break }
  }
  if (left < 0 || right <= left) return info

  const x = left
  const y = top
  const w = right - left + 1
  const h = bottom - top + 1

  // Rayons de coin (px phys) : [tl, tr, br, bl]. Le rebord INTÉRIEUR du ring
  // reprend ces rayons moins l'épaisseur de bordure des côtés adjacents (CSS).
  const corner = (css: string) => Math.max(0, (parseFloat(css) || 0) * 2) + radiusDelta
  const radii = [
    corner(cs.borderTopLeftRadius),
    corner(cs.borderTopRightRadius),
    corner(cs.borderBottomRightRadius),
    corner(cs.borderBottomLeftRadius),
  ]
  const innerRadii = [
    Math.max(0, radii[0] - (bw.top + bw.left) / 2),
    Math.max(0, radii[1] - (bw.top + bw.right) / 2),
    Math.max(0, radii[2] - (bw.bottom + bw.right) / 2),
    Math.max(0, radii[3] - (bw.bottom + bw.left) / 2),
  ]

  const roundRect = (px: number, py: number, pw: number, ph: number, rr: number[]) => {
    const p = new Path2D()
    if (pw <= 0 || ph <= 0) return p
    const r = rr.map((v) => Math.max(0, Math.min(v, pw / 2, ph / 2)))
    p.moveTo(px + r[0], py)
    p.lineTo(px + pw - r[1], py)
    p.arcTo(px + pw, py, px + pw, py + r[1], r[1])
    p.lineTo(px + pw, py + ph - r[2])
    p.arcTo(px + pw, py + ph, px + pw - r[2], py + ph, r[2])
    p.lineTo(px + r[3], py + ph)
    p.arcTo(px, py + ph, px, py + ph - r[3], r[3])
    p.lineTo(px, py + r[0])
    p.arcTo(px, py, px + r[0], py, r[0])
    p.closePath()
    return p
  }

  // Ring = outer arrondi − inner arrondi, rempli en une fois (evenodd).
  const paintRing = (
    ox: number, oy: number, ow: number, oh: number, orr: number[],
    ix: number, iy: number, iw: number, ih: number, irr: number[],
    fill: string, gco: GlobalCompositeOperation,
  ) => {
    const p = roundRect(ox, oy, ow, oh, orr)
    p.addPath(roundRect(ix, iy, iw, ih, irr))
    ctx.globalCompositeOperation = gco
    ctx.fillStyle = fill
    ctx.fill(p, 'evenodd')
  }

  // 1. Effacement : ring élargi de `outPad` hors du bord externe (anti-alias,
  //    coins) ; intérieur élargi de `innerPad` si un rebord de bordure subsiste.
  paintRing(
    x - outPad, y - outPad, w + outPad * 2, h + outPad * 2,
    radii.map((r) => r + outPad),
    x + bw.left - innerPad, y + bw.top - innerPad,
    w - bw.left - bw.right + innerPad * 2, h - bw.top - bw.bottom + innerPad * 2,
    innerRadii, '#000000', 'destination-out',
  )

  // 2. Peinture : ring exact, en couleur de bordure.
  paintRing(
    x, y, w, h, radii,
    x + bw.left, y + bw.top,
    w - bw.left - bw.right, h - bw.top - bw.bottom,
    innerRadii, color, 'source-over',
  )

  info.painted = true
  return info
}

/** Aperçu visuel du raster (toggle DEBUG) : image + bande du bas zoomée ×2. */
function showCapturePreview(canvas: HTMLCanvasElement, caption: string) {
  if (!isEdgeDebugEnabled()) return
  let panel = document.getElementById('capture-preview-panel') as HTMLDivElement | null
  if (!panel) {
    panel = document.createElement('div')
    panel.id = 'capture-preview-panel'
    panel.style.cssText =
      'position:fixed;right:8px;bottom:8px;z-index:99999;max-height:45vh;overflow:auto;' +
      'background:#fff;border:1px solid #888;font:11px/1.4 ui-monospace,monospace;padding:6px;display:flex;flex-wrap:wrap;gap:8px'
    panel.dataset.count = '0'
    document.body.appendChild(panel)
  }
  let count = Number(panel.dataset.count || '0')
  if (count >= 24) {
    panel.removeChild(panel.firstChild as Node)
    count--
  }
  panel.dataset.count = String(count + 1)

  const entry = document.createElement('div')
  entry.style.cssText = 'max-width:170px;border-bottom:1px dashed #aaa;padding:4px 0'
  const img = document.createElement('img')
  img.style.cssText = 'width:160px;display:block'
  img.src = canvas.toDataURL('image/png')
  entry.appendChild(img)

  const strip = document.createElement('canvas')
  const rows = 12
  strip.width = canvas.width
  strip.height = rows
  const sctx = strip.getContext('2d')
  if (sctx) {
    sctx.drawImage(canvas, 0, canvas.height - rows, canvas.width, rows, 0, 0, canvas.width, rows)
    const big = document.createElement('img')
    big.style.cssText = 'width:160px;display:block;margin-top:2px;image-rendering:pixelated'
    big.src = strip.toDataURL('image/png')
    entry.appendChild(big)
  }

  const cap = document.createElement('div')
  cap.textContent = caption
  entry.appendChild(cap)
  panel.appendChild(entry)
}

/**
 * Rasterise le nœud via un clone détaché dans un wrapper paddé.
 *
 * - Clone inséré dans un wrapper `fixed` invisible (aucun flicker, styles
 *   calculés résolus car attaché au DOM) ; transform/position neutralisés →
 *   contenu ancré en haut-gauche du wrapper.
 * - Cible = `[data-export-root]`, sinon la carte interne bordée (voir
 *   `resolveCaptureTarget`) ; `position:relative` sur le clone ré-ancre les
 *   Handles absolus sur la cible (= sa boîte live), le padding du wrapper ne les
 *   décale plus.
 * - `width`/`height` optionnels : passés quand on connaît la taille exacte
 *   (figure) pour forcer un canvas précis ; omis pour l'export solo (mesure
 *   naturelle du wrapper, padding inclus).
 * - `zoom` : divise les mesures écran pour rendre `dx`/`dy` en unités monde.
 * - Sortie : canvas éventuellement corrigé par `ensureBottomBorder` (plan C),
 *   plus le décalage de la cible dans l'enveloppe, qui doit commander le
 *   placement du raster.
 */
async function captureNodePadded(
  el: HTMLElement,
  opts: { width?: number; height?: number; zoom?: number } = {},
): Promise<NodeCapture> {
  const zoom = opts.zoom ?? 1
  const { target, explicit } = resolveCaptureTarget(el)

  // Décalage de la cible dans l'enveloppe, mesuré sur le DOM **live** avant le
  // clone. C'est lui qui doit commander le placement du raster : l'enveloppe
  // sert à dimensionner le canvas, mais si la cible est un descendant (carte
  // d'entité, composite `mct-syncop`, …) le contenu peint est plus petit et
  // n'est plus ancré en haut-gauche de l'image.
  const er = el.getBoundingClientRect()
  const tr = target.getBoundingClientRect()
  const dx = (tr.left - er.left) / zoom
  const dy = (tr.top - er.top) / zoom

  if (!explicit && (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5)) {
    console.warn(
      `[exportSvg] nœud « ${el.getAttribute('data-id') ?? '?'} » : la cible rasterisée est ` +
        `décalée de (${dx.toFixed(1)}, ${dy.toFixed(1)}) px dans l'enveloppe et n'est pas ` +
        `taguée [data-export-root]. Posez l'attribut sur la racine à capturer ` +
        `(nœud composé de plusieurs formes).`,
    )
  }

  const clone = target.cloneNode(true) as HTMLElement
  clone.style.transform = 'none'
  clone.style.left = '0'
  clone.style.top = '0'
  clone.style.position = 'relative'
  // `h-full` (= 100%) sur la carte à dimensionner au contenu : le wrapper du
  // clone force sa hauteur via `options.height` (`apply-style.js`), la carte
  // `height:100%` absorbe alors la marge de sécurité et sa bordure-bas sort du
  // foreignObject (coupée). `auto` reproduit le layout live (l'enveloppe RF n'a
  // aucune hauteur fixe) → la carte se hauteur de contenu, comme les blocs
  // MPD-SQL qui exportent parfaitement.
  clone.style.height = 'auto'

  // Contrôles UI exclus de l'export (bouton ⤓ des blocs SQL, etc.) : pur
  // d'interaction, pas du contenu à figer dans le SVG. `display:none` rétracte
  // aussi les enfants (icône), l'en-tête garde son padding → géométrie inchangée.
  clone.querySelectorAll('[data-no-export]').forEach((el) => {
    ;(el as HTMLElement).style.display = 'none'
  })

  // Le masquage (position hors écran) est porté par un HÔTE non capturé :
  // `html-to-image` recopie intégralement le style calculé du root cloné dans le
  // `foreignObject` (`clone-node.js:cloneCSSStyle`) — tout style de masquage posé
  // sur le root capturé (opacity, left:-…px…) rendrait la capture invisible.
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-100000px;top:0;z-index:-1'
  const wrapper = document.createElement('div')
  wrapper.style.cssText =
    `position:relative;display:inline-block;padding:${NODE_CAPTURE_PAD}px;pointer-events:none`
  wrapper.appendChild(clone)
  host.appendChild(wrapper)
  document.body.appendChild(host)

  // Variables CSS : lues sur le nœud live (déjà résolues par héritage),
  // recopiées sur le wrapper — racine capturée — pour que les `calc()` du
  // clone rendent exactement comme le live.
  const liveCs = getComputedStyle(el)
  for (const name of CAPTURE_CSS_VARS) {
    const value = liveCs.getPropertyValue(name).trim()
    if (value) wrapper.style.setProperty(name, value)
  }

  // La fonte voyage sur le wrapper, et non via une variable custom : `host` est
  // reparentÔö£┬« sous `body`, donc le clone perd l'hÔö£┬«ritage de la racine du canevas et
  // retomberait sur le `--font-sans` du sÔö£┬«lecteur de la toolbar. Sans cette recopie,
  // une figure qui Ôö£┬«pingle sa fonte s'exporterait dans la police de celui qui
  // exporte ├ö├ç├Â et l'organigramme y perdait une ligne sur Ôö¼┬¢ TrÔö£┬«sorerie /
  // ComptabilitÔö£┬« Ôö¼Ôòù. `html-to-image` recopiant le style du clone dans la
  // `foreignObject`, une valeur inline sur le wrapper est ce qui survit.
  //
  // Neutre pour une figure qui n'Ôö£┬«pingle rien : la valeur calculÔö£┬«e est alors celle
  // qu'hÔö£┬«ritait dÔö£┬«jÔö£├í le clone.
  if (liveCs.fontFamily) wrapper.style.fontFamily = liveCs.fontFamily

  try {
    const canvas = await toCanvas(wrapper, {
      pixelRatio: 2,
      skipAutoScale: true,
      width: opts.width,
      height: opts.height,
      style: { boxShadow: 'none' },
    })

    // Plan C : bordure entière redessinée (ring evenodd, déterministe).
    const fix = ensureBottomBorder(canvas, target)
    if (fix.painted) {
      console.info('[captureNodePadded]', {
        nodeId: el.getAttribute('data-id'),
        canvasW: canvas.width / 2,
        canvasH: canvas.height / 2,
        edgeRow: fix.edgeRow,
        painted: fix.painted,
        color: fix.color,
      })
    }
    showCapturePreview(
      canvas,
      `#${el.getAttribute('data-id')} · ${fix.clipped ? 'pentagone' : fix.bordered ? 'bordure' : 'sans bordure'} · ` +
        `${fix.painted ? 'redessinée ✓' : '—'}`,
    )
    return { canvas, dx, dy }
  } finally {
    host.remove()
  }
}

/**
 * Exporte la figure entière en SVG (format plat, Word/Typst compatible).
 *
 * Hybridation manuelle, chacune des trois couches avec sa technique fiable :
 * - **Arêtes** : ré-émises en `<path>` vectoriels, couleurs lues via
 *   `getComputedStyle` (résout `var(--xy-edge-stroke-*)` → vraie couleur, plus
 *   de `#666`), pointillés/épaisseurs/opacité préservés ; l'étendue de chaque
 *   chemin est incluse dans la bbox de la figure (plus d'arêtes recoupées en
 *   bord de figure).
 * - **Nœuds** : rasterisés via un clone détaché paddé (`captureNodePadded`) —
 *   la cible est la **carte interne bordée** (`resolveCaptureTarget`), pas
 *   l'enveloppe `.react-flow__node` ; c'est ce qui conserve la bordure-bas des
 *   entités (cartes `h-full` à hauteur fractionnaire) comme pour les blocs
 *   MPD-SQL dont la racine est déjà leur carte. La marge transparente est
 *   recompensée à l'assemblage (placement `-NODE_CAPTURE_PAD`).
 * - **Labels (verbes, cardinalités, rôles)** : capturés en UNE seule surcouche
 *   raster du `.react-flow__edgelabel-renderer` entier, recadrée sur l'union de
 *   leurs boîtes — rien n'est clippé (les rôles débordent de leur boîte 36×36),
 *   positions flow exactes.
 *
 * Toute la figure est prise, indépendamment du viewport/zoom du moment
 * (`onlyRenderVisibleElements` est désactivé : nœuds et arêtes sont tous dans
 * le DOM). Conteneurs de `react-flow__background` et panneaux exclus comme avant.
 */
export async function exportSvg(filename = 'diagram.svg', opts: { edgesAbove?: boolean } = {}) {
  const renderer = document.querySelector('.react-flow__renderer') as HTMLElement | null
  const viewport = renderer?.querySelector('.react-flow__viewport') as HTMLElement | null
  if (!renderer || !viewport) return

  const vm = viewport.style.transform.match(/translate\(([-\d.]+)px?,\s*([-\d.]+)px?\)\s*scale\(([-\d.]+)\)/)
  const vx = vm ? Number(vm[1]) || 0 : 0
  const vy = vm ? Number(vm[2]) || 0 : 0
  const zoom = vm ? Number(vm[3]) || 1 : 1
  const rb = renderer.getBoundingClientRect()

  // Convertisseur écran (viewport transformé) → coordonnées monde.
  const toFlow = (r: DOMRect) => ({
    x: (r.left - rb.left - vx) / zoom,
    y: (r.top - rb.top - vy) / zoom,
    w: r.width / zoom,
    h: r.height / zoom,
  })

  // Bbox de la figure en coordonnées flow : nœuds + étendue des arêtes + labels.
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  // ---- Arêtes : chemins vectoriels (couleurs via style calculé) ----
  const edgeParts: string[] = []
  // Origine → substitut sûr : les ids de markers RF (`1__color=hsl(128, 100%,
  // 40%)&type=arrowclosed`) contiennent `=`, `&`, `(`, `)`, `%` — d’une part
  // `querySelector(`marker#${id}`)` lèverait une exception de sélecteur,
  // d’autre part `url(#…(…)…)` réémis tel quel serait tronqué à la première
  // parenthèse par le parseur SVG. On réécrit donc en `m0`, `m1`, … des deux
  // côtés (def + référence). Chemin mort jusqu’ici : RF émet `url('#id')`
  // (avec quotes) que l’ancien regex `url\(#…` ne matchait pas — aucune figure
  // existante ne porte de marker, leur export est inchangé.
  const markerIds = new Map<string, string>()
  const markerDefs = [...renderer.querySelectorAll('.react-flow__marker marker')]
  for (const edgeSvg of [...renderer.querySelectorAll('.react-flow__edges > svg')] as SVGElement[]) {
    const g = edgeSvg.querySelector('g.react-flow__edge') as SVGGElement | null
    if (!g) continue
    for (const p of g.querySelectorAll('path')) {
      if (p.classList.contains('react-flow__edge-interaction')) continue
      const d = p.getAttribute('d')
      if (!d) continue
      const cs = getComputedStyle(p)
      if (cs.visibility === 'hidden' || cs.display === 'none') continue

      // Étendue du chemin (coord. locales = coord. flow) : incluse dans la bbox
      // pour que boucles réflexives et arcs ne soient pas recoupés en bord de figure.
      const bb = p.getBBox()
      minX = Math.min(minX, bb.x)
      minY = Math.min(minY, bb.y)
      maxX = Math.max(maxX, bb.x + bb.width)
      maxY = Math.max(maxY, bb.y + bb.height)

      let markerHref = ''
      const markerUrl = p.getAttribute('marker-end')
      if (markerUrl) {
        // RF émet `url('#id')` (quotes AVANT le hash) et ses ids portent des
        // `hsl(…)` : un `[^)]+` tronquerait au `)` interne et `#?` avant la
        // quote raterait le hash — d’où l’ancre des deux côtés + capture large.
        const id = markerUrl.match(/^url\(\s*['"]?#?([^'"]*?)['"]?\s*\)$/)?.[1]
        if (id) {
          let safe = markerIds.get(id)
          if (!safe) {
            safe = `m${markerIds.size}`
            markerIds.set(id, safe)
            const marker = markerDefs.find((m) => m.getAttribute('id') === id)
            if (marker) {
              // Def clonée + style calculé réécrit : `outerHTML` brut conserve
              // les `var()` non résolus (ex. `muted-foreground`), morts hors
              // du DOM — la def exportée doit être autonome. `setAttribute`
              // plutôt que replace (l’échappement `&amp;` casse l’égalité).
              const def = marker.cloneNode(true) as Element
              const liveSym = marker.querySelector('polyline, path, line, circle')
              const sym = def.querySelector('polyline, path, line, circle')
              if (liveSym && sym) {
                const scs = getComputedStyle(liveSym)
                sym.setAttribute('style', `stroke-width: 1; stroke: ${scs.stroke}; fill: ${scs.fill};`)
              }
              def.setAttribute('id', safe)
              edgeParts.unshift(def.outerHTML)
            }
          }
          markerHref = ` marker-end="url(#${safe})"`
        }
      }

      const dash = cs.strokeDasharray && cs.strokeDasharray !== 'none' ? ` stroke-dasharray="${cs.strokeDasharray}"` : ''
      const opacity = cs.opacity !== '1' ? ` opacity="${cs.opacity}"` : ''
      edgeParts.push(
        `<path d="${d}" stroke="${cs.stroke || '#666'}" stroke-width="${cs.strokeWidth}" fill="${cs.fill || 'none'}"${dash}${opacity}${markerHref}/>`,
      )
    }
  }

  // ---- Nœuds : raster (clone paddé) + bbox monde ----
  const nodeImages: NodePlacement[] = []
  for (const el of [...renderer.querySelectorAll('.react-flow__node')] as HTMLElement[]) {
    const m = el.style.transform.match(TRANSLATE_RE)
    const fx = m ? parseFloat(m[1]) : 0
    const fy = m ? parseFloat(m[2]) : 0
    const nw = el.getBoundingClientRect().width / zoom
    const nh = el.getBoundingClientRect().height / zoom

    minX = Math.min(minX, fx)
    minY = Math.min(minY, fy)
    maxX = Math.max(maxX, fx + nw)
    maxY = Math.max(maxY, fy + nh)

    const { canvas, dx, dy } = await captureNodePadded(el, {
      width: Math.ceil(nw) + NODE_CAPTURE_PAD * 2,
      height: Math.ceil(nh) + NODE_CAPTURE_PAD * 2,
      zoom,
    })
    nodeImages.push({
      href: canvas.toDataURL('image/png'),
      x: fx + dx - NODE_CAPTURE_PAD,
      y: fy + dy - NODE_CAPTURE_PAD,
      w: canvas.width / 2,
      h: canvas.height / 2,
    })
  }

  // ---- Labels : une seule surcouche raster du conteneur EdgeLabelRenderer ----
  let labelImage: { href: string; x: number; y: number; w: number; h: number } | null = null
  const labelRenderer = document.querySelector('.react-flow__edgelabel-renderer') as HTMLElement | null
  const debugEnabled = isEdgeDebugEnabled()
  if (labelRenderer) {
    const children = [...labelRenderer.children] as HTMLElement[]
    const visible = children.filter((div) => {
      if (div.querySelector('button')) return false
      if (div.getBoundingClientRect().width === 0 || div.getBoundingClientRect().height === 0) return false
      if (debugEnabled) return false
      return true
    })

    if (visible.length > 0) {
      let lbx = Infinity, lby = Infinity, lrx = -Infinity, lrb = -Infinity
      for (const div of visible) {
        const els = [div, ...div.querySelectorAll('*')]
        for (const e of els) {
          const f = toFlow((e as HTMLElement).getBoundingClientRect())
          lbx = Math.min(lbx, f.x)
          lby = Math.min(lby, f.y)
          lrx = Math.max(lrx, f.x + f.w)
          lrb = Math.max(lrb, f.y + f.h)
        }
      }

      if (isFinite(lbx) && lrx - lbx > 0 && lrb - lby > 0) {
        const lw = lrx - lbx
        const lh = lrb - lby
        minX = Math.min(minX, lbx)
        minY = Math.min(minY, lby)
        maxX = Math.max(maxX, lrx)
        maxY = Math.max(maxY, lrb)

        const canvas = await toCanvas(labelRenderer, {
          pixelRatio: 2,
          skipAutoScale: true,
          width: lw,
          height: lh,
          style: {
            position: 'relative',
            left: '0',
            top: '0',
            width: `${lw}px`,
            height: `${lh}px`,
            transform: `translate(${-lbx}px, ${-lby}px)`,
            transformOrigin: '0 0',
          },
        })
        labelImage = {
          href: canvas.toDataURL('image/png'),
          x: lbx,
          y: lby,
          w: lw,
          h: lh,
        }
      }
    }
  }

  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 800; maxY = 600 }

  const PAD = 40
  const ox = minX - PAD
  const oy = minY - PAD
  const cw = Math.ceil(maxX - minX + PAD * 2)
  const ch = Math.ceil(maxY - minY + PAD * 2)

  // Fond reprenant la couleur de fond de l'appli (clair ou sombre).
  const bodyBg = getComputedStyle(document.body).backgroundColor
  const bg = bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' ? bodyBg : '#ffffff'

  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`
  svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}" viewBox="${ox} ${oy} ${cw} ${ch}">\n`
  svg += `  <rect x="${ox}" y="${oy}" width="${cw}" height="${ch}" fill="${bg}"/>\n`

  // Arêtes sous tout le reste — sauf figure 16 (`edgesAbove`, miroir du
  // `data-edges-above` live) : l’écran-hôte opaque les recouvrirait, comme
  // à l’écran où la couche des arêtes passe devant les nœuds.
  const edgesFirst = !opts.edgesAbove
  if (edgesFirst) {
    for (const e of edgeParts) {
      svg += `  ${e}\n`
    }
  }

  // Nœuds (image raster du clone paddé, marge transparente recompensée).
  for (const nd of nodeImages) {
    svg += `  <image href="${nd.href}" x="${nd.x}" y="${nd.y}" width="${nd.w}" height="${nd.h}"/>\n`
  }

  if (!edgesFirst) {
    for (const e of edgeParts) {
      svg += `  ${e}\n`
    }
  }

  // Étiquettes d'arêtes par-dessus (verbes, cardinalités, rôles).
  if (labelImage) {
    svg += `  <image href="${labelImage.href}" x="${labelImage.x}" y="${labelImage.y}" width="${labelImage.w}" height="${labelImage.h}"/>\n`
  }

  svg += `</svg>`

  download(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), filename)
}