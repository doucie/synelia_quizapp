#!/usr/bin/env python3
# Figure 1.2.1 : objectifs généraux de SyneliaQuizApp (socle + deux piliers), SVG autonome.
from xml.sax.saxutils import escape as esc

FONT = "Helvetica, Arial, sans-serif"
INK = "#1F2A37"
MUTED = "#5B6675"
BLUE, BLUE_LN, BLUE_BG = "#2F5D9E", "#BFD0E8", "#EAF1FA"
GREEN, GREEN_LN, GREEN_BG = "#3F7D6B", "#BCD8CF", "#E9F3EF"
PURPLE, PURPLE_LN, PURPLE_BG = "#7A4E9E", "#D6C6E4", "#F1EBF7"
SAND, SAND_LN = "#9A6B16", "#E3D3AE"
PAPER = "#9AA6B6"
GREYBAR = "#E4E8EE"

W, H = 1100, 690
out = []
add = out.append


# ------------------------------------------------------------ primitives
def g(x, y, body, s=1.0, rot=0):
    r = f" rotate({rot})" if rot else ""
    return f'<g transform="translate({x} {y}) scale({s}){r}">{body}</g>\n'


def T(x, y, t, size=14, weight=400, fill=INK, anchor="start", style=""):
    return (f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" '
            f'text-anchor="{anchor}"{style}>{esc(t)}</text>\n')


def person(c, dx=0, dy=0, sc=1.0):
    return (f'<g transform="translate({dx} {dy}) scale({sc})"><circle cx="0" cy="-11" r="10" fill="{c}"/>'
            f'<path d="M-19 20 C-19 5 -9 1 0 1 C9 1 19 5 19 20 Z" fill="{c}"/></g>')


def sheet(accent=PAPER, lines="#B9C2CE"):
    return (f'<path d="M-20 -26 H8 L20 -14 V26 H-20 Z" fill="#FFFFFF" stroke="{PAPER}" stroke-width="1.6" stroke-linejoin="round"/>'
            f'<path d="M8 -26 V-14 H20" fill="#EEF2F7" stroke="{PAPER}" stroke-width="1.6" stroke-linejoin="round"/>'
            f'<circle cx="-8" cy="-7" r="4.5" fill="{accent}"/>'
            f'<path d="M-14 6 H14 M-14 13 H14 M-14 20 H5" stroke="{lines}" stroke-width="2.2" stroke-linecap="round"/>')


def envelope(c):
    return (f'<rect x="-22" y="-15" width="44" height="30" rx="4" fill="#FFFFFF" stroke="{c}" stroke-width="2.2"/>'
            f'<path d="M-21 -13 L0 5 L21 -13" fill="none" stroke="{c}" stroke-width="2.2" stroke-linejoin="round"/>')


def network(c):
    return (f'<path d="M0 -9 L-17 12 M0 -9 L17 12 M-17 12 H17" stroke="{c}" stroke-width="2.2" fill="none"/>'
            f'<circle cx="0" cy="-9" r="7" fill="{c}"/><circle cx="-17" cy="12" r="7" fill="{c}"/><circle cx="17" cy="12" r="7" fill="{c}"/>')


def spreadsheet(c):
    return (f'<rect x="-22" y="-18" width="44" height="36" rx="3" fill="#FFFFFF" stroke="{c}" stroke-width="2"/>'
            f'<rect x="-22" y="-18" width="44" height="10" rx="3" fill="{c}"/>'
            f'<path d="M-22 1 H22 M-22 10 H22 M-7 -8 V18 M8 -8 V18" stroke="{c}" stroke-width="1.4"/>')


def form(c):
    s = f'<rect x="-18" y="-23" width="36" height="46" rx="4" fill="#FFFFFF" stroke="{c}" stroke-width="2"/>'
    for y in (-14, -2, 10):
        s += f'<rect x="-11" y="{y}" width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="{c}" stroke-width="1.6"/>'
        s += f'<path d="M1 {y+4} H12" stroke="{c}" stroke-width="2" stroke-linecap="round"/>'
    s += f'<path d="M-9.5 -10 L-7.5 -7.5 L-4.5 -12.5" fill="none" stroke="{c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
    return s


