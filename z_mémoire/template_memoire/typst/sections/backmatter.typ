#import "../theme.typ": top-heading, note-box

#let render-backmatter(meta) = [
  #pagebreak()
  #top-heading([Conclusion])

  La conclusion devra rappeler la problématique de départ, synthétiser la démarche suivie, mettre en valeur les résultats obtenus et souligner les contributions principales du projet au regard des besoins de SYNELIA.

  #note-box([Contenu obligatoire], [
    - rappel de la problématique
    - rappel de la démarche suivie
    - résultats obtenus
    - contributions principales
    - limites du travail
    - perspectives d'évolution
  ])

  [Rédiger ici la conclusion finale du mémoire.]

  #pagebreak()
  #top-heading([Références bibliographiques])

  #note-box([Version actuelle], [
    La bibliographie sera complétée dans une seconde phase, une fois les ouvrages, articles et ressources en ligne fournis. Cette section est volontairement structurée dès maintenant pour faciliter l'injection ultérieure des références.
  ])

  #set par(first-line-indent: 0pt)
  #strong[Ouvrages]

  [À compléter : ouvrages de génie logiciel, architecture logicielle, développement web, ingénierie des exigences, tests, sécurité.] 

  #strong[Documentation technique]

  [À compléter : Spring Boot, Angular, MySQL, MapStruct, Lombok, Typst, documentation REST.] 

  #strong[Articles et publications]

  [À compléter : articles scientifiques et publications professionnelles sur l'e-recrutement, les ATS, l'automatisation des évaluations techniques et l'ergonomie des plateformes numériques.] 

  #strong[Normes et standards]

  [À compléter : RFC, OWASP, OpenAPI, règles RGPD ou autres références normatives citées dans le mémoire.] 

  #pagebreak()
  #top-heading([Annexes])

  #note-box([Organisation recommandée], [
    - Annexe A : captures d'écran de l'application
    - Annexe B : diagrammes UML complémentaires
    - Annexe C : scripts SQL significatifs
    - Annexe D : extraits de code choisis
    - Annexe E : documentation API
    - Annexe F : guide d'installation et de déploiement
    - Annexe G : manuel utilisateur
    - Annexe H : planning du projet
  ])

  #heading(level: 2, numbering: none, outlined: true)[Annexe A — Captures d'écran de l'application]
  [Insérer ici les captures principales par profil et par module.] 

  #heading(level: 2, numbering: none, outlined: true)[Annexe B — Diagrammes complémentaires]
  [Insérer ici les diagrammes UML ou d'architecture non inclus dans le corps principal.] 

  #heading(level: 2, numbering: none, outlined: true)[Annexe C — Scripts et artefacts techniques]
  [Insérer ici les éléments techniques complémentaires réellement utiles à la lecture.] 

  #pagebreak()
  #top-heading([Table des matières], outlined: false)
  #outline(title: none, depth: 3)
]