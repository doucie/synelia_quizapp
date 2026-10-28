#!/usr/bin/env python3
# Figure 1.3.1 : processus de recrutement AVANT SyneliaQuizApp (illustré, SVG autonome).
# Pictogrammes génériques dessinés ici (aucun logo de marque).
from xml.sax.saxutils import escape as esc

FONT = "Helvetica, Arial, sans-serif"
INK = "#1F2A37"
MUTED = "#5B6675"
BLUE = "#2F5D9E"
BLUE_LN = "#BFD0E8"
SAND = "#9A6B16"
SAND_LN = "#E3D3AE"
SLATE = "#4A5A70"
SLATE_LN = "#C9D1DC"
GREEN = "#3F7D6B"
AMBER = "#C0701A"
LINE = "#AEB8C6"
PAPER = "#9AA6B6"

W, H = 1100, 630
out = []
add = out.append


def g(x, y, body, s=1.0, rot=0):
    r = f" rotate({rot})" if rot else ""
    return f'<g transform="translate({x} {y}) scale({s}){r}">{body}</g>\n'


# ------------------------------------------------------------ pictogrammes
def person(c, dx=0, dy=0, sc=1.0):
    return (f'<g transform="translate({dx} {dy}) scale({sc})"><circle cx="0" cy="-11" r="10" fill="{c}"/>'
            f'<path d="M-19 20 C-19 5 -9 1 0 1 C9 1 19 5 19 20 Z" fill="{c}"/></g>')


def sheet(accent=PAPER, lines="#B9C2CE"):
    return (f'<path d="M-20 -26 H8 L20 -14 V26 H-20 Z" fill="#FFFFFF" stroke="{PAPER}" stroke-width="1.6" stroke-linejoin="round"/>'
            f'<path d="M8 -26 V-14 H20" fill="#EEF2F7" stroke="{PAPER}" stroke-width="1.6" stroke-linejoin="round"/>'
            f'<circle cx="-8" cy="-7" r="4.5" fill="{accent}"/>'
            f'<path d="M-14 6 H14 M-14 13 H14 M-14 20 H5" stroke="{lines}" stroke-width="2.2" stroke-linecap="round"/>')


def offer_sheet():
    return (f'<path d="M-20 -26 H8 L20 -14 V26 H-20 Z" fill="#FFFFFF" stroke="{BLUE}" stroke-width="1.8" stroke-linejoin="round"/>'
            f'<path d="M8 -26 V-14 H20" fill="#E4ECF8" stroke="{BLUE}" stroke-width="1.8" stroke-linejoin="round"/>'
            f'<path d="M-13 -12 H1" stroke="{BLUE}" stroke-width="3.2" stroke-linecap="round"/>'
            f'<path d="M-13 0 H13 M-13 8 H13 M-13 16 H4" stroke="#9DB6DB" stroke-width="2.2" stroke-linecap="round"/>')


def envelope(c):
    return (f'<rect x="-22" y="-15" width="44" height="30" rx="4" fill="#FFFFFF" stroke="{c}" stroke-width="2.2"/>'
            f'<path d="M-21 -13 L0 5 L21 -13" fill="none" stroke="{c}" stroke-width="2.2" stroke-linejoin="round"/>')


def network(c):
    return (f'<path d="M0 -9 L-17 12 M0 -9 L17 12 M-17 12 H17" stroke="{c}" stroke-width="2.2" fill="none"/>'
            f'<circle cx="0" cy="-9" r="7" fill="{c}"/><circle cx="-17" cy="12" r="7" fill="{c}"/><circle cx="17" cy="12" r="7" fill="{c}"/>')


def briefcase(c):
    return (f'<rect x="-22" y="-10" width="44" height="29" rx="4" fill="#FFFFFF" stroke="{c}" stroke-width="2.2"/>'
            f'<path d="M-9 -10 V-17 H9 V-10" fill="none" stroke="{c}" stroke-width="2.2" stroke-linejoin="round"/>'
            f'<path d="M-22 3 H22" stroke="{c}" stroke-width="2"/><rect x="-3.5" y="-1" width="7" height="9" rx="1.5" fill="{c}"/>')


def spreadsheet(c):
    return (f'<rect x="-22" y="-18" width="44" height="36" rx="3" fill="#FFFFFF" stroke="{c}" stroke-width="2"/>'
            f'<rect x="-22" y="-18" width="44" height="10" rx="3" fill="{c}"/>'
            f'<path d="M-22 1 H22 M-22 10 H22 M-7 -8 V18 M8 -8 V18" stroke="{c}" stroke-width="1.4"/>')


def form(c):
    s = f'<rect x="-18" y="-23" width="36" height="46" rx="4" fill="#FFFFFF" stroke="{c}" stroke-width="2"/>'
    for i, y in enumerate((-14, -2, 10)):
        s += f'<rect x="-11" y="{y}" width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="{c}" stroke-width="1.6"/>'
        s += f'<path d="M1 {y+4} H12" stroke="{c}" stroke-width="2" stroke-linecap="round"/>'
    s += f'<path d="M-9.5 -10 L-7.5 -7.5 L-4.5 -12.5" fill="none" stroke="{c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
    return s


