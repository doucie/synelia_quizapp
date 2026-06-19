/* Standalone "Exporter SVG" helper for figure pages that do NOT use links.js
   (sequences, future free-form figures, …).

   Usage:
     <script src="svg-export.js"></script>
     <script>
       // Capture the .figure (or any selector) on click
       window.addSvgExportButton({ target: ".figure", filename: "sequences" });
     </script>
*/

(function () {
  // Mode capture : pas de bouton, marges réduites.
  try {
    if (/[?&]capture=1\b/.test(location.search)) {
      const css = document.createElement("style");
      css.textContent =
        "html,body{background:#fff!important;margin:0!important;padding:0!important;}" +
        ".page-header,.figure-caption,.figure-title,.legend,.kpi-strip," +
        ".page-intro,.page-footer{display:none!important;}" +
        ".page{margin:0!important;padding:0!important;box-shadow:none!important;border:none!important;max-width:none!important;background:transparent!important;}" +
        ".figure{margin:0!important;padding:0!important;box-shadow:none!important;background:transparent!important;border:none!important;}";
      (document.head || document.documentElement).appendChild(css);
    }
  } catch (e) {}

  async function fetchCss(href) {
    try {
      const r = await fetch(href);
      if (!r.ok) return "";
      return await r.text();
    } catch { return ""; }
  }

  async function exportSvg(opts) {
    const sel = (opts && opts.target) || ".figure";
    const filename = (opts && opts.filename) || "figure";
    const node = document.querySelector(sel);
    if (!node) throw new Error("Cible introuvable: " + sel);

    const rect = node.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);

    // Inline all stylesheets so the SVG is self-contained.
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const cssBlobs = await Promise.all(links.map((l) => fetchCss(l.href)));
    // Also inline <style> tags in <head>.
    Array.from(document.querySelectorAll("head style")).forEach((s) => cssBlobs.push(s.textContent));
    const inlineCss = `
      html, body { background: transparent; margin: 0; padding: 0; }
      .figure { margin: 0 !important; box-shadow: none !important; }
    `;
    const fullCss = cssBlobs.join("\n") + "\n" + inlineCss;

    const clone = node.cloneNode(true);
    clone.style.margin = "0";
    const htmlSerialized = new XMLSerializer().serializeToString(clone);

    const svg =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
      `version="1.1" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n` +
      `<defs><style type="text/css"><![CDATA[\n${fullCss}\n]]></style></defs>\n` +
      `<foreignObject x="0" y="0" width="${width}" height="${height}">` +
      `<div xmlns="http://www.w3.org/1999/xhtml">${htmlSerialized}</div>` +
      `</foreignObject>\n` +
      `</svg>\n`;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename + ".svg";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  window.addSvgExportButton = function (opts) {
    if (/[?&]capture=1\b/.test(location.search)) { return; }
    const bar = document.createElement("div");
    bar.style.position = "fixed";
    bar.style.right = "16px";
    bar.style.bottom = "16px";
    bar.style.zIndex = "9999";
    bar.style.background = "white";
    bar.style.border = "1px solid #cbd5e1";
    bar.style.borderRadius = "8px";
    bar.style.padding = "6px 8px";
    bar.style.boxShadow = "0 4px 16px rgba(15,23,42,0.18)";
    bar.style.font = "13px/1.2 system-ui, sans-serif";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Exporter SVG";
    btn.style.font = "inherit";
    btn.style.padding = "6px 10px";
    btn.style.border = "1px solid #cbd5e1";
    btn.style.borderRadius = "6px";
    btn.style.background = "#eef2ff";
    btn.style.color = "#312e81";
    btn.style.cursor = "pointer";
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      const prev = btn.textContent;
      btn.textContent = "…";
      try {
        await exportSvg(opts);
        btn.textContent = "OK";
      } catch (e) {
        console.error(e);
        btn.textContent = "Erreur";
      }
      setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 1500);
    });
    bar.appendChild(btn);

    const append = () => document.body.appendChild(bar);
    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", append);
    } else { append(); }
  };

  window.exportSvg = exportSvg;
})();
