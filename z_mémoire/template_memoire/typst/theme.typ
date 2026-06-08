#let palette = (
  ink: rgb("#1a202c"),
  muted: rgb("#4a5568"),
  primary: rgb("#1a365d"),
  secondary: rgb("#2c5282"),
  accent: rgb("#3182ce"),
  accent_soft: rgb("#f7fafc"),
  line: rgb("#cbd5e0"),
)

// Polices livrées avec Typst : toujours disponibles et bien rendues
// (pas de fonte variable, donc pas de warning ni de rendu dégradé).
#let body_fonts = ("Libertinus Serif", "Georgia", "Times New Roman")
#let display_fonts = body_fonts
#let sans_fonts = display_fonts

#let page-footer(numbering, italic: false) = context [
  #set text(font: body_fonts, size: 9pt, fill: palette.muted, weight: "regular")
  #set par(first-line-indent: 0pt, justify: false)
  #let total = counter(page).final().first()
  #grid(
    columns: (1fr, 1fr, 1fr),
    gutter: 1em,
    align(left + horizon)[
      Mémoire de fin d'études — ENSIT
    ],
    align(center + horizon)[
      #if italic [
        #emph[Page #counter(page).display(numbering) / #total]
      ] else [
        Page #counter(page).display(numbering) / #total
      ]
    ],
    align(right + horizon)[
      SyneliaQuizApp
    ],
  )
]

#let body-header = [
  #set text(font: body_fonts, size: 8pt, fill: palette.muted)
  #set par(first-line-indent: 0pt, justify: false)
  #align(right)[
    SyneliaQuizApp — Mémoire d'ingénieur — #emph[ENSIT 2026]
  ]
  #v(0.2em)
  #line(length: 100%, stroke: 0.4pt + palette.line)
]

#let document-table(..args) = block(above: 1.1em, below: 1.25em)[
  #table(..args)
]

#let title-panel(title, width: 84%, size: 16pt, fill: white, ink: palette.primary) = block(
  width: width,
  inset: (x: 14pt, y: 12pt),
  radius: 4pt,
  fill: fill,
  stroke: (paint: palette.line, thickness: 0.65pt),
)[
  #set par(first-line-indent: 0pt, justify: false, leading: 0.95em)
  #set text(font: display_fonts)
  #text(size: size, weight: "semibold", fill: ink)[#title]
]

// ===========================================================================
//  TEMPLATE : enrobe tout le document pour appliquer set/show globalement.
//  À appeler dans main.typ via : #show: template
// ===========================================================================

#let template(body) = {

  set text(
    lang: "fr",
    font: body_fonts,
    size: 12.5pt,
    fill: palette.ink,
  )

  set page(
    paper: "a4",
    margin: (top: 2.6cm, bottom: 2.5cm, x: 2.6cm),
    numbering: "1",
    footer: page-footer("1"),
  )

  set par(
    justify: true,
    leading: 0.88em,
    spacing: 1.28em,
    first-line-indent: 0pt,
  )

  set list(
    marker: ([•], [◦], [▪]),
    indent: 1.2em,
    body-indent: 0.55em,
    spacing: 0.55em,
  )

  set enum(
    indent: 1.2em,
    body-indent: 0.55em,
    spacing: 0.55em,
  )

  set table(
    inset: (x: 11pt, y: 12pt),
    stroke: (paint: palette.line, thickness: 0.6pt),
    align: left + horizon,
    fill: (x, y) => if y == 0 {
      palette.primary
    } else if calc.even(y) {
      palette.accent_soft
    } else {
      white
    },
  )

  // Niveau 1 = chapitre ("1"), niveau 2 = section ("1.1"),
  // niveau 3 = sous-section ("1.1.1").
  set heading(numbering: "1.1.1.")

  show table.cell: set text(size: 10.5pt)
  show table.cell: set par(first-line-indent: 0pt, justify: false, spacing: 0.45em)
  show table.cell.where(y: 0): set text(fill: white, weight: "semibold", size: 10.5pt)

  show link: it => underline(stroke: 0.4pt + palette.accent, offset: 2pt, it)

  // Niveau 1 : chapitre. Saut de page, sur-titre "CHAPITRE N", titre fort.
  show heading.where(level: 1): it => {
    set text(font: display_fonts)
    if it.numbering == none {
      block(above: 1.8em, below: 1.6em)[
        #set par(first-line-indent: 0pt, justify: false)
        #text(size: 22.5pt, weight: "bold", fill: palette.primary)[#it.body]
        #v(0.45em)
        #line(length: 100%, stroke: 0.85pt + palette.primary)
      ]
    } else {
      pagebreak(weak: true)
      block(above: 1.2em, below: 1.8em)[
        #text(
          size: 11pt,
          weight: "semibold",
          fill: palette.secondary,
          tracking: 0.18em,
        )[CHAPITRE #counter(heading).display("1")]
        #v(0.5em)
        #text(size: 26pt, weight: "bold", fill: palette.primary)[#it.body]
        #v(0.6em)
        #line(length: 100%, stroke: 0.8pt + palette.primary)
      ]
    }
  }

  // Niveau 2 : section, numérotée "1.1"
  show heading.where(level: 2): it => block(above: 1.8em, below: 0.9em)[
    #set par(first-line-indent: 0pt, justify: false)
    #set text(font: display_fonts, size: 15pt, weight: "bold", fill: palette.primary)
    #if it.numbering != none [
      #counter(heading).display("1.1") #h(0.55em)
    ]
    #it.body
  ]

  // Niveau 3 : sous-section, numérotée "1.1.1"
  show heading.where(level: 3): it => block(above: 1.7em, below: 0.55em)[
    #set par(first-line-indent: 0pt, justify: false)
    #set text(font: display_fonts, size: 12.5pt, weight: "bold", fill: palette.secondary)
    #if it.numbering != none [
      #counter(heading).display("1.1.1") #h(0.45em)
    ]
    #it.body
  ]

  // Niveau 4 : paragraphe titré, en italique
  show heading.where(level: 4): it => block(above: 1.0em, below: 0.4em)[
    #set par(first-line-indent: 0pt, justify: false)
    #set text(size: 11.5pt, weight: "semibold", style: "italic", fill: palette.ink)
    #if it.numbering != none [
      #counter(heading).display("1.1.1.1") #h(0.4em)
    ]
    #it.body
  ]

  // Espacement après les légendes de figure
  show figure.caption: set block(below: 0.7em)

  body
}

