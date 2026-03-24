# CAHIER DES CHARGES

---

<div align="center">

# **SyneliaQuizApp**

## Application Web de Gestion du Processus de Recrutement

---

**Version :** 1.0  
**Date :** 9 janvier 2026  
**Statut :** En cours de rédaction

---

| Rôle | Nom |
|------|-----|
| **Client** | SYNELIA |
| **Chef de projet** | [À compléter] |
| **Rédacteur** | [À compléter] |

---

</div>

---

## HISTORIQUE DES VERSIONS

| Version | Date | Auteur | Modifications |
|---------|------|--------|---------------|
| 0.1 | Août 2025 | - | Création initiale |
| 1.0 | Janvier 2026 | - | Version complète du cahier des charges |

---

## TABLE DES MATIÈRES

1. [PARTIE I : PRÉSENTATION GÉNÉRALE](#partie-i--présentation-générale)
   - 1.1 Informations du Projet
   - 1.2 Contexte et Problématique
   - 1.3 Objectifs du Projet
   - 1.4 Périmètre Fonctionnel
2. [PARTIE II : ACTEURS ET CAS D'UTILISATION](#partie-ii--acteurs-et-cas-dutilisation)
   - 2.1 Identification des Acteurs
   - 2.2 Parcours Utilisateurs Principaux
   - 2.3 Diagramme des Cas d'Utilisation
3. PARTIE III : SPÉCIFICATIONS FONCTIONNELLES
4. PARTIE IV : ARCHITECTURE ET TECHNOLOGIES
5. PARTIE V : SÉCURITÉ
6. PARTIE VI : INTERFACE UTILISATEUR
7. PARTIE VII : CONTRAINTES ET ÉVOLUTIONS
8. ANNEXES

---

<div style="page-break-after: always;"></div>

# PARTIE I : PRÉSENTATION GÉNÉRALE

---

## 1.1 Informations du Projet

### 1.1.1 Fiche d'identité

| Élément | Description |
|---------|-------------|
| **Nom du projet** | SyneliaQuizApp |
| **Client** | SYNELIA |
| **Type d'application** | Application Web SPA (Single Page Application) |
| **Version** | 0.1 |
| **Date de démarrage** | Août 2025 |
| **Durée estimée** | 6 mois |

### 1.1.2 Intervenants du projet

| Rôle | Responsabilité |
|------|----------------|
| **Maître d'ouvrage (MOA)** | SYNELIA - Direction des Ressources Humaines |
| **Maître d'œuvre (MOE)** | Équipe de développement |
| **Chef de projet** | Coordination et suivi du projet |
| **Développeur Backend** | Conception et développement de l'API |
| **Développeur Frontend** | Conception et développement de l'interface |
| **Testeur** | Validation et recette |

### 1.1.3 Documents de référence

- Analyse des besoins SYNELIA
- Étude de l'existant
- Benchmark des solutions de recrutement

---

## 1.2 Contexte et Problématique

### 1.2.1 Présentation de l'entreprise SYNELIA

SYNELIA est une entreprise spécialisée dans les services informatiques et le conseil en technologies. En pleine croissance, l'entreprise fait face à des besoins de recrutement importants pour renforcer ses équipes techniques et accompagner son développement.

Le département des Ressources Humaines gère actuellement plusieurs dizaines de recrutements par an, avec des profils variés allant des développeurs juniors aux experts seniors, en passant par les chefs de projet et consultants.

### 1.2.2 Problématique du recrutement actuel

Le processus de recrutement actuel chez SYNELIA présente plusieurs difficultés majeures :

#### Processus manuel et chronophage

- Les candidatures arrivent par différents canaux (email, site web, LinkedIn, cabinets)
- Le tri des CV se fait manuellement, sans critères standardisés
- La planification des entretiens nécessite de nombreux échanges emails
- Le suivi des candidatures est effectué sur des fichiers Excel dispersés

#### Absence de centralisation

- Pas de base de données unique des candidats
- Informations éparpillées entre plusieurs outils
- Difficulté à retrouver l'historique d'un candidat
- Pas de vision globale sur les campagnes en cours

#### Évaluations non standardisées

- Chaque recruteur évalue selon ses propres critères
- Pas de grille d'évaluation commune
- Difficile de comparer objectivement les candidats
- Les compétences techniques ne sont pas vérifiées de manière uniforme

#### Manque de traçabilité

- Impossible de savoir d'où viennent les meilleurs candidats
- Pas de métriques sur l'efficacité des sources de recrutement
- Historique des décisions non documenté
- Difficulté à justifier les choix auprès de la direction

#### Expérience candidat dégradée

- Délais de réponse trop longs
- Manque de visibilité sur l'avancement du processus
- Communication non personnalisée
- Image de l'entreprise impactée

### 1.2.3 Besoin de digitalisation

Face à ces constats, SYNELIA souhaite se doter d'un outil moderne permettant de :

1. **Centraliser** toutes les candidatures dans une plateforme unique
2. **Automatiser** les tâches répétitives (emails, évaluations techniques)
3. **Standardiser** le processus d'évaluation des candidats
4. **Collaborer** efficacement entre les différents acteurs du recrutement
5. **Suivre** l'ensemble des candidatures en temps réel
6. **Mesurer** la performance du processus de recrutement

---

## 1.3 Objectifs du Projet

### 1.3.1 Objectifs stratégiques

| Objectif | Description |
|----------|-------------|
| **Digitaliser le processus** | Remplacer les processus manuels par une plateforme web centralisée permettant de gérer l'intégralité du cycle de recrutement |
| **Automatiser l'évaluation technique** | Intégrer un système de quiz technique permettant de pré-filtrer les candidats de manière objective avant les entretiens |
| **Faciliter la collaboration** | Permettre à plusieurs recruteurs d'évaluer simultanément les candidats et de partager leurs avis en temps réel |
| **Améliorer l'image employeur** | Offrir aux candidats une expérience de candidature moderne et fluide |

### 1.3.2 Objectifs opérationnels

| Objectif | Cible |
|----------|-------|
| Réduire le temps de traitement d'une candidature | -50% |
| Diminuer le nombre d'emails échangés | -70% |
| Augmenter le taux de réponse aux candidats | 100% dans les 48h |
| Standardiser les évaluations techniques | 100% des candidats passent le quiz |
| Centraliser les données candidats | Base unique accessible à tous |

### 1.3.3 Indicateurs de succès (KPIs)

Les indicateurs suivants permettront de mesurer le succès du projet :

**KPIs quantitatifs :**
- Nombre de candidatures traitées par mois
- Temps moyen de traitement d'une candidature
- Taux de conversion candidature → entretien → embauche
- Score moyen des candidats aux quiz techniques
- Nombre d'évaluations collaboratives réalisées

**KPIs qualitatifs :**
- Satisfaction des recruteurs (enquête interne)
- Satisfaction des candidats (enquête post-candidature)
- Qualité des embauches (évaluation à 6 mois)

---

## 1.4 Périmètre Fonctionnel

### 1.4.1 Fonctionnalités incluses (In Scope)

Le projet SyneliaQuizApp couvre les fonctionnalités suivantes :

#### Gestion des campagnes de recrutement
- Création et paramétrage des campagnes
- Définition des critères de sélection
- Configuration des quiz techniques
- Génération de liens de partage traçables

#### Gestion des candidatures
- Formulaire de candidature en ligne
- Upload de CV et lettre de motivation
- Vérification de l'email du candidat
- Suivi de candidature pour le candidat

#### Système de quiz technique
- Banque de questions par spécialité
- Configuration du nombre de questions et du temps
- Passage du quiz en ligne avec sauvegarde automatique
- Calcul automatique des scores

#### Gestion des entretiens
- Planification des entretiens (présentiel/distanciel)
- Envoi automatique de convocations
- Suivi des statuts d'entretien

#### Évaluation collaborative
- Interface d'évaluation partagée
- Notation et commentaires par évaluateur
- Calcul des moyennes en temps réel
- Visualisation des avis des autres recruteurs

#### Prise de décision
- Workflow de validation
- Pré-sélection et décision finale
- Notifications automatiques aux candidats

#### Administration
- Gestion des utilisateurs et des rôles
- Configuration des données de référence (départements, spécialités, questions)
- Tableau de bord avec statistiques

### 1.4.2 Fonctionnalités exclues (Out of Scope)

Les éléments suivants ne font **pas** partie du périmètre de cette version :

| Fonctionnalité exclue | Raison |
|----------------------|--------|
| Intégration avec les job boards (Indeed, LinkedIn) | Prévu pour une version ultérieure |
| Visioconférence intégrée | Utilisation d'outils externes (Teams, Zoom) |
| Gestion de la paie et des contrats | Périmètre RH distinct |
| Application mobile native | Version web responsive prioritaire |
| Multi-langue | Version française uniquement pour le lancement |
| Matching automatique par IA | Fonctionnalité avancée pour V2 |

### 1.4.3 Contraintes du projet

#### Contraintes techniques
- L'application doit être accessible via navigateur web moderne (Chrome, Firefox, Edge, Safari)
- Temps de réponse inférieur à 3 secondes pour les opérations courantes
- Disponibilité cible de 99% en heures ouvrées
- Compatibilité avec les écrans de 1280px minimum

#### Contraintes organisationnelles
- Formation des utilisateurs à prévoir
- Migration des données existantes (fichiers Excel)
- Accompagnement au changement nécessaire

#### Contraintes réglementaires
- Conformité RGPD obligatoire
- Conservation des données candidats limitée à 2 ans
- Droit d'accès et de suppression des données

### 1.4.4 Hypothèses

- Les utilisateurs disposent d'une connexion internet stable
- Les candidats possèdent une adresse email valide
- Les recruteurs sont équipés d'ordinateurs avec navigateurs récents
- L'entreprise dispose d'un serveur de messagerie fonctionnel

---

<div style="page-break-after: always;"></div>

# PARTIE II : ACTEURS ET CAS D'UTILISATION

---

## 2.1 Identification des Acteurs

### 2.1.1 Acteurs internes

L'application distingue trois niveaux d'utilisateurs internes avec des droits croissants :

#### Super Administrateur

| Attribut | Description |
|----------|-------------|
| **Rôle** | Administrateur technique avec accès complet |
| **Profil type** | Responsable informatique, Administrateur système |
| **Responsabilités** | Configuration système, gestion de tous les paramètres, accès à toutes les fonctionnalités |
| **Permissions** | Toutes les permissions sans restriction |

**Fonctionnalités accessibles :**
- Gestion complète des utilisateurs (création, modification, suppression)
- Configuration des données de référence (départements, spécialités, questions, réponses)
- Paramétrage du système
- Accès aux campagnes, candidatures, entretiens et évaluations
- Tableau de bord complet avec toutes les statistiques

#### Administrateur

| Attribut | Description |
|----------|-------------|
| **Rôle** | Responsable RH ou manager avec droits étendus |
| **Profil type** | DRH, Responsable recrutement, Manager |
| **Responsabilités** | Gestion des campagnes, supervision des recruteurs, prise de décision |
| **Permissions** | Gestion des utilisateurs, campagnes, candidatures, décisions |

**Fonctionnalités accessibles :**
- Gestion des utilisateurs (sauf Super Admin)
- Création et gestion des campagnes de recrutement
- Visualisation et gestion de toutes les candidatures
- Planification des entretiens
- Évaluation des candidats
- Prise de décision (acceptation/refus)
- Accès au tableau de bord

#### Recruteur

| Attribut | Description |
|----------|-------------|
| **Rôle** | Chargé de recrutement opérationnel |
| **Profil type** | Chargé de recrutement, RH opérationnel, Manager technique |
| **Responsabilités** | Gestion quotidienne des candidatures, entretiens, évaluations |
| **Permissions** | Gestion des campagnes assignées, candidatures, entretiens, évaluations |

**Fonctionnalités accessibles :**
- Création et gestion des campagnes
- Consultation et gestion des candidatures
- Planification et suivi des entretiens
- Évaluation collaborative des candidats
- Prise de décision sur les candidatures
- Accès au tableau de bord personnel

### 2.1.2 Acteurs externes

#### Candidat

| Attribut | Description |
|----------|-------------|
| **Rôle** | Personne postulant à une offre d'emploi |
| **Profil type** | Demandeur d'emploi, personne en reconversion, salarié en recherche |
| **Objectifs** | Postuler à une offre, démontrer ses compétences, suivre sa candidature |
| **Permissions** | Accès limité à son propre parcours de candidature |

**Fonctionnalités accessibles :**
- Consultation de l'offre d'emploi (via lien de partage)
- Soumission de candidature (formulaire + CV)
- Vérification de son adresse email
- Passage du quiz technique
- Suivi de l'avancement de sa candidature

### 2.1.3 Matrice des Rôles et Permissions

| Fonctionnalité | Super Admin | Admin | Recruteur | Candidat |
|----------------|:-----------:|:-----:|:---------:|:--------:|
| **Authentification** |
| Connexion / Déconnexion | ✅ | ✅ | ✅ | ❌ |
| Modifier son profil | ✅ | ✅ | ✅ | ❌ |
| **Gestion des utilisateurs** |
| Créer un utilisateur | ✅ | ✅ | ❌ | ❌ |
| Modifier un utilisateur | ✅ | ✅ | ❌ | ❌ |
| Supprimer un utilisateur | ✅ | ❌ | ❌ | ❌ |
| Attribuer le rôle Super Admin | ✅ | ❌ | ❌ | ❌ |
| **Données de référence** |
| Gérer les départements | ✅ | ❌ | ❌ | ❌ |
| Gérer les spécialités | ✅ | ❌ | ❌ | ❌ |
| Gérer les questions/réponses | ✅ | ❌ | ❌ | ❌ |
| **Campagnes** |
| Créer une campagne | ✅ | ✅ | ✅ | ❌ |
| Modifier une campagne | ✅ | ✅ | ✅ | ❌ |
| Supprimer une campagne | ✅ | ✅ | ❌ | ❌ |
| Générer des tokens de partage | ✅ | ✅ | ✅ | ❌ |
| **Candidatures** |
| Soumettre une candidature | ❌ | ❌ | ❌ | ✅ |
| Consulter les candidatures | ✅ | ✅ | ✅ | ❌ |
| Passer le quiz | ❌ | ❌ | ❌ | ✅ |
| Suivre sa candidature | ❌ | ❌ | ❌ | ✅ |
| **Entretiens** |
| Planifier un entretien | ✅ | ✅ | ✅ | ❌ |
| Modifier un entretien | ✅ | ✅ | ✅ | ❌ |
| **Évaluations** |
| Évaluer un candidat | ✅ | ✅ | ✅ | ❌ |
| Voir les évaluations des autres | ✅ | ✅ | ✅ | ❌ |
| **Décisions** |
| Prendre une décision | ✅ | ✅ | ✅ | ❌ |
| Annuler une décision | ✅ | ✅ | ❌ | ❌ |
| **Dashboard** |
| Accéder au tableau de bord | ✅ | ✅ | ✅ | ❌ |
| Voir les statistiques globales | ✅ | ✅ | ❌ | ❌ |

---

## 2.2 Parcours Utilisateurs Principaux

### 2.2.1 Parcours Candidat

Le parcours du candidat se déroule en 5 étapes principales :

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1. OFFRE   │───▶│ 2. CANDIDA- │───▶│ 3. VÉRIFI-  │───▶│  4. QUIZ    │───▶│  5. SUIVI   │
│  (Découverte)│    │    TURE     │    │ CATION EMAIL│    │ TECHNIQUE   │    │ CANDIDATURE │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### Étape 1 : Découverte de l'offre
- Le candidat reçoit un lien de partage (via email, LinkedIn, site web)
- Le lien contient un **token de source** permettant de tracer l'origine
- Le candidat accède à la page de candidature de la campagne

#### Étape 2 : Soumission de la candidature
- Remplissage du formulaire :
  - Informations personnelles (nom, prénom, email, téléphone, date de naissance)
  - Upload du CV (formats PDF, DOC, DOCX)
  - Lettre de motivation (optionnel)
  - Acceptation des conditions et consentement RGPD
- Validation et enregistrement de la candidature

#### Étape 3 : Vérification de l'email
- Réception d'un email de confirmation avec un lien de vérification
- Clic sur le lien pour valider l'adresse email
- Déblocage de l'accès au quiz technique

#### Étape 4 : Passage du quiz technique
- Accès au quiz via un lien sécurisé (token unique)
- Lecture des instructions et durée estimée
- Réponse aux questions (QCM)
- **Sauvegarde automatique** des réponses à chaque question
- Soumission finale et calcul du score

#### Étape 5 : Suivi de la candidature
- Accès à une page de suivi avec code personnel
- Visualisation du statut actuel
- Historique des étapes franchies
- Réception d'emails à chaque changement de statut

### 2.2.2 Parcours Recruteur

Le parcours du recruteur couvre le cycle complet de gestion des recrutements :

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ 1. CAMPAGNE │───▶│ 2. CANDIDA- │───▶│ 3. ENTRETIEN│───▶│ 4. ÉVALUA-  │───▶│ 5. DÉCISION │
│  (Création) │    │    TURES    │    │(Planification)│   │    TION     │    │  (Finale)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### Étape 1 : Création de campagne
- Définition des informations de la campagne :
  - Titre et description du poste
  - Spécialité requise
  - Dates de début et fin
  - Nombre maximum de candidatures
- Configuration du quiz :
  - Nombre de questions
  - Activation du chronomètre
- Génération des tokens de partage pour différentes sources

#### Étape 2 : Gestion des candidatures
- Réception des notifications de nouvelles candidatures
- Consultation de la liste des candidatures avec filtres
- Visualisation des détails : profil, CV, score quiz
- Tri et présélection des candidats

#### Étape 3 : Planification des entretiens
- Sélection des candidats retenus
- Création d'entretiens :
  - Date et heure
  - Type (présentiel ou en ligne)
  - Lieu ou lien de visioconférence
- Envoi automatique des convocations par email

#### Étape 4 : Évaluation collaborative
- Accès à l'interface d'évaluation partagée
- Consultation des informations candidat et du score quiz
- Notation sur 100 et commentaires
- Visualisation en temps réel des évaluations des autres recruteurs
- Calcul automatique de la moyenne

#### Étape 5 : Prise de décision
- Analyse des évaluations collectives
- Prise de décision : Accepter ou Rejeter
- Déclenchement des notifications automatiques au candidat
- Archivage de la candidature

### 2.2.3 Parcours Administrateur

Le parcours administrateur est orienté configuration et supervision :

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ 1. CONFIG.  │───▶│ 2. GESTION  │───▶│ 3. SUIVI    │
│ RÉFÉRENTIELS│    │ UTILISATEURS│    │ ACTIVITÉ    │
└─────────────┘    └─────────────┘    └─────────────┘
```

#### Étape 1 : Configuration des référentiels
- Création des départements de l'entreprise
- Définition des spécialités par département
- Alimentation de la banque de questions par spécialité
- Création des réponses et marquage des bonnes réponses

#### Étape 2 : Gestion des utilisateurs
- Création des comptes recruteurs et administrateurs
- Attribution des rôles
- Activation/désactivation des comptes
- Réinitialisation des mots de passe

#### Étape 3 : Suivi de l'activité
- Consultation du tableau de bord global
- Visualisation des statistiques (candidatures, conversions, sources)
- Suivi des campagnes en cours
- Supervision des évaluations

---

## 2.3 Diagramme des Cas d'Utilisation

### 2.3.1 Diagramme global

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SYSTÈME SYNELIA QUIZ APP                            │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         GESTION DES RÉFÉRENTIELS                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │    │
│  │  │   Gérer      │  │   Gérer      │  │   Gérer      │  │   Gérer     │  │    │
│  │  │ Départements │  │ Spécialités  │  │  Questions   │  │  Réponses   │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│         ▲                                                                        │
│         │                                                                        │
│  ┌──────┴──────┐                                                                 │
│  │ Super Admin │                                                                 │
│  └──────┬──────┘                                                                 │
│         │                                                                        │
│         ▼                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         GESTION DES UTILISATEURS                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │    │
│  │  │   Créer      │  │   Modifier   │  │  Activer/    │                   │    │
│  │  │ Utilisateur  │  │ Utilisateur  │  │  Désactiver  │                   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│         ▲                                                                        │
│         │                                                                        │
│  ┌──────┴──────┐                                                                 │
│  │    Admin    │                                                                 │
│  └──────┬──────┘                                                                 │
│         │                                                                        │
│         ▼                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    GESTION DU RECRUTEMENT                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │    │
│  │  │    Gérer     │  │   Gérer      │  │  Planifier   │  │   Évaluer   │  │    │
│  │  │  Campagnes   │  │ Candidatures │  │  Entretiens  │  │  Candidats  │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │    │
│  │                                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │    │
│  │  │   Prendre    │  │  Consulter   │  │   Générer    │                   │    │
│  │  │  Décisions   │  │  Dashboard   │  │   Tokens     │                   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│         ▲                                                                        │
│         │                                                                        │
│  ┌──────┴──────┐                                                                 │
│  │  Recruteur  │                                                                 │
│  └─────────────┘                                                                 │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                       PARCOURS CANDIDAT                                  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │    │
│  │  │  Soumettre   │  │  Vérifier    │  │   Passer     │  │   Suivre    │  │    │
│  │  │ Candidature  │  │   Email      │  │    Quiz      │  │ Candidature │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│         ▲                                                                        │
│         │                                                                        │
│  ┌──────┴──────┐                                                                 │
│  │  Candidat   │                                                                 │
│  └─────────────┘                                                                 │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3.2 Priorisation des Cas d'Utilisation (MoSCoW)

| Priorité | Cas d'utilisation | Justification |
|----------|-------------------|---------------|
| **MUST HAVE** | | |
| 🔴 | Soumettre une candidature | Fonctionnalité cœur du système |
| 🔴 | Passer le quiz technique | Différenciateur clé de l'application |
| 🔴 | Gérer les campagnes | Indispensable pour organiser les recrutements |
| 🔴 | Consulter les candidatures | Nécessaire pour les recruteurs |
| 🔴 | Évaluer les candidats | Objectif principal de collaboration |
| 🔴 | S'authentifier | Sécurité de base |
| **SHOULD HAVE** | | |
| 🟠 | Planifier des entretiens | Important mais pas bloquant |
| 🟠 | Prendre des décisions | Workflow complet de recrutement |
| 🟠 | Vérifier l'email | Validation des candidats |
| 🟠 | Suivre sa candidature | Expérience candidat |
| 🟠 | Recevoir des notifications | Communication automatisée |
| **COULD HAVE** | | |
| 🟡 | Consulter le dashboard | Supervision et analytics |
| 🟡 | Exporter des données | Reporting externe |
| 🟡 | Générer des tokens de partage | Tracking des sources |
| **WON'T HAVE (this time)** | | |
| ⚪ | Intégration calendrier | Prévu pour V2 |
| ⚪ | Visioconférence intégrée | Utilisation d'outils externes |
| ⚪ | Matching IA | Fonctionnalité avancée |

---

*Suite du document : PARTIE III - SPÉCIFICATIONS FONCTIONNELLES*

---
