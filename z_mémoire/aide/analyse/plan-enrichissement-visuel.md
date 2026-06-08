# Plan d'enrichissement visuel — Mémoire SyneliaQuizApp

> Document créé le 2026-06-07  
> Basé sur l'analyse comparative avec LauraElena_Carvajal_Garcia.pdf  
> Objectif : diversifier les types de figures et mieux répartir les visuels dans toutes les parties

---

## État des lieux

| Section | Figures actuelles | Type dominant |
|---------|-------------------|---------------|
| Partie 1 (Cadre théorique) | 2 (organigramme + table) | Image + Table |
| Partie 2 (Analyse & Conception) | ~28 (Merise, UML, Architecture) | Merise/UML à 75% |
| Partie 3 (Réalisation) | 2 (MPT) | Architecture physique |
| Partie 4 (Résultats) | 3 (captures) | Images |
| **Total** | **~35 figures** | **Monotone** (Merise x17, UML x4, Captures x3) |

**Problème** : les 2 premières parties (60% du mémoire) n'ont quasiment que des tableaux et du texte, les figures sont concentrées en Partie 2 (conception Merise).

---

## Plan détaillé — 22 figures proposées

### 🔴 Priorité haute (10 figures)

| # | Chapitre | § | Type de figure | Description | Remplace |
|---|----------|---|----------------|-------------|----------|
| 1 | 1. Présentation générale | Processus de recrutement | **Schéma de flux** (BPMN-like) | Processus éclaté actuel : email → fichiers → formulaires externes → validation informelle. Flèches rouges = ruptures, icônes = outils disparates | Texte descriptif |
| 2 | 2. État de l'art | Benchmark | **Matrice visuelle comparée** | Lignes = fonctionnalités (campagnes, quiz, entretien, permissions, dashboard), Colonnes = Workable / Greenhouse / HackerRank / SyneliaQuizApp. Cellules = ✅⚠️❌ avec code couleur | Texte benchmark actuel |
| 3 | 2. État de l'art | Synthèse comparative | **Pile technologique en couches** | Navigateur → Angular 20 → REST/JSON → Spring Boot 3.5 → JPA/Hibernate → MySQL 8. Chaque couche avec icône + version | Tableau de synthèse |
| 4 | 3. Analyse des besoins | Priorisation MoSCoW | **Pyramide MoSCoW visuelle** | 3 niveaux empilés (Must have / Should have / Won't have) avec pastilles colorées par lot fonctionnel + compteur de besoins par niveau | Tableau MoSCoW |
| 5 | 4. Conception | Dépendances fonctionnelles | **Graphe de dépendances** | Nœuds = déterminants (campaign_id, application_id, etc.), Arêtes = attributs dépendants. Taille des nœuds ∝ nombre de dépendances | Tableau actuel |
| 6 | 4. Conception | Diagrammes d'activités | **Machine d'états — Candidature** | États : PENDING → EMAIL_VERIFIED → QUIZ_IN_PROGRESS → QUIZ_COMPLETED → INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED → DECIDED. Transitions avec conditions (ex: quiz expiré → ABANDONED) | Tableau descriptif actuel |
| 7 | 4. Conception | Diagrammes d'activités | **Machine d'états — Campagne** | États : DRAFT → OPEN → IN_PROGRESS → CLOSED → ARCHIVED. Transitions avec conditions (ex: date de fin atteinte → CLOSED) | À ajouter |
| 8 | 6. Implémentation | Notifications | **Schéma Pub/Sub** | EventEmitter → [EmailService(Thymeleaf), InAppNotificationService, MailLogService]. Chaque branche avec exemple concret (ex: nouvelle candidature → email de vérification) | Texte descriptif |
| 9 | 7. Tests | Stratégie de tests | **Pyramide des tests** | 3 niveaux : Unitaires (JUnit, base), Intégration/API (Postman, contrôleurs), Fonctionnels/E2E (scénarios). Largeur proportionnelle au volume | Tableau des niveaux |
| 10 | 8. Résultats | Fonctionnalités implémentées | **Radar de couverture** | 6 axes (Campagnes, Candidatures, Quiz, Entretiens, Évaluations, Admin) notés de 1 à 5. Superposition : attendu (pointillés) vs réalisé (plein) | Tableau actuel |

### 🟡 Priorité moyenne (9 figures)

| # | Chapitre | § | Type de figure | Description | Remplace |
|---|----------|---|----------------|-------------|----------|
| 11 | 1. Présentation générale | Défis et limitations | **Schéma 3 colonnes** | Fragmentation des outils / Absence standardisation / Manque traçabilité. Chaque colonne = icône + flèche de conséquence + impact métier | Texte descriptif |
| 12 | 1. Présentation générale | Acteurs du système | **Diagramme des acteurs** | 4 stick figures (Candidat, Recruteur, Admin, Super Admin) avec bulles d'interaction principales | Aucun (ajout) |
| 13 | 2. État de l'art | Critères de sélection | **Radar 6 axes** | Adéquation métier / Maturité / Sécurité native / Structuration / Productivité / Coût — 5 courbes superposées (Spring Boot, Node.js, Django, ASP.NET, Laravel) | Tableau des critères |
| 14 | 3. Analyse des besoins | Parties prenantes | **Stakeholder map** | 4 quadrants (Interne/Externe × Stratégique/Opérationnel). Positionner Candidat (externe, opérationnel), Recruteur (interne, opérationnel), Admin (interne, stratégique), Super Admin (interne, stratégique) | Aucun (ajout) |
| 15 | 4. Conception | Merise→Tables | **Schéma de mapping** | Colonne gauche = 7 entités conceptuelles, Colonne droite = tables physiques. Flèches de correspondance | Tableau actuel |
| 16 | 4. Conception | API REST | **Carte des endpoints** | Arbre visuel : `/api` → branches par domaine (auth, campaigns, applications, quiz, interviews, evaluations, decisions, admin). Chaque feuille = endpoint avec méthode HTTP | Tableau des familles |
| 17 | 5. Environnement technique | Récapitulatif | **Stack technique visuelle** | Icônes empilées : Angular 20.2 → Spring Boot 3.5.6 → Java 21 → MySQL 8 → Flyway → Redis 7 → MinIO | Tableau récapitulatif |
| 18 | 6. Implémentation | Moteur de pipeline | **Diagramme de séquence** | Recruteur → Controller → PipelineBusiness → PipelineTemplate → PipelineStage → ApplicationProgress → DB. Une séquence pour "avancer une candidature" | Aucun (ajout) |
| 19 | 6. Implémentation | Traçabilité et audit | **Schéma chaîne d'audit** | User Action → AuditEventService → Snapshot JSON (avant/après) → audit_event table. Annotation des champs clés (entity_type, action, actor, timestamp, delta) | Texte descriptif |

### 🟢 Priorité basse (3 figures)

| # | Chapitre | § | Type de figure | Description | Remplace |
|---|----------|---|----------------|-------------|----------|
| 20 | 1. Présentation générale | Objectifs | **Pyramide des objectifs** | 3 niveaux : Digitaliser (base) → Automatiser l'évaluation (milieu) → Améliorer la collaboration (sommet). Flèche montante = valeur ajoutée | Texte descriptif |
| 21 | 3. Analyse des besoins | Règles de gestion | **Carte des dépendances** | 9 règles (RG-01 à RG-09) en nœuds, flèches = "conditionne" ou "est prérequis de" | Aucun (ajout) |
| 22 | 7. Tests | Couverture | **Graphique en barres** | Barres par module métier (Permissions, Formulaires, Quiz, Entretiens, Décisions, Notifications, Admin) avec % de classes testées et nb de specs | Aucun (ajout) |

---

## Bilan

| Priorité | Nombre | Types de figures |
|---|---|---|
| 🔴 Haute | 10 | Flux BPMN, matrice benchmark, pile techno, pyramide MoSCoW, graphe dépendances, machines d'états (×2), pub/sub, pyramide tests, radar couverture |
| 🟡 Moyenne | 9 | Schéma 3 colonnes, acteurs, radar 6 axes, stakeholder map, mapping Merise, carte API, stack visuelle, séquence pipeline, chaîne audit |
| 🟢 Basse | 3 | Pyramide objectifs, carte dépendances règles, graphique couverture tests |

| Métrique | Avant | Après |
|---|---|---|
| Nombre total de figures | ~35 | ~57 |
| Types de figures distincts | 4 (Merise, UML, Table, Capture) | 12+ (BPMN, radar, pyramide, graphe, machine d'états, matrice visuelle, pub/sub, pile, carte, séquence, flux, schéma conceptuel) |
| Figures en Partie 1 | 2 | 7-8 |
| Figures en Partie 3 | 2 | 6-7 |
| Tableaux remplacés par schémas | — | 8 |

---

## Recommandation de mise en œuvre

1. **Commencer par les 10 🔴** — ce sont les plus impactants et les plus visibles
2. **Par lot de 2-3 figures par session** pour éviter la fatigue
3. **Pour chaque figure** : définir le schéma → le coder en Typst (ou l'exporter en PNG depuis un outil externe) → l'insérer dans le body.typ
4. **Outils suggérés** pour créer les schémas : draw.io (export PNG), Mermaid (export SVG), Typst directement (pour les diagrammes simples), Python matplotlib (pour les graphiques de données)
