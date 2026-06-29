/* Draw SVG links between entity boxes positioned in a `.canvas`,
   plus an interactive editor: drag entities, snap to grid, export positions.

   Links: `window.LINKS = [{from, to, fromAnchor?, toAnchor?, card?, cardFrom?, cardTo?, strong?, dashed?}]`
   Anchor: 'top' | 'right' | 'bottom' | 'left' | 'auto'.

   Persistence: positions are saved to localStorage under the page path,
   so reloading keeps your manual layout. Use "Réinitialiser" to drop it. */

console.log("links.js v11 — control point drag, verb auto-follows");

(function () {
  // Mode capture (?capture=1) : masque la barre d'outils, supprime les marges
  // du body et réduit l'espace blanc autour de la figure pour les captures PNG.
  try {
    if (/[?&]capture=1\b/.test(location.search)) {
      const css = document.createElement("style");
      css.textContent =
        "html,body{background:#fff!important;margin:0!important;padding:0!important;}" +
        ".editor-toolbar,.toolbar,#tb-collapsed,svg.anchor-handles," +
        ".page-header,.figure-caption,.figure-title,.legend,.kpi-strip," +
        ".page-intro,.page-footer{display:none!important;}" +
        ".page{margin:0!important;padding:0!important;box-shadow:none!important;border:none!important;max-width:none!important;background:transparent!important;}" +
        ".figure{margin:0!important;padding:0!important;box-shadow:none!important;background:transparent!important;border:none!important;}" +
        ".canvas-viewport{overflow:visible!important;max-height:none!important;margin:0!important;padding:0!important;}";
      (document.head || document.documentElement).appendChild(css);
    }
  } catch (e) {}

  const STORAGE_KEY = "figures_html:positions:" + location.pathname;
  const SIZE_KEY = "figures_html:canvas-size:" + location.pathname;
  const ZOOM_KEY = "figures_html:zoom:" + location.pathname;
  const ANCHORS_KEY = "figures_html:anchors:" + location.pathname;
  const COLLAPSED_KEY = "figures_html:tb-collapsed:" + location.pathname;
  const VERSION_KEY = "figures_html:version:" + location.pathname;
  const VERB_OFFSETS_KEY = "figures_html:verb-offsets:v2:" + location.pathname;
  const GRID = 10;
  const ZOOM_STEP = 0.01;
  const ZOOM_MIN = 0.1;
  const ZOOM_MAX = 3.0;
  const SIZE_STEP = 100;
  const SIDE_CYCLE = ["top", "right", "bottom", "left"];
  let snapToGrid = true;
  let editMode = false;
  let rafPending = false;
  let zoom = 1;
  let anchorOverrides = {}; // key "i|A" or "i|B" -> "top"/"right"/...
  let verbOffsets = {};   // key linkIdx -> {dx, dy} relatif, ajusté via point de contrôle
  let ctrlDragState = null; // { linkIdx, canvasX, canvasY, startX, startY }

  // ── Geometry ──────────────────────────────────────────────────────────────
  function anchorPoint(rect, side, ratio) {
    const r = typeof ratio === "number" ? ratio : 0.5;
    switch (side) {
      case "top":    return { x: rect.x + rect.w * r,  y: rect.y };
      case "bottom": return { x: rect.x + rect.w * r,  y: rect.y + rect.h };
      case "left":   return { x: rect.x,               y: rect.y + rect.h * r };
      case "right":  return { x: rect.x + rect.w,      y: rect.y + rect.h * r };
      default:       return { x: rect.x + rect.w / 2,  y: rect.y + rect.h / 2 };
    }
  }

  function autoAnchor(fromRect, toRect) {
    const fc = { x: fromRect.x + fromRect.w / 2, y: fromRect.y + fromRect.h / 2 };
    const tc = { x: toRect.x + toRect.w / 2,     y: toRect.y + toRect.h / 2 };
    const dx = tc.x - fc.x;
    const dy = tc.y - fc.y;
    if (Math.abs(dx) > Math.abs(dy) * 1.1) {
      return { from: dx > 0 ? "right" : "left",  to: dx > 0 ? "left" : "right" };
    }
    return { from: dy > 0 ? "bottom" : "top", to: dy > 0 ? "top" : "bottom" };
  }

  function orthogonal(a, b, sideA, sideB, waypoint) {
    const EXT = 30;
    const exitPt = (pt, side) => {
      switch (side) {
        case "top":    return { x: pt.x, y: pt.y - EXT };
        case "bottom": return { x: pt.x, y: pt.y + EXT };
        case "left":   return { x: pt.x - EXT, y: pt.y };
        case "right":  return { x: pt.x + EXT, y: pt.y };
        default:       return pt;
      }
    };
    const ea = exitPt(a, sideA);
    const eb = exitPt(b, sideB);
    const hor = (s) => s === "left" || s === "right";
    // point de référence = coude par défaut (sans waypoint)
    const ref = hor(sideA) === hor(sideB)
      ? (hor(sideA) ? { x: eb.x, y: ea.y } : { x: ea.x, y: eb.y })
      : { x: ea.x, y: eb.y };
    // waypoint peut être absolu {x,y} ou relatif {dx,dy}
    let wpAbs = null;
    if (waypoint) {
      if (waypoint.dx !== undefined) {
        wpAbs = { x: ref.x + waypoint.dx, y: ref.y + waypoint.dy };
      } else {
        wpAbs = waypoint;
      }
    }
    const pts = [{ x: a.x, y: a.y }, ea];

    if (wpAbs) {
      // Route through waypoint with right-angle bends
      if (hor(sideA)) { pts.push({ x: wpAbs.x, y: ea.y }); }
      else            { pts.push({ x: ea.x, y: wpAbs.y }); }
      pts.push({ x: wpAbs.x, y: wpAbs.y });
      if (hor(sideB)) { pts.push({ x: wpAbs.x, y: eb.y }); }
      else            { pts.push({ x: eb.x, y: wpAbs.y }); }
    } else {
      // Auto-routing — 1 seul coude, jamais plus
      if (hor(sideA) === hor(sideB)) {
        if (hor(sideA)) {
          // Deux horizontaux → horizontal puis vertical
          pts.push({ x: eb.x, y: ea.y });
        } else {
          // Deux verticaux → vertical puis horizontal
          pts.push({ x: ea.x, y: eb.y });
        }
      } else {
        // Côtés opposés → coude à l'intersection
        pts.push({ x: ea.x, y: eb.y });
      }
    }

    pts.push(eb, { x: b.x, y: b.y });
    const d = pts.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(' ');
    // mid = point de contrôle — milieu du plus long segment (centré visuellement)
    let mid;
    if (wpAbs) {
      mid = wpAbs;
    } else {
      // pts[1]=ea, pts[2]=coude, pts[3]=eb (si 1 coude)
      const seg1 = Math.hypot(pts[2].x - ea.x, pts[2].y - ea.y);
      const seg2 = Math.hypot(eb.x - pts[2].x, eb.y - pts[2].y);
      if (seg1 >= seg2) {
        mid = { x: (ea.x + pts[2].x) / 2, y: (ea.y + pts[2].y) / 2 };
      } else {
        mid = { x: (pts[2].x + eb.x) / 2, y: (pts[2].y + eb.y) / 2 };
      }
    }
    // verbMid = centre du 1er segment de transition (ea → pts[2])
    const verbMid = { x: (ea.x + pts[2].x) / 2, y: (ea.y + pts[2].y) / 2 };
    return { d, mid, verbMid };
  }

  // Courbes de Bézier (utilisées par défaut, sauf pages domaine mcd-classic)
  function bezier(a, b, sideA, sideB) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.max(40, Math.hypot(dx, dy) / 2);
    const handle = (side, base) => {
      switch (side) {
        case "top":    return { x: base.x,        y: base.y - dist };
        case "bottom": return { x: base.x,        y: base.y + dist };
        case "left":   return { x: base.x - dist, y: base.y };
        case "right":  return { x: base.x + dist, y: base.y };
        default:       return { x: base.x,        y: base.y };
      }
    };
    const c1 = handle(sideA, a);
    const c2 = handle(sideB, b);
    const mid = bezierMid(a, c1, c2, b);
    return { d: `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`, c1, c2, mid };
  }

  function bezierMid(a, c1, c2, b) {
    const t = 0.5;
    const mt = 1 - t;
    return {
      x: mt*mt*mt*a.x + 3*mt*mt*t*c1.x + 3*mt*t*t*c2.x + t*t*t*b.x,
      y: mt*mt*mt*a.y + 3*mt*mt*t*c1.y + 3*mt*t*t*c2.y + t*t*t*b.y
    };
  }

  // ── Render ────────────────────────────────────────────────────────────────
  function render() {
    rafPending = false;
    const canvas = document.querySelector(".canvas");
    if (!canvas) return;
    const svg = canvas.querySelector("svg.links");
    if (!svg) return;
    const cr = canvas.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${cr.width} ${cr.height}`);
    svg.innerHTML = "";

    // Overlay layer that hosts anchor handles ABOVE entities, so they remain
    // clickable in edit mode even when entities (cards, packages, layers…)
    // visually cover them.
    let handlesSvg = canvas.querySelector("svg.anchor-handles");
    if (!handlesSvg) {
      const nsHandles = "http://www.w3.org/2000/svg";
      handlesSvg = document.createElementNS(nsHandles, "svg");
      handlesSvg.classList.add("anchor-handles");
      handlesSvg.style.position = "absolute";
      handlesSvg.style.left = "0";
      handlesSvg.style.top = "0";
      handlesSvg.style.width = "100%";
      handlesSvg.style.height = "100%";
      handlesSvg.style.pointerEvents = "none"; // children re-enable it
      handlesSvg.style.zIndex = "1000";
      canvas.appendChild(handlesSvg);
    }
    handlesSvg.setAttribute("viewBox", `0 0 ${cr.width} ${cr.height}`);
    handlesSvg.innerHTML = "";

    const rectOf = (key) => {
      const el = canvas.querySelector(`[data-entity="${key}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x - cr.x, y: r.y - cr.y, w: r.width, h: r.height };
    };

    // First pass: resolve sides per link so we can distribute multiple
    // anchors that land on the same side of the same box (avoids overlap).
    const resolved = [];
    (window.LINKS || []).forEach((link, idx) => {
      const fr = rectOf(link.from);
      const tr = rectOf(link.to);
      if (!fr || !tr) return;
      let sideA = anchorOverrides[idx + "|A"] || link.fromAnchor;
      let sideB = anchorOverrides[idx + "|B"] || link.toAnchor;
      if (!sideA || !sideB || sideA === "auto" || sideB === "auto") {
        const auto = autoAnchor(fr, tr);
        sideA = sideA && sideA !== "auto" ? sideA : auto.from;
        sideB = sideB && sideB !== "auto" ? sideB : auto.to;
      }
      resolved.push({ idx, link, fr, tr, sideA, sideB });
    });

    // Group anchors per (entity, side) and assign a ratio along that side
    const groups = new Map();
    const keyOf = (entKey, side) => entKey + "::" + side;
    resolved.forEach((r, i) => {
      const groupA = keyOf(r.link.from, r.sideA);
      const groupB = keyOf(r.link.to, r.sideB);
      const horizontal = (s) => s === "top" || s === "bottom";
      const sortA = horizontal(r.sideA) ? r.tr.x + r.tr.w / 2 : r.tr.y + r.tr.h / 2;
      const sortB = horizontal(r.sideB) ? r.fr.x + r.fr.w / 2 : r.fr.y + r.fr.h / 2;
      if (!groups.has(groupA)) groups.set(groupA, []);
      if (!groups.has(groupB)) groups.set(groupB, []);
      groups.get(groupA).push({ i, end: "A", sortKey: sortA });
      groups.get(groupB).push({ i, end: "B", sortKey: sortB });
    });

    const ratios = resolved.map(() => ({ A: 0.5, B: 0.5 }));
    groups.forEach((arr) => {
      arr.sort((a, b) => a.sortKey - b.sortKey);
      const n = arr.length;
      arr.forEach((item, j) => {
        const r = n === 1 ? 0.5 : 0.18 + (0.64 * j) / (n - 1);
        ratios[item.i][item.end] = r;
      });
    });

    const ns = "http://www.w3.org/2000/svg";
    // Définitions de marqueurs UML (flèches) — idempotent (déjà dans le DOM)
    if (!svg.querySelector("defs")) {
      const defs = document.createElementNS(ns, "defs");
      defs.innerHTML =
        '<marker id="uml-extends" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="white" stroke="#333" stroke-width="1"/></marker>' +
        '<marker id="uml-aggregate" viewBox="0 0 14 14" refX="7" refY="7" markerWidth="8" markerHeight="8" orient="auto"><path d="M7,0 L14,7 L7,14 L0,7 Z" fill="white" stroke="#333" stroke-width="1"/></marker>' +
        '<marker id="uml-compose" viewBox="0 0 14 14" refX="7" refY="7" markerWidth="8" markerHeight="8" orient="auto"><path d="M7,0 L14,7 L7,14 L0,7 Z" fill="#333" stroke="#333" stroke-width="1"/></marker>' +
        '<marker id="uml-depend" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="none" stroke="#888" stroke-width="1"/></marker>' +
        '<marker id="uml-assoc" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#555" stroke="none"/></marker>';
      svg.appendChild(defs);
    }
    resolved.forEach((r, i) => {
      const a = anchorPoint(r.fr, r.sideA, ratios[i].A);
      const b = anchorPoint(r.tr, r.sideB, ratios[i].B);
      const isDomain = /[\/](mcd|mld|mpd)_[^/]+\.html/.test(location.pathname);
      const wp = isDomain ? verbOffsets[r.idx] : null;
      const curve = isDomain ? orthogonal(a, b, r.sideA, r.sideB, wp) : bezier(a, b, r.sideA, r.sideB);
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", curve.d);
      path.setAttribute("data-link-idx", r.idx);
      // Stocke les ancres pour mise à jour synchrone pendant drag verbes
      path.setAttribute("data-ax", a.x); path.setAttribute("data-ay", a.y);
      path.setAttribute("data-bx", b.x); path.setAttribute("data-by", b.y);
      path.setAttribute("data-sideA", r.sideA); path.setAttribute("data-sideB", r.sideB);
      if (r.link.strong) path.classList.add("strong");
      if (r.link.dashed) path.setAttribute("stroke-dasharray", "5 4");
      // Flèche UML
      const uml = r.link.uml;
      if (uml === "extends")     { path.setAttribute("marker-end", "url(#uml-extends)"); path.classList.add("uml"); }
      else if (uml === "implement") { path.setAttribute("marker-end", "url(#uml-extends)"); path.setAttribute("stroke-dasharray","5 4"); path.classList.add("uml"); }
      else if (uml === "aggregate") { path.setAttribute("marker-end", "url(#uml-aggregate)"); path.classList.add("uml"); }
      else if (uml === "compose")   { path.setAttribute("marker-end", "url(#uml-compose)"); path.classList.add("uml"); }
      else if (uml === "depend")    { path.setAttribute("marker-end", "url(#uml-depend)"); path.setAttribute("stroke-dasharray","5 4"); path.classList.add("uml"); }
      else if (uml === "assoc")     { path.setAttribute("marker-end", "url(#uml-assoc)"); path.classList.add("uml"); }
      svg.appendChild(path);

      const placeLabel = (point, side, text) => {
        if (!text) return;
        const off = 11;
        const dx = side === "left" ? -off : side === "right" ? off : 0;
        const dy = side === "top"  ? -off : side === "bottom" ? off + 8 : -4;
        const t = document.createElementNS(ns, "text");
        t.classList.add("card");
        t.setAttribute("x", point.x + dx);
        t.setAttribute("y", point.y + dy);
        t.setAttribute("text-anchor",
          side === "left" ? "end" : side === "right" ? "start" : "middle");
        t.textContent = text;
        svg.appendChild(t);
        try {
          const bbox = t.getBBox();
          const bg = document.createElementNS(ns, "rect");
          bg.setAttribute("x", bbox.x - 2);
          bg.setAttribute("y", bbox.y - 1);
          bg.setAttribute("width", bbox.width + 4);
          bg.setAttribute("height", bbox.height + 2);
          bg.setAttribute("fill", "white");
          bg.setAttribute("rx", "2");
          svg.insertBefore(bg, t);
        } catch (_) { /* getBBox can fail before paint */ }
      };

      // Cardinalités aux ancres
      placeLabel(a, r.sideA, r.link.cardFrom || r.link.card);
      placeLabel(b, r.sideB, r.link.cardTo);

      // Verbe MCD — ellipse d'association Merise (non déplaçable)
      if (r.link.verb) {
        const m = curve.mid;   // point de contrôle = position de la bulle aussi
        const verbW = Math.max(28, r.link.verb.length * 6.5 + 16);
        const verbH = 22;
        const g = document.createElementNS(ns, "g");
        g.classList.add("verb-group");
        g.setAttribute("data-link-idx", r.idx);
        const el = document.createElementNS(ns, "ellipse");
        el.setAttribute("cx", m.x);
        el.setAttribute("cy", m.y);
        el.setAttribute("rx", verbW / 2);
        el.setAttribute("ry", verbH / 2);
        el.setAttribute("fill", "#fff");
        el.setAttribute("stroke", "#555");
        el.setAttribute("stroke-width", "1");
        g.appendChild(el);
        const vt = document.createElementNS(ns, "text");
        vt.classList.add("verb");
        vt.setAttribute("x", m.x);
        vt.setAttribute("y", m.y);
        vt.setAttribute("text-anchor", "middle");
        vt.setAttribute("dominant-baseline", "central");
        vt.textContent = r.link.verb;
        g.appendChild(vt);
        svg.appendChild(g);

        // Point de contrôle (▪) pour ajuster le routage — draggable en mode édition
        if (isDomain) {
          const ctrl = document.createElementNS(ns, "rect");
          ctrl.classList.add("ctrl-handle");
          ctrl.setAttribute("data-link-idx", r.idx);
          ctrl.setAttribute("x", m.x - 6);
          ctrl.setAttribute("y", m.y - 6);
          ctrl.setAttribute("width", "12");
          ctrl.setAttribute("height", "12");
          ctrl.setAttribute("rx", "2");
          ctrl.setAttribute("fill", "var(--primary, #4f46e5)");
          ctrl.setAttribute("stroke", "#fff");
          ctrl.setAttribute("stroke-width", "2");
          ctrl.setAttribute("cx", m.x); // pour lecture rapide
          ctrl.setAttribute("cy", m.y);
          ctrl.style.pointerEvents = "auto";
          svg.appendChild(ctrl);
        }
      }

      // Clickable anchor handles (visible only in edit mode via CSS).
      // Appended to the overlay SVG so they sit above entities.
      const handle = (point, end) => {
        const h = document.createElementNS(ns, "circle");
        h.setAttribute("cx", point.x);
        h.setAttribute("cy", point.y);
        h.setAttribute("r", 7);
        h.classList.add("anchor-handle");
        h.style.pointerEvents = "auto";
        h.dataset.linkIdx = r.idx;
        h.dataset.end = end;
        handlesSvg.appendChild(h);
      };
      handle(a, "A");
      handle(b, "B");
    });
  }

  function scheduleRender() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(render);
  }

  // ── Position persistence ──────────────────────────────────────────────────
  function entityElements() {
    return Array.from(document.querySelectorAll(".canvas [data-entity]"));
  }

  function savedPositions() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  }

  function applySavedPositions() {
    const pos = savedPositions();
    entityElements().forEach((el) => {
      const k = el.getAttribute("data-entity");
      const p = pos[k];
      if (!p) return;
      el.style.left = p.left + "px";
      el.style.top = p.top + "px";
      if (p.width) el.style.width = p.width + "px";
    });
  }

  function collectPositions() {
    const out = {};
    entityElements().forEach((el) => {
      const k = el.getAttribute("data-entity");
      const left = parseInt(el.style.left, 10) || 0;
      const top = parseInt(el.style.top, 10) || 0;
      const width = parseInt(el.style.width, 10) || el.offsetWidth;
      out[k] = { left, top, width };
    });
    return out;
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collectPositions()));
  }

  function loadAnchorOverrides() {
    try { anchorOverrides = JSON.parse(localStorage.getItem(ANCHORS_KEY) || "{}"); }
    catch { anchorOverrides = {}; }
  }
  function loadVerbOffsets() {
    try {
      const raw = JSON.parse(localStorage.getItem(VERB_OFFSETS_KEY) || "{}");
      // Migrate old absolute {x,y} to relative {dx,dy} — will be fixed on first render
      verbOffsets = raw;
    } catch { verbOffsets = {}; }
  }
  function persistAnchorOverrides() {
    localStorage.setItem(ANCHORS_KEY, JSON.stringify(anchorOverrides));
  }
  function cycleAnchor(linkIdx, end) {
    const key = linkIdx + "|" + end;
    const link = (window.LINKS || [])[linkIdx];
    if (!link) return;
    const canvas = canvasEl();
    const cr = canvas.getBoundingClientRect();
    const rectOf = (k) => {
      const el = canvas.querySelector(`[data-entity="${k}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x - cr.x, y: r.y - cr.y, w: r.width, h: r.height };
    };
    let current = anchorOverrides[key];
    if (!current) {
      const fr = rectOf(link.from), tr = rectOf(link.to);
      if (fr && tr) {
        const auto = autoAnchor(fr, tr);
        const explicit = end === "A" ? link.fromAnchor : link.toAnchor;
        current = (explicit && explicit !== "auto") ? explicit : (end === "A" ? auto.from : auto.to);
      } else {
        current = "top";
      }
    }
    const i = SIDE_CYCLE.indexOf(current);
    anchorOverrides[key] = SIDE_CYCLE[(i + 1) % SIDE_CYCLE.length];
    persistAnchorOverrides();
    scheduleRender();
  }

  // ── Drag-and-drop editor ──────────────────────────────────────────────────
  let dragState = null;

  // Met à jour synchrone les paths et bulles des liens connectés à une entité
  function syncLinksForEntity(entityKey) {
    const canvas = canvasEl();
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    const rectOf = (k) => {
      const el = canvas.querySelector('[data-entity="' + k + '"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x - cr.x, y: r.y - cr.y, w: r.width, h: r.height };
    };
    const getSide = (link, end) => {
      const key = link.idx + "|" + end;
      if (anchorOverrides[key]) return anchorOverrides[key];
      const explicit = end === "A" ? link.fromAnchor : link.toAnchor;
      if (explicit && explicit !== "auto") return explicit;
      const fr = rectOf(link.from), tr = rectOf(link.to);
      if (fr && tr) {
        const auto = autoAnchor(fr, tr);
        return end === "A" ? auto.from : auto.to;
      }
      return "top";
    };
    const hor = (s) => s === "left" || s === "right";

    (window.LINKS || []).forEach((link, idx) => {
      if (link.from !== entityKey && link.to !== entityKey) return;
      const path = canvas.querySelector('svg.links path[data-link-idx="' + idx + '"]');
      if (!path) return;
      const sa = getSide({idx, from:link.from, to:link.to, fromAnchor:link.fromAnchor, toAnchor:link.toAnchor}, "A");
      const sb = getSide({idx, from:link.from, to:link.to, fromAnchor:link.fromAnchor, toAnchor:link.toAnchor}, "B");
      const fr = rectOf(link.from), tr = rectOf(link.to);
      if (!fr || !tr) return;
      const a = anchorPoint(fr, sa, 0.5);
      const b = anchorPoint(tr, sb, 0.5);

      // Update path data attributes
      path.setAttribute("data-ax", a.x); path.setAttribute("data-ay", a.y);
      path.setAttribute("data-bx", b.x); path.setAttribute("data-by", b.y);
      path.setAttribute("data-sideA", sa); path.setAttribute("data-sideB", sb);

      const hasWp = verbOffsets[idx] && (verbOffsets[idx].dx !== undefined || verbOffsets[idx].x !== undefined);
      let wp = null;
      if (hasWp) {
        const EXT=30;
        const ea2 = (()=>{switch(sa){case"top":return{x:a.x,y:a.y-EXT};case"bottom":return{x:a.x,y:a.y+EXT};case"left":return{x:a.x-EXT,y:a.y};case"right":return{x:a.x+EXT,y:a.y};default:return a;}})();
        const eb2 = (()=>{switch(sb){case"top":return{x:b.x,y:b.y-EXT};case"bottom":return{x:b.x,y:b.y+EXT};case"left":return{x:b.x-EXT,y:b.y};case"right":return{x:b.x+EXT,y:b.y};default:return b;}})();
        const ref2 = hor(sa) === hor(sb)
          ? (hor(sa) ? { x: eb2.x, y: ea2.y } : { x: ea2.x, y: eb2.y })
          : { x: ea2.x, y: eb2.y };
        if (verbOffsets[idx].dx !== undefined) wp = {x:ref2.x+verbOffsets[idx].dx, y:ref2.y+verbOffsets[idx].dy};
        else wp = verbOffsets[idx];
      }
      const curve = orthogonal(a, b, sa, sb, wp);
      path.setAttribute("d", curve.d);

      // Update verb position
      const vg = canvas.querySelector('.verb-group[data-link-idx="' + idx + '"]');
      const ch = canvas.querySelector('.ctrl-handle[data-link-idx="' + idx + '"]');
      if (vg) {
        const m = curve.mid;
        const el2 = vg.querySelector("ellipse");
        const vt2 = vg.querySelector("text.verb");
        if (el2) { el2.setAttribute("cx", m.x); el2.setAttribute("cy", m.y); }
        if (vt2) { vt2.setAttribute("x", m.x); vt2.setAttribute("y", m.y); }
        if (ch) {
          const m = curve.mid;
          ch.setAttribute("cx", m.x); ch.setAttribute("cy", m.y);
          ch.setAttribute("x", m.x-6); ch.setAttribute("y", m.y-6);
        }
      }
    });
  }

  function onPointerDown(e) {
    if (!editMode) return;
    // Click on anchor handle? cycle side
    if (e.target.classList && e.target.classList.contains("anchor-handle")) {
      e.preventDefault();
      const idx = parseInt(e.target.dataset.linkIdx, 10);
      const end = e.target.dataset.end;
      cycleAnchor(idx, end);
      return;
    }
    const el = e.target.closest(".canvas [data-entity]");
    if (!el) return;
    e.preventDefault();
    const canvas = document.querySelector(".canvas");
    const cr = canvas.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    dragState = {
      el,
      offsetX: (e.clientX - er.x) / zoom,
      offsetY: (e.clientY - er.y) / zoom,
      canvasX: cr.x,
      canvasY: cr.y,
      canvasW: cr.width / zoom,
      canvasH: cr.height / zoom,
      w: er.width / zoom,
      h: er.height / zoom,
    };
    el.classList.add("dragging");
    if (el.setPointerCapture) {
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
    }
  }

  function onPointerMove(e) {
    if (!dragState) return;
    let x = (e.clientX - dragState.canvasX) / zoom - dragState.offsetX;
    let y = (e.clientY - dragState.canvasY) / zoom - dragState.offsetY;
    if (snapToGrid) {
      x = Math.round(x / GRID) * GRID;
      y = Math.round(y / GRID) * GRID;
    }
    x = Math.max(0, Math.min(dragState.canvasW - dragState.w, x));
    y = Math.max(0, Math.min(dragState.canvasH - dragState.h, y));
    dragState.el.style.left = x + "px";
    dragState.el.style.top = y + "px";
    // Mise à jour synchrone des liens connectés (bulles + paths)
    syncLinksForEntity(dragState.el.getAttribute("data-entity"));
    scheduleRender();
  }

  function onPointerUp() {
    if (!dragState) return;
    dragState.el.classList.remove("dragging");
    dragState = null;
    persist();
    scheduleRender();
  }

  // ── Control-point drag (intersection bend handle) ─────────────────────────
  function onCtrlPointerDown(e) {
    if (!editMode) return;
    const handle = e.target.closest(".ctrl-handle");
    if (!handle) return;
    e.preventDefault(); e.stopPropagation();
    const canvas = canvasEl();
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    const linkIdx = parseInt(handle.getAttribute("data-link-idx"), 10);
    const cx = parseFloat(handle.getAttribute("cx")) || 0;
    const cy = parseFloat(handle.getAttribute("cy")) || 0;
    ctrlDragState = { linkIdx, canvasX: cr.x, canvasY: cr.y, startX: cx, startY: cy };
    handle.style.cursor = "grabbing";
  }

  function onCtrlPointerMove(e) {
    if (!ctrlDragState) return;
    const path = document.querySelector('svg.links path[data-link-idx="' + ctrlDragState.linkIdx + '"]');
    if (!path) return;
    const a = { x: parseFloat(path.getAttribute("data-ax")), y: parseFloat(path.getAttribute("data-ay")) };
    const b = { x: parseFloat(path.getAttribute("data-bx")), y: parseFloat(path.getAttribute("data-by")) };
    const sa = path.getAttribute("data-sideA");
    const sb = path.getAttribute("data-sideB");
    const hor = (s) => s === "left" || s === "right";

    const dx = (e.clientX - ctrlDragState.canvasX) / zoom - ctrlDragState.startX;
    const dy = (e.clientY - ctrlDragState.canvasY) / zoom - ctrlDragState.startY;
    let nx = ctrlDragState.startX + dx;
    let ny = ctrlDragState.startY + dy;

    // Contraindre au segment d'intersection
    if (hor(sa) === hor(sb)) {
      const EXT=30;
      if (hor(sa)) {
        // Deux lignes horizontales → intersection verticale → déplacement horizontal uniquement
        ny = ctrlDragState.startY;
        // Clamp Y entre les deux sorties pour éviter la torsion
        const eaY = sa==="top"?a.y-EXT:sa==="bottom"?a.y+EXT:a.y;
        const ebY = sb==="top"?b.y-EXT:sb==="bottom"?b.y+EXT:b.y;
        const minY = Math.min(eaY, ebY);
        const maxY = Math.max(eaY, ebY);
        if (ny < minY) ny = minY;
        if (ny > maxY) ny = maxY;
      } else {
        // Deux lignes verticales → intersection horizontale → déplacement vertical uniquement
        nx = ctrlDragState.startX;
        // Clamp X entre les deux sorties pour éviter la torsion
        const eaX = sa==="left"?a.x-EXT:sa==="right"?a.x+EXT:a.x;
        const ebX = sb==="left"?b.x-EXT:sb==="right"?b.x+EXT:b.x;
        const minX = Math.min(eaX, ebX);
        const maxX = Math.max(eaX, ebX);
        if (nx < minX) nx = minX;
        if (nx > maxX) nx = maxX;
      }
    }

    const curve = orthogonal(a, b, sa, sb, { x: nx, y: ny });
    path.setAttribute("d", curve.d);

    // Update control handle
    const ctrl = document.querySelector('.ctrl-handle[data-link-idx="' + ctrlDragState.linkIdx + '"]');
    if (ctrl) { ctrl.setAttribute("cx", nx); ctrl.setAttribute("cy", ny); ctrl.setAttribute("x", nx-6); ctrl.setAttribute("y", ny-6); }
    // Update verb position (même position que le point de contrôle)
    const verbGroup = document.querySelector('.verb-group[data-link-idx="' + ctrlDragState.linkIdx + '"]');
    if (verbGroup) {
      const el2 = verbGroup.querySelector("ellipse");
      const vt2 = verbGroup.querySelector("text.verb");
      if (el2) { el2.setAttribute("cx", nx); el2.setAttribute("cy", ny); }
      if (vt2) { vt2.setAttribute("x", nx); vt2.setAttribute("y", ny); }
    }
  }

  function onCtrlPointerUp() {
    if (!ctrlDragState) return;
    // Save as relative offset
    const path = document.querySelector('svg.links path[data-link-idx="' + ctrlDragState.linkIdx + '"]');
    if (path) {
      const a = { x: parseFloat(path.getAttribute("data-ax")), y: parseFloat(path.getAttribute("data-ay")) };
      const b = { x: parseFloat(path.getAttribute("data-bx")), y: parseFloat(path.getAttribute("data-by")) };
      const sa = path.getAttribute("data-sideA");
      const sb = path.getAttribute("data-sideB");
      const ea = (() => { const EXT=30; switch(sa){case"top":return{x:a.x,y:a.y-EXT};case"bottom":return{x:a.x,y:a.y+EXT};case"left":return{x:a.x-EXT,y:a.y};case"right":return{x:a.x+EXT,y:a.y};default:return a;} })();
      const eb = (() => { const EXT=30; switch(sb){case"top":return{x:b.x,y:b.y-EXT};case"bottom":return{x:b.x,y:b.y+EXT};case"left":return{x:b.x-EXT,y:b.y};case"right":return{x:b.x+EXT,y:b.y};default:return b;} })();
      const hor = (s) => s === "left" || s === "right";
      const ref = hor(sa) === hor(sb)
        ? (hor(sa) ? { x: eb.x, y: ea.y } : { x: ea.x, y: eb.y })
        : { x: ea.x, y: eb.y };
      const curX = parseFloat(document.querySelector('.ctrl-handle[data-link-idx="' + ctrlDragState.linkIdx + '"]')?.getAttribute("cx")) || ref.x;
      const curY = parseFloat(document.querySelector('.ctrl-handle[data-link-idx="' + ctrlDragState.linkIdx + '"]')?.getAttribute("cy")) || ref.y;
      verbOffsets[ctrlDragState.linkIdx] = { dx: curX - ref.x, dy: curY - ref.y };
    }
    ctrlDragState = null;
    localStorage.setItem(VERB_OFFSETS_KEY, JSON.stringify(verbOffsets));
    scheduleRender();
  }

  // ── Canvas size + zoom + fullscreen ───────────────────────────────────────
  function canvasEl() { return document.querySelector(".canvas"); }
  function figureEl() { return document.querySelector(".figure"); }

  function applySavedSize() {
    const c = canvasEl();
    if (!c) return;
    try {
      const s = JSON.parse(localStorage.getItem(SIZE_KEY) || "null");
      if (s && s.width) c.style.width = s.width + "px";
      if (s && s.height) c.style.height = s.height + "px";
    } catch (_) {}
  }

  function persistSize() {
    const c = canvasEl();
    if (!c) return;
    const width = parseInt(c.style.width, 10) || c.offsetWidth;
    const height = parseInt(c.style.height, 10) || c.offsetHeight;
    localStorage.setItem(SIZE_KEY, JSON.stringify({ width, height }));
  }

  function collectCanvasSize() {
    const c = canvasEl();
    if (!c) return { width: 0, height: 0 };
    return {
      width: parseInt(c.style.width, 10) || c.offsetWidth,
      height: parseInt(c.style.height, 10) || c.offsetHeight,
    };
  }

  function collectAnchorOverrides() {
    // Return only entries that match a current LINK index, sorted by key.
    const out = {};
    const max = (window.LINKS || []).length;
    Object.keys(anchorOverrides)
      .filter((k) => {
        const [i] = k.split("|");
        return Number(i) < max;
      })
      .sort()
      .forEach((k) => { out[k] = anchorOverrides[k]; });
    return out;
  }

  // ── SVG export ────────────────────────────────────────────────────────────
  async function fetchCss(href) {
    try {
      const r = await fetch(href);
      if (!r.ok) return "";
      return await r.text();
    } catch { return ""; }
  }

  function escapeXml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  async function exportSvg() {
    const c = canvasEl();
    if (!c) throw new Error("canevas introuvable");

    // Measure unzoomed coordinates
    const prevTransform = c.style.transform;
    c.style.transform = "scale(1)";
    const cr = c.getBoundingClientRect();
    const width  = parseInt(c.style.width,  10) || c.offsetWidth;
    const height = parseInt(c.style.height, 10) || c.offsetHeight;

    // Re-render so the SVG paths reflect the current (unzoomed) layout
    render();

    // 1) Inline CSS from styles.css + a few extras forced for SVG context
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const cssBlobs = await Promise.all(links.map((l) => fetchCss(l.href)));
    const inlineCss = `
      /* SVG export overrides */
      .canvas { position: relative; }
      .canvas .entity { position: absolute; }
      html, body { background: transparent; margin: 0; padding: 0; }
    `;
    const fullCss = cssBlobs.join("\n") + "\n" + inlineCss;

    // 2) Clone the canvas HTML (entities) and strip the inner SVG (we re-emit it)
    const clone = c.cloneNode(true);
    const innerSvg = clone.querySelector("svg.links");
    let svgInner = "";
    if (innerSvg) {
      // Use the current live svg content (already rendered) and copy attributes
      const live = c.querySelector("svg.links");
      svgInner = live ? live.innerHTML : "";
      innerSvg.remove();
    }

    // Remove any toolbar / anchor handles / dragging state from the clone
    clone.querySelectorAll(".anchor-handle, .editor-toolbar").forEach((n) => n.remove());
    clone.classList.remove("dragging");
    clone.style.transform = "";
    clone.style.width = width + "px";
    clone.style.height = height + "px";

    // The clone is still an HTML node; we'll embed it via <foreignObject>
    const htmlSerialized = new XMLSerializer().serializeToString(clone);

    // 3) Build the SVG: links underneath (paths from svgInner), entities above (foreignObject)
    const svg =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
      `version="1.1" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n` +
      `<defs><style type="text/css"><![CDATA[\n${fullCss}\n]]></style></defs>\n` +
      // entities first via foreignObject (HTML), then links on top so labels stay readable
      `<foreignObject x="0" y="0" width="${width}" height="${height}">` +
      `<div xmlns="http://www.w3.org/1999/xhtml">${htmlSerialized}</div>` +
      `</foreignObject>\n` +
      `<g class="links-layer" fill="none">${svgInner}</g>\n` +
      `</svg>\n`;

    // Restore zoom
    c.style.transform = prevTransform;

    // 4) Download
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = (location.pathname.split("/").pop() || "figure.html").replace(/\.html?$/i, "");
    a.href = url;
    a.download = base + ".svg";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  function resizeCanvas(dw, dh) {
    const c = canvasEl();
    if (!c) return;
    const w = (parseInt(c.style.width, 10) || c.offsetWidth) + dw;
    const h = (parseInt(c.style.height, 10) || c.offsetHeight) + dh;
    c.style.width = Math.max(400, w) + "px";
    c.style.height = Math.max(400, h) + "px";
    persistSize();
    scheduleRender();
  }

  function applySavedZoom() {
    if (/[?&]capture=1\b/.test(location.search)) { zoom = 1; applyZoom(); return; }
    const z = parseFloat(localStorage.getItem(ZOOM_KEY));
    if (!isNaN(z) && z >= ZOOM_MIN && z <= ZOOM_MAX) zoom = z;
    applyZoom();
  }

  function applyZoom() {
    const c = canvasEl();
    if (!c) return;
    // En mode capture : pas de zoom, pas de spacer, canvas dans le flux normal.
    if (/[?&]capture=1\b/.test(location.search)) {
      c.style.transform = "";
      c.style.transformOrigin = "";
      return;
    }
    c.style.transformOrigin = "top left";
    c.style.transform = `scale(${zoom})`;
    // Reserve space in the viewport so scrollbars match the zoomed canvas
    const w = (parseInt(c.style.width, 10) || c.offsetWidth) * zoom;
    const h = (parseInt(c.style.height, 10) || c.offsetHeight) * zoom;
    let spacer = c.parentElement.querySelector(".canvas-spacer");
    if (!spacer) {
      spacer = document.createElement("div");
      spacer.className = "canvas-spacer";
      spacer.style.pointerEvents = "none";
      c.parentElement.appendChild(spacer);
    }
    spacer.style.width = w + "px";
    spacer.style.height = h + "px";
    const zLabel = document.getElementById("tb-zoom-label");
    if (zLabel) zLabel.textContent = Math.round(zoom * 100) + "%";
    if (!/[?&]capture=1\b/.test(location.search)) {
      localStorage.setItem(ZOOM_KEY, String(zoom));
    }
  }

  function setZoom(z) {
    zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
    applyZoom();
    scheduleRender();
  }

  // Auto-zoom pour que le canvas tienne sans scroll au chargement
  function autoSizeCanvas() {
    const c = canvasEl();
    if (!c) return;
    // Ne pas toucher si l'utilisateur a déjà zoomé ou redimensionné
    if (localStorage.getItem(ZOOM_KEY)) return;
    if (localStorage.getItem(SIZE_KEY)) return;
    // Seulement pour les petits canvases (figures domaine)
    if (c.offsetWidth > 1200) return;
    // Calcule la bbox du contenu et ajuste le zoom pour que tout tienne
    const cr = c.getBoundingClientRect();
    let minX = 0, minY = 0, maxX = cr.width, maxY = cr.height;
    c.querySelectorAll("[data-entity]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const x = r.x - cr.x, y = r.y - cr.y;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + r.width  > maxX) maxX = x + r.width;
      if (y + r.height > maxY) maxY = y + r.height;
    });
    const svg = c.querySelector("svg.links");
    if (svg) {
      svg.querySelectorAll("path, text, rect, ellipse").forEach((node) => {
        try { const b = node.getBBox(); if (b.x < minX) minX = b.x; if (b.y < minY) minY = b.y; if (b.x + b.width > maxX) maxX = b.x + b.width; if (b.y + b.height > maxY) maxY = b.y + b.height; } catch (_) {}
      });
    }
    const contentW = maxX - minX + 32;
    const contentH = maxY - minY + 32;
    const vp = c.parentElement;
    if (!vp || contentW <= 0 || contentH <= 0) return;
    const availW = Math.max(100, vp.clientWidth  - 16);
    const availH = Math.max(100, vp.clientHeight - 16);
    const z = Math.min(availW / contentW, availH / contentH, 1); // ne dépasse pas 100%
    if (z < 1 && z > 0.7) setZoom(Math.max(ZOOM_MIN, z)); // seulement si pas trop petit
  }

  function fitToContent() {
    const c = canvasEl();
    const vp = c && c.parentElement;
    if (!c || !vp) return;
    // Reset zoom to 1 momentarily so we measure unzoomed coordinates.
    const prevTransform = c.style.transform;
    c.style.transform = "scale(1)";
    const cr = c.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    c.querySelectorAll("[data-entity]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const x = r.x - cr.x, y = r.y - cr.y;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + r.width  > maxX) maxX = x + r.width;
      if (y + r.height > maxY) maxY = y + r.height;
    });
    const svg = c.querySelector("svg.links");
    if (svg) {
      svg.querySelectorAll("path, text, rect").forEach((node) => {
        try {
          const b = node.getBBox();
          if (b.x < minX) minX = b.x;
          if (b.y < minY) minY = b.y;
          if (b.x + b.width  > maxX) maxX = b.x + b.width;
          if (b.y + b.height > maxY) maxY = b.y + b.height;
        } catch (_) {}
      });
    }
    c.style.transform = prevTransform;
    if (!isFinite(minX) || !isFinite(minY) || maxX <= minX || maxY <= minY) return;
    const contentW = maxX + Math.max(0, minX); // include left margin so content stays visible
    const contentH = maxY + Math.max(0, minY);
    const availW = Math.max(50, vp.clientWidth  - 16);
    const availH = Math.max(50, vp.clientHeight - 16);
    const z = Math.min(availW / contentW, availH / contentH);
    setZoom(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z)));
  }

  function wrapCanvasInViewport() {
    const c = canvasEl();
    if (!c) return;
    // En mode capture, on laisse le canvas dans le flux normal (position:relative)
    // afin qu'il pousse la hauteur de son parent et qu'aucun spacer ne soit nécessaire.
    if (/[?&]capture=1\b/.test(location.search)) return;
    if (c.parentElement.classList.contains("canvas-viewport")) return;
    const vp = document.createElement("div");
    vp.className = "canvas-viewport";
    c.parentNode.insertBefore(vp, c);
    vp.appendChild(c);
    c.style.position = "absolute";
    c.style.top = "0";
    c.style.left = "0";
    c.style.margin = "0";
  }

  function toggleFullscreen() {
    const fig = figureEl();
    if (!fig) return;
    if (!document.fullscreenElement) {
      fig.requestFullscreen && fig.requestFullscreen();
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  }

  // ── Toolbar ───────────────────────────────────────────────────────────────
  function buildToolbar() {
    const bar = document.createElement("div");
    bar.className = "editor-toolbar";
    bar.innerHTML = `
      <button type="button" id="tb-collapse" class="tb-collapse" title="Replier la barre">▾</button>
      <div class="tb-inner">
      <label class="tb-toggle">
        <input type="checkbox" id="tb-edit" />
        <span>Édition</span>
      </label>
      <label class="tb-toggle">
        <input type="checkbox" id="tb-snap" checked />
        <span>Grille ${GRID}px</span>
      </label>
      <span class="tb-sep"></span>
      <button type="button" id="tb-zoom-out" title="Dézoomer (Ctrl+-)">−</button>
      <button type="button" id="tb-zoom-label" title="Zoom 100% (Ctrl+0)">100%</button>
      <button type="button" id="tb-zoom-in" title="Zoomer (Ctrl++)">+</button>
      <button type="button" id="tb-zoom-fit" title="Ajuster à la largeur">Ajuster</button>
      <button type="button" id="tb-fs" title="Plein écran (F11 alt.)">⛶ Plein écran</button>
      <span class="tb-sep"></span>
      <span class="tb-group" title="Largeur du canevas">
        <button type="button" id="tb-w-minus">L−</button>
        <button type="button" id="tb-w-plus">L+</button>
      </span>
      <span class="tb-group" title="Hauteur du canevas">
        <button type="button" id="tb-h-minus">H−</button>
        <button type="button" id="tb-h-plus">H+</button>
      </span>
      <span class="tb-sep"></span>
      <button type="button" id="tb-export">Copier positions (JSON)</button>
      <button type="button" id="tb-export-html">Copier styles HTML</button>
      <button type="button" id="tb-export-svg">Exporter SVG</button>
      <button type="button" id="tb-reset" class="danger">Réinitialiser</button>
      <span class="tb-sep"></span>
      <label class="tb-toggle" id="tb-version-group" title="Style de la figure" style="display:none">
        <span>Style</span>
        <select id="tb-version">
          <option value="classic">Classique</option>
          <option value="moderne">Moderne</option>
        </select>
      </label>
      <span class="tb-status" id="tb-status">v11</span>
      </div>
    `;
    (figureEl() || document.body).appendChild(bar);

    // Collapse / expand
    const collapseBtn = bar.querySelector("#tb-collapse");
    const setCollapsed = (v) => {
      bar.classList.toggle("collapsed", v);
      collapseBtn.textContent = v ? "▸" : "▾";
      collapseBtn.title = v ? "Déplier la barre" : "Replier la barre";
      localStorage.setItem(COLLAPSED_KEY, v ? "1" : "0");
    };
    collapseBtn.addEventListener("click", () => setCollapsed(!bar.classList.contains("collapsed")));
    setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");

    // — Version selector (only on domain MCD/MLD/MPD pages) —
    const versionGroup = bar.querySelector("#tb-version-group");
    const versionSelect = bar.querySelector("#tb-version");
    const isDomain = document.body.classList.contains("mcd-classic");
    if (isDomain && versionGroup && versionSelect) {
      versionGroup.style.display = "";
      const savedVersion = localStorage.getItem(VERSION_KEY) || "classic";
      const applyVersion = (v) => {
        if (v === "moderne") {
          document.body.classList.remove("mcd-classic");
        } else {
          document.body.classList.add("mcd-classic");
        }
        versionSelect.value = v;
        localStorage.setItem(VERSION_KEY, v);
        scheduleRender();
      };
      versionSelect.addEventListener("change", (e) => applyVersion(e.target.value));
      applyVersion(savedVersion);
    } else if (versionGroup) {
      versionGroup.style.display = "none";
    }

    const status = bar.querySelector("#tb-status");
    const flash = (msg) => {
      status.textContent = msg;
      clearTimeout(flash._t);
      flash._t = setTimeout(() => { status.textContent = ""; }, 2200);
    };

    bar.querySelector("#tb-edit").addEventListener("change", (e) => {
      editMode = e.target.checked;
      document.body.classList.toggle("edit-mode", editMode);
    });
    bar.querySelector("#tb-snap").addEventListener("change", (e) => {
      snapToGrid = e.target.checked;
    });
    bar.querySelector("#tb-export").addEventListener("click", async () => {
      const payload = {
        canvas: collectCanvasSize(),
        positions: collectPositions(),
        anchors: collectAnchorOverrides(),
      };
      const json = JSON.stringify(payload, null, 2);
      try {
        await navigator.clipboard.writeText(json);
        flash("JSON copié (canevas + positions + ancrages)");
      } catch {
        prompt("Copie manuelle :", json);
      }
    });
    bar.querySelector("#tb-export-html").addEventListener("click", async () => {
      const size = collectCanvasSize();
      const pos = collectPositions();
      const anchors = collectAnchorOverrides();
      const parts = [];
      parts.push(`<!-- canvas: ${size.width} × ${size.height} px -->`);
      parts.push(`<div class="canvas" style="width:${size.width}px; height:${size.height}px;">`);
      Object.entries(pos).forEach(([k, p]) => {
        parts.push(`  data-entity="${k}" style="top:${p.top}px; left:${p.left}px; width:${p.width}px;"`);
      });
      if (Object.keys(anchors).length) {
        parts.push("");
        parts.push("/* Ancrages à reporter dans window.LINKS (idx|A = from, idx|B = to) */");
        Object.entries(anchors).forEach(([k, side]) => {
          const [idx, end] = k.split("|");
          const prop = end === "A" ? "fromAnchor" : "toAnchor";
          parts.push(`LINKS[${idx}].${prop} = "${side}";`);
        });
      }
      const text = parts.join("\n");
      try {
        await navigator.clipboard.writeText(text);
        flash("HTML copié (canevas + positions + ancrages)");
      } catch {
        prompt("Copie manuelle :", text);
      }
    });
    bar.querySelector("#tb-export-svg").addEventListener("click", async () => {
      try {
        await exportSvg();
        flash("SVG téléchargé");
      } catch (err) {
        console.error(err);
        flash("Échec export SVG : " + (err && err.message ? err.message : err));
      }
    });
    bar.querySelector("#tb-reset").addEventListener("click", () => {
      if (!confirm("Réinitialiser positions, taille et zoom enregistrés localement ?")) return;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SIZE_KEY);
      localStorage.removeItem(ZOOM_KEY);
      localStorage.removeItem(ANCHORS_KEY);
      localStorage.removeItem(COLLAPSED_KEY);
      localStorage.removeItem(VERSION_KEY);
      localStorage.removeItem(VERB_OFFSETS_KEY);
      location.reload();
    });

    bar.querySelector("#tb-zoom-in").addEventListener("click", () => setZoom(zoom + ZOOM_STEP));
    bar.querySelector("#tb-zoom-out").addEventListener("click", () => setZoom(zoom - ZOOM_STEP));
    bar.querySelector("#tb-zoom-label").addEventListener("click", () => setZoom(1));
    bar.querySelector("#tb-zoom-fit").addEventListener("click", fitToContent);
    bar.querySelector("#tb-fs").addEventListener("click", toggleFullscreen);
    bar.querySelector("#tb-w-plus").addEventListener("click", () => resizeCanvas(SIZE_STEP, 0));
    bar.querySelector("#tb-w-minus").addEventListener("click", () => resizeCanvas(-SIZE_STEP, 0));
    bar.querySelector("#tb-h-plus").addEventListener("click", () => resizeCanvas(0, SIZE_STEP));
    bar.querySelector("#tb-h-minus").addEventListener("click", () => resizeCanvas(0, -SIZE_STEP));

    window.addEventListener("keydown", (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const step = e.shiftKey ? ZOOM_STEP * 10 : ZOOM_STEP;
      if (e.key === "+" || e.key === "=") { e.preventDefault(); setZoom(zoom + step); }
      else if (e.key === "-") { e.preventDefault(); setZoom(zoom - step); }
      else if (e.key === "0") { e.preventDefault(); setZoom(1); }
    });
    document.addEventListener("fullscreenchange", () => {
      document.body.classList.toggle("is-fullscreen", !!document.fullscreenElement);
      scheduleRender();
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    const canvas = document.querySelector(".canvas");
    if (!canvas) return;
    wrapCanvasInViewport();
    applySavedSize();
    applySavedPositions();
    loadAnchorOverrides();
    loadVerbOffsets();
    buildToolbar();
    applySavedZoom();
    render();
    // Auto-size canvas to fit content (évite le scroll sur les figures domaine)
    requestAnimationFrame(() => requestAnimationFrame(autoSizeCanvas));
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    // Control-point drag (intersection routing)
    document.addEventListener("pointerdown", onCtrlPointerDown);
    document.addEventListener("pointermove", onCtrlPointerMove);
    document.addEventListener("pointerup", onCtrlPointerUp);
    window.addEventListener("resize", scheduleRender);
    if (/[?&]capture=1\b/.test(location.search)) {
      // Marqueur "JS a tourné", remplacé par BBOX:WxH si autoFitCapture réussit.
      document.title = "CAPTURE_PENDING";
      // Laisse 1 frame pour que les positions / liens soient mesurables, puis
      // recadre le canvas sur la bbox réelle du contenu et publie les dims.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          try { autoFitCapture(); } catch (e) { document.title = "CAPTURE_ERROR:" + e.message; }
        });
      });
    }
  }

  function autoFitCapture() {
    const canvas = document.querySelector(".canvas");
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    // Considère tout enfant positionné ayant top/left inline (entities,
    // arch-layer, packages, etc.). Ignore les overlays SVG.
    const all = Array.from(canvas.querySelectorAll("*"));
    const kids = all.filter(function (el) {
      if (el.tagName === "SVG" || el.closest("svg")) return false;
      return el.style && (el.style.top !== "" || el.style.left !== "");
    });
    if (!kids.length) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    kids.forEach(function (el) {
      const r = el.getBoundingClientRect();
      const x = r.x - cr.x, y = r.y - cr.y;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + r.width  > maxX) maxX = x + r.width;
      if (y + r.height > maxY) maxY = y + r.height;
    });
    if (!isFinite(minX)) return;
    const pad = 16;
    const dx = -minX + pad;
    const dy = -minY + pad;
    kids.forEach(function (el) {
      const top  = parseFloat(el.style.top)  || 0;
      const left = parseFloat(el.style.left) || 0;
      el.style.top  = (top  + dy) + "px";
      el.style.left = (left + dx) + "px";
    });
    const newW = Math.ceil(maxX - minX + 2 * pad);
    const newH = Math.ceil(maxY - minY + 2 * pad);
    canvas.style.width  = newW + "px";
    canvas.style.height = newH + "px";
    canvas.style.margin = "0";
    // Force tous les ancêtres jusqu'à <body> à la taille exacte du canvas
    // pour que Edge --window-size=newW,newH capture pile la zone utile.
    let el = canvas.parentElement;
    while (el && el !== document.body) {
      el.style.width = newW + "px";
      el.style.maxWidth = "none";
      el.style.margin = "0";
      el.style.padding = "0";
      el = el.parentElement;
    }
    document.documentElement.style.width  = newW + "px";
    document.documentElement.style.height = newH + "px";
    document.body.style.width  = newW + "px";
    document.body.style.height = newH + "px";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    scheduleRender();
    const meta = document.createElement("meta");
    meta.setAttribute("name", "capture-bbox");
    meta.setAttribute("content", newW + "x" + newH);
    document.head.appendChild(meta);
    document.title = "BBOX:" + newW + "x" + newH;
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
