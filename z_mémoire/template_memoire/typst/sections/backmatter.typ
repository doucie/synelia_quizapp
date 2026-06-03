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

  #set par(first-line-indent: 0pt, spacing: 0.45em)
  #set text(size: 9.5pt)

  #heading(level: 2, numbering: none, outlined: false)[Ouvrages et articles scientifiques]

  #heading(level: 3, numbering: none, outlined: false)[Digitalisation RH et gestion du recrutement]
  - Bondarouk, T. & Olivas-Luján, M. R. (2013). *Electronic HRM in the Smart Era*. Emerald Group Publishing. \ *Cité en : Introduction (§Méthodologie), §1.1.2 (Nécessité d'une solution digitale).*
  - Stone, D. L., Deadrick, D. L., Lukaszewski, K. M. & Johnson, R. (2015). The influence of technology on the future of human resource management. *Human Resource Management Review*, 25(2), 216-231. \ *Cité en : §1.1.2 (Défis et limitations actuels).*
  - Chapman, D. S. & Webster, J. (2003). The use of technologies in the recruiting, selection, and evaluation of job applicants. *Journal of Management*, 29(4), 519-543. \ *Cité en : §1.1.2 (Processus de recrutement traditionnel).*

  #heading(level: 3, numbering: none, outlined: false)[Architecture logicielle et développement web]
  - Walls, C. (2022). *Spring in Action* (6ᵉ édition). Manning Publications. \ *Cité en : §1.3.2 (Choix du framework backend).*
  - Freeman, A. (2023). *Pro Angular 16*. Apress. \ *Cité en : §1.3.2 (Choix du framework frontend).*
  - Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*. Thèse de doctorat, University of California, Irvine. \ *Cité en : §3.2.2 (Conception de l'API REST).*
  - Spilca, L. (2024). *Spring Start Here: Learn what you need to know to start building robust applications* (2ᵉ édition). Manning Publications. \ *Cité en : §3.4.1 (Technologies backend) — référence contextuelle.*
  - Fain, Y. & Moiseev, A. (2018). *Angular Development with TypeScript* (2ᵉ édition). Manning Publications. \ *Cité en : §3.5.4 (Communication temps réel et WebSocket).*

  #heading(level: 3, numbering: none, outlined: false)[Méthodologie d'ingénierie et conception]
  - Larman, C. (2005). *UML et les design patterns : Analyse et conception orientées objet et développement itératif*. Pearson Education. \ *Cité en : §2.1 (Méthodologie d'analyse), §3.3 (Compléments UML).*
  - Martin, R. C. (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall. \ *Cité en : §3.1 (Architecture globale du système).*
  - Fowler, M. (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley. \ *Cité en : §3.4.1 (Technologies backend — pattern DTO/MapStruct), §3.5 (Architecture en couches).*
  - Fowler, M. (2010). *Domain-Specific Languages*. Addison-Wesley Professional. \ *Cité en : §3.5.3 (Moteur de pipeline et progression).*
  - Massé, M. (2011). *REST API Design Rulebook*. O'Reilly Media. \ *Cité en : §3.2.2 (Conception de l'API REST).*

  #heading(level: 3, numbering: none, outlined: false)[Sécurité des systèmes d'information]
  - Spilca, L. (2024). *Spring Security in Action* (2ᵉ édition). Manning Publications. \ *Cité en : §2.2 (Besoins non fonctionnels — sécurité).*
  - Gamma, E., Helm, R., Johnson, R. & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley. \ *Cité en : §3.5.3 (Notifications, permissions et pilotage — pattern Observateur).*

  #heading(level: 3, numbering: none, outlined: false)[Modélisation métier — Méthode Merise]
  - Tardieu, H., Rochfeld, A. & Colletti, R. (2003). *La méthode Merise : Principes et outils*. Éditions d'Organisation. \ *Cité en : §3.2.1 (Démarche Merise retenue).*
  - Gabay, J. (2008). *Merise et UML : Guide pratique — Modélisation des données et des traitements*. Dunod. \ *Cité en : §3.2.1 (Démarche Merise retenue).*
  - Matheron, J. P. (2005). *Comprendre Merise : Outils conceptuels et organisationnels*. Eyrolles. \ *Cité en : §3.2.1 (Démarche Merise retenue).*

  #heading(level: 3, numbering: none, outlined: false)[Persistance et bases de données]
  - Bauer, C., King, G. & Gregory, G. (2016). *Java Persistence with Hibernate* (2ᵉ édition). Manning Publications. \ *Cité en : §1.3.2 (Choix du SGBD), §3.4.1 (Technologies backend), §3.4.3 (Base de données).*
  - Carlson, J. L. (2013). *Redis in Action*. Manning Publications. \ *Cité en : §3.4.1 (Technologies backend — cache Redis).*

  #heading(level: 3, numbering: none, outlined: false)[Ergonomie et expérience utilisateur]
  - Nogier, J.-F. & Bouillot, J. (2020). *Ergonomie du logiciel et design web : Le manuel des interfaces utilisateur* (6ᵉ édition). Dunod. \ *Cité en : §3.2.4 (Maquettes et interfaces).*
  - Bastien, J. C. & Scapin, D. L. (1993). *Ergonomical criteria for the evaluation of user interfaces*. Rapport technique INRIA. \ *Cité en : §2.2 (Besoins non fonctionnels — ergonomie).*

  #heading(level: 3, numbering: none, outlined: false)[Qualité logicielle et tests]
  - Meszaros, G. (2007). *xUnit Test Patterns: Refactoring Test Code*. Addison-Wesley Professional. \ *Cité en : §4.1 (Stratégie de tests).*

  #heading(level: 3, numbering: none, outlined: false)[Urbanisation des SI et transformation digitale]
  - Longépé, C. (2009). *Le projet d'urbanisation du S.I. : Démarche pratique avec cas d'étude*. Dunod. \ *Cité en : Introduction (§Présentation du sujet).*

  #heading(level: 3, numbering: none, outlined: false)[DevOps et déploiement continu]
  - Humble, J. & Farley, D. (2010). *Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation*. Addison-Wesley. \ *Cité en : §3.5.7 (Exécution locale et chaîne DevOps).*

  #heading(level: 3, numbering: none, outlined: false)[Sécurisation des examens en ligne]
  - Nigam, A., Pasricha, R., Singh, T. & Joseph, P. (2021). A systematic review of research on cheating in online exams: Mitigation, detection, and prevention. *Journal of Computing in Higher Education*. \ *Cité en : §3.5.3 (Sécurisation du quiz et intégrité des évaluations).*

  #heading(level: 3, numbering: none, outlined: false)[Traçabilité et audit des systèmes]
  - Johnston, R. (2019). Designing an Enterprise Application Audit Trail. *Journal of Systems Architecture*. \ *Cité en : §3.5.3 (Traçabilité, audit et historisation).*

  #heading(level: 3, numbering: none, outlined: false)[Contrôle d'accès avancé]
  - Hu, V. C., Ferraiolo, D., Kuhn, R., Friedman, A. R. & Lang, C. N. (2014). *Guide to Attribute Based Access Control (ABAC) Definition and Considerations*. NIST Special Publication 800-162. \ *Cité en : §3.5.3 (Notifications, permissions et pilotage — permissions ABAC).*

  #v(0.6cm)
  #heading(level: 2, numbering: none, outlined: false)[Documentations techniques et ressources en ligne]

  - Broadcom / Spring Team. (2025). *Spring Boot Reference Documentation (Version 3.5.x)*. Consulté le 12 mars 2026 sur https://docs.spring.io/spring-boot/reference/. \ *Cité en : §3.4.1 (Technologies backend).*
  - Google. (2025). *Angular Documentation: Concepts and Architecture (v20)*. Consulté le 18 avril 2026 sur https://angular.dev/reference/releases. \ *Cité en : §3.4.2 (Technologies frontend).*
  - Google. (2025). *Angular Signals: Fine-Grained Reactivity Model*. Consulté le 20 avril 2026 sur https://angular.dev/guide/signals. \ *Cité en : §3.4.2 (Technologies frontend — Signals).*
  - Red Gate Software. (2025). *Flyway Documentation: Database Migrations and Version Control*. Consulté le 3 mars 2026 sur https://flywaydb.org/documentation/. \ *Cité en : §3.4.1 (Technologies backend — Flyway), §3.4.3 (Base de données).*
  - MinIO Inc. (2025). *MinIO Object Storage Reference Guide*. Consulté le 15 février 2026 sur https://min.io/docs/. \ *Cité en : §3.4.1 (Technologies backend — stockage objet), §3.5.7 (Exécution locale).*
  - OWASP Foundation. (2025). *OWASP Top 10 Web Application Security Risks*. Consulté le 8 mars 2026 sur https://owasp.org/Top10/. \ *Cité en : §2.2 (Besoins non fonctionnels — sécurité).*
  - KodMatrix. (2025). Angular 20: Everything You Need to Know. *DEV Community*. Consulté le 22 avril 2026 sur https://dev.to/. \ *Cité en : §3.4.2 (Technologies frontend — évolution Angular 20).*
  - Object Management Group. (2013). *Business Process Model and Notation (BPMN 2.0)*. Consulté le 5 mars 2026 sur https://www.omg.org/spec/BPMN/2.0/. \ *Cité en : §3.5.3 (Moteur de pipeline et progression).*

  #v(0.6cm)
  #heading(level: 2, numbering: none, outlined: false)[Démarche de recherche documentaire]

  La bibliographie de ce mémoire a été constituée selon une démarche thématique progressive. Les références ont d'abord été identifiées à partir des besoins propres au projet SyneliaQuizApp, puis regroupées par domaine : processus métier du recrutement, architecture logicielle, sécurité, modélisation Merise, ergonomie, persistance, tests, urbanisation des SI et DevOps. Chaque référence a été sélectionnée pour son aptitude à éclairer un choix technique, une méthode de conception ou une règle de gestion documentée dans le corps du mémoire. Les ressources en ligne ont été consultées entre février et mai 2026 ; les dates exactes de consultation sont indiquées pour chaque référence web.

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