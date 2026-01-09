# 📋 PLAN D'ÉCRITURE DU CAHIER DES CHARGES
## Application Web de Gestion du Processus de Recrutement - SyneliaQuizApp

**Généré par ingénierie inversée du projet quizapp_full**  
**Date :** 7 janvier 2026

---

## 📌 PRÉAMBULE

Ce document définit le plan structuré pour la rédaction d'un cahier des charges complet, reconstruit par analyse approfondie (ingénierie inversée) du projet `quizapp_full`. 

### Éléments analysés :
- **Backend** : 21 entités JPA, 22 contrôleurs REST, 23 classes métier
- **Frontend** : 12 pages principales, 20+ services, 3 guards de sécurité
- **Architecture** : Stack Spring Boot 3.5.6 / Angular 20.2.0 / MySQL
- **Documentation existante** : 855 lignes de CDC existant, 12 guides Postman

---

# 🗂️ STRUCTURE DU CAHIER DES CHARGES

---

## PARTIE I : PRÉSENTATION GÉNÉRALE
*Objectif : Contextualiser le projet et définir le périmètre*

### 1. Informations Générales du Projet
- 1.1 Fiche d'identité du projet
  - Nom du projet : SyneliaQuizApp
  - Client : Synelia
  - Type : Application Web SPA
  - Version : 0.1
- 1.2 Historique et évolutions
- 1.3 Responsables et intervenants

### 2. Contexte et Problématique
- 2.1 Présentation de l'entreprise Synelia
- 2.2 Problématique du recrutement actuel
  - Processus manuel chronophage
  - Absence de centralisation des candidatures
  - Évaluations non standardisées
  - Manque de traçabilité
- 2.3 Besoin de digitalisation

### 3. Objectifs du Projet
- 3.1 Objectifs stratégiques
  - Digitaliser le processus de recrutement
  - Automatiser l'évaluation technique
  - Faciliter la collaboration entre recruteurs
- 3.2 Objectifs opérationnels
  - Réduire le temps de traitement des candidatures
  - Améliorer l'expérience candidat
  - Centraliser la prise de décision
- 3.3 Indicateurs de succès (KPIs)

### 4. Périmètre Fonctionnel
- 4.1 Fonctionnalités incluses (In Scope)
- 4.2 Fonctionnalités exclues (Out of Scope)
- 4.3 Contraintes et hypothèses

---

## PARTIE II : ACTEURS ET CAS D'UTILISATION
*Objectif : Identifier tous les utilisateurs et leurs interactions*

### 5. Identification des Acteurs
- 5.1 Acteurs internes
  - **Super Administrateur** : Configuration système, gestion globale
  - **Administrateur** : Gestion RH, paramétrage
  - **Recruteur** : Évaluation, entretiens, décisions
- 5.2 Acteurs externes
  - **Candidat** : Postulation, quiz, suivi
  - **Visiteur** : Consultation des offres
- 5.3 Matrice rôles/permissions

### 6. Cas d'Utilisation Généraux
- 6.1 Diagramme des cas d'utilisation global
- 6.2 Description synthétique par acteur
- 6.3 Priorisation des cas d'utilisation (MoSCoW)

### 7. Scénarios Utilisateur Détaillés
- 7.1 Parcours Candidat
  - Découverte de l'offre
  - Soumission de candidature
  - Vérification email
  - Passage du quiz technique
  - Suivi de l'avancement
- 7.2 Parcours Recruteur
  - Création de campagne
  - Gestion des candidatures
  - Planification d'entretiens
  - Évaluation collaborative
  - Prise de décision
- 7.3 Parcours Administrateur
  - Configuration des référentiels
  - Gestion des utilisateurs
  - Paramétrage du système

---

## PARTIE III : SPÉCIFICATIONS FONCTIONNELLES DÉTAILLÉES
*Objectif : Décrire chaque module fonctionnel en détail*

### 8. Module Authentification et Gestion des Utilisateurs
- 8.1 Connexion (Login)
  - Champs : email, mot de passe
  - Hashage BCrypt
  - Gestion de session
