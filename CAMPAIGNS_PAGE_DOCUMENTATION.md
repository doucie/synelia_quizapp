# 📋 Page des Campagnes de Recrutement

## Vue d'ensemble

La page **Campagnes** (`/dashboard/campaigns`) offre une interface moderne et intuitive permettant aux recruteurs de visualiser et gérer toutes les campagnes de recrutement. Elle est organisée en **3 onglets principaux** avec un système de filtres avancé.

## 🎯 Fonctionnalités principales

### 1. Système d'onglets

#### 📊 **Toutes les campagnes**
- Affiche **toutes** les campagnes disponibles dans le système
- API appelée : `campaignService.getAllCampaignsByCriteria({ size: 100, page: 0 })`
- Accessible à tous les recruteurs

#### 👤 **Mes campagnes**
- Affiche uniquement les campagnes **créées par l'utilisateur connecté**
- Filtre : `createdBy = currentUserId`
- API appelée : `campaignService.getMyCampaigns({ size: 100, page: 0 })`
- Permet aux recruteurs de gérer leurs propres campagnes

#### 👥 **Campagnes partagées**
- Affiche les campagnes **partagées via la table `campaign_crud`**
- Source : `campaignCrud.campaigns` où `userId = currentUserId`
- API appelée : `campaignService.getSharedCampaigns()`
- Montre les campagnes auxquelles le recruteur a accès mais qu'il n'a pas créées

### 2. Système de recherche et filtrage

#### 🔍 **Barre de recherche**
Recherche en temps réel sur :
- Titre de la campagne (`campaignTitle`)
- Description (`campaignDesc`)
- Spécialité associée (`specialityLibelle`)

#### 🏷️ **Filtres de statut**
4 filtres rapides avec compteurs dynamiques :
- **Toutes** : Affiche toutes les campagnes
- **En cours** (`ACTIVE`) : Campagnes actives
- **En attente** (`PENDING`) : Campagnes en attente de démarrage
- **Terminées** (`CLOSED`) : Campagnes terminées

### 3. Cartes de campagnes

Chaque campagne est affichée sous forme de **carte moderne** avec :

#### 📌 En-tête de carte
- **Titre de la campagne**
- **Icône d'accès** :
  - 🌐 : `allCanUpdate = true` (tous les recruteurs peuvent modifier)
  - 👤 : Créateur de la campagne
  - 👥 : Accès partagé via `campaign_crud`
- **Badge de statut** avec couleurs :
  - 🟢 Vert : En cours (`ACTIVE`)
  - 🟡 Jaune : En attente (`PENDING`)
  - ⚫ Gris : Terminée (`CLOSED`)

#### 📝 Contenu de carte
- **Description** (tronquée à 2 lignes)
- **Spécialité** avec icône 🎯

#### 📊 Statistiques
- **Questions** 📝 : Nombre de questions dans la campagne
- **Candidats** 👥 : Nombre de candidatures reçues
- **Max** 🎯 : Nombre maximum de candidatures (`maxApply`)

#### 📅 Dates
- **Début** : Date de début de la campagne
- **Fin** : Date de fin de la campagne

#### 👤 Footer
- Nom du créateur de la campagne

## 🔐 Gestion des droits d'accès

### Champ `allCanUpdate`

Le booléen `allCanUpdate` dans la table `campaigns` détermine si **tous les recruteurs** peuvent :
- ✏️ Modifier la campagne
- 📊 Évaluer les candidats participants

#### Comportement :
- `allCanUpdate = true` → Tous les recruteurs ont accès en modification/évaluation
- `allCanUpdate = false` → Seuls les utilisateurs avec droits via `campaign_crud` peuvent agir

### Table `campaign_crud`

Cette table crée une liaison entre `users` et `campaigns` pour gérer les droits spécifiques :

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT | Identifiant unique |
| `campaign_id` | INT | Référence à la campagne |
| `user_id` | INT | Référence à l'utilisateur |
| `can_update` | BOOLEAN | Droit de modification |
| `can_delete` | BOOLEAN | Droit de suppression |
| `can_evaluate` | BOOLEAN | Droit d'évaluer les candidats |
| `follow` | BOOLEAN | Suivi de la campagne |

