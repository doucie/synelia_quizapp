#import "../theme.typ": top-heading, palette

#let render-backmatter(meta) = [
  #pagebreak()
  #top-heading([Conclusion])

  Le présent mémoire avait pour ambition de répondre à une problématique concrète : comment concevoir une plateforme unifiée capable de digitaliser le recrutement, de standardiser l'évaluation technique et de renforcer la traçabilité des décisions, tout en restant adaptée aux contraintes opérationnelles d'une entreprise en croissance ? Cette question, posée dans le contexte réel de SYNELIA, traduisait un besoin de transformation profonde d'un processus métier encore trop fragmenté entre emails, fichiers de suivi et pratiques peu standardisées.

  Pour y répondre, une démarche d'ingénierie logicielle complète a été déployée en quatre temps. La phase d'analyse a permis de formaliser les besoins métier, les règles de gestion et les flux du recrutement à partir du cahier des charges et de l'observation des pratiques existantes. La phase de conception a structuré l'architecture en couches, modélisé la base de données selon la méthode Merise et défini les contrats d'API REST. La réalisation a été menée de manière incrémentale en s'appuyant sur Spring Boot pour le backend, Angular pour le frontend et MySQL pour la persistance, avec des migrations versionnées via Flyway. Enfin, une phase de validation continue a permis de confronter la solution aux exigences fonctionnelles et de corriger les écarts au fil du développement.

  Les résultats obtenus sont substantiels. La plateforme SyneliaQuizApp couvre aujourd'hui l'ensemble du cycle de recrutement : création et configuration des campagnes, soumission et suivi des candidatures, évaluation technique par quiz automatisé avec chronométrage et correction manuelle, planification et gestion des entretiens, évaluations collaboratives, prise de décision et notifications. L'application distingue quatre profils d'utilisateurs — candidat, recruteur, administrateur et super administrateur — avec des permissions fines combinant rôles système et droits contextualisés par entité. Une interface d'administration transverse complète le dispositif en offrant les leviers de paramétrage, de gouvernance et de supervision nécessaires à une exploitation durable.

  Les contributions principales de ce travail se situent à plusieurs niveaux. Sur le plan fonctionnel, le projet apporte à SYNELIA une solution métier unifiée qui remplace avantageusement l'éparpillement antérieur des outils et des pratiques. Sur le plan technique, il démontre la pertinence d'une architecture en couches fondée sur des frameworks modernes et opinionnés, capable de soutenir un domaine métier riche en règles de gestion sans sacrifier la maintenabilité. Sur le plan méthodologique, il illustre comment une documentation vivante — cartographies fonctionnelles, journaux de correctifs, guides de validation — peut servir de levier de qualité tout au long du cycle de vie d'un projet.

  Ce travail comporte néanmoins des limites qu'il convient de reconnaître. La couverture de tests automatisés reste ciblée sur les zones les plus sensibles et mériterait d'être étendue à l'ensemble des parcours critiques. Certaines zones transverses, notamment la gestion des emails, des notifications et de la configuration, demeurent plus sensibles aux écarts de paramétrage que les modules cœur. Enfin, la solution n'a pas encore été confrontée à un environnement de production à grande échelle, ce qui laisse ouverte la question de la montée en charge, de l'observabilité et du déploiement continu.

  Les perspectives ouvertes par ce projet sont nombreuses. Sur le plan technique, le renforcement de la chaîne CI/CD, l'automatisation accrue des tests et la mise en place d'une supervision opérationnelle constitueraient des priorités naturelles. Sur le plan fonctionnel, l'enrichissement des indicateurs analytiques, l'amélioration de l'expérience candidat et l'intégration de nouveaux canaux de diffusion renforceraient la valeur d'usage de la plateforme. À plus long terme, l'ouverture vers des modules complémentaires — matching avancé, intégration avec des job boards, application mobile — pourrait élargir le périmètre sans remettre en cause les fondations techniques posées par ce travail.

  Au terme de ce mémoire, il apparaît que la transformation numérique d'un processus de recrutement ne se résume pas à l'écriture d'un logiciel. Elle exige une lecture fine des besoins métier, une architecture capable d'absorber la complexité sans la subir, et une démarche de validation ancrée dans le réel. C'est cette triple exigence que le projet SyneliaQuizApp s'est efforcé de satisfaire, en proposant à SYNELIA bien plus qu'un outil : un système structuré, évolutif et porteur de valeur pour l'ensemble de ses parties prenantes.

  #pagebreak()
  #top-heading([Références bibliographiques])

  #set par(first-line-indent: 0pt, spacing: 0.45em)
  #set text(size: 9.5pt)

  #heading(level: 2, numbering: none, outlined: false)[Ouvrages et articles scientifiques]

  #heading(level: 3, numbering: none, outlined: false)[Digitalisation RH et gestion du recrutement]
  - Bondarouk, T. & Olivas-Luján, M. R. (2013). *Electronic HRM in the Smart Era*. Emerald Group Publishing. \ *Cité p. 6 (Introduction), p. @ref-solution-digitale (§Nécessité d'une solution digitale).*
  - Stone, D. L., Deadrick, D. L., Lukaszewski, K. M. & Johnson, R. (2015). The influence of technology on the future of human resource management. *Human Resource Management Review*, 25(2), 216-231. \ *Cité p. @ref-defis (§Défis et limitations actuels).*
  - Chapman, D. S. & Webster, J. (2003). The use of technologies in the recruiting, selection, and evaluation of job applicants. *Journal of Management*, 29(4), 519-543. \ *Cité p. @ref-processus (§Processus de recrutement traditionnel).*

  #heading(level: 3, numbering: none, outlined: false)[Architecture logicielle et développement web]
  - Walls, C. (2022). *Spring in Action* (6ᵉ édition). Manning Publications. \ *Cité p. @ref-choix-backend (§Choix du framework backend).*
  - Freeman, A. (2023). *Pro Angular 16*. Apress. \ *Cité p. @ref-choix-frontend (§Choix du framework frontend).*
  - Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*. Thèse de doctorat, University of California, Irvine. \ *Cité p. @ref-api-rest (§Conception de l'API REST).*
  - Spilca, L. (2024). *Spring Start Here* (2ᵉ édition). Manning Publications. \ *Cité p. @ref-tech-backend (§Technologies backend) — référence contextuelle.*
  - Fain, Y. & Moiseev, A. (2018). *Angular Development with TypeScript* (2ᵉ édition). Manning Publications. \ *Cité p. @ref-websocket (§Communication temps réel et WebSocket).*

  #heading(level: 3, numbering: none, outlined: false)[Méthodologie d'ingénierie et conception]
  - Larman, C. (2005). *UML et les design patterns*. Pearson Education. \ *Cité p. @ref-methodo (§Méthodologie d'analyse).*
  - Martin, R. C. (2017). *Clean Architecture*. Prentice Hall. \ *Cité p. @ref-archi (§Architecture globale du système).*
  - Fowler, M. (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley. \ *Cité p. @ref-tech-backend (§Technologies backend — DTO/MapStruct).*
  - Fowler, M. (2010). *Domain-Specific Languages*. Addison-Wesley Professional. \ *Cité p. @ref-pipeline (§Moteur de pipeline et progression).*
  - Massé, M. (2011). *REST API Design Rulebook*. O'Reilly Media. \ *Cité p. @ref-api-rest (§Conception de l'API REST).*

  #heading(level: 3, numbering: none, outlined: false)[Sécurité des systèmes d'information]
  - Spilca, L. (2024). *Spring Security in Action* (2ᵉ édition). Manning Publications. \ *Cité p. @ref-besoins-nf (§Besoins non fonctionnels — sécurité).*
  - Gamma, E., Helm, R., Johnson, R. & Vlissides, J. (1994). *Design Patterns*. Addison-Wesley. \ *Cité p. @ref-notifications (§Notifications — pattern Observateur).*

  #heading(level: 3, numbering: none, outlined: false)[Modélisation métier — Méthode Merise]
  - Tardieu, H., Rochfeld, A. & Colletti, R. (2003). *La méthode Merise : Principes et outils*. Éditions d'Organisation. \ *Cité p. @ref-merise (§Démarche Merise retenue).*
  - Gabay, J. (2008). *Merise et UML : Guide pratique*. Dunod. \ *Cité p. @ref-merise (§Démarche Merise retenue).*
  - Matheron, J. P. (2005). *Comprendre Merise*. Eyrolles. \ *Cité p. @ref-merise (§Démarche Merise retenue).*

  #heading(level: 3, numbering: none, outlined: false)[Persistance et bases de données]
  - Bauer, C., King, G. & Gregory, G. (2016). *Java Persistence with Hibernate* (2ᵉ édition). Manning Publications. \ *Cité p. @ref-choix-sgbd (§Choix du SGBD), p. @ref-tech-backend (§Technologies backend), p. @ref-bdd (§Base de données).*
  - Carlson, J. L. (2013). *Redis in Action*. Manning Publications. \ *Cité p. @ref-tech-backend (§Technologies backend — cache Redis).*

  #heading(level: 3, numbering: none, outlined: false)[Ergonomie et expérience utilisateur]
  - Nogier, J.-F. & Bouillot, J. (2020). *Ergonomie du logiciel et design web* (6ᵉ édition). Dunod. \ *Cité p. @ref-maquettes (§Maquettes et interfaces).*
  - Bastien, J. C. & Scapin, D. L. (1993). *Ergonomical criteria for the evaluation of user interfaces*. Rapport technique INRIA. \ *Cité p. @ref-besoins-nf (§Besoins non fonctionnels — ergonomie).*

  #heading(level: 3, numbering: none, outlined: false)[Qualité logicielle et tests]
  - Meszaros, G. (2007). *xUnit Test Patterns*. Addison-Wesley Professional. \ *Cité p. @ref-tests (§Stratégie de tests).*

  #heading(level: 3, numbering: none, outlined: false)[Urbanisation des SI et transformation digitale]
  - Longépé, C. (2009). *Le projet d'urbanisation du S.I.*. Dunod. \ *Cité p. 6 (Introduction).*

  #heading(level: 3, numbering: none, outlined: false)[DevOps et déploiement continu]
  - Humble, J. & Farley, D. (2010). *Continuous Delivery*. Addison-Wesley. \ *Cité p. @ref-devops (§Exécution locale et chaîne DevOps).*

  #heading(level: 3, numbering: none, outlined: false)[Sécurisation des examens en ligne]
  - Nigam, A., Pasricha, R., Singh, T. & Joseph, P. (2021). A systematic review of research on cheating in online exams. *Journal of Computing in Higher Education*. \ *Cité p. @ref-anti-triche (§Sécurisation du quiz et intégrité des évaluations).*

  #heading(level: 3, numbering: none, outlined: false)[Traçabilité et audit des systèmes]
  - Johnston, R. (2019). Designing an Enterprise Application Audit Trail. *Journal of Systems Architecture*. \ *Cité p. @ref-audit (§Traçabilité, audit et historisation).*

  #heading(level: 3, numbering: none, outlined: false)[Contrôle d'accès avancé]
  - Hu, V. C. et al. (2014). *Guide to Attribute Based Access Control (ABAC)*. NIST SP 800-162. \ *Cité p. @ref-notifications (§Notifications, permissions et pilotage — permissions ABAC).*

  #v(0.6cm)
  #heading(level: 2, numbering: none, outlined: false)[Documentations techniques et ressources en ligne]

  - Broadcom / Spring Team. (2025). *Spring Boot Reference Documentation (Version 3.5.x)*. Consulté le 12 mars 2026. \ *Cité p. @ref-tech-backend (§Technologies backend).*
  - Google. (2025). *Angular Documentation: Concepts and Architecture (v20)*. Consulté le 18 avril 2026. \ *Cité p. @ref-tech-frontend (§Technologies frontend).*
  - Google. (2025). *Angular Signals: Fine-Grained Reactivity Model*. Consulté le 20 avril 2026. \ *Cité p. @ref-tech-frontend (§Technologies frontend — Signals).*
  - Red Gate Software. (2025). *Flyway Documentation*. Consulté le 3 mars 2026. \ *Cité p. @ref-tech-backend (§Technologies backend), p. @ref-bdd (§Base de données).*
  - MinIO Inc. (2025). *MinIO Object Storage Reference Guide*. Consulté le 15 février 2026. \ *Cité p. @ref-tech-backend (§Technologies backend), p. @ref-devops (§Exécution locale).*
  - OWASP Foundation. (2025). *OWASP Top 10*. Consulté le 8 mars 2026. \ *Cité p. @ref-besoins-nf (§Besoins non fonctionnels — sécurité).*
  - KodMatrix. (2025). Angular 20: Everything You Need to Know. *DEV Community*. Consulté le 22 avril 2026. \ *Cité p. @ref-tech-frontend (§Technologies frontend).*
  - Object Management Group. (2013). *BPMN 2.0*. Consulté le 5 mars 2026. \ *Cité p. @ref-pipeline (§Moteur de pipeline et progression).*

  #v(0.6cm)
  #heading(level: 2, numbering: none, outlined: false)[Démarche de recherche documentaire]

  La bibliographie de ce mémoire a été constituée selon une démarche thématique progressive. Les références ont d'abord été identifiées à partir des besoins propres au projet SyneliaQuizApp, puis regroupées par domaine : processus métier du recrutement, architecture logicielle, sécurité, modélisation Merise, ergonomie, persistance, tests, urbanisation des SI et DevOps. Chaque référence a été sélectionnée pour son aptitude à éclairer un choix technique, une méthode de conception ou une règle de gestion documentée dans le corps du mémoire. Les ressources en ligne ont été consultées entre février et mai 2026 ; les dates exactes de consultation sont indiquées pour chaque référence web.

  #pagebreak()
  #top-heading([Annexes])

  #set text(size: 12.5pt)
  #set par(first-line-indent: 1.25em, spacing: 1.28em, leading: 0.88em)

  #heading(level: 2, numbering: none, outlined: true)[Annexe A — Captures d'écran complémentaires]

  Les figures suivantes présentent des écrans additionnels de la plateforme qui n'apparaissent pas dans le corps du mémoire. Elles illustrent la richesse fonctionnelle de l'application à travers les différents modules du tableau de bord recruteur et administrateur.

  #figure(
    image("../../../figures_html/captures/to use/quizapp - postuler - campagne - 1.png", width: 100%),
    caption: [Page publique de dépôt de candidature — formulaire de soumission pour une campagne.],
  )

  #figure(
    image("../../../figures_html/captures/to use/quizapp - quiz - 10 - 725fc7354b4b42fe8cdb56e2f64e5a1f.png", width: 100%),
    caption: [Interface de passation du quiz technique — question à choix multiples avec chronomètre.],
  )

  #figure(
    image("../../../figures_html/captures/to use/quizapp - dashboard - candidates.png", width: 100%),
    caption: [Liste des candidatures — filtrage, recherche et actions contextualisées par dossier.],
  )

  #figure(
    image("../../../figures_html/captures/to use/quizapp - dashboard - interviews avec exemple d'entretien terminé et en cours.png", width: 100%),
    caption: [Gestion des entretiens — planification, états (terminé, en cours) et actions associées.],
  )

  #figure(
    image("../../../figures_html/captures/to use/quizapp - dashboard - evaluate - EVAL1AB2C.png", width: 100%),
    caption: [Écran d'évaluation collaboratif — critères détaillés, notation et commentaires par évaluateur.],
  )

  #figure(
    image("../../../figures_html/captures/to use/quizapp - dashboard - decisions.png", width: 100%),
    caption: [Module de décisions — présélection, décision finale, annulation et historique.],
  )

  #figure(
    image("../../../figures_html/captures/to use/quizapp - dashboard - entities.png", width: 100%),
    caption: [Vue d'administration des entités — gestion des données de référence (départements, spécialités, etc.).],
  )

  #figure(
    image("../../../figures_html/captures/to use/quizapp - dashboard - questions.png", width: 100%),
    caption: [Banque de questions — création, types de questions, réponses et niveau de difficulté.],
  )

  #figure(
    image("../../../figures_html/captures/to use/quizapp - dashboard - system-role-permission.png", width: 100%),
    caption: [Gestion des permissions système — rôles, droits et overrides utilisateur.],
  )

  #figure(
    image("../../../figures_html/captures/to use/quizapp - dashboard - settings # configuration app.png", width: 100%),
    caption: [Paramétrage de l'application — configuration SMTP, modèles d'email et constantes globales.],
  )

  #heading(level: 2, numbering: none, outlined: true)[Annexe B — Diagrammes de séquence complémentaires]

  Les trois diagrammes de séquence suivants, mentionnés dans le corps du mémoire (Partie 2, § Compléments éventuels en UML), sont présentés ici en détail. Ils complètent le diagramme de soumission d'une candidature publique en documentant les interactions dynamiques entre le frontend Angular, l'API REST Spring Boot, les services métier, la couche de persistance JPA/MySQL et les mécanismes de notification.

  #figure(
    image("../../../figures_html/captures/to use/Diagrammes de séquence — 2. Passation et soumission du quiz technique.png", width: 100%),
    caption: [Séquence — passation et soumission du quiz technique : chargement des questions, enregistrement progressif des réponses et clôture du quiz.],
  )

  #figure(
    image("../../../figures_html/captures/to use/Diagrammes de séquence — 3. Planification et convocation d'un entretien.png", width: 100%),
    caption: [Séquence — planification et convocation d'un entretien : rattachement à la candidature, production de la convocation et mise à jour du pipeline.],
  )

  #figure(
    image("../../../figures_html/captures/to use/Diagrammes de séquence — 4. Saisie et propagation d'une décision finale.png", width: 100%),
    caption: [Séquence — saisie et propagation d'une décision finale : agrégation des évaluations, décision et synchronisation des états du dossier.],
  )

  #heading(level: 2, numbering: none, outlined: true)[Annexe C — Extraits de code sources]

  Cette annexe présente quelques extraits représentatifs du code développé dans le cadre du projet. Ils illustrent les choix d'architecture et les motifs de conception récurrents dans l'implémentation de SyneliaQuizApp.

  #v(0.5cm)
  #text(size: 10pt, weight: "semibold", fill: palette.primary)[Extrait C.1 — Filtre d'authentification JWT (Spring Security)]

  Le filtre ci-dessous intercepte chaque requête HTTP entrante, extrait le jeton JWT de l'en-tête #raw("Authorization", lang: "http"), valide sa signature et sa date d'expiration, puis peuple le contexte de sécurité Spring avec l'identité et les autorités de l'utilisateur. La hiérarchie implicite des rôles — SUPER héritant de ADMIN et RECRUITER, ADMIN héritant de RECRUITER — est résolue directement dans le filtre.

  #show raw: set text(size: 8.5pt)
  ```java
  @Override
  protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain)
          throws ServletException, IOException {
      String authHeader = request.getHeader("Authorization");

      if (authHeader != null && authHeader.startsWith("Bearer ")) {
          String token = authHeader.substring(7);
          try {
              if (jwtService.isTokenValid(token)) {
                  Integer userId = jwtService.extractUserId(token);
                  String systemRole = jwtService.extractSystemRole(token);
                  UserRole normalizedRole = UserRole.fromValue(systemRole);

                  List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                  Set<String> authorityNames = new LinkedHashSet<>();
                  if (normalizedRole != null) {
                      authorityNames.add("ROLE_" + normalizedRole.getSystemRole());
                      if (UserRole.SUPER.equals(normalizedRole)) {
                          authorityNames.add("ROLE_ADMIN");
                          authorityNames.add("ROLE_RECRUITER");
                      } else if (UserRole.ADMIN.equals(normalizedRole)) {
                          authorityNames.add("ROLE_RECRUITER");
                      }
                  }
                  for (String authorityName : authorityNames) {
                      authorities.add(new SimpleGrantedAuthority(authorityName));
                  }

                  var authToken = new UsernamePasswordAuthenticationToken(
                      userId, null, authorities);
                  SecurityContextHolder.getContext()
                      .setAuthentication(authToken);
              }
          } catch (Exception e) {
              logger.debug("JWT validation failed: {}", e.getMessage());
          }
      }
      filterChain.doFilter(request, response);
  }
  ```

  #v(0.5cm)
  #text(size: 10pt, weight: "semibold", fill: palette.primary)[Extrait C.2 — Création d'une candidature (couche métier Spring)]

  La méthode #raw("create") de la classe #raw("ApplicationsBusiness") orchestre l'ensemble des opérations nécessaires à la soumission d'une candidature : validation des champs obligatoires, vérification de l'existence du jeton de source et de la campagne associée, contrôle des limites de candidatures par campagne, instanciation de l'entité, initialisation de la progression dans le pipeline, génération du code de suivi, création de la tentative de quiz et envoi de l'email de vérification. L'annotation #raw("@Transactional") garantit l'atomicité de l'ensemble.

  #show raw: set text(size: 8.5pt)
  ```java
  @Transactional
  public Response<ApplicationsDto> create(
          Request<ApplicationsDto> request, Locale locale)
          throws ParseException, JsonProcessingException {

      platformReadinessService.requireEmailDeliveryAvailable(
              EmailActionType.APPLICATION_VERIFICATION, locale);

      for (ApplicationsDto dto : request.getDatas()) {
          // Validation des champs obligatoires
          Map<String, Object> fieldsToVerify = new HashMap<>();
          fieldsToVerify.put("candidateFirstName", dto.getCandidateFirstName());
          fieldsToVerify.put("candidateLastName", dto.getCandidateLastName());
          fieldsToVerify.put("candidateEmail", dto.getCandidateEmail());
          fieldsToVerify.put("candidatePhone", dto.getCandidatePhone());

          if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
              throw new InvalidEntityException(
                  functionalError.FIELD_EMPTY(
                      Validate.getValidate().getField(), locale));
          }

          // Vérification du jeton de source et de la campagne
          SourceToken existingSourceToken = sourceTokenRepository
              .findOne(dto.getSourceTokenId(), false);
          if (existingSourceToken == null) {
              throw new EntityNotFoundException(
                  functionalError.DATA_NOT_EXIST(
                      "sourceToken", locale));
          }

          Campaigns campaign = existingSourceToken.getCampaigns();
          // ... vérification des limites, instanciation, pipeline, quiz ...
      }

      return response;
  }
  ```

  #v(0.5cm)
  #text(size: 10pt, weight: "semibold", fill: palette.primary)[Extrait C.3 — DashboardController : endpoint d'agrégation des statistiques]

  Le contrôleur ci-dessous illustre le pattern d'agrégation utilisé pour le tableau de bord. Un endpoint unique #raw("GET /api/dashboard/overview-stats") consolide les données de plusieurs repositories — applications, entretiens, évaluations, décisions — et produit un objet JSON structuré contenant les indicateurs clés (KPIs avec deltas mensuels), les distributions par statut, les tendances sur 30 jours, l'entonnoir de conversion, le top 5 des campagnes et la distribution des scores de quiz.

  #show raw: set text(size: 8.5pt)
  ```java
  @GetMapping("/overview-stats")
  public Map<String, Object> getOverviewStats() {
      Map<String, Object> result = new LinkedHashMap<>();

      List<Applications> apps = applicationsRepository.findAll().stream()
              .filter(a -> !Boolean.TRUE.equals(a.getIsDeleted()))
              .toList();

      // KPIs avec delta mois en cours vs mois précédent
      Map<String, Object> kpis = new LinkedHashMap<>();
      kpis.put("applications", buildKpi(apps, Applications::getCreatedAt,
              startOfPrevMonth, startOfMonth));
      // ... interviews, evaluations, decisions ...
      result.put("kpis", kpis);

      // Distribution par statut, tendance 30 jours, entonnoir, top campagnes...
      result.put("statusDistribution",
          toEntryList(apps.stream()
              .collect(Collectors.groupingBy(Applications::getApplicationStatus,
                       LinkedHashMap::new, Collectors.counting()))));

      result.put("applicationsTrend", build30DayTrend(apps));
      result.put("conversionFunnel", buildFunnel(apps));
      result.put("topCampaigns", buildTopCampaigns(apps, 5));

      return result;
  }
  ```

  #pagebreak()
  #top-heading([Table des matières], outlined: false)
  #outline(title: none, depth: 3)
]