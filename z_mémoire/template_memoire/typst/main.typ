#import "theme.typ": *
#import "sections/frontmatter.typ": render-frontmatter
#import "sections/body.typ": render-body
#import "sections/backmatter.typ": render-backmatter

// IMPORTANT : applique le template global (set/show rules de theme.typ).
// Sans ce show, les set/show du module importé ne s'appliqueraient pas,
// et tout retomberait sur le rendu par défaut de Typst.
#show: template

#let meta = (
  school: "École Nouvelle Supérieure d'Ingénieurs et de Technologie (ENSIT)",
  company: "SYNELIA",
  academic_year: "2025 - 2026",
  diploma: "diplôme d'Ingénieur en Sciences Informatiques",
  option: "Génie Logiciel",
  student_name: "KOUASSI EMISSAH MARIE",
  advisor_name: "M. ASSOHOUN",
  internship_supervisor: "M. KOUADIO INNOCENT",
  internship_role: "Manager Backend chez SYNELIA",
  title: "Étude, conception et mise en œuvre d'une application web de gestion du processus de recrutement avec évaluation technique automatisée : cas de l'entreprise SYNELIA",
  short_title: "SyneliaQuizApp - Mémoire d'ingénieur",
)

#render-frontmatter(meta)
#render-body(meta)
#render-backmatter(meta)