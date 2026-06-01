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
  academic_year: "2023 - 2024",
  diploma: "diplôme d'Ingénieur en Sciences Informatiques",
  option: "Génie Logiciel",
  student_name: "[Nom patronymique] [Prénom]",
  advisor_name: "[Titre Nom Prénom]",
  internship_supervisor: "[Nom Prénom]",
  internship_role: "[Fonction du maître de stage]",
  title: "Étude, conception et mise en œuvre d'une application web de gestion du processus de recrutement avec évaluation technique automatisée : cas de l'entreprise SYNELIA",
  short_title: "SyneliaQuizApp - Mémoire d'ingénieur",
)

#render-frontmatter(meta)
#render-body(meta)
#render-backmatter(meta)