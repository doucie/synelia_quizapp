#import "../theme.typ": cover-page, title-page, front-heading, note-box, page-footer

#let render-frontmatter(meta) = [
  #cover-page(meta)
  #pagebreak()
  #title-page(meta)
  #pagebreak()

  #set page(numbering: none, footer: page-footer("i", italic: true))
  #counter(page).update(1)

  #front-heading([Remerciements])
  Je tiens à exprimer ma profonde gratitude à mon encadreur pédagogique, #strong[#meta.advisor_name], pour son accompagnement, sa disponibilité et la qualité de ses conseils tout au long de ce travail.

  Mes sincères remerciements s'adressent également à mon maître de stage, #strong[#meta.internship_supervisor], pour sa confiance, son encadrement au sein de SYNELIA et la richesse des échanges techniques et méthodologiques qui ont nourri ce projet.

  Je remercie l'ensemble de l'équipe SYNELIA pour son accueil, sa bienveillance et son implication dans le suivi du projet SyneliaQuizApp.

  Mes remerciements vont aussi au corps enseignant et administratif de l'ENSIT, ainsi qu'aux membres du jury qui consacreront du temps à l'évaluation de ce mémoire.

  Enfin, j'adresse une pensée reconnaissante à ma famille et à mes proches pour leur soutien constant durant mon parcours académique.

  #pagebreak()
  #front-heading([Résumé])
  #note-box([À finaliser en dernier], [
    Le résumé devra tenir sur 1 à 1,5 page maximum et synthétiser :

    - le contexte du projet
    - la problématique traitée
    - les objectifs poursuivis
    - la méthodologie adoptée
    - les technologies mobilisées
    - les résultats obtenus
    - les mots-clés
  ])

  [Insérer ici le résumé final du mémoire en français.]

  #front-heading([Abstract])
  #note-box([To be finalized last], [
    The abstract should remain concise and aligned with the final French summary.
  ])

  [Insert here the final English abstract.]

  #pagebreak()
  #front-heading([Sommaire])
  #set par(first-line-indent: 0pt, justify: false)
  #outline(title: none, depth: 1)

  #pagebreak()
  #front-heading([Avant-propos])
  L'avant-propos présente le cadre institutionnel du mémoire. Il situe le travail au regard de la formation d'ingénieur en sciences informatiques dispensée à l'ENSIT et du contexte professionnel offert par l'entreprise d'accueil SYNELIA.

  #note-box([Contenu attendu], [
    - présentation de l'ENSIT
    - présentation de la formation et du diplôme
    - présentation de SYNELIA
    - cadre du stage de fin d'études
  ])

  [Rédiger ici un avant-propos institutionnel, sans entrer directement dans l'analyse technique du projet.]

  #pagebreak()
  #front-heading([Glossaire])
  #set par(first-line-indent: 0pt)
  #grid(
    columns: (auto, 1fr),
    gutter: 0.55em,
    [#strong[API]], [Application Programming Interface],
    [#strong[Angular]], [Framework frontend utilisé pour l'interface web monopage],
    [#strong[ATS]], [Applicant Tracking System],
    [#strong[CRUD]], [Create, Read, Update, Delete],
    [#strong[DTO]], [Data Transfer Object],
    [#strong[JPA]], [Java Persistence API],
    [#strong[JWT]], [JSON Web Token],
    [#strong[MCD]], [Modèle Conceptuel de Données dans la méthode Merise],
    [#strong[MCT]], [Modèle Conceptuel des Traitements dans la méthode Merise],
    [#strong[MERISE]], [Méthode d'Étude et de Réalisation Informatique pour les Systèmes d'Entreprise],
    [#strong[MLD]], [Modèle Logique de Données],
    [#strong[MPD]], [Modèle Physique de Données],
    [#strong[MySQL]], [Système de gestion de base de données relationnelle],
    [#strong[REST]], [Style d'architecture des services web],
    [#strong[RGPD]], [Règlement Général sur la Protection des Données],
    [#strong[SAT]], [Structure d'Accès Théorique],
    [#strong[SPA]], [Single Page Application],
    [#strong[Spring Boot]], [Framework backend Java retenu pour le projet],
    [#strong[Typst]], [Système de composition utilisé pour le mémoire],
    [#strong[UML]], [Unified Modeling Language],
    [#strong[WebSocket]], [Protocole de communication bidirectionnelle en temps réel],
  )

  #note-box([À enrichir], [Ajouter ici les autres sigles réellement utilisés dans le mémoire au fur et à mesure de la rédaction.])
]