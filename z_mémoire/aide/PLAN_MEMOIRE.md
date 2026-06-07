# SQUELETTE COMPLET DU MÉMOIRE D'INGÉNIEUR
## Application Web de Gestion du Processus de Recrutement - SyneliaQuizApp

---

## 🎓 TITRES PROPOSÉS POUR LE MÉMOIRE

### Proposition 1
**« Étude, conception et mise en œuvre d'une application web de gestion du processus de recrutement avec évaluation technique automatisée : Cas de l'entreprise SYNELIA »**

### Proposition 2
**« Conception et déploiement d'une plateforme digitale de recrutement intégrant un système de quiz technique et d'évaluation collaborative : Application pour SYNELIA »**

### Proposition 3
**« Mise en place d'un système d'information pour l'automatisation du processus de recrutement et d'évaluation des candidats : Étude de cas SYNELIA »**

---

# STRUCTURE DU MÉMOIRE

---

## COUVERTURE

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│              [Logo ENSIT]           [Logo Ministère Éducation]      │
│                                                                     │
│         ÉCOLE NOUVELLE SUPÉRIEURE D'INGÉNIEURS ET DE TECHNOLOGIE   │
│                              (ENSIT)                                │
│                                                                     │
│                           ═══════════                               │
│                                                                     │
│                   MÉMOIRE DE FIN D'ÉTUDES                           │
│                                                                     │
│     En vue de l'obtention du diplôme d'Ingénieur en Sciences        │
│              Informatiques - Option : Génie Logiciel                │
│                                                                     │
│                           ═══════════                               │
│                                                                     │
│                              THÈME :                                │
│                                                                     │
│     « Étude, conception et mise en œuvre d'une application web     │
│       de gestion du processus de recrutement avec évaluation       │
│       technique automatisée : Cas de l'entreprise SYNELIA »        │
│                                                                     │
│                           ═══════════                               │
│                                                                     │
│   Présenté par :                                                    │
│   [NOM Patronymique] [Prénom]                                       │
│                                                                     │
│   Encadreur pédagogique :                                           │
│   [Titre] [NOM] [Prénom]                                            │
│                                                                     │
│   Maître de stage :                                                 │
│   [NOM] [Prénom]                                                    │
│   [Fonction : ex. Directeur Technique / Chef de Projet]             │
│                                                                     │
│   Entreprise d'accueil : SYNELIA                                    │
│                                                                     │
│                    Année académique : 2023 - 2024                   │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## PAGE DE GARDE

*(Reprend exactement les éléments de la couverture)*

---

## PAGE DE REMERCIEMENTS *(Facultatif)*

```
REMERCIEMENTS

[Espace réservé pour les remerciements personnels]

- Remerciements à l'encadreur pédagogique
- Remerciements au maître de stage
- Remerciements à l'entreprise SYNELIA
- Remerciements à l'ENSIT
- Remerciements aux membres du jury
- Remerciements à la famille et aux proches
```

---

## RÉSUMÉ / ABSTRACT

### Résumé (Français)
*(Maximum 1 à 1,5 page)*

```
RÉSUMÉ

[À rédiger : Synthèse du travail réalisé]

Structure suggérée :
- Contexte du projet et problématique
- Objectifs du travail
- Méthodologie adoptée
- Technologies utilisées (Spring Boot, Angular, MySQL)
- Principales fonctionnalités développées
- Résultats obtenus
- Mots-clés : Application web, Recrutement, Quiz technique, Spring Boot, 
  Angular, Évaluation collaborative, SPA, API REST

```

### Abstract (Anglais)
*(Maximum 1 à 1,5 page)*

```
ABSTRACT

[À rédiger : English translation of the summary]

Keywords: Web application, Recruitment, Technical quiz, Spring Boot, 
Angular, Collaborative evaluation, SPA, REST API
```

---

## SOMMAIRE

```
SOMMAIRE

INTRODUCTION

PREMIÈRE PARTIE : CADRE THÉORIQUE ET CONTEXTE DU PROJET
    Chapitre 1 : Présentation générale du projet
    Chapitre 2 : Étude de l'existant et état de l'art

DEUXIÈME PARTIE : ANALYSE ET CONCEPTION
    Chapitre 3 : Analyse des besoins
    Chapitre 4 : Conception de la solution

TROISIÈME PARTIE : RÉALISATION ET MISE EN ŒUVRE
    Chapitre 5 : Environnement technique et outils
    Chapitre 6 : Implémentation de la solution
    Chapitre 7 : Tests et validation

QUATRIÈME PARTIE : RÉSULTATS ET PERSPECTIVES
    Chapitre 8 : Présentation des résultats
    Chapitre 9 : Limites et perspectives

CONCLUSION

RÉFÉRENCES BIBLIOGRAPHIQUES

ANNEXES

TABLE DES MATIÈRES
```

---

## AVANT-PROPOS

