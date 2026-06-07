# 📋 PLAN DU CAHIER DES CHARGES (Version Allégée)
## Application Web de Gestion du Processus de Recrutement - SyneliaQuizApp

**Projet :** quizapp_full  
**Date :** 9 janvier 2026  
**Objectif :** 25-40 pages maximum

---

# 🗂️ STRUCTURE DU CAHIER DES CHARGES

---

## PARTIE I : PRÉSENTATION GÉNÉRALE
*Pages estimées : 3-4 pages*

### 1. Informations du Projet
- Fiche d'identité (Nom, Client, Type, Version)
- Responsables et intervenants

### 2. Contexte et Problématique
- Présentation de l'entreprise Synelia
- Problématique du recrutement actuel
  - Processus manuel chronophage
  - Absence de centralisation
  - Évaluations non standardisées
- Besoin de digitalisation

### 3. Objectifs du Projet
- Objectifs stratégiques
  - Digitaliser le processus de recrutement
  - Automatiser l'évaluation technique
  - Faciliter la collaboration entre recruteurs
- Objectifs opérationnels
  - Réduire le temps de traitement
  - Améliorer l'expérience candidat
- Indicateurs de succès (KPIs)

### 4. Périmètre Fonctionnel
- Fonctionnalités incluses (In Scope)
- Fonctionnalités exclues (Out of Scope)
- Contraintes et hypothèses

---

## PARTIE II : ACTEURS ET CAS D'UTILISATION
*Pages estimées : 4-5 pages*

### 5. Identification des Acteurs
- **Acteurs internes**
  - Super Administrateur : Configuration système
  - Administrateur : Gestion RH
  - Recruteur : Évaluation et décisions
- **Acteurs externes**
  - Candidat : Postulation et quiz
- Matrice rôles/permissions (tableau synthétique)

### 6. Parcours Utilisateurs Principaux
- **Parcours Candidat** : Postulation → Vérification email → Quiz → Entretien → Décision
- **Parcours Recruteur** : Campagne → Candidatures → Évaluation → Décision
- **Parcours Administrateur** : Configuration → Gestion utilisateurs → Référentiels

### 7. Diagramme des Cas d'Utilisation
- Diagramme global (1 page)
- Priorisation MoSCoW

---

## PARTIE III : SPÉCIFICATIONS FONCTIONNELLES
*Pages estimées : 10-15 pages*

### 8. Module Authentification
- Connexion / Déconnexion
- Inscription avec validation
- Récupération de mot de passe
- Gestion des sessions

### 9. Module Gestion des Utilisateurs
- Liste paginée avec recherche
- CRUD utilisateurs
- Attribution des rôles (super, admin, recruiter)
- Activation/Désactivation de comptes

### 10. Module Données de Référence
- Départements (CRUD)
- Spécialités liées aux départements (CRUD)
- Questions avec temps alloué (CRUD)
- Réponses et associations Questions-Réponses
- Marquage des bonnes réponses

### 11. Module Campagnes de Recrutement
- Liste des campagnes (filtres par statut)
- Création/Modification de campagne
  - Informations : titre, description, spécialité
  - Configuration : dates, nombre max de candidatures
  - Paramètres quiz : nombre de questions, mode chronométré
- Tokens de partage (SourceToken)
  - Génération de codes uniques
  - Tracking de l'origine des candidatures

### 12. Module Candidatures
- **Formulaire de candidature (externe)**
  - Champs : identité, contact, CV, lettre de motivation
  - Upload de CV (PDF, DOC, DOCX)
  - Consentement RGPD
- **Vérification email**
  - Envoi d'email avec lien de confirmation
  - Validation du compte candidat
- **Gestion des candidatures (recruteur)**
  - Vue tabulaire avec tri et filtres
  - Détail candidature avec historique
- **Suivi de candidature (candidat)**
  - Accès par code de suivi

### 13. Module Quiz Technique
- **Configuration**
  - Association campagne-questions
  - Paramétrage du chronomètre
- **Passage du quiz**
  - Sécurité par token unique
  - Affichage question par question
  - Navigation (précédent/suivant)
  - Barre de progression
  - Chronomètre (si activé)
  - **⚠️ Sauvegarde automatique des réponses en temps réel**
    - Enregistrement à chaque sélection de réponse
    - Protection contre la perte de données (fermeture navigateur, déconnexion)
    - Reprise du quiz à la dernière question sauvegardée
- **États du quiz** : PENDING → IN_PROGRESS → COMPLETED
- **Calcul du score**
  - Score en points et pourcentage
  - Stockage dans la candidature

### 14. Module Entretiens
- Planification (date, lieu/lien visio, type)
- Statuts : PENDING, SCHEDULED, STARTED, OVER, POSTPONED
- Association de candidats aux entretiens
- Envoi automatique de convocations par email

