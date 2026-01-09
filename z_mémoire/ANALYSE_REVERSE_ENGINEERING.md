# 🔍 Analyse Reverse Engineering - SyneliaQuizApp

**Date d'analyse :** 24 décembre 2025  
**Objectif :** Produire un cahier des charges fonctionnel et technique pour soutenance

---

## 1. 🏗️ Architecture Globale du Projet

### 1.1 Vue d'ensemble

Le projet est une **application web full-stack** de type **SPA (Single Page Application)** composée de :

```
quizapp_full/
├── quizapp/                    # 🔙 BACKEND - API REST Spring Boot
├── quizapp_front/              # 🖥️ FRONTEND - Application Angular
├── recruitement_synelia_plan/  # 📐 MAQUETTES HTML/CSS statiques
├── z_notes/                    # 📝 Documentation technique
├── z_tasks/                    # ✅ Suivi des tâches
└── CAHIER_DES_CHARGES.md       # 📋 Spécifications existantes
```

### 1.2 Architecture Backend (quizapp/)

```
quizapp/src/main/java/tech/synelia/quizapp/
├── QuizappApplication.java     # Point d'entrée Spring Boot
├── ServletInitializer.java     # Initialisation WAR
├── business/                   # 📊 Couche métier (Services)
│   ├── AnswersBusiness.java
│   ├── ApplicationsBusiness.java
│   ├── CampaignsBusiness.java
│   ├── CandidateAnswersBusiness.java
│   ├── CandidateInterviewBusiness.java
│   ├── DecisionBusiness.java
│   ├── DepartmentsBusiness.java
│   ├── EmailBusiness.java
│   ├── EvaluationsBusiness.java
│   ├── InterviewsBusiness.java
│   ├── NotificationsBusiness.java
│   ├── QuestionsBusiness.java
│   ├── SourceTokenBusiness.java
│   ├── SpecialitiesBusiness.java
│   ├── UserBusiness.java
│   └── fact/                   # Factories
├── config/                     # ⚙️ Configuration
│   ├── MailConfig.java
│   ├── MinioConfig.java        # Stockage fichiers (CV)
│   ├── SecurityConfig.java
│   ├── ThymeleafConfig.java
│   └── WebSocketConfig.java
├── dao/                        # 💾 Couche d'accès aux données
│   ├── entity/                 # Entités JPA (21 entités)
│   └── repository/             # Repositories Spring Data
├── rest/                       # 🌐 Couche API REST
│   ├── api/                    # Controllers (22 controllers)
│   ├── fact/                   # DTOs et Factories
│   ├── ConnectionInterceptor.java
│   ├── RestInterceptor.java
│   └── WebMvcConfig.java
├── security/                   # 🔐 Sécurité (Cryptage AES/RSA)
├── user/managment/             # 👤 Gestion utilisateurs
├── utils/                      # 🛠️ Utilitaires
└── websocket/                  # 📡 WebSocket temps réel
```

### 1.3 Architecture Frontend (quizapp_front/)

```
quizapp_front/src/app/
├── app.routes.ts               # 🗺️ Configuration des routes
├── components/                 # 🧩 Composants réutilisables
│   ├── header/
│   ├── notifications/
│   ├── qeel/                   # Assistant IA ?
│   └── theme-toggle/
├── core/                       # 🎯 Modules core
│   ├── constants/
│   ├── guards/                 # Auth, Role, SourceToken guards
│   ├── interceptors/
│   ├── interfaces/
│   ├── models/
│   └── services/
├── directives/                 # 📌 Directives Angular
├── features/                   # ⭐ Modules fonctionnels
│   └── quiz/                   # Module Quiz
├── pages/                      # 📄 Pages de l'application
│   ├── analytics/
│   ├── apply-position/         # Candidature
│   ├── campaigns/              # Campagnes publiques
│   ├── candidates/
│   ├── connexion/
│   ├── dashboard/              # Espace recruteur/admin
│   │   ├── applications/
│   │   ├── campaigns/
│   │   ├── decisions/
│   │   ├── entities/           # CRUD Admin
│   │   ├── evaluations/
│   │   ├── interviews/
│   │   ├── overview/
│   │   └── users/
│   ├── home/
│   ├── inscription/
│   ├── mot-de-passe-oublie/
│   ├── quiz/                   # Passage du quiz
│   ├── track-application/      # Suivi candidature
│   └── verify-email/
├── services/                   # 🔌 Services API
└── shared/                     # 📦 Modules partagés
    ├── icons/
    └── models/
```

