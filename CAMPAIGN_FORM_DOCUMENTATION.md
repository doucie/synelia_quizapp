# Formulaire de Création/Modification de Campagne

## Vue d'ensemble

Le formulaire de campagne permet de créer ou modifier des campagnes de recrutement avec tous les détails nécessaires. Il est accessible via :
- **Création** : `/dashboard/campaigns/new`
- **Modification** : `/dashboard/campaigns/:id/edit`

## Fonctionnalités

### 1. Informations Générales

#### Titre de la campagne *(requis)*
- Titre descriptif de la campagne
- Minimum 3 caractères
- Exemple : "Campagne de recrutement développeurs 2024"

#### Description *(requis)*
- Description détaillée des objectifs et du contexte
- Minimum 10 caractères
- Zone de texte multi-ligne

#### Statut *(requis)*
- **En attente** (PENDING) - Par défaut
- **Active** (ACTIVE)
- **Fermée** (CLOSED)

#### Dates *(requises)*
- **Date de début** : Date de début de la campagne
- **Date de fin** : Date de fin de la campagne

### 2. Configuration

#### Nombre maximum de candidatures
- Optionnel
- Si non défini : illimité
- Permet de limiter le nombre de candidatures acceptées

#### Barème de notation *(requis)*
Options prédéfinies :
- 10 points (par défaut)
- 20 points
- 50 points
- 100 points
- **Personnalisé** : saisir un barème personnalisé

#### Autorisation globale d'évaluation
Checkbox : "Autoriser tous les recruteurs à évaluer les candidatures"
- **Décoché par défaut**
- Si coché : tous les recruteurs peuvent évaluer sans être ajoutés explicitement
- Si décoché : seuls les recruteurs ajoutés dans la section suivante peuvent évaluer

### 3. Recruteurs Autorisés

#### Recherche de recruteurs
- Barre de recherche pour trouver des utilisateurs
- Filtre automatique sur les rôles : RECRUITER, ADMIN, SUPER_ADMIN
- Recherche à partir de 2 caractères
- Affiche : avatar, nom, email et rôle

#### Sélection multiple
- Possibilité d'ajouter plusieurs recruteurs
- Exclusion automatique des utilisateurs déjà ajoutés

#### Droits par recruteur
Pour chaque recruteur ajouté, définir ses droits :

1. **Peut évaluer** ✅ (coché par défaut)
   - Autorisation d'évaluer les candidatures
   - Rempli automatiquement à la sélection

2. **Peut modifier** ❌ (décoché par défaut)
   - Autorisation de modifier la campagne
   - Donne accès à l'édition de la campagne

3. **Peut supprimer** ❌ (décoché par défaut)
   - Autorisation de supprimer la campagne
   - Droit le plus sensible

#### Gestion des recruteurs
- **Bouton de suppression** : retirer un recruteur de la liste
- **Toggle des droits** : activer/désactiver chaque droit individuellement

## Architecture Technique

### Composant Angular
```typescript
CampaignFormComponent
├── campaign-form.ts        // Logique et formulaire réactif
├── campaign-form.component.html  // Template
└── campaign-form.component.scss  // Styles
```

### Services utilisés
- **CampaignService** : CRUD des campagnes
- **UserService** : Recherche et récupération des utilisateurs
- **Router** : Navigation

### Formulaire réactif
- Utilisation de `FormGroup` avec validation
- Validation côté client avec `Validators`
- Gestion des champs conditionnels (barème personnalisé)

### Gestion d'état
- Utilisation de **signals** pour la réactivité
- `loading()` : état de chargement
- `saving()` : état de sauvegarde
- `selectedRecruiters()` : liste des recruteurs sélectionnés
- `searchResults()` : résultats de recherche

## Base de données

### Migration
**Fichier** : `V1_015__rename_all_can_update_to_all_can_evaluate.sql`

```sql
ALTER TABLE campaigns 
CHANGE COLUMN all_can_update all_can_evaluate BOOLEAN DEFAULT FALSE;
```

### Table `campaigns`
Champs principaux :
- `campaign_title` : Titre
- `campaign_desc` : Description
- `campaign_status` : Statut (PENDING/ACTIVE/CLOSED)
- `campaign_start` : Date de début
- `campaign_end` : Date de fin
- `max_apply` : Nombre max de candidatures
- `all_can_evaluate` : ✨ **Nouveau** (anciennement `all_can_update`)
- `marked_out_of` : Barème de notation

### Table `campaign_crud`
Gestion des droits des recruteurs :
- `campaign_id` : FK vers campaigns
- `user_id` : FK vers users
- `can_evaluate` : Droit d'évaluation
- `can_update` : Droit de modification
- `can_delete` : Droit de suppression
- `follow` : Suivi de la campagne

## Routes

### Frontend (Angular)
```typescript
// Création
{ path: 'campaigns/new', component: CampaignFormComponent }

// Modification
{ path: 'campaigns/:id/edit', component: CampaignFormComponent }
```

### Backend (Spring Boot)
À implémenter :
- `POST /campaigns/create` : Créer une campagne
- `POST /campaigns/update` : Mettre à jour une campagne
- `GET /campaigns/{id}` : Récupérer les détails
- `POST /campaignCrud/create` : Créer les accès recruteurs
- `POST /campaignCrud/update` : Mettre à jour les accès

## TODO

### Backend
1. ✅ Migration SQL créée
2. ⏳ Entité `Campaigns` à mettre à jour (allCanEvaluate)
3. ⏳ DTO `CampaignsDto` à mettre à jour
4. ⏳ Méthodes `getCampaignById()` dans le service
5. ⏳ Méthodes pour gérer `campaign_crud` (accès recruteurs)

### Frontend
1. ✅ Composant créé
2. ✅ Routes ajoutées
3. ✅ Interface Campaign mise à jour
4. ⏳ Intégration complète des APIs backend
5. ⏳ Tests unitaires

## Usage

### Créer une nouvelle campagne
1. Aller sur `/dashboard/campaigns`
2. Cliquer sur "Nouvelle campagne"
3. Remplir les informations obligatoires
4. (Optionnel) Ajouter des recruteurs avec leurs droits
5. Cliquer sur "Créer la campagne"

### Modifier une campagne
1. Aller sur `/dashboard/campaigns`
2. Cliquer sur "Voir détails" d'une campagne
3. Cliquer sur "Modifier"
4. Modifier les champs souhaités
5. Cliquer sur "Mettre à jour"

## Validations

### Côté client
- Titre : minimum 3 caractères, requis
- Description : minimum 10 caractères, requis
- Statut : requis
- Dates : requises
- Barème : minimum 1, requis

### Côté serveur (à implémenter)
- Validation des dates (fin > début)
- Validation de l'unicité du titre
- Validation des IDs de recruteurs
- Validation des droits d'accès

## Sécurité

### Guards Angular
- `authGuard` : utilisateur authentifié
- `recruiterRoleGuard` : rôle RECRUITER, ADMIN ou SUPER_ADMIN

### Backend
- Vérifier les droits de création/modification
- Valider que l'utilisateur peut ajouter des recruteurs
- Contrôler les accès aux campagnes

## Design

### Responsive
- Grilles adaptatives (2 et 3 colonnes)
- Mobile-first
- Breakpoint : 768px

### Dark mode
- Support complet via variables CSS
- Variables utilisées : `--primary`, `--surface`, `--background`, `--text-primary`, etc.

### UX
- Validation en temps réel
- Messages d'erreur clairs
- Loading states
- Animations fluides
- Autocomplete pour la recherche
- Dropdown de résultats avec debounce