### 15. Module Évaluations
- Interface d'évaluation collaborative (plein écran)
- Notation sur 100 avec commentaires
- Synchronisation temps réel entre évaluateurs
- Calcul automatique des moyennes

### 16. Module Décisions
- Pré-sélection (après quiz)
- Décision finale (après entretien)
- Actions : Accepter / Rejeter / Annuler
- Notifications automatiques au candidat

### 17. Module Notifications
- Centre de notifications in-app
- Types : nouvelle candidature, quiz complété, entretien planifié, etc.
- Notifications email (templates HTML)

### 18. Module Dashboard
- Statistiques globales
- Présence en ligne (QEEL - temps réel)
- Dernières activités

---

## PARTIE IV : ARCHITECTURE ET TECHNOLOGIES
*Pages estimées : 3-4 pages*

### 19. Architecture Globale
- Architecture 3-tiers (Présentation, Métier, Données)
- Pattern SPA + API REST
- Schéma d'architecture simplifié

### 20. Stack Technologique
| Couche | Technologies |
|--------|--------------|
| **Backend** | Java 21, Spring Boot 3.5, Spring Security, MySQL |
| **Frontend** | Angular 20, TypeScript, SCSS |
| **Temps réel** | WebSocket |
| **Emails** | Spring Mail, Thymeleaf |

### 21. Communications
- API REST (JSON)
- WebSocket pour le temps réel

---

## PARTIE V : SÉCURITÉ
*Pages estimées : 2-3 pages*

### 22. Authentification et Autorisation
- Authentification par token
- Hashage des mots de passe (BCrypt)
- Matrice rôles/routes

### 23. Protection des Données
- Conformité RGPD
- Suppression logique (soft delete)
- Validation des entrées

---

## PARTIE VI : INTERFACE UTILISATEUR
*Pages estimées : 2-3 pages*

### 24. Charte Graphique
- Palette de couleurs
- Typographie
- Mode sombre (optionnel)

### 25. Ergonomie
- Navigation intuitive
- Composants réutilisables (tableaux, formulaires, modales)
- Design responsive

---

## PARTIE VII : CONTRAINTES ET ÉVOLUTIONS
*Pages estimées : 2-3 pages*

### 26. Contraintes Techniques
- Prérequis serveur (JDK 21+, MySQL 8+, Node.js 18+)
- Environnements (dev, prod)

### 27. Évolutions Futures
- Intégration calendrier (Google, Outlook)
- Visioconférence intégrée
- Intelligence artificielle pour matching CV
- Multi-langue (FR, EN)
- Application mobile

---

## ANNEXES
*Pages estimées : 3-5 pages*

### Annexe A : Glossaire
- Termes métier et techniques

### Annexe B : Diagrammes UML
- Diagramme de cas d'utilisation
- Diagramme de séquence (processus candidature)

### Annexe C : Maquettes d'écran
- Captures des interfaces principales

---

# 📊 RÉCAPITULATIF

| Partie | Pages estimées |
|--------|----------------|
| I - Présentation générale | 3-4 |
| II - Acteurs et cas d'utilisation | 4-5 |
| III - Spécifications fonctionnelles | 10-15 |
| IV - Architecture et technologies | 3-4 |
| V - Sécurité | 2-3 |
| VI - Interface utilisateur | 2-3 |
| VII - Contraintes et évolutions | 2-3 |
| Annexes | 3-5 |
| **TOTAL** | **29-42 pages** |

---

# ✅ POINTS CLÉS INTÉGRÉS

1. **Pas de détails d'attributs de base de données** - La partie "Modèle de données" a été supprimée (dictionnaire de données, types SQL, etc.)

2. **Sauvegarde automatique des réponses du quiz** - Section 13 détaille explicitement :
   - Enregistrement automatique à chaque sélection
   - Protection contre la perte de données
   - Reprise possible du quiz

3. **Taille optimisée** - Plan réduit de 12 parties à 7 parties + annexes, estimation 29-42 pages

---

# 🔄 ÉLÉMENTS SUPPRIMÉS (vs. version précédente)

- ❌ Partie IV "Modèle de données" (dictionnaire, attributs, types SQL)
- ❌ Partie VII "API REST" détaillée (catalogue des endpoints)
- ❌ Partie IX "Gestion des fichiers" séparée (intégrée dans Candidatures)
- ❌ Partie X "Déploiement" détaillée
- ❌ Annexes D/E (Scripts SQL, Documentation API complète)
- ❌ Architecture backend/frontend détaillée (structure des packages)

---

**Document simplifié pour un cahier des charges fonctionnel**

*Version : 2.0 | Date : 9 janvier 2026*
