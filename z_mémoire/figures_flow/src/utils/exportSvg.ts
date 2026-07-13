import { toCanvas } from 'html-to-image'

export async function exportSvg(filename = 'diagram.svg') {
  const renderer = document.querySelector('.react-flow__renderer') as HTMLElement
  const edgesEl = renderer?.querySelector('.react-flow__edges') as HTMLElement
  if (!renderer) return

  const viewport = renderer.querySelector('.react-flow__viewport') as HTMLElement
  const tRe = /translate\(([\d.-]+)px,\s*([\d.-]+)px\)/
  const vm = viewport?.style.transform.match(/translate\(([-\d.]+)px?,\s*([-\d.]+)px?\)\s*scale\(([-\d.]+)\)/)
  const vx = vm ? Number(vm[1]) || 0 : 0
  const vy = vm ? Number(vm[2]) || 0 : 0
  const zoom = vm ? Number(vm[3]) || 1 : 1

  const nodeEls = [...renderer.querySelectorAll('.react-flow__node')] as HTMLElement[]
  const rb = renderer.getBoundingClientRect()

  // ---- STEP 1: capture nodes and compute bounds ----
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  const images: { href: string; x: number; y: number; w: number; h: number }[] = []

  for (const el of nodeEls) {
    const m = el.style.transform.match(tRe)
    const fx = m ? parseFloat(m[1]) : 0
    const fy = m ? parseFloat(m[2]) : 0
    const r = el.getBoundingClientRect()
    const nw = r.width / zoom
    const nh = r.height / zoom

    minX = Math.min(minX, fx)
    minY = Math.min(minY, fy)
    maxX = Math.max(maxX, fx + nw)
    maxY = Math.max(maxY, fy + nh)

    const pr = 2
    const canvas = await toCanvas(el, { pixelRatio: pr, skipAutoScale: true, style: { transform: 'none' } })
    images.push({
      href: canvas.toDataURL('image/png'),
      x: fx,
      y: fy,
      w: canvas.width / pr,
      h: canvas.height / pr,
    })
  }

  // ---- STEP 2: edge label images + bounds ----
  for (const div of [...document.querySelectorAll('.react-flow__edgelabel-renderer > div')] as HTMLElement[]) {
    if (div.querySelector('button')) continue

    const r = div.getBoundingClientRect()
    const fx = (r.left - rb.left - vx) / zoom
    const fy = (r.top - rb.top - vy) / zoom
    const fw = r.width / zoom
    const fh = r.height / zoom

    minX = Math.min(minX, fx)
    minY = Math.min(minY, fy)
    maxX = Math.max(maxX, fx + fw)
    maxY = Math.max(maxY, fy + fh)

    const pr = 2
    // Override position so the captured content starts at (0,0) rather than at some
    // absolute left/top offset within the offscreen foreignObject.
    const canvas = await toCanvas(div, { pixelRatio: pr, skipAutoScale: true, style: { position: 'relative', left: '0', top: '0' } })
    images.push({
      href: canvas.toDataURL('image/png'),
      x: fx,
      y: fy,
      w: canvas.width / pr,
      h: canvas.height / pr,
    })
  }

  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 800; maxY = 600 }

  const PAD = 40
  const cx = minX - PAD
  const cy = minY - PAD
  const cw = maxX - minX + PAD * 2
  const ch = maxY - minY + PAD * 2

  // ---- STEP 3: collect edge path data as strings ----
  const edgeParts: string[] = []
  for (const edgeSvg of edgesEl?.querySelectorAll(':scope > svg') ?? []) {
    const g = edgeSvg.querySelector('g')
    if (!g) continue
    const gClone = g.cloneNode(true) as SVGGElement
    for (const p of [...gClone.querySelectorAll('path')]) {
      if (p.classList.contains('react-flow__edge-interaction')) { p.remove(); continue }
      const d = p.getAttribute('d')
      if (!d) continue
      const stroke = p.getAttribute('stroke') || '#666'
      const sw = p.getAttribute('stroke-width') || '2'
      const fill = p.getAttribute('fill') || 'none'
      let dash = p.getAttribute('stroke-dasharray') || ''
      edgeParts.push(`<path d="${d}" stroke="${stroke}" stroke-width="${sw}" fill="${fill}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`)
    }
  }

  // ---- STEP 4: build SVG as a string ----
  const xmlns = 'http://www.w3.org/2000/svg'
  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`
  svg += `<svg xmlns="${xmlns}" width="${cw}" height="${ch}" viewBox="${cx} ${cy} ${cw} ${ch}">\n`
  svg += `  <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" fill="white"/>\n`

  // Edges (below everything)
  for (const e of edgeParts) {
    svg += `  ${e}\n`
  }

  // All images (nodes + labels) on top
  for (const nd of images) {
    svg += `  <image href="${nd.href}" x="${nd.x}" y="${nd.y}" width="${nd.w}" height="${nd.h}"/>\n`
  }

  svg += `</svg>`

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