```
AVANT-PROPOS

1. Présentation de l'école
   - ENSIT : École Nouvelle Supérieure d'Ingénieurs et de Technologie
   - Historique et mission
   - Programmes de formation proposés
   - Option Génie Logiciel

2. Présentation de la formation
   - Cycle ingénieur en sciences informatiques
   - Objectifs pédagogiques
   - Compétences visées
   - Place du stage de fin d'études dans le cursus

3. Présentation du diplôme
   - Diplôme d'Ingénieur en Sciences Informatiques
   - Conditions d'obtention
   - Valeur académique et professionnelle

4. Présentation de l'entreprise d'accueil
   - SYNELIA : Activités et domaines d'expertise
   - Structure organisationnelle
   - Vision et valeurs
   - Positionnement sur le marché
   - Contexte d'accueil du stagiaire

5. Cadre du stage
   - Durée du stage
   - Département/Service d'accueil
   - Mission confiée
```

---

## GLOSSAIRE

```
GLOSSAIRE

A
─────────────────────────────────────────────────────────────────
API         : Application Programming Interface - Interface de 
              programmation permettant la communication entre logiciels

Angular     : Framework JavaScript/TypeScript développé par Google 
              pour créer des applications web monopage (SPA)

B
─────────────────────────────────────────────────────────────────
Backend     : Partie serveur d'une application web, gérant la logique 
              métier et l'accès aux données

BCrypt      : Algorithme de hachage cryptographique utilisé pour 
              sécuriser les mots de passe

C
─────────────────────────────────────────────────────────────────
CORS        : Cross-Origin Resource Sharing - Mécanisme de sécurité 
              permettant les requêtes HTTP entre domaines différents

CRUD        : Create, Read, Update, Delete - Opérations de base sur 
              les données

CSS         : Cascading Style Sheets - Langage de description des 
              styles visuels d'une page web

D
─────────────────────────────────────────────────────────────────
DTO         : Data Transfer Object - Objet utilisé pour transférer 
              des données entre les couches de l'application

E
─────────────────────────────────────────────────────────────────
E-recrutement : Processus de recrutement utilisant les technologies 
                numériques

F
─────────────────────────────────────────────────────────────────
Frontend    : Partie client d'une application web, interface 
              utilisateur visible dans le navigateur

H
─────────────────────────────────────────────────────────────────
HTML        : HyperText Markup Language - Langage de balisage pour 
              la structure des pages web

HTTP        : HyperText Transfer Protocol - Protocole de communication 
              pour le web

J
─────────────────────────────────────────────────────────────────
Java        : Langage de programmation orienté objet utilisé pour 
              le développement du backend

JDK         : Java Development Kit - Kit de développement Java

JSON        : JavaScript Object Notation - Format d'échange de données

JWT         : JSON Web Token - Standard pour la création de tokens 
              d'accès sécurisés

L
─────────────────────────────────────────────────────────────────
Lombok      : Bibliothèque Java réduisant le code boilerplate

M
─────────────────────────────────────────────────────────────────
MapStruct   : Framework de mapping d'objets Java

Maven       : Outil de gestion de dépendances et de build pour projets Java

MVC         : Model-View-Controller - Architecture logicielle séparant 
              les données, l'affichage et la logique

MySQL       : Système de gestion de base de données relationnelles

N
─────────────────────────────────────────────────────────────────
npm         : Node Package Manager - Gestionnaire de paquets pour Node.js

O
─────────────────────────────────────────────────────────────────
ORM         : Object-Relational Mapping - Technique de correspondance 
              entre objets et base de données relationnelle

P
─────────────────────────────────────────────────────────────────
POO         : Programmation Orientée Objet

Q
─────────────────────────────────────────────────────────────────
QEEL        : "Who Is Online" - Module de présence en temps réel 
              développé dans l'application

Quiz        : Test technique automatisé pour évaluer les compétences 
              des candidats

R
─────────────────────────────────────────────────────────────────
REST        : Representational State Transfer - Architecture pour 
              les services web

RGPD        : Règlement Général sur la Protection des Données

RxJS        : Reactive Extensions for JavaScript - Bibliothèque 
              pour la programmation réactive

S
─────────────────────────────────────────────────────────────────
SCSS        : Syntactically Awesome Style Sheets - Préprocesseur CSS

SPA         : Single Page Application - Application web monopage

Spring Boot : Framework Java simplifiant le développement d'applications

SQL         : Structured Query Language - Langage de requêtes pour 
              bases de données

T
─────────────────────────────────────────────────────────────────
Token       : Jeton d'authentification ou de vérification

TypeScript  : Langage de programmation typé, superset de JavaScript

U
─────────────────────────────────────────────────────────────────
UML         : Unified Modeling Language - Langage de modélisation

URL         : Uniform Resource Locator - Adresse web

W
─────────────────────────────────────────────────────────────────
WebSocket   : Protocole de communication bidirectionnelle en temps réel

```

---

# INTRODUCTION *(NON NUMÉROTÉE)*