def chat(c):
    return (f'<path d="M-24 -18 H4 Q10 -18 10 -12 V0 Q10 6 4 6 H-10 L-17 13 V6 H-24 Q-30 6 -30 0 V-12 Q-30 -18 -24 -18 Z" fill="{c}" transform="translate(3 -2)"/>'
            f'<path d="M-2 4 H20 Q26 4 26 10 V20 Q26 26 20 26 H17 V33 L9 26 H-2 Q-8 26 -8 20 V10 Q-8 4 -2 4 Z" fill="#FFFFFF" stroke="{c}" stroke-width="2" transform="translate(1 -9)"/>')


def key(c):
    return (f'<circle cx="-10" cy="0" r="8" fill="none" stroke="{c}" stroke-width="2.8"/>'
            f'<path d="M-2 0 H17 M11 0 V8 M17 0 V6" fill="none" stroke="{c}" stroke-width="2.8" stroke-linecap="round"/>')


def clock(c):
    return (f'<circle cx="0" cy="0" r="15" fill="#FFFFFF" stroke="{c}" stroke-width="2.6"/>'
            f'<path d="M0 -8 V0 H7" fill="none" stroke="{c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>')


def calendar(c):
    return (f'<rect x="-16" y="-14" width="32" height="30" rx="4" fill="#FFFFFF" stroke="{c}" stroke-width="2.2"/>'
            f'<rect x="-16" y="-14" width="32" height="9" rx="3" fill="{c}"/>'
            f'<path d="M-8 -18 V-11 M8 -18 V-11" stroke="{c}" stroke-width="2.6" stroke-linecap="round"/>'
            f'<path d="M-7 5 L-2 10 L8 0" fill="none" stroke="{c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>')


def balance(c):
    return (f'<path d="M0 -16 V13 M-9 14 H9 M-17 -10 H17" stroke="{c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
            f'<path d="M-17 -10 L-22 3 M-17 -10 L-12 3 M17 -10 L12 3 M17 -10 L22 3" stroke="{c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
            f'<path d="M-23 3 H-11 M11 3 H23" stroke="{c}" stroke-width="2.6" stroke-linecap="round"/>')


def hand_check(c):
    return person(c, -3, 1, 0.78) + (f'<circle cx="11" cy="11" r="9" fill="{c}" stroke="#FFFFFF" stroke-width="2"/>'
                                     '<path d="M6.5 11 L10 14.5 L15.5 7.5" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>')


def badge(x, y, r, stroke, icon, s=0.85, fill="#FFFFFF"):
    return (f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="1.8"/>\n' + g(x, y, icon, s))


def tick(x, y, r, color):
    return (f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}"/>'
            f'<path d="M{x-r*0.45} {y} L{x-r*0.1} {y+r*0.38} L{x+r*0.5} {y-r*0.35}" fill="none" stroke="#FFFFFF" '
            f'stroke-width="{r*0.22}" stroke-linecap="round" stroke-linejoin="round"/>\n')


def panel(x, y, w, h, color, line, num, title):
    p = (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="#FFFFFF" stroke="{line}" stroke-width="1.8"/>\n'
         f'<path d="M{x+16} {y} H{x+w-16} A16 16 0 0 1 {x+w} {y+16} V{y+46} H{x} V{y+16} A16 16 0 0 1 {x+16} {y} Z" fill="{color}"/>\n'
         f'<circle cx="{x+30}" cy="{y+23}" r="13" fill="#FFFFFF"/>'
         f'<text x="{x+30}" y="{y+28.5}" text-anchor="middle" font-size="15" font-weight="700" fill="{color}">{num}</text>\n')
    return p + T(x + 54, y + 29, title, 17, 700, "#FFFFFF")


def item(x, y, icon_x, icon, color_ln, title, sub, text_x, ts=0.8, r=20):
    return (badge(icon_x, y, r, color_ln, icon, ts) + T(text_x, y - 2, title, 14, 700) + T(text_x, y + 15, sub, 12, 400, MUTED))


# ------------------------------------------------------------ squelette
add(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="{FONT}" '
    'role="img" aria-label="Objectifs généraux de SyneliaQuizApp : digitaliser le recrutement, automatiser l\'évaluation technique, améliorer la collaboration interne">\n')
