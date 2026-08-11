(function () {
  "use strict";

  var DATA = window.BD_EXEMPLES;
  var CLES = window.BD_EXEMPLES.cles || { pri: {}, uni: {}, fk: {} };
  var TABLE_NUM = {};

  function buildTableNumMap() {
    DATA.familles.forEach(function (famille) {
      famille.tables.forEach(function (table) {
        TABLE_NUM[table.nom] = table.num;
      });
    });
  }

  function cellKey(tableName, colName) {
    var pri = CLES.pri || {};
    var uni = CLES.uni || {};
    if (colName === "id") return "PRI";
    if (pri[tableName] && pri[tableName].indexOf(colName) !== -1) return "PRI";
    if (uni[tableName] && uni[tableName].indexOf(colName) !== -1) return "UNI";
    var key = tableName + ":" + colName;
    if ((CLES.fk || {}).hasOwnProperty(key)) return "FK:" + CLES.fk[key];
    return "";
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCell(value, tableName, colName) {
    if (value === null || value === undefined) {
      return '<td class="cell-null">NULL</td>';
    }
    var key = cellKey(tableName, colName);
    if (key.indexOf("FK:") === 0) {
      var target = key.slice(3);
      var num = TABLE_NUM[target];
      if (num) {
        return (
          '<td><a href="#table-' + num + '" class="cell-fk" data-fk="' +
          num +
          '">' +
          esc(value) +
          "</a></td>"
        );
      }
    }
    if (key === "PRI") {
      return '<td class="cell-pk">' + esc(value) + "</td>";
    }
    if (key === "UNI") {
      return '<td class="cell-uni">' + esc(value) + "</td>";
    }
    return "<td>" + esc(value) + "</td>";
  }

  function buildNav() {
    var nav = document.getElementById("nav");
    DATA.familles.forEach(function (famille) {
      var famEl = document.createElement("div");
      famEl.className = "nav-family";
      famEl.textContent = famille.nom;
      nav.appendChild(famEl);

      famille.tables.forEach(function (table) {
        var item = document.createElement("div");
        item.className = "nav-table";
        item.dataset.nom = table.nom;
        item.dataset.famille = famille.nom;
        item.innerHTML =
          '<a href="#table-' + table.num + '">' +
          "<span class=\"badge-count\">" + table.num + "</span> " +
          esc(table.nom) +
          "</a>";
        nav.appendChild(item);
      });
    });
  }

  function buildTableCard(famille, table) {
    var card = document.createElement("section");
    card.className = "table-card";
    card.id = "table-" + table.num;
    card.dataset.nom = table.nom;
    card.dataset.famille = famille.nom;

    var head = document.createElement("div");
    head.className = "table-head";
    head.innerHTML =
      '<div class="table-title"><span class="table-num">Table ' +
      table.num +
      "</span>&#9670; " +
      esc(table.nom) +
      "</div>" +
      '<div class="table-desc">' +
      esc(table.description) +
      "</div>";
    card.appendChild(head);

    var wrap = document.createElement("div");
    wrap.className = "table-wrap";

    var tableEl = document.createElement("table");
    var thead = document.createElement("thead");
    var headRow = document.createElement("tr");
    table.colonnes.forEach(function (col) {
      var th = document.createElement("th");
      th.textContent = col;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    tableEl.appendChild(thead);

    var tbody = document.createElement("tbody");
    table.lignes.forEach(function (ligne) {
      var tr = document.createElement("tr");
      ligne.forEach(function (cell, i) {
        tr.insertAdjacentHTML("beforeend", renderCell(cell, table.nom, table.colonnes[i]));
      });
      tbody.appendChild(tr);
    });
    tableEl.appendChild(tbody);
    wrap.appendChild(tableEl);
    card.appendChild(wrap);

    if (table.notes && table.notes.length) {
      var ul = document.createElement("ul");
      ul.className = "notes";
      ul.innerHTML = "<span class=\"notes-label\">Notes :</span> ";
      table.notes.forEach(function (note) {
        var li = document.createElement("li");
        li.textContent = note;
        ul.appendChild(li);
      });
      card.appendChild(ul);
    }

    return card;
  }

  function buildContent() {
    var content = document.getElementById("content");
    DATA.familles.forEach(function (famille) {
      var section = document.createElement("section");
      section.className = "family-section";
      section.dataset.famille = famille.nom;

      var title = document.createElement("h2");
      title.className = "family-title";
      title.textContent = famille.nom;
      section.appendChild(title);

      famille.tables.forEach(function (table) {
        section.appendChild(buildTableCard(famille, table));
      });

      content.appendChild(section);
    });
  }

  function flashTable(el) {
    el.classList.remove("flashing");
    void el.offsetWidth;
    el.classList.add("flashing");
    var done = function (event) {
      if (event.target !== el) return;
      el.classList.remove("flashing");
      el.removeEventListener("animationend", done);
    };
    el.addEventListener("animationend", done);
  }

  function scrollToTable(num) {
    var el = document.getElementById("table-" + num);
    if (!el) return;

    var header = document.querySelector(".page-header");
    var headerH = header ? header.getBoundingClientRect().height : 0;
    var offset = headerH + 14;

    var rect = el.getBoundingClientRect();
    var cardTopAbs = rect.top + window.scrollY;
    var cardH = rect.height;
    var available = window.innerHeight - offset;

    var top;
    if (cardH < available) {
      top = cardTopAbs - offset - (available - cardH) / 2;
    } else {
      top = cardTopAbs - offset;
    }
    top = Math.max(0, top);

    window.scrollTo({ top: top, behavior: "smooth" });
    if (window.history && history.replaceState) {
      history.replaceState(null, "", "#table-" + num);
    }

    var flashed = false;
    var doFlash = function () {
      if (flashed) return;
      flashed = true;
      window.removeEventListener("scrollend", doFlash);
      flashTable(el);
    };
    if ("onscrollend" in window) {
      window.addEventListener("scrollend", doFlash, { once: true });
    }
    setTimeout(doFlash, 450);
  }

  function bindNavClicks() {
    var nav = document.getElementById("nav");
    nav.addEventListener("click", function (event) {
      var link = event.target.closest('a[href^="#table-"]');
      if (!link) return;
      var num = link.getAttribute("href").replace("#table-", "");
      if (!/^\d+$/.test(num)) return;
      event.preventDefault();
      scrollToTable(num);
    });
  }

  function bindFkClicks() {
    var content = document.getElementById("content");
    content.addEventListener("click", function (event) {
      var link = event.target.closest("a.cell-fk");
      if (!link) return;
      var num = link.getAttribute("data-fk");
      if (!/^\d+$/.test(num)) return;
      event.preventDefault();
      scrollToTable(Number(num));
    });
  }

  function bindSearch() {
    var input = document.getElementById("search-input");
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var cards = document.querySelectorAll(".table-card");
      var navItems = document.querySelectorAll(".nav-table");
      var sections = document.querySelectorAll(".family-section");
      var anyVisible = false;

      sections.forEach(function (section) {
        var sectionVisible = false;
        section.querySelectorAll(".table-card").forEach(function (card) {
          var match =
            !q ||
            card.dataset.nom.toLowerCase().indexOf(q) !== -1 ||
            card.dataset.famille.toLowerCase().indexOf(q) !== -1;
          card.style.display = match ? "" : "none";
          if (match) sectionVisible = true;
        });
        section.style.display = sectionVisible ? "" : "none";
        if (sectionVisible) anyVisible = true;
      });

      navItems.forEach(function (item) {
        var match =
          !q ||
          item.dataset.nom.toLowerCase().indexOf(q) !== -1 ||
          item.dataset.famille.toLowerCase().indexOf(q) !== -1;
        item.style.display = match ? "" : "none";
      });

      var empty = document.getElementById("no-result");
      if (!anyVisible && q) {
        if (!empty) {
          empty = document.createElement("div");
          empty.id = "no-result";
          empty.className = "no-result";
          empty.textContent = "Aucune table ne correspond à « " + input.value + " ».";
          document.getElementById("content").appendChild(empty);
        }
      } else if (empty) {
        empty.remove();
      }
    });
  }

  function countTables() {
    return DATA.familles.reduce(function (acc, f) {
      return acc + f.tables.length;
    }, 0);
  }

  function init() {
    document.getElementById("page-title").textContent = DATA.titre;
    document.getElementById("page-subtitle").textContent = DATA.sousTitre;
    document.getElementById("page-source").textContent = DATA.source;
    document.getElementById("footer").textContent =
      countTables() + " tables — " + DATA.familles.length + " familles — données fictives, structure conforme au snapshot de la base";

    buildTableNumMap();
    buildNav();
    buildContent();
    bindSearch();
    bindNavClicks();
    bindFkClicks();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
