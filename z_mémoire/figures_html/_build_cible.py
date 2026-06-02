# -*- coding: utf-8 -*-
"""
Génère les variantes "cible" (post-migration 420) des figures MCD / MLD / MPD
à partir des fichiers existants, en supprimant les marqueurs added/deleted et
les libellés relatifs aux deltas, tout en conservant le design, les fonctions
JS, la classe `entity pivot` et la classe `entity new` (mais sans badge ::after).

Convention d'entrée : les fichiers mcd.html, mld.html, mpd.html portent des
<li class="added"> (nouvelles colonnes) et <li class="deleted"> (anciennes
colonnes), ainsi que des marqueurs <span class="key new">+</span> /
<span class="key new">+FK</span> et <span class="key del">−...</span>.

Convention de sortie :
- chaque <li class="deleted"> est entièrement retiré ;
- chaque <li class="added"> devient un <li> normal,
  <span class="key new">+FK</span> est remplacé par <span class="key fk">FK</span>,
  <span class="key new">+</span> est supprimé ;
- la <body> reçoit la classe `target-view` pour neutraliser le badge ::after
  des entités `entity new` (via styles.css) ;
- titre, sous-titre et figure-caption sont adaptés pour décrire l'état cible
  et non plus le diff de migration.
"""

from __future__ import annotations
import re
from pathlib import Path

HERE = Path(__file__).parent

PAIRS = [
    ("mcd.html", "mcd_cible.html"),
    ("mld.html", "mld_cible.html"),
    ("mpd.html", "mpd_cible.html"),
]

# ── Patterns ────────────────────────────────────────────────────────────────

# <li class="deleted"> ... </li>  (avec ou sans espaces autour)
RE_LI_DELETED = re.compile(
    r'[ \t]*<li class="deleted">.*?</li>\s*\n',
    re.DOTALL,
)

# class="added" sur un <li>
RE_LI_ADDED_CLASS = re.compile(r'<li class="added">')

# +FK marker → FK
RE_KEY_NEW_FK = re.compile(r'<span class="key new">\+FK</span>')
# bare + marker → drop
RE_KEY_NEW_PLUS = re.compile(r'<span class="key new">\+</span>')

# body opener
RE_BODY = re.compile(r'<body>')

# Adaptations textuelles spécifiques (sous-titre et caption)
TEXT_REPLACEMENTS = [
    # MCD
    (
        "Entités métier cibles après application de l'évolution\n"
        "          <code>420-evolution-pipeline-multi-occurrences</code>.\n"
        "          Les entités en vert sont nouvelles, les attributs barrés sont supprimés\n"
        "          et les attributs verts sont ajoutés.",
        "État cible après application de l'évolution\n"
        "          <code>420-evolution-pipeline-multi-occurrences</code>.\n"
        "          Les entités introduites par la migration restent surlignées en vert.\n"
        "          Aucun delta n'est représenté : seul le schéma cible est affiché.",
    ),
    (
        "Figure 1 — MCD cible du module recrutement\n"
        "        (entités, cardinalités, rounds repétables et grille d'évaluation mutualisée).",
        "Figure 1 — MCD cible (post-420) du module recrutement\n"
        "        (entités, cardinalités, rounds répétables et grille d'évaluation mutualisée).",
    ),
    # MLD
    (
        "Traduction relationnelle cible : tables, clés primaires (PK) et étrangères (FK)\n"
        "          du module recrutement après évolution multi-occurrences.",
        "Traduction relationnelle cible : tables, clés primaires (PK) et étrangères (FK)\n"
        "          du module recrutement après évolution multi-occurrences.\n"
        "          Les tables introduites par la migration 420 sont surlignées en vert.",
    ),
    (
        "Figure 2 — MLD relationnel cible. Les colonnes vertes sont ajoutées par l'évolution 420,\n"
        "        les barrées sont supprimées.",
        "Figure 2 — MLD relationnel cible (post-420). Aucun delta n'est représenté ;\n"
        "        seules les tables nouvelles sont marquées en vert.",
    ),
    # MPD
    (
        "Schéma MySQL 8 cible. Colonnes d'audit communes",
        "Schéma MySQL 8 cible (post-migration 420). Colonnes d'audit communes",
    ),
    (
        "Figure 3 — MPD cible MySQL 8. Les colonnes vertes sont introduites par l'évolution 420.",
        "Figure 3 — MPD cible MySQL 8 (post-420). Les tables nouvelles sont marquées en vert.",
    ),
]

# Adaptations spécifiques pour MLD candidate_answer et MPD candidate_answer :
# une fois la migration appliquée, application_quiz_attempt_id est un FK normal.
EXTRA_REPLACEMENTS = [
    # MLD : "+FK" déjà géré par regex
    # Rien de plus pour le moment.
]


def transform(html: str) -> str:
    # 1) Supprimer les <li class="deleted">…</li>
    html = RE_LI_DELETED.sub("", html)

    # 2) Neutraliser class="added"
    html = RE_LI_ADDED_CLASS.sub("<li>", html)

    # 3) +FK → FK normal
    html = RE_KEY_NEW_FK.sub('<span class="key fk">FK</span>', html)

    # 4) Bare + marker → enlever le span entièrement
    html = RE_KEY_NEW_PLUS.sub("", html)

    # 5) Marquer le body pour le mode "cible"
    html = RE_BODY.sub('<body class="target-view">', html, count=1)

    # 6) Adapter les libellés
    for old, new in TEXT_REPLACEMENTS:
        html = html.replace(old, new)

    return html


def adapt_title(html: str, source_name: str) -> str:
    # Préfixe les <title> et le <h1> pour annoncer la version cible
    if source_name == "mcd.html":
        html = html.replace("<title>MCD — SyneliaQuizApp</title>",
                            "<title>MCD cible (post-420) — SyneliaQuizApp</title>")
        html = html.replace("<h1>Modèle Conceptuel de Données (MCD)</h1>",
                            "<h1>MCD cible — Modèle Conceptuel de Données (post-420)</h1>")
    elif source_name == "mld.html":
        html = html.replace("<title>MLD / MLDR — SyneliaQuizApp</title>",
                            "<title>MLD / MLDR cible (post-420) — SyneliaQuizApp</title>")
        html = html.replace("<h1>Modèle Logique de Données Relationnel (MLD / MLDR)</h1>",
                            "<h1>MLD / MLDR cible — Modèle Logique Relationnel (post-420)</h1>")
    elif source_name == "mpd.html":
        html = html.replace("<title>MPD — SyneliaQuizApp</title>",
                            "<title>MPD cible (post-420) — SyneliaQuizApp</title>")
        html = html.replace("<h1>Modèle Physique de Données (MPD)</h1>",
                            "<h1>MPD cible — Modèle Physique MySQL 8 (post-420)</h1>")
    return html


def main() -> None:
    for src, dst in PAIRS:
        src_path = HERE / src
        dst_path = HERE / dst
        raw = src_path.read_text(encoding="utf-8")
        out = transform(raw)
        out = adapt_title(out, src)
        dst_path.write_text(out, encoding="utf-8")
        print(f"[ok] {dst_path.name}")


if __name__ == "__main__":
    main()