- 8.2 Inscription
  - Validation des champs
  - Vérification unicité email
  - Attribution rôle par défaut
- 8.3 Récupération de mot de passe
- 8.4 Gestion des utilisateurs (CRUD)
  - Liste paginée avec filtres
  - Création/Modification/Suppression logique
  - Activation/Désactivation de comptes
- 8.5 Gestion des rôles et permissions

### 9. Module Données de Référence (Entités)
- 9.1 Départements
  - CRUD complet
  - Champs : nom, description
- 9.2 Spécialités
  - CRUD complet
  - Liaison département parent
  - Champs : nom, description, departmentId
- 9.3 Questions
  - CRUD complet
  - Champs : contenu, chronomètre, spécialité
- 9.4 Réponses
  - CRUD complet
  - Champs : contenu
- 9.5 Associations Questions-Réponses
  - Marquage réponse(s) correcte(s)
  - Gestion multiple choix

### 10. Module Campagnes de Recrutement
- 10.1 Liste des campagnes
  - Vue tabulaire paginée
  - Filtres par statut (active, closed, draft)
  - Indicateurs statistiques
- 10.2 Création/Modification de campagne
  - Champs obligatoires : titre, statut, spécialité
  - Champs optionnels : description, dates, max candidatures
  - Configuration quiz : nb questions, chronométré
- 10.3 Détail de campagne
  - Vue d'ensemble
  - Liste des candidatures
  - Statistiques (taux de conversion)
- 10.4 Tokens de partage (SourceToken)
  - Génération de codes 6 caractères
  - Nommage source (LinkedIn, Site web...)
  - Date d'expiration
  - Tracking origine candidatures

### 11. Module Candidatures (Applications)
- 11.1 Formulaire de candidature (externe)
  - Guard : validation token source
  - Champs obligatoires : prénom, nom, email, téléphone, date naissance, CV
  - Champs optionnels : lettre de motivation
  - Upload CV (PDF, DOC, DOCX)
  - Consentement RGPD
- 11.2 Vérification email
  - Génération token unique
  - Envoi email de confirmation
  - Validation et marquage
- 11.3 Liste des candidatures (recruteur)
  - Vue tabulaire avec colonnes triables
  - Filtres multiples
  - Recherche textuelle
  - Export données
- 11.4 Détail candidature
  - Informations candidat
  - Historique des actions
  - Score quiz
  - Évaluations reçues
- 11.5 Suivi de candidature (candidat)
  - Accès par code de suivi + email
  - Historique des étapes
  - Statut actuel

### 12. Module Quiz Technique
- 12.1 Configuration du quiz
  - Association campagne-questions
  - Nombre de questions
  - Mode chronométré (optionnel)
- 12.2 Passage du quiz (candidat)
  - Sécurité : token unique par candidature
  - Page d'accueil avec instructions
  - Affichage question par question
  - Sélection réponse (unique/multiple)
  - Navigation précédent/suivant
  - Barre de progression
  - Chronomètre (si activé)
  - Sauvegarde temps réel
- 12.3 États du quiz
  - PENDING : non commencé
  - IN_PROGRESS : en cours
  - COMPLETED : terminé
- 12.4 Calcul et stockage du score
  - Comparaison réponses sélectionnées/correctes
  - Score en points et pourcentage
  - Enregistrement dans candidature

### 13. Module Entretiens (Interviews)
- 13.1 Liste des entretiens
  - Vue calendrier
  - Vue liste avec statuts
  - Filtres par date, statut, campagne
- 13.2 Création d'entretien
  - Date et heure
  - Type : présentiel / en ligne
  - Lieu ou lien visio
  - Candidat(s) à convoquer
  - Notes préparatoires
- 13.3 Gestion des statuts
  - PENDING : planifié, en attente
  - SCHEDULED : confirmé
  - STARTED : en cours
  - OVER : terminé
  - POSTPONED : reporté
  - ARCHIVED : archivé
- 13.4 Association candidats-entretiens
  - Durée individuelle
  - Horaires par candidat
- 13.5 Envoi de convocations
  - Email automatique au candidat
  - Lien de connexion (si en ligne)

