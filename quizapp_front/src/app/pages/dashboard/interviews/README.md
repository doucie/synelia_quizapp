# Page de Gestion des Entretiens

## Description
Page moderne pour gérer les entretiens avec les candidats pré-sélectionnés. Cette page permet de planifier, suivre et gérer le statut des entretiens.

## Fonctionnalités

### 1. Vue d'ensemble
- **Statistiques en temps réel** : Nombre d'entretiens en attente, planifiés, en cours et terminés
- **Recherche avancée** : Recherche par nom de candidat, email, campagne ou lieu
- **Filtres intelligents** : Filtrage par statut (Tous, Planifiés, En cours, Terminés)

### 2. Gestion des entretiens
- **Créer un entretien** : Planifier un nouvel entretien pour un candidat éligible
- **Modifier un entretien** : Mettre à jour les informations d'un entretien existant
- **Supprimer un entretien** : Annuler un entretien
- **Changer le statut** : Démarrer, terminer, marquer comme réussi/échoué

### 3. Éligibilité des candidats
Seuls les candidats ayant les statuts suivants peuvent avoir un entretien planifié :
- `PRE_SCREEN_ACCEPTED` : Candidats pré-sélectionnés
- `INTERVIEWING` : Candidats en processus d'entretien

### 4. Informations d'entretien
Pour chaque entretien, vous pouvez gérer :
- **Date et heure** : Planification précise
- **Type d'entretien** : Technique, RH, Téléphonique, Visioconférence, Sur site
- **Lieu** : Adresse ou salle de réunion
- **Lien de visioconférence** : Pour les entretiens à distance
- **Notes** : Commentaires et observations
- **Notation** : Score maximum pour l'évaluation

### 5. Statuts d'entretien
- `PENDING` : En attente de planification
- `SCHEDULED` : Planifié
- `STARTED` : En cours
- `OVER` : Terminé
- `PASSED` : Réussi
- `FAILED` : Échoué
- `POSTPONED` : Reporté
- `ARCHIVED` : Archivé

## Structure des fichiers

```
quizapp_front/src/app/
├── core/services/
│   └── interview.service.ts          # Service API pour les entretiens
├── pages/dashboard/interviews/
│   ├── interviews.ts                 # Composant TypeScript
│   ├── interviews.html               # Template HTML
│   └── interviews.scss               # Styles SCSS avec variables de colors.css
```

## Routes
- **URL** : `/dashboard/interviews`
- **Accès** : Recruteurs et Administrateurs uniquement
- **Guard** : `recruiterRoleGuard`

## Design
- **Theme** : Utilise les variables CSS de `colors.css`
- **Layout** : Grid responsive avec cartes d'entretien
- **Composants** : 
  - Header avec statistiques et filtres
  - Grille de cartes d'entretiens
  - Panneau de détails latéral
  - Modal de création/édition

## Utilisation

### Créer un entretien
1. Cliquer sur "Planifier un entretien"
2. Sélectionner un candidat éligible
3. Renseigner la date, l'heure et les détails
4. Valider

### Modifier un entretien
1. Cliquer sur l'icône crayon d'une carte d'entretien
2. Modifier les informations
3. Enregistrer

### Changer le statut
- **Démarrer** : Bouton play sur les entretiens planifiés
- **Terminer** : Bouton check sur les entretiens en cours
- **Évaluer** : Boutons réussi/échoué sur les entretiens terminés

## Intégration Backend
Le service utilise l'API REST suivante :
- `POST /interviews/getByCriteria` : Récupération des entretiens
- `POST /interviews/create` : Création d'un entretien
- `POST /interviews/update` : Mise à jour d'un entretien
- `POST /interviews/delete` : Suppression d'un entretien

## Notes techniques
- **Framework** : Angular 18+ avec Signals
- **Format date** : `dd/MM/yyyy HH:mm` (backend)
- **Responsive** : Adapté mobile, tablette et desktop
- **Accessibilité** : Support clavier et lecteurs d'écran
