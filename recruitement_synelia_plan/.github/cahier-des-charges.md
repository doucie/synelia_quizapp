# Cahier des charges - Application web de gestion du processus de recrutement pour Synelia

## 1. Présentation du projet

### 1.1. Contexte
L'entreprise Synelia souhaite disposer d'un outil interne de gestion du recrutement afin d'éviter la dépendance à des solutions externes comme Google Forms.

### 1.2. Objectifs
- Créer des campagnes de recrutement personnalisées
- Automatiser le processus de candidature et d'évaluation
- Centraliser la gestion des candidats et des évaluations
- Améliorer le suivi des candidatures
- Faciliter la collaboration entre recruteurs

### 1.3. Périmètre du projet
Application web complète avec interface candidat, recruteur et administrateur, incluant la gestion des questionnaires chronométrés, l'évaluation des candidats et le suivi des entretiens.

### 1.4. Périmètre fonctionnel

#### 1.4.1. Parties prenantes
- **Administrateur** : gère l'ensemble des ressources (campagnes, utilisateurs, questions, spécialités, évaluations).
- **Recruteur** : gère les campagnes, interviews, évaluations, avis candidats.
- **Candidat** : accède uniquement via des liens spécifiques (formulaire, QCM, suivi candidature).

#### 1.4.2. Fonctionnalités par profil

**a. Candidat**
- Accès via un lien de campagne (LinkedIn, mail, etc.).
- Formulaire de candidature (Nom, Prénom, Téléphone, Email, CV).
- Vérification email obligatoire.
- Accès à un QCM chronométré avec sauvegarde automatique des réponses.
- Récupération d'un lien pour continuer le QCM en cas d'interruption.
- Accès à un espace candidature : informations saisies, score obtenu, état de candidature (En attente, Acceptée, Rejetée, Archivée).
- Demande de modifications (Nom, Prénom, Téléphone, Email) uniquement si la candidature est en attente ou acceptée.

**b. Recruteur**
- Consultation et gestion des campagnes en cours.
- Création et modification de campagnes (suppression sur demande admin).
- Création, modification et suppression des interviews et évaluations.
- Consultation et mise à jour des candidatures (statut : en attente, acceptée, rejetée).
- Émission d'avis et observations sur les candidats.
- Accès aux dashboards (statistiques, suivi campagnes, taux de réussite QCM).

**c. Administrateur**
- Gestion complète de l'application.
- Création, modification et suppression de :
  - Campagnes
  - Utilisateurs
  - Questions (QCM) et réponses associées
  - Départements et spécialités
  - Candidats et candidatures
  - Interviews et évaluations
- Accès aux dashboards (statistiques, suivi campagnes, taux de réussite QCM).

### 1.5. Parcours utilisateur (simplifié)

#### 1.5.1. Administrateur
1. Crée les départements et les spécialités
2. Crée les questions et réponses associées aux spécialités en précisant le temps de réponse.
3. Gère toutes les entités (campagnes, candidats, questions, etc.)
4. Supervise l'activité et les statistiques.

#### 1.5.2. Recruteur
1. Crée ou modifie une campagne.
2. Génère des liens de campagne à partager.
3. Suit les candidats (tableau de bord).
4. Évalue après interview (avis, notes).