def chat(c):
    return (f'<path d="M-24 -18 H4 Q10 -18 10 -12 V0 Q10 6 4 6 H-10 L-17 13 V6 H-24 Q-30 6 -30 0 V-12 Q-30 -18 -24 -18 Z" fill="{c}" transform="translate(3 -2)"/>'
            f'<path d="M-2 4 H20 Q26 4 26 10 V20 Q26 26 20 26 H17 V33 L9 26 H-2 Q-8 26 -8 20 V10 Q-8 4 -2 4 Z" fill="#FFFFFF" stroke="{c}" stroke-width="2" transform="translate(1 -9)"/>')


def decision():
    return (f'<path d="M-16 -23 H6 L17 -12 V23 H-16 Z" fill="#FFFFFF" stroke="{SLATE}" stroke-width="2" stroke-linejoin="round"/>'
            f'<path d="M6 -23 V-12 H17" fill="#EEF2F7" stroke="{SLATE}" stroke-width="2" stroke-linejoin="round"/>'
            f'<path d="M-9 -4 H9 M-9 3 H4" stroke="#B9C2CE" stroke-width="2" stroke-linecap="round"/>'
            f'<circle cx="8" cy="14" r="10" fill="{GREEN}" stroke="#FFFFFF" stroke-width="2"/>'
            f'<path d="M3 14 L7 18 L13 10" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>')


def badge(x, y, r, stroke, icon, s=0.85):
    return (f'<circle cx="{x}" cy="{y}" r="{r}" fill="#FFFFFF" stroke="{stroke}" stroke-width="1.8"/>\n'
            + g(x, y, icon, s))


def label(cx, y, title, sub=None):
    s = f'<text x="{cx}" y="{y}" text-anchor="middle" font-size="13" font-weight="700" fill="{INK}">{esc(title)}</text>\n'
    if sub:
        for i, ln in enumerate(sub if isinstance(sub, list) else [sub]):
            s += f'<text x="{cx}" y="{y+16+i*14}" text-anchor="middle" font-size="11.5" fill="{MUTED}">{esc(ln)}</text>\n'
    return s


def marker(n, x, y):
    return (f'<circle cx="{x}" cy="{y}" r="10.5" fill="{AMBER}"/>'
            f'<text x="{x}" y="{y+4.3}" text-anchor="middle" font-size="12" font-weight="700" fill="#FFFFFF">{n}</text>\n')


def curve(x1, y1, x2, y2, color=LINE, arrow="ah"):
    xm = (x1 + x2) / 2
    return (f'<path d="M{x1} {y1} C{xm} {y1} {xm} {y2} {x2} {y2}" fill="none" stroke="{color}" stroke-width="1.4" '
            f'marker-end="url(#{arrow})"/>\n')


# ------------------------------------------------------------ squelette
add(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="{FONT}" '
    f'role="img" aria-label="Processus de recrutement avant SyneliaQuizApp : diffusion multicanale, candidatures reçues, suivi réparti, évaluation et décision">\n')
add('<title>Processus de recrutement avant SyneliaQuizApp</title>\n')
add('<defs>'
    f'<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="{LINE}"/></marker>'
    f'<marker id="ab" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#8FB0DD"/></marker>'
    f'<marker id="am" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="{AMBER}"/></marker>'
    f'<marker id="as" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="{SLATE}"/></marker>'
    '</defs>\n')