---

## 2. 🛠️ Technologies Utilisées

### 2.1 Backend

| Catégorie | Technologie | Version | Rôle |
|-----------|-------------|---------|------|
| **Langage** | Java | 21 | Langage principal |
| **Framework** | Spring Boot | 3.5.6 | Framework applicatif |
| **Sécurité** | Spring Security | - | Authentification/Autorisation |
| **Base de données** | MySQL | - | Stockage persistant |
| **ORM** | Spring Data JPA | - | Mapping objet-relationnel |
| **Mapping** | MapStruct | 1.5.5 | DTO ↔ Entity |
| **Utilitaire** | Lombok | 1.18.40 | Réduction boilerplate |
| **Templates** | Thymeleaf | - | Emails HTML |
| **WebSocket** | Spring WebSocket | - | Temps réel |
| **Stockage** | MinIO | - | Stockage fichiers (CV) |
| **Cryptage** | AES/RSA | - | Sécurité des échanges |
| **Packaging** | WAR | - | Déploiement Tomcat |

### 2.2 Frontend

| Catégorie | Technologie | Version | Rôle |
|-----------|-------------|---------|------|
| **Framework** | Angular | 20.2.0 | Framework SPA |
| **Langage** | TypeScript | 5.9.2 | Typage statique |
| **Styles** | SCSS | - | Styles avancés |
| **Réactivité** | RxJS | 7.8.0 | Programmation réactive |
| **Build** | Angular CLI | 20.2.0 | Tooling |
| **Tests** | Jasmine/Karma | - | Tests unitaires |

### 2.3 Outils de développement

| Outil | Utilisation |
|-------|-------------|
| **Maven** | Build backend |
| **npm** | Gestion dépendances frontend |
| **Postman** | Documentation API (exemples fournis) |
| **TelosysTools** | Génération de code (scaffolding) |

---

## 3. 📊 Découpage Fonctionnel

### 3.1 Domaines Métier Identifiés

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYNELIA QUIZ APP                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │ 1. GESTION       │  │ 2. GESTION       │  │ 3. SYSTÈME    │  │
│  │    UTILISATEURS  │  │    RÉFÉRENTIELS  │  │    QUIZ       │  │
│  │                  │  │                  │  │               │  │
│  │ • Authentification│  │ • Départements  │  │ • Questions   │  │
│  │ • Inscription    │  │ • Spécialités   │  │ • Réponses    │  │
│  │ • Rôles (3 types)│  │ • Sources       │  │ • Campagne-Q  │  │
│  │ • Profils        │  │                  │  │ • Passage     │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │ 4. CAMPAGNES     │  │ 5. CANDIDATURES  │  │ 6. ENTRETIENS │  │
│  │    RECRUTEMENT   │  │                  │  │               │  │
│  │                  │  │ • Soumission     │  │ • Planification│ │
│  │ • Création       │  │ • Suivi statut   │  │ • Évaluations │  │
│  │ • Publication    │  │ • Documents (CV) │  │ • Décisions   │  │
│  │ • Clôture        │  │ • Tokens         │  │ • Historique  │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │ 7. NOTIFICATIONS │  │ 8. ANALYTICS     │  │ 9. TEMPS RÉEL │  │
│  │                  │  │                  │  │               │  │
│  │ • Email          │  │ • Statistiques   │  │ • WebSocket   │  │
│  │ • In-app         │  │ • Tableau bord   │  │ • Qeel        │  │
│  │ • Vérification   │  │ • Reporting      │  │ • Statut      │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Modules Fonctionnels (9 domaines)