#### 1.5.3. Candidat
1. Reçoit un lien de campagne.
2. Remplit le formulaire et vérifie l'email.
3. Accède au QCM chronométré (avec sauvegarde en cas d'interruption).
4. Reçoit le score avec un lien vers le suivi de candidature (avec possibilité de demande de renvoi en cas de perte)
5. Consulte le statut et éventuellement demande une correction d'informations personnelles.

## 2. Spécifications fonctionnelles

### 2.1. Gestion des utilisateurs et droits d'accès

#### 2.1.1. Profils utilisateurs
- **Administrateur** : Tous les droits (CRUD complet)
- **Recruteur** : Droits limités avec demandes d'approbation à l'admin
- **Candidat** : Accès uniquement via liens sécurisés

#### 2.1.2. Gestion des permissions
- **Admin** : Création, modification, suppression de tous les éléments
- **Recruteur** :
  - Création/modification de campagnes (avec demande de suppression)
  - Le créateur d'une campagne a tous les droits sur cette dernière et peut gérer les permissions en rapport
  - Gestion complète des interviews et évaluations
  - Demandes de modification et de suppression pour autres entités
- **Candidat** : Consultation et modification sous demande de ses données

### 2.2. Processus de candidature

#### 2.2.1. Création de candidature
- Réception du lien de campagne (LinkedIn/Email)
- Formulaire initial :
  - Nom, prénom
  - Numéro de téléphone
  - Adresse email
  - CV (upload)
- Vérification email obligatoire
- Enregistrement en base après vérification

#### 2.2.2. Questionnaire (QCM)
- **Déclenchement** : Après vérification email
- **Caractéristiques** :
  - Chronométré
  - Questions à choix multiples
  - Sauvegarde automatique des réponses
  - Possibilité de reprendre après interruption
- **Finalisation** :
  - Affichage du score
  - Génération du lien de suivi de candidature personnel
  - Réception du score et du lien de suivi de candidature par mail

#### 2.2.3. Gestion des interruptions
- Détection des candidatures incomplètes
- Envoi automatique de lien de continuation
- Vérification par email/téléphone pour éviter les doublons de candidatures
- Redirection automatique vers la continuation en cas de tentative de nouveau formulaire par le même candidat pour la même campagne

### 2.3. Suivi de candidature

#### 2.3.1. Page candidat
- **Consultation** :
  - Informations personnelles
  - Score obtenu (sans les détails des questions et des réponses)
  - Statut : En attente / Acceptée / Rejetée / Archivée
- **Candidature archivée** :
  - Aucune information disponible
  - Notice pour signaler que la candidature est archivée
- **Candidature rejetée** :
  - Aucune demande de modification d'information possible
  - Notice pour signaler que la candidature est rejetée
- **Candidature acceptée ou en attente** :
  - Demande de modification/mise à jour d'informations possible
  - Éléments modifiables (sous demande) : Nom, prénom, téléphone, email
  - Éléments non modifiables : CV, réponses QCM

### 2.4. Gestion des campagnes

#### 2.4.1. Création de campagne
- Nom de la campagne
- Description
- Département et spécialité ciblés
- Sélection des questions associées
- Date de début et date de fin

#### 2.4.2. Suivi de campagne
- Liste des candidatures
- Statistiques (taux de réponse, scores moyens, nombres de candidatures par campagnes etc.)
- Gestion des statuts de candidature

### 2.5. Gestion des entretiens

#### 2.5.1. Planification
- Création d'entretien (présentiel/Google Meet)
- Date et heure de l'entretien
- Lieu ou Lien du meeting
- Notification aux participants (candidature acceptée) par mail

#### 2.5.2. Évaluation
- Choix des recruteurs aptes par le recruteur principal ou l'admin
- Formulaire d'évaluation remplit par le(s) recruteur(s)
- Notes, avis et observations
- Décisions finales pour chaque candidat (Retenu/Non retenu)
- Validation de décision finale par le recruteur principal (possibilité de validation multiple)
- Possibilité d'envoyer un mail automatique au candidat en fonction de la décision finale
- Prévisualisation du mail automatique avant envoi.

## 3. Spécifications techniques

### 3.1. Architecture

#### 3.1.1. Frontend : Angular
- Assure l'interface utilisateur (UI) responsive.
- Gère la navigation entre les différentes sections (formulaire, QCM, suivi de candidature, tableau de bord recruteurs/admin).
- Intègre les composants dynamiques pour l'upload de CV, la saisie des formulaires et la consultation des statuts en temps réel.
- Consomme les API REST exposées par le backend.

#### 3.1.2. Backend : Java Spring Boot
- Fournit les services RESTful utilisés par le frontend.
- Contient la logique métier (gestion des campagnes, QCM, candidatures, interviews, évaluations).
- Implémente la sécurité (authentification, autorisations par rôles : admin, recruteur, candidat).
- Gère l'intégration des modules transverses (envoi d'emails, génération de liens sécurisés, sauvegarde en temps réel).

#### 3.1.3. Base de données (MySQL)
- Stocke toutes les données structurées : utilisateurs, campagnes, questions, réponses, candidatures, résultats, interviews, évaluations.
- Utilise des relations normalisées avec clés primaires et étrangères (voir section Schéma BDD).

### 3.2. Sécurité

#### 3.2.1. Authentification
- Vérification email obligatoire
- Liens à usage unique avec expiration
- Gestion des sessions sécurisées