### 14. Module Évaluations
- 14.1 Interface d'évaluation collaborative
  - Mode plein écran (sans header/sidebar)
  - Affichage infos candidat
  - Score quiz technique
  - Liste évaluateurs en temps réel
- 14.2 Formulaire d'évaluation
  - Notation sur 100
  - Zone commentaire
  - Modification possible
- 14.3 Synchronisation temps réel
  - Polling 5 secondes
  - Mise à jour des présences
  - Affichage évaluations des autres
- 14.4 Calcul des moyennes
  - Moyenne automatique
  - Nombre d'évaluations

### 15. Module Décisions
- 15.1 Types de décision
  - Pré-sélection (après quiz)
  - Décision finale (après entretien)
- 15.2 Actions disponibles
  - Accepter
  - Rejeter
  - Annuler décision précédente
- 15.3 Notifications automatiques
  - Email au candidat selon décision
  - Notification in-app aux recruteurs

### 16. Module Notifications
- 16.1 Centre de notifications
  - Badge compteur non-lus
  - Dropdown liste récente
  - Marquage comme lu
  - Lien direct vers objet concerné
- 16.2 Types de notifications
  - Nouvelle candidature reçue
  - Email vérifié par candidat
  - Quiz complété
  - Entretien planifié
  - Évaluation ajoutée
  - Décision prise
- 16.3 Notifications email
  - Templates HTML responsives
  - Variables dynamiques

### 17. Module Dashboard et Analytics
- 17.1 Vue d'ensemble (Overview)
  - Statistiques globales
  - Campagnes actives
  - Candidatures en cours
- 17.2 Widgets
  - Utilisateurs en ligne (QEEL)
  - Dernières activités
  - Graphiques de tendance
- 17.3 Composant QEEL (Who Is Online)
  - Affichage en temps réel
  - WebSocket

---

## PARTIE IV : MODÈLE DE DONNÉES
*Objectif : Documenter la structure de la base de données*

### 18. Schéma Conceptuel de Données
- 18.1 Diagramme Entité-Relation (ERD)
- 18.2 Description des relations

### 19. Description des Entités
- 19.1 User (Utilisateur)
- 19.2 Departments (Départements)
- 19.3 Specialities (Spécialités)
- 19.4 Questions
- 19.5 Answers (Réponses)
- 19.6 QuestionsAnswers (Association)
- 19.7 Campaigns (Campagnes)
- 19.8 SourceToken (Tokens de partage)
- 19.9 Applications (Candidatures)
- 19.10 CandidateAnswers (Réponses candidat)
- 19.11 Interviews (Entretiens)
- 19.12 CandidateInterview (Association)
- 19.13 Evaluations (Évaluations)
- 19.14 Decision (Décisions)
- 19.15 Notifications
- 19.16 EmailVerificationToken

### 20. Dictionnaire de Données
- 20.1 Tableau par entité : champ, type, contraintes, description
- 20.2 Clés primaires et étrangères
- 20.3 Index et optimisations

---

## PARTIE V : ARCHITECTURE TECHNIQUE
*Objectif : Décrire l'architecture et les choix technologiques*

### 21. Architecture Logicielle
- 21.1 Vue d'ensemble de l'architecture
  - Architecture 3-tiers
  - Pattern MVC
  - SPA + API REST
- 21.2 Diagramme d'architecture
- 21.3 Flux de communication

### 22. Stack Technologique
- 22.1 Backend
  - Java 21
  - Spring Boot 3.5.6
  - Spring Security
  - Spring Data JPA
  - Spring WebSocket
  - Spring Mail
  - MapStruct 1.5.5
  - Lombok 1.18.40
  - MySQL
- 22.2 Frontend
  - Angular 20.2.0
  - TypeScript 5.9.2
  - SCSS
  - RxJS 7.8.0
- 22.3 Outils et librairies complémentaires
  - Apache POI (export Excel)
  - OkHttp
  - Thymeleaf (templates email)
  - SpringDoc OpenAPI