```
INTRODUCTION

1. Présentation du sujet
   - Le recrutement à l'ère du digital
   - L'importance de la digitalisation des processus RH
   - Le projet SyneliaQuizApp comme réponse aux besoins de SYNELIA

2. Problématique
   - Comment optimiser et automatiser le processus de recrutement 
     tout en garantissant une évaluation objective des candidats ?
   - Sous-questions :
     • Comment centraliser la gestion des campagnes de recrutement ?
     • Comment automatiser l'évaluation technique des candidats ?
     • Comment faciliter la collaboration entre recruteurs ?
     • Comment améliorer l'expérience candidat ?

3. Justification du choix de la thématique
   - Pertinence pour l'entreprise SYNELIA
   - Enjeux actuels du recrutement digital
   - Opportunité de développer une solution sur mesure
   - Intérêt académique et professionnel

4. Définition des concepts clés
   - E-recrutement
   - Application web monopage (SPA)
   - Quiz technique automatisé
   - Évaluation collaborative
   - Architecture client-serveur

5. Méthodologie générale adoptée
   - Approche itérative et incrémentale
   - Analyse des besoins
   - Conception UML
   - Développement agile
   - Tests et validation

6. Annonce du plan
   - Présentation des différentes parties du mémoire
   - Logique de progression

7. Phrase conclusive
   « À la fin de ce travail, nous présenterons des perspectives 
   d'amélioration et d'évolution de la solution développée. »
```

---

# CORPS DU MÉMOIRE

---

# PREMIÈRE PARTIE : CADRE THÉORIQUE ET CONTEXTE DU PROJET

---

## CHAPITRE 1 : PRÉSENTATION GÉNÉRALE DU PROJET

### 1.1. Contexte du projet
   - 1.1.1. L'entreprise SYNELIA et ses besoins
   - 1.1.2. Le processus de recrutement traditionnel
   - 1.1.3. Les défis et limitations actuels
   - 1.1.4. La nécessité d'une solution digitale

### 1.2. Objectifs du projet
   - 1.2.1. Objectifs généraux
     * Digitaliser le processus de recrutement
     * Automatiser les évaluations techniques
     * Faciliter la collaboration entre recruteurs
   - 1.2.2. Objectifs spécifiques
     * Développer une application web complète
     * Implémenter un système de quiz technique
     * Créer un module d'évaluation collaborative
     * Assurer le suivi des candidatures en temps réel

### 1.3. Périmètre fonctionnel
   - 1.3.1. Modules couverts par l'application
   - 1.3.2. Acteurs du système
     * Utilisateurs internes (Super Admin, Admin, Recruteur)
     * Utilisateurs externes (Candidats)
   - 1.3.3. Frontières du projet

### 1.4. Contraintes du projet
   - 1.4.1. Contraintes techniques
   - 1.4.2. Contraintes temporelles
   - 1.4.3. Contraintes budgétaires
   - 1.4.4. Contraintes organisationnelles

---

## CHAPITRE 2 : ÉTUDE DE L'EXISTANT ET ÉTAT DE L'ART

### 2.1. Étude de l'existant
   - 2.1.1. Processus actuel de recrutement chez SYNELIA
   - 2.1.2. Outils utilisés actuellement
   - 2.1.3. Points forts identifiés
   - 2.1.4. Limites et dysfonctionnements

### 2.2. Benchmark des solutions existantes
   - 2.2.1. Présentation des solutions du marché
     * Solutions commerciales (Workable, Greenhouse, BambooHR)
     * Solutions open source
   - 2.2.2. Analyse comparative
   - 2.2.3. Forces et faiblesses des solutions analysées
   - 2.2.4. Tableau comparatif

### 2.3. État de l'art technologique
   - 2.3.1. Les frameworks backend modernes
     * Spring Boot et l'écosystème Spring
     * Alternatives (Node.js, Django, .NET)
   - 2.3.2. Les frameworks frontend modernes
     * Angular et ses avantages
     * Comparaison avec React et Vue.js
   - 2.3.3. Les architectures logicielles
     * Architecture monolithique vs microservices
     * Architecture REST
     * Communication temps réel (WebSocket)
   - 2.3.4. Les bases de données relationnelles
     * MySQL et ses caractéristiques

### 2.4. Justification des choix technologiques
   - 2.4.1. Pourquoi Spring Boot ?
   - 2.4.2. Pourquoi Angular ?
   - 2.4.3. Pourquoi MySQL ?
   - 2.4.4. Synthèse des technologies retenues

### 2.5. Critique de l'existant et solution proposée
   - 2.5.1. Synthèse des besoins identifiés
   - 2.5.2. Présentation de la solution envisagée
   - 2.5.3. Valeur ajoutée de la solution

---

# DEUXIÈME PARTIE : ANALYSE ET CONCEPTION

---

## CHAPITRE 3 : ANALYSE DES BESOINS

### 3.1. Méthodologie d'analyse
   - 3.1.1. Techniques de recueil des besoins
   - 3.1.2. Parties prenantes identifiées
   - 3.1.3. Documentation de référence