#### Exemple de requête :
```sql
-- Récupérer les campagnes partagées avec l'utilisateur ID 303
SELECT c.* 
FROM campaigns c
JOIN campaign_crud cc ON c.id = cc.campaign_id
WHERE cc.user_id = 303 AND c.is_deleted = FALSE;
```

## 🎨 Design et UX

### Palette de couleurs
- **Primary** : Gradient violet (#667eea → #764ba2)
- **Active** : Gradient vert (#10b981 → #059669)
- **Pending** : Gradient jaune (#f59e0b → #d97706)
- **Closed** : Gradient gris (#6b7280 → #4b5563)

### Animations
- ✨ Fade-in au chargement de la page (300ms)
- 🔄 Rotation du bouton "Actualiser" pendant le chargement
- 📈 Hover sur les cartes : élévation + échelle
- 💫 Pulse sur les indicateurs de statut

### Responsive
- **Desktop** : Grille adaptative (min 350px par carte)
- **Tablet** : 2 colonnes
- **Mobile** : 1 colonne, interface optimisée

## 🔄 Flux de données

```
Composant CampaignsComponent
    ↓
    ├─→ getAllCampaigns() → campaigns/getByCriteria
    ├─→ getMyCampaigns() → campaigns/getByCriteria (avec createdBy)
    └─→ getSharedCampaigns() → campaignCrud/getByCriteria
              ↓
        Transformation des données
              ↓
        Signals (allCampaigns, myCampaigns, sharedCampaigns)
              ↓
        Computed (displayedCampaigns avec filtres)
              ↓
        Affichage dans le template
```

## 📦 Structure des fichiers

```
campaigns/
├── campaigns.ts          # Composant principal (218 lignes)
│   ├── 3 Signals pour chaque type de campagne
│   ├── Computed pour le filtrage
│   ├── Méthodes de chargement avec forkJoin
│   └── Helpers pour affichage (statut, dates, accès)
│
├── campaigns.html        # Template (193 lignes)
│   ├── Onglets avec compteurs
│   ├── Barre de recherche + filtres de statut
│   ├── Grille de cartes responsive
│   └── États vides personnalisés
│
└── campaigns.scss        # Styles (600+ lignes)
    ├── Design moderne avec gradients
    ├── Animations et transitions
    ├── Media queries responsive
    └── États hover et active
```

## 🚀 Prochaines étapes

Pour améliorer la page des campagnes, vous pouvez :

1. **Ajouter la pagination** : Gérer plus de 100 campagnes
2. **Créer une page détails** : `/dashboard/campaigns/:id`
3. **Formulaire de création** : Bouton "Nouvelle campagne"
4. **Actions rapides** :
   - Dupliquer une campagne
   - Archiver/Réactiver
   - Partager avec d'autres recruteurs
5. **Statistiques avancées** :
   - Taux de conversion
   - Temps moyen de traitement
   - Graphiques de progression

## 🔗 Liens utiles

- **Service** : `core/services/campaign.service.ts`
- **Modèles** : `Campaign`, `CampaignCrud` interfaces
- **Route** : `/dashboard/campaigns` (avec `recruiterRoleGuard`)
- **Menu** : Déjà configuré dans `dashboard.ts` ligne 115-120

## ✅ Résumé

La page des campagnes offre une **expérience utilisateur moderne et intuitive** avec :
- ✅ 3 onglets pour organiser les campagnes
- ✅ Système de recherche et filtrage en temps réel
- ✅ Design responsive et accessible
- ✅ Gestion fine des droits d'accès (`allCanUpdate` + `campaign_crud`)
- ✅ Animations fluides et visuellement agréables
- ✅ Code TypeScript typé et maintenable

Cette page constitue une base solide pour la gestion des campagnes de recrutement par les recruteurs ! 🎉