### 23. Architecture Backend
- 23.1 Structure des packages
  - rest/api/ : Controllers REST
  - business/ : Couche métier
  - dao/entity/ : Entités JPA
  - dao/repository/ : Repositories
  - config/ : Configuration
  - security/ : Sécurité
  - utils/ : Utilitaires
  - websocket/ : Temps réel
- 23.2 Pattern DTO et Mapping
- 23.3 Gestion des erreurs
- 23.4 Internationalisation (i18n)

### 24. Architecture Frontend
- 24.1 Structure des dossiers
  - pages/ : Composants de page
  - components/ : Composants réutilisables
  - core/ : Services, guards, interceptors
  - shared/ : Modules partagés
  - features/ : Modules fonctionnels
- 24.2 Routing et lazy loading
- 24.3 Gestion d'état
- 24.4 Communication avec l'API

### 25. Communications Temps Réel
- 25.1 Configuration WebSocket
- 25.2 Endpoint : /ws/qeel
- 25.3 Cas d'usage : présence en ligne, évaluations

---

## PARTIE VI : SÉCURITÉ ET AUTORISATIONS
*Objectif : Documenter la sécurité de l'application*

### 26. Authentification
- 26.1 Méthode token-based
- 26.2 Hashage mots de passe (BCrypt)
- 26.3 Sessions stateless
- 26.4 Cryptage AES/RSA

### 27. Autorisation
- 27.1 Matrice rôles/routes
- 27.2 Guards Frontend
  - authGuard
  - noAuthGuard
  - superRoleGuard
  - adminRoleGuard
  - recruiterRoleGuard
  - sourceTokenGuard
- 27.3 Sécurisation des endpoints

### 28. Protection des Données
- 28.1 Conformité RGPD
- 28.2 Suppression logique (soft delete)
- 28.3 Configuration CORS
- 28.4 Validation des entrées

---

## PARTIE VII : API REST
*Objectif : Documenter l'interface de programmation*

### 29. Conventions API
- 29.1 Base URL : http://localhost:8081
- 29.2 Format : JSON
- 29.3 Headers requis
- 29.4 Structure des réponses