### 3.2. Besoins fonctionnels
   - 3.2.1. Module Authentification et Gestion des utilisateurs
     * Connexion / Déconnexion
     * Inscription
     * Récupération de mot de passe
     * Gestion des rôles et permissions
   - 3.2.2. Module Données de référence
     * Gestion des départements
     * Gestion des spécialités
     * Gestion des questions et réponses
   - 3.2.3. Module Campagnes de recrutement
     * Création / Modification / Suppression de campagnes
     * Configuration des quiz
     * Génération de tokens de partage
   - 3.2.4. Module Candidatures
     * Formulaire de candidature
     * Vérification email
     * Upload de CV
     * Suivi de candidature
   - 3.2.5. Module Quiz technique
     * Passage du quiz
     * Calcul automatique du score
     * Gestion du chronomètre
   - 3.2.6. Module Entretiens
     * Planification des entretiens
     * Gestion des statuts
     * Convocations automatiques
   - 3.2.7. Module Évaluations
     * Interface d'évaluation collaborative
     * Notation et commentaires
     * Calcul des moyennes
   - 3.2.8. Module Décisions
     * Pré-sélection
     * Décision finale
     * Notifications automatiques
   - 3.2.9. Module Notifications
     * Types de notifications
     * Marquage lu/non-lu
   - 3.2.10. Module Dashboard
     * Statistiques globales
     * Présence en ligne (QEEL)

### 3.3. Besoins non fonctionnels
   - 3.3.1. Performance
     * Temps de réponse
     * Capacité de charge
   - 3.3.2. Sécurité
     * Authentification
     * Autorisation
     * Protection des données
   - 3.3.3. Ergonomie
     * Interface intuitive
     * Responsive design
   - 3.3.4. Maintenabilité
     * Code modulaire
     * Documentation
   - 3.3.5. Disponibilité
     * Taux de disponibilité cible
   - 3.3.6. Conformité
     * RGPD
     * Bonnes pratiques

### 3.4. Diagrammes des cas d'utilisation
   - 3.4.1. Diagramme global
   - 3.4.2. Cas d'utilisation - Administrateur
   - 3.4.3. Cas d'utilisation - Recruteur
   - 3.4.4. Cas d'utilisation - Candidat
   - 3.4.5. Description textuelle des cas d'utilisation principaux

### 3.5. Règles de gestion
   - 3.5.1. Règles métier
   - 3.5.2. Contraintes d'intégrité
   - 3.5.3. Règles de calcul (scores, pourcentages)

---

## CHAPITRE 4 : CONCEPTION DE LA SOLUTION

### 4.1. Architecture globale du système
   - 4.1.1. Architecture logique
     * Présentation de l'architecture en couches
     * Séparation Frontend/Backend
   - 4.1.2. Architecture physique
     * Schéma de déploiement
     * Communication entre composants
   - 4.1.3. Architecture technique détaillée
     * Backend : Controllers → Business → DAO → Entities
     * Frontend : Pages → Services → Composants

### 4.2. Conception de la base de données
   - 4.2.1. Modèle Conceptuel de Données (MCD)
   - 4.2.2. Modèle Logique de Données (MLD)
   - 4.2.3. Modèle Physique de Données (MPD)
   - 4.2.4. Description des entités principales
     * User
     * Departments / Specialities
     * Questions / Answers / QuestionsAnswers
     * Campaigns / SourceToken
     * Applications / CandidateAnswers
     * Interviews / CandidateInterview
     * Evaluations / Decision
     * Notifications
   - 4.2.5. Dictionnaire de données

### 4.3. Diagrammes de classes
   - 4.3.1. Diagramme de classes global
   - 4.3.2. Diagramme de classes - Module Utilisateurs
   - 4.3.3. Diagramme de classes - Module Campagnes
   - 4.3.4. Diagramme de classes - Module Candidatures
   - 4.3.5. Diagramme de classes - Module Quiz
   - 4.3.6. Diagramme de classes - Module Évaluations

### 4.4. Diagrammes de séquence
   - 4.4.1. Séquence - Authentification utilisateur
   - 4.4.2. Séquence - Soumission d'une candidature
   - 4.4.3. Séquence - Passage du quiz technique
   - 4.4.4. Séquence - Création d'un entretien
   - 4.4.5. Séquence - Évaluation collaborative

### 4.5. Diagrammes d'activités
   - 4.5.1. Activité - Processus complet de candidature
   - 4.5.2. Activité - Workflow d'évaluation
   - 4.5.3. Activité - Prise de décision

### 4.6. Diagrammes d'états
   - 4.6.1. États d'une candidature (Application)
   - 4.6.2. États d'un quiz
   - 4.6.3. États d'un entretien

### 4.7. Maquettes et interfaces
   - 4.7.1. Charte graphique
   - 4.7.2. Wireframes des pages principales
   - 4.7.3. Maquettes haute-fidélité
   - 4.7.4. Navigation et arborescence du site

