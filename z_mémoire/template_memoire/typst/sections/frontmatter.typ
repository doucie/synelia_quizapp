#import "../theme.typ": cover-page, title-page, front-heading, note-box, page-footer

#let render-frontmatter(meta) = [
  // Couverture + page de garde : sans numéro
  #set page(numbering: none, footer: none)
  #cover-page(meta)
  #pagebreak()

  // Page blanche entre couverture et page de garde
  #align(center + horizon)[~]
  #pagebreak()

  #title-page(meta)
  #pagebreak()

  // Pages liminaires : chiffres romains
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

  Ce mémoire présente l'étude, la conception et la mise en œuvre d'une application web de gestion du processus de recrutement avec évaluation technique automatisée, réalisée pour le compte de l'entreprise SYNELIA, dans le cadre du projet de fin d'études du cycle d'ingénieur en sciences informatiques.

  Le recrutement constitue un levier stratégique pour les entreprises de services numériques. La capacité à attirer, évaluer et intégrer rapidement les talents conditionne directement la qualité des prestations et la compétitivité. Pourtant, dans de nombreuses structures, le processus de recrutement reste fragmenté entre emails, fichiers de suivi, formulaires externes et échanges informels, ce qui génère des pertes d'information, un manque de standardisation des évaluations et une traçabilité insuffisante des décisions.

  Pour répondre à cette problématique, le projet SyneliaQuizApp a été conçu comme une plateforme centralisée couvrant l'ensemble du cycle de recrutement : création et configuration des campagnes, soumission et suivi des candidatures, évaluation technique par quiz automatisé, planification des entretiens, évaluations collaboratives, prise de décision et notifications. L'application distingue quatre profils d'utilisateurs — super administrateur, administrateur, recruteur et candidat — avec des permissions fines et des parcours adaptés à chaque rôle.

  La démarche méthodologique a suivi une progression en quatre temps. Une phase d'analyse a permis de formaliser les besoins métier, les règles de gestion et les flux du recrutement à partir du cahier des charges et de l'observation des pratiques existantes. Une phase de conception a structuré l'architecture en couches, modélisé la base de données relationnelle et défini les contrats d'API REST entre le backend et le frontend. La réalisation a été menée de manière incrémentale en s'appuyant sur Spring Boot pour la logique serveur, Angular pour l'interface utilisateur et MySQL pour la persistance, avec des migrations versionnées via Flyway. Enfin, une phase de validation a permis de confronter la solution aux exigences fonctionnelles, de corriger les écarts et de mesurer les résultats obtenus.

  Les principaux résultats du projet incluent une couverture fonctionnelle élevée des modules cœur du recrutement — campagnes, formulaires, quiz, entretiens, évaluations, décisions — une architecture technique robuste et maintenable, une gestion granulaire des permissions, une interface administrateur complète pour le paramétrage transverse, ainsi qu'un parcours candidat public sécurisé avec suivi en temps réel. Le projet a également mis en évidence des limites liées au niveau d'industrialisation des tests, à la maturité de certaines zones transverses et à l'absence de mise à l'échelle en environnement de production.

  En conclusion, SyneliaQuizApp démontre qu'une démarche d'ingénierie logicielle structurée peut transformer un processus métier sensible en un système cohérent, évolutif et porteur de valeur pour l'entreprise. Les perspectives ouvertes par ce travail incluent le renforcement de la chaîne CI/CD, l'enrichissement des indicateurs analytiques, l'amélioration de l'expérience candidat et l'extension fonctionnelle vers de nouveaux modules.

  #pagebreak()
  #front-heading([Sommaire])
  #set par(first-line-indent: 0pt, justify: false)
  #outline(title: none, depth: 1)

  #pagebreak()
  #front-heading([Avant-propos])

  #set par(justify: true)

  Le présent mémoire s'inscrit dans le cadre académique de la formation d'ingénieur en sciences informatiques de l'École Nouvelle Supérieure d'Ingénieurs et de Technologie (ENSIT), établissement d'enseignement supérieur situé à Abidjan, en Côte d'Ivoire. L'ENSIT forme des ingénieurs capables de concevoir, développer et piloter des solutions informatiques adaptées aux enjeux technologiques actuels, en s'appuyant sur un socle scientifique solide et une pédagogie orientée vers la pratique professionnelle.

  Le parcours complet à l'ENSIT s'étend sur cinq années et se décompose en deux cycles complémentaires. Les deux premières années constituent la classe préparatoire intégrée, durant laquelle les élèves acquièrent l'ensemble des bases scientifiques nécessaires à la poursuite d'études d'ingénieur : mathématiques (analyse, algèbre, probabilités), physique (électronique, électromagnétisme, optique), initiation à l'algorithmique et à la programmation (langage C, micro-informatique), ainsi que des enseignements transverses (économie, gestion, techniques d'expression et anglais). Cette prépa intégrée met l'accent sur l'acquisition de connaissances solides et la découverte de l'entreprise, à travers des projets et des conférences professionnelles.

  Les trois années suivantes forment le cycle ingénieur proprement dit. La première année, dite de tronc commun, consolide les bases scientifiques et techniques — algorithmique avancée, programmation orientée objet, bases de données, systèmes d'exploitation, réseaux — tout en initiant les élèves aux premiers projets concrets. La deuxième année ouvre la voie aux spécialisations avancées : modélisation orientée objet (UML, Merise), développement web et mobile (J2EE, applications web), intelligence artificielle et machine learning, administration des systèmes et des réseaux, sécurité informatique. La troisième année, enfin, approfondit les compétences métier (gestion de projets, architectures cloud, cryptographie, méthodologie de recherche et de rédaction) et se conclut par un projet de fin d'études réalisé en entreprise, dont ce mémoire constitue l'aboutissement.

  C'est dans ce cadre que j'ai eu l'opportunité d'effectuer mon stage de fin d'études au sein de SYNELIA, entreprise de services numériques africaine basée à Abidjan. Née en 2018 de la transformation de Smile Group Afrique — filiale franchisée d'un groupe européen leader de l'Open Source implanté en Côte d'Ivoire depuis 2012 — SYNELIA incarne une ambition : bâtir une industrie technologique africaine compétitive, ancrée localement et tournée vers l'international. La contraction de « Synergie » et « Nouvelle » reflète cette volonté de tracer une voie inédite pour l'écosystème numérique du continent.

  Aujourd'hui, SYNELIA revendique plus de cent dix profils technologiques, plus de cent projets livrés avec succès et environ quatre-vingt-dix clients actifs répartis en Afrique de l'Ouest. Le groupe structure son offre autour de six expertises majeures — Hosting et Cloud, API Management, Big Data et Machine Learning, Cybersécurité, Intelligence Artificielle et Automatisation de processus — complétées par des unités d'activité dédiées telles que l'Open Digital Academy (formation et insertion des talents tech africains) et la distribution de services Mobile Money.

  Le projet SyneliaQuizApp, qui fait l'objet de ce mémoire, s'inscrit dans l'unité « Contrôle qualité des recrutements » du groupe. Il répond à un besoin concret identifié par la direction : structurer le processus de recrutement à travers une plateforme interne unifiée, capable de centraliser les campagnes, d'automatiser l'évaluation technique des candidats et de garantir la traçabilité des décisions. Ce projet m'a permis de mobiliser l'ensemble des compétences acquises au cours de ma formation — analyse des besoins, conception logicielle, développement full-stack, gestion de base de données, sécurité applicative — dans un contexte professionnel réel, exigeant et formateur.

  Je tiens à exprimer ici ma gratitude envers l'ENSIT pour la qualité de la formation dispensée, et envers SYNELIA pour la confiance accordée et l'environnement de travail stimulant qui a rendu ce projet possible.

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
]