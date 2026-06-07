# Analyse comparative : Mémoire de LauraElena Carvajal Garcia vs Votre mémoire

> Fichier créé le 2026-06-07  
> Source analysée : `LauraElena_Carvajal_Garcia.pdf` (PhD Thesis — Universidad Politécnica de Madrid)  
> Source comparée : `z_mémoire/template_memoire/typst/` (Mémoire d'ingénieur ENSIT — SyneliaQuizApp)

---

## 1. CE QU'IL Y A DANS LE MÉMOIRE DE LAURA ELENA ET PAS DANS LE VÔTRE

### 1.1 Structure académique formelle

Laura Elena écrit un **PhD thesis** (thèse de doctorat) de ~260 pages. Les différences structurelles majeures sont :

| Élément | Laura Elena | Votre mémoire |
|---------|-------------|---------------|
| **Revue systématique de la littérature (SLR)** | Très formelle : critères d'inclusion/exclusion, tables de sélection des études, mot-clés de recherche documentés, processus d'extraction de données, diagramme PRISMA implicite | Benchmark des solutions existantes + état de l'art technologique, mais pas de SLR formelle |
| **Hypothèse de recherche** | Formulée explicitement avec hypothèse nulle (H0) et alternative (H1) | Problématique énoncée mais pas d'hypothèse formelle testable |
| **Question de recherche centrale** | Explicite et clairement formulée dès le chapitre 3 | Oui, mais moins formelle |
| **Tables de synthèse comparative des travaux connexes** | Tableau complet (Table 2.5-1, page 37) avec colonnes : auteur, working set, abstraction level, validation, traceability | Pas d'équivalent — benchmark textuel seulement |
| **Validation empirique structurée** | Expérimentation planifiée avec groupes de contrôle, mesures quantitatives (temps de développement, qualité des designs, complexité perçue) | Tests fonctionnels + validation API mais pas d'expérimentation contrôlée |
| **Matrice des forces / limitations** | Analyse des forces ET faiblesses de chaque travail connexe | Benchmark comparatif mais moins systématique |
| **Annexes détaillées** | Résultats bruts de recherche Google Scholar, questionnaires, données expérimentales | Absentes (prévues ?) |

### 1.2 Contenu conceptuel absent de votre mémoire

- **Concept de "Functional Usability Features" (FUF)** : 11 caractéristiques d'utilisabilité avec impact prouvé sur le design logiciel (System Status Feedback, Progress Feedback, Warning, Undo, Abort, Step-by-Step, Preferences, Personal Object Space, Favorites, Multilevel Help, Command Aggregation)
- **Méta-modèle de cas d'utilisation pour l'utilisabilité** : représentation formelle des besoins d'utilisabilité sous forme de use cases
- **Système de "responsabilités"** à plusieurs niveaux : System Responsibilities → High-level component responsibilities → Low-level component responsibilities (concept de traçabilité verticale)
- **Artefacts d'élicitation dédiés** : "Usability Elicitation Guideline" structuré en HCI Recommendations → Elaboration → Stakeholders Discussion → Usage Examples
- **Pattern language à base de responsabilités** : réutilisation de 84% des responsabilités entre patterns

### 1.3 Différence fondamentale de nature

| Votre mémoire | Mémoire de Laura Elena |
|---------------|------------------------|
| Produit un **logiciel opérationnel** | Produit des **concepts et patterns architecturaux** |
| Contribution = **application web fonctionnelle** | Contribution = **méthode + guidelines + artefacts de conception** |
| Sujet = **processus métier** (recrutement digitalisé) | Sujet = **architecture logicielle conceptuelle** (patterns d'utilisabilité) |
| Approche = **ingénierie de développement** | Approche = **recherche scientifique en génie logiciel** |

---

## 2. POURQUOI SON MÉMOIRE EST-IL SI RICHE EN FIGURES ?

### 2.1 Analyse quantitative (estimation)

Son mémoire contient environ **60 à 80 figures** pour ~200 pages de contenu. Les types de figures se répartissent ainsi :

| Type de figure | Estimation | Exemples |
|----------------|-----------|----------|
| Diagrammes UML (composants, séquence, classes) | ~25-30 | Figures 2.4-1 à 2.4-5, diagrammes de séquence |
| Tables complexes (matrices, synthèses) | ~15-20 | Table 2.2-2, Table 2.4-1, Table 2.5-1 |
| Schémas conceptuels originaux | ~8-10 | Framework d'utilisabilité, pyramide attributs/propriétés/patterns |
| Graphiques de données (barres, courbes) | ~5-8 | Figure 2.3-3, impacts mesurés des FUFs |
| Captures d'écran | ~0-2 | Quasiment pas de captures d'écran |
| Diagrammes BPMN / processus | ~5 | Figure 3.3-1, Figure 4.2-1 |
| Diagrammes MCC / communication | ~2 | MCC des flux d'information |

### 2.2 Les 7 raisons pour lesquelles elle a autant de figures

#### 1. SON SUJET EST INTRINSÈQUEMENT VISUEL
Elle propose des **patterns architecturaux** — un pattern architectural SE REPRÉSENTE par un diagramme. C'est le médium naturel du sujet.  
→ Votre sujet (application de recrutement) est plus **processuel et fonctionnel** que conceptuel/architectural.

#### 2. SES DIAGRAMMES SONT SA CONTRIBUTION SCIENTIFIQUE
Ses figures ne sont pas des illustrations — ce sont SES RÉSULTATS. Chaque diagramme de composants, chaque diagramme de séquence est un artefact de recherche qu'elle a produit et qui constitue sa contribution. Toutes les 2-3 pages, elle présente un nouveau pattern.

#### 3. ELLE PRODUIT DES VUES MULTIPLES DU MÊME OBJET
Pour chaque pattern, elle produit systématiquement :
- Une description textuelle du problème
- Un diagramme de composants (architecture)
- Un diagramme de séquence (comportement)
- Une implémentation OO suggérée
→ Cela triple le nombre de figures par pattern.

#### 4. SES FIGURES SONT VARIÉES DANS LEUR NATURE
- Diagrammes UML (composants, séquence, classes)
- Tables de données (résultats de recherche Google Scholar)
- Matrices comparatives (bénéfices vs tactiques architecturales)
- Graphiques quantitatifs (impact measurement, bar charts)
- Schémas de décomposition (attributs → propriétés → patterns)
- Cartes de forces (concept issu de l'architecture logicielle)
- BPMN / diagrammes de processus

#### 5. CHAQUE FIGURE EST JUSTIFIÉE PAR LE TEXTE
Système de renvoi systématique « Figure X.X-X » avec légende descriptive. Chaque figure est **discutée dans le paragraphe qui précède ou suit**.

#### 6. ELLE UTILISE DES TABLES STRUCTURÉES PLUTÔT QUE DU TEXTE
Au lieu de décrire textuellement les résultats de sa revue de littérature, elle les met dans des **tables visuelles** :
- Table 2.2-2 : 29 études sélectionnées avec auteur, titre, source, année, type
- Table 2.2-3 : Raisons d'exclusion avec colonne critère + reasoning
→ Cela donne immédiatement une richesse visuelle.

#### 7. ELLE N'HÉSITE PAS À RÉPÉTER UN PATTERN VISUEL POUR PLUSIEURS VUES
Les MCD/MLD/MPD de votre mémoire sont 5×3 = 15 figures. Dans son cas, elle utilise le même pattern : pour chaque FUF (11 features), elle aurait pu produire guideline + diagramme de classes + diagramme de séquence. Mais elle ne le fait que pour les plus importants.

---

## 3. CE QUI VOUS MANQUE POUR ATTEINDRE CE NIVEAU DE RICHESSE VISUELLE

### 3.1 Types de figures que vous pourriez AJOUTER

#### A. Diagrammes de séquence détaillés (vous en avez déjà 1)
Vous avez un diagramme de séquence (soumission candidature). Vous pourriez en ajouter 3-4 de plus :
- **Passation du quiz** : Candidat → Frontend → API Quiz → Version formulaire → Réponses → Score
- **Planification d'entretien** : Recruteur → Frontend → API Entretien → Notification → Candidat
- **Décision finale** : Recruteur → API Décision → Pipeline → Notification → Candidat
- **Vérification d'email** : Candidat → Email → API → Vérification → Mise à jour statut

Cela vous donnerait 4-5 diagrammes de séquence supplémentaires.

#### B. Graphiques de données quantitatives
Aucun graphique de données dans votre mémoire. Pourtant vous avez des données exploitables :
- **Volumétrie** : nombre de campagnes, de candidatures, de quiz passés
- **Temps de réponse API** : avant/après optimisation
- **Couverture de tests** : % de classes testées par module
- **Complexité cyclomatique** par module métier
- **Répartition des permissions** : combien d'utilisateurs par rôle
- **Taux de conversion** candidature → quiz → entretien → décision

#### C. Schémas conceptuels originaux
Créez des schémas qui expliquent les CONCEPTS, pas seulement l'architecture :
- **Pyramide de la gouvernance des permissions** : Rôle système → Permission d'entité → Override
- **Cycle de vie d'une campagne** : Brouillon → Ouverte → En cours → Clôturée → Archivée (avec les transitions)
- **Carte des dépendances entre modules** : montrant comment campagne, candidature, quiz, entretien, évaluation, décision sont liés
- **Entonnoir de conversion** : Nombre de vues → nombre de candidatures → nombre de quiz complétés → nombre d'entretiens → nombre de décisions

#### D. Matrices comparatives visuelles
Vous avez des tables comparatives (Spring Boot vs Node.js, Angular vs React, etc.) mais vous pourriez ajouter :
- **Matrice fonctionnalités vs solutions du marché** : lignes = fonctionnalités, colonnes = Workable / Greenhouse / HackerRank / SyneliaQuizApp, cellules = ✅ / ⚠️ / ❌
- **Matrice besoins vs acteurs** : qui fait quoi dans le système (visuel plus poussé)

#### E. Diagrammes de flux utilisateur (User Journey Maps)
Pour chaque type d'utilisateur :
- **Parcours candidat** : découverte → soumission → vérification → quiz → suivi → entretien → décision
- **Parcours recruteur** : création campagne → publication → réception candidatures → évaluation → entretien → décision
Ces diagrammes existent peut-être déjà dans vos cartographies fonctionnelles.

#### F. Captures d'écran annotées
Vous avez 3 captures d'écran (page 3). Pour atteindre 10-15 figures de plus, ajoutez :
- Interface de passation du quiz (annotée : timer, progression, questions, bouton valider)
- Interface d'évaluation collaborative (annotée : critères, pondérations, commentaires)
- Interface de gestion des pipelines (annotée : étapes, ordre, config)
- Interface de suivi candidat public (annotée : statut, historique, actions disponibles)
- Tableau de bord recruteur (annoté : KPIs, filtres, graphiques)

### 3.2 Pourquoi vos figures actuelles ne suffisent pas

Votre mémoire actuel a une structure de figures concentrée :

| Section | Figures | Type dominant |
|---------|---------|---------------|
| Présentation Synelia | 1 (organigramme) + 1 table | Image + Table |
| Architecture | 2 figures | Schémas |
| MCD | 5 figures | Merise |
| MLD | 5 figures | Merise |
| MPD | 5 figures | Merise |
| SAT | 2 figures | Merise |
| MCT | 3 figures (1 inline + 3 images) | Merise + Processus |
| MPT | 2 figures | Architecture physique |
| MCC | 1 figure | Communication |
| Classes UML | 4 figures | UML |
| Séquence | 1 figure (+ renvoi annexe) | UML |
| Captures d'écran | 3 | Images |
| **Total** | **~35 figures** | |

Le problème n'est pas le nombre (35 c'est honorable), c'est la **monotonie** :
- 17 figures sur 35 sont des diagrammes Merise (MCD/MLD/MPD) → même pattern répété 15 fois
- 4 figures sont des classes UML → deuxième pattern répété 4 fois
- 3 figures sont des captures d'écran → troisième pattern répété 3 fois

Laura Elena, elle, alterne : diagramme de composants → table de données → graphique → diagramme de séquence → table comparative → schéma conceptuel → etc.

### 3.3 Plan d'action pour enrichir votre mémoire en figures

- **Ajouter 4 diagrammes de séquence** (quiz, entretien, décision, vérification email) → +4 figures
- **Ajouter 3 graphiques de données** (volumétrie, performance, couverture tests) → +3 figures
- **Ajouter 3 schémas conceptuels** (cycle de vie campagne, pyramide permissions, carte dépendances modules) → +3 figures
- **Ajouter 1 matrice comparative fonctionnelle** (SyneliaQuizApp vs solutions marché) → +1 figure
- **Ajouter 2 captures d'écran annotées** (quiz, dashboard) → +2 figures
- **Ajouter 2 user journey maps** (candidat, recruteur) → +2 figures
- **Ajouter 1 diagramme d'états** (machine d'état d'une candidature) → +1 figure

**Total potentiel : +16 figures → ~51 figures** pour un mémoire plus riche visuellement.

---

## 4. CE QUE VOUS AVEZ QUE LAURA ELENA N'A PAS

Il est important de noter que certaines forces de votre mémoire n'ont pas d'équivalent chez elle :

| Votre force | Pourquoi c'est important |
|-------------|--------------------------|
| **Une application qui marche** | Contribution concrète et vérifiable — la sienne est conceptuelle |
| **Démarche Merise complète** (MCD → MLD → MPD + MCT + MPT + MCC + SAT) | Rigueur méthodologique française que les PhD espagnols n'ont pas toujours |
| **Captures d'écran réelles** | Preuve tangible du résultat livré |
| **Pipeline configurable** | Concept de machine d'états adaptable, contribution technique forte |
| **Mécanismes anti-triche** | Problème réel d'ingénierie résolu dans votre contexte |
| **Temps réel (WebSocket)** | Composante technique avancée absente de son travail |

---

## 5. RECOMMANDATIONS PRIORITAIRES

### Priorité haute (impact immédiat)

1. **Ajouter 4 diagrammes de séquence** — c'est le plus gros manque car votre UML est surtout statique (diagrammes de classes) et vous n'avez qu'1 séquence
2. **Ajouter 2-3 schémas conceptuels** — cycle de vie de campagne, pyramide des permissions, carte des dépendances entre modules
3. **Ajouter 2 captures d'écran annotées** — quiz technique et dashboard (ce sont les fonctionnalités les plus différenciantes)
4. **Ajouter 1 matrice comparative** — SyneliaQuizApp vs Workable vs Greenhouse vs HackerRank (avec colonnes fonctionnalités)

### Priorité moyenne (renforce la crédibilité)

5. **Ajouter un graphique de couverture de tests** par module métier
6. **Ajouter un diagramme d'états** de la candidature (machine d'états du pipeline)
7. **Ajouter un user journey map** candidat (montre l'expérience de bout en bout)

### Priorité basse (peaufinage)

8. **Ajouter les annexes** : extraits de code significatifs, extraits de Postman collections, résultats bruts de recherche
9. **Ajouter une table de synthèse** de vos résultats de tests et validation

---

## 6. SYNTHÈSE

| Aspect | Laura Elena | Vous |
|--------|-------------|------|
| Type de document | PhD Thesis | Mémoire d'ingénieur |
| Contribution | Conceptuelle (patterns, guidelines, méthodes) | Opérationnelle (application web fonctionnelle) |
| Nombre de figures | ~60-80 | ~35 |
| Richesse visuelle | Très variée (8 types de figures) | Concentrée sur Merise/UML/captures |
| Revue de littérature | SLR formelle avec tables | Benchmark + état de l'art technologique |
| Validation empirique | Expérimentation planifiée avec mesures quantitatives | Tests fonctionnels + validation API |
| Force principale | Rigueur académique et richesse conceptuelle | Résultat concret et opérationnel |

**Votre mémoire n'est PAS moins bon** — il est différent par nature. Mais comme Laura Elena a une thèse de doctorat, son niveau d'exigence académique sur les figures est plus élevé. Les recommandations ci-dessus visent à vous rapprocher de ce standard SANS changer la nature de votre contribution.