### 4.8. Conception de l'API REST
   - 4.8.1. Convention de nommage des endpoints
   - 4.8.2. Structure des requêtes et réponses
   - 4.8.3. Gestion des erreurs
   - 4.8.4. Documentation de l'API

---

# TROISIÈME PARTIE : RÉALISATION ET MISE EN ŒUVRE

---

## CHAPITRE 5 : ENVIRONNEMENT TECHNIQUE ET OUTILS

### 5.1. Environnement de développement
   - 5.1.1. Matériel utilisé
   - 5.1.2. Système d'exploitation
   - 5.1.3. IDE et éditeurs de code
     * IntelliJ IDEA / VS Code
   - 5.1.4. Outils de versioning (Git)

### 5.2. Technologies backend
   - 5.2.1. Java 21
     * Caractéristiques
     * Nouveautés utilisées
   - 5.2.2. Spring Boot 3.5.6
     * Spring Web (REST)
     * Spring Security
     * Spring WebSocket
     * Spring Mail
     * Spring Data JPA
   - 5.2.3. Bibliothèques complémentaires
     * Lombok
     * MapStruct
     * Thymeleaf (templates email)
   - 5.2.4. Serveur d'application
     * Tomcat embarqué

### 5.3. Technologies frontend
   - 5.3.1. Angular 20
     * Architecture modulaire
     * Composants standalone
     * Routing et guards
   - 5.3.2. TypeScript
   - 5.3.3. RxJS et programmation réactive
   - 5.3.4. SCSS et styles
   - 5.3.5. Outils de build (Angular CLI, npm)

### 5.4. Base de données
   - 5.4.1. MySQL 8.0
     * Configuration
     * Optimisations
   - 5.4.2. Outil d'administration (phpMyAdmin / MySQL Workbench)

### 5.5. Outils complémentaires
   - 5.5.1. Postman (tests API)
   - 5.5.2. Git et GitHub/GitLab
   - 5.5.3. Maven (gestion de dépendances)
   - 5.5.4. npm (gestion de paquets frontend)

---

## CHAPITRE 6 : IMPLÉMENTATION DE LA SOLUTION

### 6.1. Organisation du code source
   - 6.1.1. Structure du projet backend
     * Package business
     * Package rest (controllers)
     * Package dao (repositories, entities)
     * Package config
     * Package security
     * Package utils
     * Package websocket
   - 6.1.2. Structure du projet frontend
     * Dossier pages
     * Dossier components
     * Dossier services
     * Dossier core (guards, interceptors)
     * Dossier shared

### 6.2. Implémentation du backend
   - 6.2.1. Configuration de Spring Boot
   - 6.2.2. Création des entités JPA
   - 6.2.3. Développement des repositories
   - 6.2.4. Implémentation de la couche métier (Business)
   - 6.2.5. Création des contrôleurs REST
   - 6.2.6. Mapping DTO avec MapStruct
   - 6.2.7. Sécurité et authentification
     * Configuration Spring Security
     * Hashage des mots de passe (BCrypt)
     * Gestion des tokens
   - 6.2.8. Système d'emails
     * Configuration Spring Mail
     * Templates Thymeleaf
   - 6.2.9. WebSocket pour le temps réel
     * Configuration WebSocket
     * Module QEEL

### 6.3. Implémentation du frontend
   - 6.3.1. Configuration d'Angular
   - 6.3.2. Création des composants réutilisables
   - 6.3.3. Développement des services HTTP
   - 6.3.4. Implémentation des guards de navigation
   - 6.3.5. Gestion de l'état utilisateur
   - 6.3.6. Formulaires réactifs et validation
   - 6.3.7. Gestion des erreurs et notifications

### 6.4. Implémentation des modules fonctionnels
   - 6.4.1. Module Authentification
   - 6.4.2. Module Gestion des entités
   - 6.4.3. Module Campagnes
   - 6.4.4. Module Candidatures
   - 6.4.5. Module Quiz technique
   - 6.4.6. Module Entretiens
   - 6.4.7. Module Évaluations
   - 6.4.8. Module Dashboard

### 6.5. Intégration et communication
   - 6.5.1. Communication Frontend-Backend (HTTP)
   - 6.5.2. Gestion du CORS
   - 6.5.3. Format des échanges (JSON)
   - 6.5.4. Gestion des fichiers (upload CV)

---

## CHAPITRE 7 : TESTS ET VALIDATION

### 7.1. Stratégie de tests
   - 7.1.1. Types de tests réalisés
   - 7.1.2. Environnement de tests
   - 7.1.3. Données de tests

### 7.2. Tests unitaires
   - 7.2.1. Tests backend (JUnit)
   - 7.2.2. Tests frontend (Karma, Jasmine)
   - 7.2.3. Couverture de code

### 7.3. Tests d'intégration
   - 7.3.1. Tests des endpoints API
   - 7.3.2. Tests avec Postman
   - 7.3.3. Scénarios d'intégration

### 7.4. Tests fonctionnels
   - 7.4.1. Scénarios de tests par module
   - 7.4.2. Tests d'acceptation utilisateur
   - 7.4.3. Validation des règles métier