#let front-heading(title) = block(above: 1.2em, below: 1.6em)[
  #set par(first-line-indent: 0pt, justify: false)
  #text(size: 22.5pt, weight: "bold", fill: palette.primary)[#title]
  #v(0.45em)
  #line(length: 100%, stroke: 0.85pt + palette.primary)
]

#let top-heading(title, outlined: true) = heading(level: 1, numbering: none, outlined: outlined)[#title]

#let note-box(title, body) = block(
  width: 100%,
  inset: 12pt,
  radius: 7pt,
  fill: palette.accent_soft,
  stroke: (paint: palette.line, thickness: 0.6pt),
  below: 1.2em,
)[
  #set par(first-line-indent: 0pt)
  #text(size: 9pt, weight: "semibold", fill: palette.accent)[#smallcaps[#title]]
  #v(0.3em)
  #body
]

#let cover-page(meta) = [
  #set par(first-line-indent: 0pt, justify: false)
  #align(center)[
    // ── Logos en-tête ──
    #grid(
      columns: (1fr, 1fr, 1fr),
      gutter: 1em,
      [
        #align(left)[
          #image("../../figures_html/captures/to use/logo-ensit.png", height: 1.6cm)
        ]
      ],
      [
        #align(center)[
          #image("../../figures_html/captures/to use/logo-ministère-education.png", height: 5.0cm)
        ]
      ],
      [
        #align(right)[
          #image("../../figures_html/captures/to use/logo-synelia.png", height: 1.3cm)
        ]
      ],
    )
    #v(0.3cm)

    // ── École ──
    #set text(font: display_fonts)
    #text(size: 12pt, weight: "semibold", fill: palette.primary)[#meta.school]
    #v(0.12em)
    #set text(font: body_fonts)
    #text(size: 10pt, fill: palette.muted)[Entreprise d'accueil : #meta.company]
    #v(0.7cm)

    #line(length: 58%, stroke: (paint: palette.line, thickness: 0.8pt))
    #v(0.6cm)

    // ── Diplôme ──
    #set text(font: display_fonts)
    #text(size: 13pt, weight: "semibold", fill: palette.primary)[#smallcaps[Mémoire de fin d'études]]
    #v(0.35em)
    #set text(font: body_fonts)
    #text(size: 11pt)[En vue de l'obtention du #meta.diploma]
    #v(0.1em)
    #text(size: 10pt, fill: palette.muted)[Option : #meta.option]
    #v(0.85cm)

    // ── Titre ──
    #text(size: 10pt, weight: "semibold", fill: palette.muted)[#smallcaps[Thème]]
    #v(0.3em)
    #title-panel(meta.title, width: 88%, size: 14.5pt, ink: palette.ink)
    #v(0.8cm)

    // ── Bloc auteur / encadrement ──
    #block(width: 78%, stroke: (paint: palette.line, thickness: 0.7pt), inset: 12pt, radius: 0pt)[
      #set text(font: body_fonts)
      #grid(
        columns: (5.2em, 1fr),
        gutter: 2em,
        align: left + top,
        // Colonne gauche : les rôles
        [
          #text(size: 10pt, weight: "semibold", fill: palette.muted)[Présenté par]
          #v(0.8em)
          #text(size: 10pt, weight: "semibold", fill: palette.muted)[Encadreur pédagogique]
          #v(0.8em)
          #text(size: 10pt, weight: "semibold", fill: palette.muted)[Maître de stage]
        ],
        // Colonne droite : les noms
        [
          #text(size: 12pt, weight: "semibold", fill: palette.primary)[#meta.student_name]
          #v(0.65em)
          #text(size: 10.5pt)[#meta.advisor_name]
          #v(0.65em)
          #text(size: 10.5pt)[#meta.internship_supervisor]
          #v(0.15em)
          #text(size: 10pt, fill: palette.muted)[#meta.internship_role]
        ],
      )
    ]

    // ── Année académique HORS du bloc ──
    #v(0.65cm)
    #set text(font: body_fonts)
    #text(size: 11pt, weight: "semibold", fill: palette.secondary)[Année académique : #meta.academic_year]
  ]
]

#let title-page(meta) = cover-page(meta)

#let part-page(label, title, subtitle: none) = [
  #pagebreak()
  #set par(first-line-indent: 0pt, justify: false)
  #v(5.2cm)
  #align(center)[
    #set text(font: display_fonts)
    #text(size: 10pt, weight: "semibold", fill: palette.secondary)[#smallcaps[#label]]
    #v(0.5em)
    #text(size: 23pt, weight: "bold", fill: palette.primary)[#title]
    #if subtitle != none [
      #v(0.8em)
      #set text(font: body_fonts)
      #text(size: 11pt, fill: palette.muted)[#subtitle]
    ]
  ]
  #pagebreak()
]