#### 3.2.2. Protection des données
- Chiffrement des données sensibles
- Validation côté serveur
- Protection contre les injections SQL
- Conformité RGPD

### 3.3. Performance
- Temps de chargement < 3 secondes
- Sauvegarde temps réel des réponses
- Optimisation pour concurrent users
- Système de cache approprié

## 4. Interface utilisateur

### 4.1. Interface Candidat
- **Page d'accueil campagne** : Formulaire d'inscription
- **Page de vérification** : Confirmation email
- **Page questionnaire** : QCM chronométré
- **Page résultats** : Score et lien candidature
- **Page candidature** : Suivi et modifications

### 4.2. Interface Recruteur
- **Dashboard** : Vue d'ensemble des campagnes
- **Gestion campagnes** : CRUD avec limitations
- **Suivi candidats** : Liste et filtres
- **Gestion interviews** : Planification et suivi
- **Évaluations** : Formulaires d'évaluation

### 4.3. Interface Administrateur
- **Dashboard administrateur** : Statistiques globales
- **Gestion complète** : Tous les CRUD
- **Gestion utilisateurs** : Création comptes recruteurs
- **Configuration système** : Paramètres globaux

## 5. Contraintes et exigences

### 5.1. Contraintes techniques
- **Compatibilité navigateurs** : Chrome, Firefox, Safari, Edge
- **Sécurité** : HTTPS obligatoire
- **Sauvegarde** : Backup automatique quotidien
- **Logs** : Traçabilité des actions importantes

### 5.2. Contraintes fonctionnelles
- **Unicité** : Un candidat = un email = une candidature par campagne
- **Persistance** : Sauvegarde continue des réponses QCM
- **Notifications** : Emails automatiques à chaque étape
- **Workflow** : Respect strict du processus de candidature

### 5.3. Contraintes de performance
- **Disponibilité** : 99.5% minimum
- **Temps de réponse** : < 2 secondes pour actions courantes
- **Concurrent users** : Support de 50 utilisateurs simultanés minimum

## 6. Livrables

### 6.1. Documentation
- Cahier des charges (ce document)
- Documentation technique
- Manuel utilisateur
- Guide d'installation et déploiement

### 6.2. Code source
- Application complète avec tests
- Scripts de déploiement
- Base de données avec données de test

### 6.3. Formation
- Formation administrateur
- Formation recruteurs
- Support technique initial

## 7. Planning et jalons

### 7.1. Phase 1 : Conception (2 semaines)
- Finalisation cahier des charges
- Maquettes UI/UX
- Architecture technique détaillée

### 7.2. Phase 2 : Développement (8 semaines)
- Backend et API
- Frontend interfaces
- Intégration et tests

### 7.3. Phase 3 : Tests et déploiement (2 semaines)
- Tests utilisateurs
- Corrections et optimisations
- Déploiement production

### 7.4. Phase 4 : Formation et support (1 semaine)
- Formation équipes
- Documentation finale
- Support initial

## 8. Budget et ressources

### 8.1. Équipe projet
- 1 Chef de projet
- 1 Développeur full-stack
- 1 Testeur/QA

### 8.2. Infrastructure
- Serveur de production
- Environnement de test
- Outils de développement
- Licences logicielles

## 9. Critères de succès

### 9.1. Fonctionnels
- Processus de candidature complet et fluide
- Gestion efficace des campagnes
- Suivi en temps réel des candidatures
- Satisfaction utilisateurs > 8/10

### 9.2. Techniques
- Application stable et performante
- Sécurité des données garantie
- Sauvegarde automatique fonctionnelle
- Déploiement réussi en production

## 10. Risques et mitigation

### 10.1. Risques techniques
- **Perte de données** : Sauvegardes automatiques multiples
- **Sécurité** : Audits de sécurité réguliers
- **Performance** : Tests de charge avant déploiement

### 10.2. Risques fonctionnels
- **Adoption utilisateur** : Formation et accompagnement
- **Processus complexe** : Interface intuitive et documentation claire
- **Evolution besoins** : Architecture modulaire et évolutive

---

*Ce cahier des charges constitue le document de référence pour le développement de l'application de recrutement Synelia. Il sera mis à jour selon l'évolution des besoins et des contraintes identifiées durant le projet.*