### 7.5. Tests de performance
   - 7.5.1. Tests de charge
   - 7.5.2. Tests de stress
   - 7.5.3. Analyse des temps de réponse

### 7.6. Tests de sécurité
   - 7.6.1. Tests d'authentification
   - 7.6.2. Tests d'autorisation
   - 7.6.3. Validation des entrées

### 7.7. Recettage et validation
   - 7.7.1. Procédure de recette
   - 7.7.2. Critères de validation
   - 7.7.3. Corrections et itérations

---

# QUATRIÈME PARTIE : RÉSULTATS ET PERSPECTIVES

---

## CHAPITRE 8 : PRÉSENTATION DES RÉSULTATS

### 8.1. Démonstration de l'application
   - 8.1.1. Captures d'écran des interfaces principales
   - 8.1.2. Parcours utilisateur - Administrateur
   - 8.1.3. Parcours utilisateur - Recruteur
   - 8.1.4. Parcours utilisateur - Candidat

### 8.2. Fonctionnalités implémentées
   - 8.2.1. Tableau récapitulatif des fonctionnalités
   - 8.2.2. Taux de couverture des besoins
   - 8.2.3. Fonctionnalités bonus réalisées

### 8.3. Bilan technique
   - 8.3.1. Statistiques du code
     * Nombre de fichiers
     * Lignes de code
     * Nombre d'entités/composants
   - 8.3.2. Performance de l'application
   - 8.3.3. Qualité du code

### 8.4. Retour d'expérience
   - 8.4.1. Difficultés rencontrées
   - 8.4.2. Solutions apportées
   - 8.4.3. Apprentissages techniques
   - 8.4.4. Apport du stage

---

## CHAPITRE 9 : LIMITES ET PERSPECTIVES

### 9.1. Limites du travail réalisé
   - 9.1.1. Limitations fonctionnelles
   - 9.1.2. Limitations techniques
   - 9.1.3. Contraintes non résolues

### 9.2. Perspectives d'amélioration
   - 9.2.1. Améliorations fonctionnelles
     * Intégration calendrier (Google Calendar, Outlook)
     * Visioconférence intégrée (WebRTC)
     * Intelligence artificielle pour le matching CV
     * Support multilingue (i18n)
     * Application mobile (PWA)
   - 9.2.2. Améliorations techniques
     * Tests automatisés complets
     * Pipeline CI/CD
     * Architecture microservices
     * Cache avec Redis
     * Recherche avec Elasticsearch
   - 9.2.3. Déploiement en production
     * Hébergement cloud
     * Configuration de production
     * Monitoring et maintenance

### 9.3. Recommandations
   - 9.3.1. Pour l'entreprise
   - 9.3.2. Pour les développeurs futurs
   - 9.3.3. Pour l'amélioration continue

---

# CONCLUSION *(NON NUMÉROTÉE)*

```
CONCLUSION

1. Rappel de la problématique
   - Reprendre la question centrale du mémoire
   - Rappeler le contexte et les enjeux

2. Rappel de la démarche suivie
   - Synthèse des étapes du projet
   - Méthodologie appliquée
   - Approche adoptée

3. Résultats obtenus
   - Présentation synthétique de l'application développée
   - Adéquation avec les objectifs fixés
   - Fonctionnalités clés implémentées

4. Contributions principales
   - Apports techniques
   - Apports fonctionnels
   - Valeur ajoutée pour SYNELIA

5. Limites du travail
   - Points non couverts
   - Difficultés non résolues
   - Axes d'amélioration identifiés

6. Perspectives
   - Évolutions futures envisagées
   - Recommandations pour la suite
   - Ouverture vers de nouvelles problématiques
```

---

# RÉFÉRENCES BIBLIOGRAPHIQUES