| # | Module | Entités concernées | Complexité |
|---|--------|-------------------|------------|
| 1 | **Gestion Utilisateurs** | User, EmailVerificationToken | ⭐⭐⭐ |
| 2 | **Référentiels** | Departments, Specialities, SourceToken | ⭐⭐ |
| 3 | **Système Quiz** | Questions, Answers, QuestionsAnswers, CampaignQuestions | ⭐⭐⭐⭐ |
| 4 | **Campagnes** | Campaigns, CampaignCrud | ⭐⭐⭐ |
| 5 | **Candidatures** | Applications, CandidateAnswers, CandidateToken, CandidateAsk | ⭐⭐⭐⭐ |
| 6 | **Entretiens** | Interviews, InterviewCrud, CandidateInterview, Evaluations, Decision | ⭐⭐⭐⭐ |
| 7 | **Notifications** | Notifications | ⭐⭐ |
| 8 | **Analytics** | (Calculs agrégés) | ⭐⭐ |
| 9 | **Temps Réel** | WebSocket, OnlineStats | ⭐⭐⭐ |

### 3.3 Acteurs du Système

| Rôle | Accès | Pages principales |
|------|-------|-------------------|
| **Visiteur** | Public | Home, Campaigns, Candidature |
| **Candidat** | Token unique | Quiz, Suivi candidature |
| **Recruteur** | Authentifié | Dashboard, Entretiens, Évaluations |
| **Super Admin** | Authentifié | Toutes entités, Configuration |

---

## 4. 📋 Ordre d'Analyse Recommandé

Pour reconstruire correctement les besoins métier, je propose l'ordre suivant :

### Phase 1 : Fondations (Comprendre la base)

```
1.1 → Entités de base (dao/entity/)
      ├── User.java                 # Structure utilisateur
      ├── Departments.java          # Organisation
      └── Specialities.java         # Domaines techniques

1.2 → Configuration sécurité
      ├── SecurityConfig.java       # Règles d'accès
      └── Guards (frontend)         # Protection routes
```

### Phase 2 : Cœur Métier Recrutement

```
2.1 → Campagnes de recrutement
      ├── Campaigns.java
      ├── CampaignCrud.java
      └── CampaignsBusiness.java

2.2 → Système de Quiz
      ├── Questions.java
      ├── Answers.java
      ├── QuestionsAnswers.java
      └── CampaignQuestions.java
```

### Phase 3 : Parcours Candidat

```
3.1 → Candidatures
      ├── Applications.java
      ├── CandidateToken.java
      └── CandidateAnswers.java

3.2 → Passage du Quiz
      └── Frontend: pages/quiz/
```

### Phase 4 : Processus d'Évaluation

```
4.1 → Entretiens
      ├── Interviews.java
      └── InterviewCrud.java

4.2 → Évaluations et Décisions
      ├── Evaluations.java
      └── Decision.java
```

### Phase 5 : Fonctionnalités Transverses

```
5.1 → Notifications (Email + In-app)
5.2 → WebSocket et temps réel
5.3 → Analytics et Dashboard
```

---

## 5. 📁 Fichiers Clés à Analyser

### Backend - Points d'entrée prioritaires

| Fichier | Raison |
|---------|--------|
| `rest/api/*Controller.java` | Définition des endpoints API |
| `dao/entity/*.java` | Modèle de données complet |
| `business/*Business.java` | Logique métier |
| `config/SecurityConfig.java` | Règles de sécurité |
| `resources/application.yml` | Configuration |

### Frontend - Points d'entrée prioritaires

| Fichier | Raison |
|---------|--------|
| `app.routes.ts` | Structure navigation |
| `core/guards/*.ts` | Règles d'accès |
| `pages/dashboard/**` | Interface recruteur |
| `pages/quiz/**` | Parcours candidat |
| `core/services/**` | Appels API |

### Documentation existante

| Fichier | Contenu |
|---------|---------|
| `CAHIER_DES_CHARGES.md` | Spécifications initiales (855 lignes) |
| `postman-examples/*.md` | Documentation API par entité |
| `z_notes/*.md` | Notes de développement |

---

## 6. 🎯 Prochaines Étapes

En attente de votre validation pour :

- [ ] **Étape 2** : Analyse détaillée du modèle de données (entités JPA)
- [ ] **Étape 3** : Documentation des endpoints API
- [ ] **Étape 4** : Mapping des flux métier (diagrammes de séquence)
- [ ] **Étape 5** : Rédaction du cahier des charges complet

---

**⏳ Status : En attente de validation avant de continuer**