add(f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>\n')
add('<rect x="20" y="64" width="1060" height="476" rx="16" fill="#F8FAFC" stroke="#E1E5EB" stroke-width="1.4"/>\n')


def arrow(x1, y1, x2, y2, color=LINE, mk="ah", curved=True):
    if curved and y1 != y2:
        xm = (x1 + x2) / 2
        d = f"M{x1} {y1} C{xm} {y1} {xm} {y2} {x2} {y2}"
    else:
        d = f"M{x1} {y1} L{x2} {y2}"
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="1.8" marker-end="url(#{mk})"/>\n'


def group_panel(x, y, w, h, stroke, fill="#FFFFFF"):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="{fill}" stroke="{stroke}" stroke-width="1.6"/>\n'


# colonnes
XA, XB, XC, XD, XE = 100, 330, 550, 780, 990
heads = [(XA, "Besoin"), (XB, "Diffusion multicanale"), (XC, "Candidatures reçues"),
         (XD, "Suivi réparti"), (XE, "Évaluation et décision")]
for cx, t in heads:
    add(f'<text x="{cx}" y="46" text-anchor="middle" font-size="14.5" font-weight="700" fill="{INK}">{esc(t)}</text>\n')

PY, PH = 92, 436          # hauteur commune des deux blocs
chan = [(160, "Email", "envoi direct", envelope(BLUE)),
        (295, "Réseaux professionnels", "publications", network(BLUE)),
        (430, "Plateformes d'emploi", "annonces en ligne", briefcase(BLUE))]
sheets = [(551, 150, -4), (549, 228, 3), (551, 306, -2), (549, 384, 4), (551, 462, -3)]
DUP = 2                    # indice de la feuille reçue par deux canaux
tools = [(150, "Boîtes mail", "pièces jointes", envelope(SAND)),
         (250, "Tableurs de suivi", "un fichier par recruteur", spreadsheet(SAND)),
         (350, "Formulaires externes", "tests et questionnaires", form(SAND)),
         (450, "Échanges informels", "messages, appels", chat(SAND))]
RECR_Y, OFFER_Y = 200, 345
EVAL_Y, DEC_Y = 205, 410

# --- blocs
add(group_panel(492, PY, 116, PH, BLUE_LN))
add(group_panel(688, PY, 184, PH, SAND_LN))

# --- liens
for (y, *_r) in chan:
    add(arrow(126, OFFER_Y - 6, XB - 36, y, "#8FB0DD", "ab"))
add(arrow(XA, RECR_Y + 84, XA, OFFER_Y - 36, "#8FB0DD", "ab", False))
# canaux -> pile de candidatures : trois flèches simples, la 2e et la 3e visent le même CV (doublon)
add(arrow(XB + 38, chan[0][0], 490, chan[0][0], LINE, "ah", False))
dx, dy, _ = sheets[DUP]
add(arrow(XB + 38, chan[1][0], 526, dy - 4, AMBER, "am"))
add(arrow(XB + 38, chan[2][0], 526, dy + 8, AMBER, "am"))
# une seule liaison entre blocs
add(arrow(610, 310, 686, 310, SLATE, "as", False))
add(arrow(874, 310, XE - 40, EVAL_Y, SLATE, "as"))
add(arrow(XE, EVAL_Y + 100, XE, DEC_Y - 40, SLATE, "as", False))

# --- colonne A
add(badge(XA, RECR_Y, 34, BLUE_LN, person(BLUE), 0.95))
add(label(XA, RECR_Y + 53, "Recruteur", "équipe RH"))
add(g(XA, OFFER_Y, offer_sheet(), 1.0))
add(label(XA, OFFER_Y + 46, "Offre de poste", "rédigée puis rediffusée"))

# --- colonne B
for y, t, sub, icon in chan:
    add(badge(XB, y, 34, BLUE_LN, icon, 0.9))
    add(label(XB, y + 52, t, sub))

# --- colonne C : pile de CV, un seul reçu deux fois
for i, (sx, sy, rot) in enumerate(sheets):
    if i == DUP:
        add(f'<rect x="{sx-30}" y="{sy-34}" width="60" height="68" rx="10" fill="#FDF3E4" stroke="{AMBER}" stroke-width="1.6"/>\n')
        add(g(sx, sy, sheet(AMBER, "#E3B988"), 1.0, rot))
        add(f'<rect x="{sx+10}" y="{sy+16}" width="28" height="18" rx="9" fill="{AMBER}"/>'
            f'<text x="{sx+24}" y="{sy+29}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#FFFFFF">×2</text>\n')
    else:
        add(g(sx, sy, sheet(), 1.0, rot))
add(marker(1, 606, 96))

# --- colonne D : outils éclatés dans un même bloc
for y, t, sub, icon in tools:
    add(badge(XD, y, 30, SAND_LN, icon, 0.82))
    add(label(XD, y + 46, t, sub))
add(marker(2, 866, 96))

# --- colonne E
ev = person(SLATE, -11, 0, 0.82) + person("#7D8BA0", 12, 5, 0.72)
add(badge(XE, EVAL_Y, 36, SLATE_LN, ev, 1.0))
add(label(XE, EVAL_Y + 58, "Plusieurs évaluateurs", ["entretiens, grilles", "et critères propres"]))
add(marker(3, XE + 36, EVAL_Y - 34))
add(badge(XE, DEC_Y, 36, SLATE_LN, decision(), 1.0))
add(label(XE, DEC_Y + 58, "Décision", ["communiquée avec plus", "ou moins de formalisation"]))

# --- légende
add(f'<text x="40" y="568" font-size="12" font-weight="700" fill="{MUTED}" letter-spacing="0.8">POINTS D\'ATTENTION</text>\n')
legend = [(1, 40, "Un même candidat peut arriver par plusieurs canaux"),
          (2, 400, "Informations réparties entre mails, tableurs et échanges"),
          (3, 760, "Critères et formats propres à chaque intervenant")]
for n, x, t in legend:
    add(marker(n, x + 11, 596))
    add(f'<text x="{x+30}" y="600" font-size="12.5" fill="{INK}">{esc(t)}</text>\n')

add('</svg>\n')
open("fig_1_3_1_processus_avant.svg", "w", encoding="utf-8").write("".join(out))
print("écrit fig_1_3_1_processus_avant.svg")