```
RÉFÉRENCES BIBLIOGRAPHIQUES

Classement par thématique

──────────────────────────────────────────────────────────────────────
OUVRAGES
──────────────────────────────────────────────────────────────────────

[1] WALLS, C. (2022). Spring in Action. 6th Edition. Manning Publications.
    ISBN: 978-1617297571

[2] FREEMAN, A. (2022). Pro Angular 16. 6th Edition. Apress.
    ISBN: 978-1484290324

[3] GAMMA, E., HELM, R., JOHNSON, R., VLISSIDES, J. (1994). 
    Design Patterns: Elements of Reusable Object-Oriented Software. 
    Addison-Wesley. ISBN: 978-0201633610

[4] MARTIN, R. C. (2017). Clean Architecture: A Craftsman's Guide 
    to Software Structure and Design. Prentice Hall. 
    ISBN: 978-0134494166

[5] FOWLER, M. (2002). Patterns of Enterprise Application Architecture. 
    Addison-Wesley. ISBN: 978-0321127426

──────────────────────────────────────────────────────────────────────
ARTICLES ET PUBLICATIONS
──────────────────────────────────────────────────────────────────────

[6] [À compléter avec les articles académiques consultés]

──────────────────────────────────────────────────────────────────────
DOCUMENTATION TECHNIQUE
──────────────────────────────────────────────────────────────────────

[7] Spring Boot Documentation. (2024). 
    https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/
    [Consulté le : JJ/MM/AAAA]

[8] Angular Documentation. (2024). 
    https://angular.dev/
    [Consulté le : JJ/MM/AAAA]

[9] MySQL 8.0 Reference Manual. (2024). 
    https://dev.mysql.com/doc/refman/8.0/en/
    [Consulté le : JJ/MM/AAAA]

[10] MapStruct Documentation. (2024). 
     https://mapstruct.org/documentation/stable/reference/html/
     [Consulté le : JJ/MM/AAAA]

[11] Project Lombok Documentation. (2024). 
     https://projectlombok.org/features/
     [Consulté le : JJ/MM/AAAA]

──────────────────────────────────────────────────────────────────────
SITES WEB ET RESSOURCES EN LIGNE
──────────────────────────────────────────────────────────────────────

[12] Baeldung - Java, Spring and Web Development Tutorials. 
     https://www.baeldung.com/
     [Consulté le : JJ/MM/AAAA]

[13] Stack Overflow - Developer Community. 
     https://stackoverflow.com/
     [Consulté le : JJ/MM/AAAA]

[14] GitHub - Version Control and Collaboration. 
     https://github.com/
     [Consulté le : JJ/MM/AAAA]

──────────────────────────────────────────────────────────────────────
NORMES ET STANDARDS
──────────────────────────────────────────────────────────────────────

[15] RFC 7519 - JSON Web Token (JWT). (2015). 
     https://tools.ietf.org/html/rfc7519
     [Consulté le : JJ/MM/AAAA]

[16] OpenAPI Specification. (2024). 
     https://spec.openapis.org/oas/latest.html
     [Consulté le : JJ/MM/AAAA]

```

---

# ANNEXES

```
ANNEXES

Annexe A : Captures d'écran de l'application
   - A.1 : Page de connexion
   - A.2 : Dashboard administrateur
   - A.3 : Liste des campagnes
   - A.4 : Formulaire de création de campagne
   - A.5 : Formulaire de candidature
   - A.6 : Interface de quiz
   - A.7 : Page d'évaluation collaborative
   - A.8 : Tableau de bord des candidatures
   - A.9 : Gestion des entretiens
   - A.10 : Centre de notifications

Annexe B : Diagrammes complémentaires
   - B.1 : Diagramme de classes complet
   - B.2 : Diagrammes de séquence détaillés
   - B.3 : Diagramme de déploiement

Annexe C : Scripts de base de données
   - C.1 : Script de création des tables
   - C.2 : Script d'insertion des données de test
   - C.3 : Requêtes SQL importantes

Annexe D : Extraits de code significatifs
   - D.1 : Configuration Spring Security
   - D.2 : Exemple de Controller REST
   - D.3 : Exemple de Service Angular
   - D.4 : Exemple de Composant Angular

Annexe E : Documentation API
   - E.1 : Liste complète des endpoints
   - E.2 : Exemples de requêtes/réponses
   - E.3 : Codes d'erreur

Annexe F : Guide d'installation et de déploiement
   - F.1 : Prérequis techniques
   - F.2 : Installation de l'environnement
   - F.3 : Configuration de l'application
   - F.4 : Lancement de l'application

Annexe G : Manuel utilisateur
   - G.1 : Guide administrateur
   - G.2 : Guide recruteur
   - G.3 : Guide candidat

Annexe H : Planning du projet
   - H.1 : Diagramme de Gantt
   - H.2 : Jalons du projet
```

---

# TABLE DES MATIÈRES

*(Générée automatiquement à partir de la structure du document)*