### 30. Catalogue des Endpoints
- 30.1 Users (/userManager/*)
- 30.2 Departments (/departmentsManager/*)
- 30.3 Specialities (/specialitiesManager/*)
- 30.4 Questions (/questionsManager/*)
- 30.5 Answers (/answersManager/*)
- 30.6 QuestionsAnswers (/questionsAnswersManager/*)
- 30.7 Campaigns (/campaignsManager/*)
- 30.8 SourceToken (/sourceTokenManager/*)
- 30.9 Applications (/applicationsManager/*)
- 30.10 Interviews (/interviewsManager/*)
- 30.11 Evaluations (/evaluationsManager/*)
- 30.12 Notifications (/notificationsManager/*)
- 30.13 Decisions (/decisionManager/*)
- 30.14 Files (/file/*)

### 31. Documentation OpenAPI
- 31.1 Swagger UI
- 31.2 Spécification OpenAPI 3.0

---

## PARTIE VIII : INTERFACE UTILISATEUR
*Objectif : Décrire l'ergonomie et le design*

### 32. Charte Graphique
- 32.1 Variables CSS
- 32.2 Palette de couleurs
- 32.3 Typographie
- 32.4 Mode sombre

### 33. Composants UI Réutilisables
- 33.1 Header avec navigation
- 33.2 Sidebar dynamique
- 33.3 Tableaux paginés
- 33.4 Formulaires avec validation
- 33.5 Modales
- 33.6 Notifications toast
- 33.7 Composant QEEL

### 34. Maquettes des Écrans
- 34.1 Page d'accueil
- 34.2 Formulaire de candidature
- 34.3 Interface de quiz
- 34.4 Dashboard recruteur
- 34.5 Gestion des entités
- 34.6 Interface d'évaluation

### 35. Responsive Design
- 35.1 Approche Desktop-first
- 35.2 Breakpoints
- 35.3 Adaptations mobiles

---

## PARTIE IX : GESTION DES FICHIERS
*Objectif : Documenter le stockage de fichiers*

### 36. Upload de CV
- 36.1 Chemin de stockage : /uploads/cv/
- 36.2 Types acceptés : PDF, DOC, DOCX
- 36.3 Taille maximale : 5MB
- 36.4 Convention de nommage

### 37. Système d'Email
- 37.1 Configuration Spring Mail
- 37.2 Templates Thymeleaf
  - verification-candidature.html
  - new_user.html
  - simple.html
- 37.3 Variables dynamiques

---

## PARTIE X : DÉPLOIEMENT ET INFRASTRUCTURE
*Objectif : Décrire l'environnement technique*

### 38. Environnements
- 38.1 Local (développement)
- 38.2 Développement (dev)
- 38.3 Production (prod)

### 39. Prérequis Serveur
- 39.1 JDK 21+
- 39.2 Node.js 18+
- 39.3 MySQL 8.0+
- 39.4 Tomcat (embarqué ou externe)

### 40. Scripts et Procédures
- 40.1 Démarrage Backend
- 40.2 Build Frontend
- 40.3 Configuration base de données

---

## PARTIE XI : ÉVOLUTIONS ET ROADMAP
*Objectif : Planifier les développements futurs*

### 41. Évolutions Fonctionnelles Prévues
- 41.1 Intégration calendrier (Google, Outlook)
- 41.2 Visioconférence intégrée (WebRTC)
- 41.3 IA pour matching CV
- 41.4 Rapports et analytics avancés
- 41.5 Multi-langue (FR, EN)
- 41.6 Application mobile (PWA/Native)

### 42. Améliorations Techniques
- 42.1 Tests automatisés (Unit, E2E)
- 42.2 Pipeline CI/CD
- 42.3 Architecture microservices
- 42.4 Cache Redis
- 42.5 Recherche Elasticsearch

---

## PARTIE XII : ANNEXES
*Documents complémentaires*

### Annexe A : Glossaire
- Définitions des termes métier
- Abréviations techniques

### Annexe B : Diagrammes
- B.1 Diagramme de classes
- B.2 Diagramme de séquence - Candidature
- B.3 Diagramme de séquence - Quiz
- B.4 Diagramme de séquence - Évaluation
- B.5 Diagramme d'activité - Processus recrutement

### Annexe C : Captures d'écran
- Interfaces principales
- Formulaires
- Tableaux de bord

### Annexe D : Scripts SQL
- Création de la base
- Données de test

### Annexe E : Documentation API Complète
- Exemples Postman
- Payloads de requête/réponse

### Annexe F : Références
- Documentation Angular
- Documentation Spring Boot
- Documentation MapStruct

---

# 📊 RÉCAPITULATIF

| Partie | Nombre de sections | Pages estimées |
|--------|-------------------|----------------|
| I - Présentation générale | 4 | 8-10 |
| II - Acteurs et cas d'utilisation | 3 | 10-12 |
| III - Spécifications fonctionnelles | 10 | 30-40 |
| IV - Modèle de données | 3 | 15-20 |
| V - Architecture technique | 5 | 12-15 |
| VI - Sécurité et autorisations | 3 | 6-8 |
| VII - API REST | 3 | 10-15 |
| VIII - Interface utilisateur | 4 | 10-12 |
| IX - Gestion des fichiers | 2 | 4-5 |
| X - Déploiement | 3 | 5-6 |
| XI - Évolutions | 2 | 4-5 |
| XII - Annexes | 6 | 20-30 |
| **TOTAL** | **48 sections** | **~130-180 pages** |

---

# 🎯 PROCHAINES ÉTAPES

1. ✅ **Phase 1 (terminée)** : Analyse du code source et ingénierie inversée
2. ⏳ **Phase 2** : Rédaction des sections prioritaires
   - Modèle de données (entités JPA → documentation)
   - Spécifications fonctionnelles (routes → features)
   - API REST (controllers → endpoints)
3. 🔜 **Phase 3** : Création des diagrammes UML
4. 🔜 **Phase 4** : Captures d'écran et maquettes
5. 🔜 **Phase 5** : Relecture et validation

---

**Document généré automatiquement par analyse du projet quizapp_full**

*Version : 1.0 | Date : 7 janvier 2026*