add('<title>Objectifs généraux de SyneliaQuizApp</title>\n')
add(f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>\n')
add('<rect x="12" y="12" width="1076" height="666" rx="18" fill="#F8FAFC" stroke="#E1E5EB" stroke-width="1.4"/>\n')

# ============================================================ pilier 2 : automatiser
AX, AY, AW, AH = 30, 30, 508, 300
add(panel(AX, AY, AW, AH, GREEN, GREEN_LN, 2, "Automatiser l'évaluation technique"))
cx = 135
add(T(cx, 100, "Candidatures", 12, 700, MUTED, "middle"))
for i in range(5):
    add(person(PAPER, cx - 60 + i * 30, 126, 0.55) + "\n")
add(f'<polygon points="{cx-80},152 {cx+80},152 {cx+16},207 {cx+16},234 {cx-16},234 {cx-16},207" fill="{GREEN_BG}" stroke="{GREEN}" stroke-width="2" stroke-linejoin="round"/>\n')
add(g(cx, 178, form(GREEN), 0.62))
for i in range(3):
    add(person(GREEN, cx - 30 + i * 30, 266, 0.6) + "\n")
add(tick(cx + 62, 266, 10, GREEN))
add(T(cx, 306, "Profils préqualifiés", 12, 700, MUTED, "middle"))
ix, tx = 270, 302
add(item(0, 120, ix, form(GREEN), GREEN_LN, "Quiz configurable", "intégré à la plateforme", tx))
add(item(0, 190, ix, balance(GREEN), GREEN_LN, "Préqualification homogène", "mêmes critères pour tous", tx))
add(item(0, 260, ix, hand_check(GREEN), GREEN_LN, "Appui au jugement humain", "il ne le remplace pas", tx))

# ============================================================ pilier 3 : collaborer
BX, BY, BW, BH = 562, 30, 508, 300
add(panel(BX, BY, BW, BH, PURPLE, PURPLE_LN, 3, "Améliorer la collaboration interne"))
dcx, dcy = 672, 196
add(T(dcx, 100, "Espace partagé", 12, 700, MUTED, "middle"))
av = [(612, 134, PURPLE), (732, 134, BLUE), (672, 286, GREEN)]
for ax_, ay_, _c in av:
    tx_, ty_ = (dcx, dcy + (36 if ay_ > dcy else -36)) if ax_ == dcx else (dcx + (-26 if ax_ < dcx else 26), dcy - 32)
    add(f'<path d="M{ax_} {ay_} L{tx_} {ty_}" stroke="{PURPLE_LN}" stroke-width="2" stroke-dasharray="5 4"/>\n')
add(g(dcx, dcy, sheet(PURPLE, "#CDB9DE"), 1.3))
for ax_, ay_, c in av:
    add(badge(ax_, ay_, 25, PURPLE_LN, person(c, 0, 2, 0.8), 1.0))
ix2, tx2 = 818, 846
add(item(0, 112, ix2, network(PURPLE), PURPLE_LN, "Informations partagées", "utiles à tous les acteurs", tx2, 0.72, 18))
add(item(0, 169, ix2, key(PURPLE), PURPLE_LN, "Droits adaptés", "selon le rôle de chacun", tx2, 0.72, 18))
add(item(0, 226, ix2, clock(PURPLE), PURPLE_LN, "Interventions suivies", "actions de chacun visibles", tx2, 0.72, 18))
add(item(0, 283, ix2, calendar(PURPLE), PURPLE_LN, "Décisions coordonnées", "évaluations, entretiens, décisions", tx2, 0.72, 18))

# ============================================================ appuis (les piliers reposent sur le socle)
for x in (284, 816):
    add(f'<path d="M{x-14} 354 L{x} 340 L{x+14} 354" fill="none" stroke="{BLUE}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>\n')

# ============================================================ socle : digitaliser
SX, SY, SW, SH = 30, 362, 1040, 290
add(panel(SX, SY, SW, SH, BLUE, BLUE_LN, 1, "Digitaliser le processus de recrutement"))
add(f'<rect x="868" y="{SY+12}" width="172" height="22" rx="11" fill="#FFFFFF" opacity="0.22"/>\n')
add(T(954, SY + 27.5, "Socle · objectif principal", 12, 700, "#FFFFFF", "middle"))

# gauche : logique éclatée
add(T(190, 440, "Logique éclatée", 14, 700, INK, "middle"))
pts = [(92, 492), (190, 478), (288, 500), (135, 566), (245, 574)]
for a, b in ((0, 1), (1, 2), (0, 3), (2, 4), (3, 4)):
    add(f'<path d="M{pts[a][0]} {pts[a][1]} L{pts[b][0]} {pts[b][1]}" stroke="#C9CFD8" stroke-width="1.6" stroke-dasharray="4 5"/>\n')
icons = [envelope(SAND), spreadsheet(SAND), chat(SAND), form(SAND), sheet(SAND, "#D9C28F")]
for (px, py), ic in zip(pts, icons):
    add(badge(px, py, 27, SAND_LN, ic, 0.72))
add(T(190, 630, "outils et fichiers dispersés", 12, 400, MUTED, "middle"))

# flèche de transformation
add(T(386, 514, "Centraliser", 13, 700, BLUE, "middle"))
add(f'<path d="M340 536 H412" stroke="{BLUE}" stroke-width="5" stroke-linecap="round"/>'
    f'<path d="M408 520 L434 536 L408 552 Z" fill="{BLUE}" stroke="{BLUE}" stroke-width="2" stroke-linejoin="round"/>\n')

# droite : fenêtre de plateforme
WX, WY, WW, WH = 446, 452, 282, 170
add(T(WX + WW / 2, 440, "Plateforme web centralisée", 14, 700, INK, "middle"))
add(f'<rect x="{WX}" y="{WY}" width="{WW}" height="{WH}" rx="12" fill="#FFFFFF" stroke="{BLUE_LN}" stroke-width="1.8"/>\n')
add(f'<path d="M{WX+12} {WY} H{WX+WW-12} A12 12 0 0 1 {WX+WW} {WY+12} V{WY+28} H{WX} V{WY+12} A12 12 0 0 1 {WX+12} {WY} Z" fill="{BLUE_BG}"/>\n')
for i, c in enumerate(("#E58A7E", "#E9C46A", "#8CC5A0")):
    add(f'<circle cx="{WX+16+i*14}" cy="{WY+14}" r="4" fill="{c}"/>')
add(f'<rect x="{WX+68}" y="{WY+7}" width="{WW-84}" height="14" rx="7" fill="#FFFFFF" stroke="{BLUE_LN}" stroke-width="1.2"/>\n')
steps = ["Candidature", "Quiz", "Entretien", "Décision"]
sx0, sp, sy_ = WX + 40, 67, WY + 72
for i in range(3):
    col = BLUE if i < 2 else GREYBAR
    add(f'<path d="M{sx0+i*sp+14} {sy_} H{sx0+(i+1)*sp-14}" stroke="{col}" stroke-width="3" stroke-linecap="round"/>')
for i, s_ in enumerate(steps):
    x = sx0 + i * sp
    if i < 2:
        add(tick(x, sy_, 13, BLUE))
    elif i == 2:
        add(f'<circle cx="{x}" cy="{sy_}" r="13" fill="#FFFFFF" stroke="{BLUE}" stroke-width="3.2"/><circle cx="{x}" cy="{sy_}" r="5" fill="{BLUE}"/>')
    else:
        add(f'<circle cx="{x}" cy="{sy_}" r="13" fill="{GREYBAR}"/>')
    add(T(x, sy_ + 31, s_, 10.5, 700 if i == 2 else 400, INK if i <= 2 else MUTED, "middle"))
add(T(WX + 16, WY + 140, "Avancement du parcours", 10.5, 400, MUTED))
add(f'<rect x="{WX+16}" y="{WY+147}" width="{WW-32}" height="8" rx="4" fill="{GREYBAR}"/>'
    f'<rect x="{WX+16}" y="{WY+147}" width="{(WW-32)*0.6}" height="8" rx="4" fill="{BLUE}"/>\n')

# résultats attendus
outs = [("Manipulations manuelles réduites", "un seul outil au lieu de plusieurs"),
        ("Échanges structurés", "circuits et statuts définis"),
        ("Étapes du parcours visibles", "pour l'équipe et pour le candidat")]
for i, (t, s_) in enumerate(outs):
    y = 488 + i * 56
    add(tick(776, y, 12, BLUE))
    add(T(802, y - 1, t, 14, 700))
    add(T(802, y + 16, s_, 12, 400, MUTED))

add('</svg>\n')
open("fig_1_2_1_objectifs.svg", "w", encoding="utf-8").write("".join(out))
print("écrit fig_1_2_1_objectifs.svg")