```
TABLE DES MATIÈRES

COUVERTURE
PAGE DE GARDE
REMERCIEMENTS
RÉSUMÉ / ABSTRACT
SOMMAIRE
AVANT-PROPOS
GLOSSAIRE

INTRODUCTION (non numérotée) .................................................. X

PREMIÈRE PARTIE : CADRE THÉORIQUE ET CONTEXTE DU PROJET

CHAPITRE 1 : PRÉSENTATION GÉNÉRALE DU PROJET ................................ X
   1.1. Contexte du projet ................................................... X
        1.1.1. L'entreprise SYNELIA et ses besoins .......................... X
        1.1.2. Le processus de recrutement traditionnel ..................... X
        1.1.3. Les défis et limitations actuels ............................. X
        1.1.4. La nécessité d'une solution digitale ......................... X
   1.2. Objectifs du projet ................................................. X
        1.2.1. Objectifs généraux ........................................... X
        1.2.2. Objectifs spécifiques ........................................ X
   1.3. Périmètre fonctionnel ............................................... X
   1.4. Contraintes du projet ............................................... X

CHAPITRE 2 : ÉTUDE DE L'EXISTANT ET ÉTAT DE L'ART ........................... X
   2.1. Étude de l'existant ................................................. X
   2.2. Benchmark des solutions existantes .................................. X
   2.3. État de l'art technologique ......................................... X
   2.4. Justification des choix technologiques .............................. X
   2.5. Critique de l'existant et solution proposée ......................... X

DEUXIÈME PARTIE : ANALYSE ET CONCEPTION

CHAPITRE 3 : ANALYSE DES BESOINS ............................................ X
   3.1. Méthodologie d'analyse .............................................. X
   3.2. Besoins fonctionnels ................................................ X
   3.3. Besoins non fonctionnels ............................................ X
   3.4. Diagrammes des cas d'utilisation .................................... X
   3.5. Règles de gestion ................................................... X

CHAPITRE 4 : CONCEPTION DE LA SOLUTION ...................................... X
   4.1. Architecture globale du système ..................................... X
   4.2. Conception de la base de données .................................... X
   4.3. Diagrammes de classes ............................................... X
   4.4. Diagrammes de séquence .............................................. X
   4.5. Diagrammes d'activités .............................................. X
   4.6. Diagrammes d'états .................................................. X
   4.7. Maquettes et interfaces ............................................. X
   4.8. Conception de l'API REST ............................................ X

TROISIÈME PARTIE : RÉALISATION ET MISE EN ŒUVRE

CHAPITRE 5 : ENVIRONNEMENT TECHNIQUE ET OUTILS .............................. X
   5.1. Environnement de développement ...................................... X
   5.2. Technologies backend ................................................ X
   5.3. Technologies frontend ............................................... X
   5.4. Base de données ..................................................... X
   5.5. Outils complémentaires .............................................. X

CHAPITRE 6 : IMPLÉMENTATION DE LA SOLUTION .................................. X
   6.1. Organisation du code source ......................................... X
   6.2. Implémentation du backend ........................................... X
   6.3. Implémentation du frontend .......................................... X
   6.4. Implémentation des modules fonctionnels ............................. X
   6.5. Intégration et communication ........................................ X

CHAPITRE 7 : TESTS ET VALIDATION ............................................ X
   7.1. Stratégie de tests .................................................. X
   7.2. Tests unitaires ..................................................... X
   7.3. Tests d'intégration ................................................. X
   7.4. Tests fonctionnels .................................................. X
   7.5. Tests de performance ................................................ X
   7.6. Tests de sécurité ................................................... X
   7.7. Recettage et validation ............................................. X

QUATRIÈME PARTIE : RÉSULTATS ET PERSPECTIVES

CHAPITRE 8 : PRÉSENTATION DES RÉSULTATS ..................................... X
   8.1. Démonstration de l'application ...................................... X
   8.2. Fonctionnalités implémentées ........................................ X
   8.3. Bilan technique ..................................................... X
   8.4. Retour d'expérience ................................................. X

CHAPITRE 9 : LIMITES ET PERSPECTIVES ........................................ X
   9.1. Limites du travail réalisé .......................................... X
   9.2. Perspectives d'amélioration ......................................... X
   9.3. Recommandations ..................................................... X

CONCLUSION (non numérotée) .................................................. X

RÉFÉRENCES BIBLIOGRAPHIQUES ................................................. X

ANNEXES ..................................................................... X
   Annexe A : Captures d'écran de l'application ............................. X
   Annexe B : Diagrammes complémentaires .................................... X
   Annexe C : Scripts de base de données .................................... X
   Annexe D : Extraits de code significatifs ................................ X
   Annexe E : Documentation API ............................................. X
   Annexe F : Guide d'installation et de déploiement ........................ X
   Annexe G : Manuel utilisateur ............................................ X
   Annexe H : Planning du projet ............................................ X

TABLE DES MATIÈRES .......................................................... X
```

---

# NOTES IMPORTANTES

## Parties NON NUMÉROTÉES
- **INTRODUCTION** : Ne porte pas de numéro de chapitre
- **CONCLUSION** : Ne porte pas de numéro de chapitre

## Règles de mise en forme à respecter
1. Chaque chapitre commence sur une nouvelle page
2. Pagination toujours recto
3. Police lisible et cohérente tout au long du document
4. Titres en anglais conservés dans les références bibliographiques
5. Mise en forme hiérarchique cohérente (Partie → Chapitre → Section → Sous-section)

## Estimation du volume
- **Introduction** : 3-5 pages
- **Chapitre 1** : 8-12 pages
- **Chapitre 2** : 15-20 pages
- **Chapitre 3** : 20-25 pages
- **Chapitre 4** : 25-35 pages
- **Chapitre 5** : 8-12 pages
- **Chapitre 6** : 20-30 pages
- **Chapitre 7** : 10-15 pages
- **Chapitre 8** : 10-15 pages
- **Chapitre 9** : 5-8 pages
- **Conclusion** : 2-3 pages
- **Total estimé** : 130-180 pages (hors annexes)

---

*Document généré le 24 décembre 2025*
*Projet : SyneliaQuizApp - Application de gestion du recrutement*
*École : ENSIT - Entreprise : SYNELIA*
