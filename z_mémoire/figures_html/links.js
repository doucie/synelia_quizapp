/* Draw SVG links between entity boxes positioned in a `.canvas`,
   plus an interactive editor: drag entities, snap to grid, export positions.

   Links: `window.LINKS = [{from, to, fromAnchor?, toAnchor?, card?, cardFrom?, cardTo?, strong?, dashed?}]`
   Anchor: 'top' | 'right' | 'bottom' | 'left' | 'auto'.

   Persistence: positions are saved to localStorage under the page path,
   so reloading keeps your manual layout. Use "Réinitialiser" to drop it. */

(function () {
  const STORAGE_KEY = "figures_html:positions:" + location.pathname;
  const SIZE_KEY = "figures_html:canvas-size:" + location.pathname;
  const ZOOM_KEY = "figures_html:zoom:" + location.pathname;
  const ANCHORS_KEY = "figures_html:anchors:" + location.pathname;
  const COLLAPSED_KEY = "figures_html:tb-collapsed:" + location.pathname;
  const GRID = 10;
  const ZOOM_STEP = 0.1;
  const ZOOM_MIN = 0.25;
  const ZOOM_MAX = 2.5;
  const SIZE_STEP = 100;
  const SIDE_CYCLE = ["top", "right", "bottom", "left"];
  let snapToGrid = true;
  let editMode = false;
  let rafPending = false;
  let zoom = 1;
  let anchorOverrides = {}; // key "i|A" or "i|B" -> "top"/"right"/...

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
    return `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`;
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
    resolved.forEach((r, i) => {
      const a = anchorPoint(r.fr, r.sideA, ratios[i].A);
      const b = anchorPoint(r.tr, r.sideB, ratios[i].B);
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", bezier(a, b, r.sideA, r.sideB));
      if (r.link.strong) path.classList.add("strong");
      if (r.link.dashed) path.setAttribute("stroke-dasharray", "5 4");
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
      placeLabel(a, r.sideA, r.link.cardFrom || r.link.card);
      placeLabel(b, r.sideB, r.link.cardTo);

      // Clickable anchor handles (visible only in edit mode via CSS)
      const handle = (point, end) => {
        const h = document.createElementNS(ns, "circle");
        h.setAttribute("cx", point.x);
        h.setAttribute("cy", point.y);
        h.setAttribute("r", 6);
        h.classList.add("anchor-handle");
        h.dataset.linkIdx = r.idx;
        h.dataset.end = end;
        svg.appendChild(h);
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
    scheduleRender();
  }

  function onPointerUp() {
    if (!dragState) return;
    dragState.el.classList.remove("dragging");
    dragState = null;
    persist();
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
    const z = parseFloat(localStorage.getItem(ZOOM_KEY));
    if (!isNaN(z) && z >= ZOOM_MIN && z <= ZOOM_MAX) zoom = z;
    applyZoom();
  }

  function applyZoom() {
    const c = canvasEl();
    if (!c) return;
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
    localStorage.setItem(ZOOM_KEY, String(zoom));
  }

  function setZoom(z) {
    zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
    applyZoom();
    scheduleRender();
  }

  function wrapCanvasInViewport() {
    const c = canvasEl();
    if (!c) return;
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
      <button type="button" id="tb-reset" class="danger">Réinitialiser</button>
      <span class="tb-status" id="tb-status"></span>
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
      const json = JSON.stringify(collectPositions(), null, 2);
      try {
        await navigator.clipboard.writeText(json);
        flash("JSON copié dans le presse-papier");
      } catch {
        prompt("Copie manuelle :", json);
      }
    });
    bar.querySelector("#tb-export-html").addEventListener("click", async () => {
      const pos = collectPositions();
      const lines = Object.entries(pos).map(([k, p]) =>
        `data-entity="${k}" style="top:${p.top}px; left:${p.left}px; width:${p.width}px;"`
      );
      const text = lines.join("\n");
      try {
        await navigator.clipboard.writeText(text);
        flash("Attributs HTML copiés");
      } catch {
        prompt("Copie manuelle :", text);
      }
    });
    bar.querySelector("#tb-reset").addEventListener("click", () => {
      if (!confirm("Réinitialiser positions, taille et zoom enregistrés localement ?")) return;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SIZE_KEY);
      localStorage.removeItem(ZOOM_KEY);
      localStorage.removeItem(ANCHORS_KEY);
      localStorage.removeItem(COLLAPSED_KEY);
      location.reload();
    });

    bar.querySelector("#tb-zoom-in").addEventListener("click", () => setZoom(zoom + ZOOM_STEP));
    bar.querySelector("#tb-zoom-out").addEventListener("click", () => setZoom(zoom - ZOOM_STEP));
    bar.querySelector("#tb-zoom-label").addEventListener("click", () => setZoom(1));
    bar.querySelector("#tb-zoom-fit").addEventListener("click", () => {
      const c = canvasEl();
      const vp = c && c.parentElement;
      if (!c || !vp) return;
      const cw = parseInt(c.style.width, 10) || c.offsetWidth;
      const avail = vp.clientWidth - 24;
      setZoom(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, avail / cw)));
    });
    bar.querySelector("#tb-fs").addEventListener("click", toggleFullscreen);
    bar.querySelector("#tb-w-plus").addEventListener("click", () => resizeCanvas(SIZE_STEP, 0));
    bar.querySelector("#tb-w-minus").addEventListener("click", () => resizeCanvas(-SIZE_STEP, 0));
    bar.querySelector("#tb-h-plus").addEventListener("click", () => resizeCanvas(0, SIZE_STEP));
    bar.querySelector("#tb-h-minus").addEventListener("click", () => resizeCanvas(0, -SIZE_STEP));

    window.addEventListener("keydown", (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === "+" || e.key === "=") { e.preventDefault(); setZoom(zoom + ZOOM_STEP); }
      else if (e.key === "-") { e.preventDefault(); setZoom(zoom - ZOOM_STEP); }
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
    buildToolbar();
    applySavedZoom();
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    render();
    window.addEventListener("resize", scheduleRender);
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
