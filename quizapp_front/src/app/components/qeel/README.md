# 📊 Système QEEL (Qui Est En Ligne)

Le système QEEL permet d'afficher en temps réel les statistiques des utilisateurs connectés dans l'application Synelia Quiz.

## 🎯 Fonctionnalités

### ✅ Statistiques affichées :
- **Utilisateurs total** : Nombre d'utilisateurs connectés / Nombre total d'utilisateurs
- **Administrateurs** : Nombre d'admins connectés / Nombre total d'admins  
- **Recruteurs** : Nombre de recruteurs connectés / Nombre total de recruteurs
- **Pourcentages** : Calcul automatique des pourcentages avec codes couleur

### 🔄 Mise à jour automatique :
- **Temps réel** : Mise à jour toutes les 30 secondes
- **Indicateur** : Affichage de la dernière mise à jour
- **Heartbeat** : Maintien des connexions actives

## 📁 Structure des fichiers

### Backend (Java)
```
UserController.java
├── updateOnlineStatus()     # Met à jour le statut d'un utilisateur
├── getOnlineStats()         # Récupère toutes les statistiques QEEL
└── getOnlineUsersCount()    # Récupère seulement le nombre d'utilisateurs en ligne
```

### Frontend (Angular)
```
services/
├── online-stats.service.ts     # Service pour récupérer les statistiques
├── user.service.ts            # Service pour gérer les utilisateurs
└── online-status.service.ts   # Service pour le suivi automatique

components/qeel/
├── qeel.component.ts          # Composant principal QEEL
└── qeel-compact.component.ts  # Version compacte pour navigation
```

## 🚀 Utilisation

### 1. Composant principal (dans le dashboard)
```typescript
// Dans overview.ts
import { QeelComponent } from '../../../components/qeel/qeel.component';

@Component({
  imports: [QeelComponent]
})
```

```html
<!-- Dans overview.html -->
<app-qeel></app-qeel>
```

### 2. Composant compact (dans la navigation)
```html
<!-- Version horizontale -->
<app-qeel-compact></app-qeel-compact>

<!-- Version verticale -->
<app-qeel-compact layout="vertical"></app-qeel-compact>

<!-- Sans total -->
<app-qeel-compact [showTotal]="false"></app-qeel-compact>
```

### 3. Service direct
```typescript
constructor(private onlineStatsService: OnlineStatsService) {}

loadStats() {
  this.onlineStatsService.getOnlineStats().subscribe(stats => {
    console.log('Utilisateurs en ligne:', stats.onlineUsers);
    console.log('Total utilisateurs:', stats.totalUsers);
  });
}
```

## 🎨 Styles et design

### Codes couleur des pourcentages :
- 🟢 **Vert** (≥70%) : Très bonne connexion
- 🟡 **Jaune** (30-69%) : Connexion moyenne  
- 🔴 **Rouge** (<30%) : Faible connexion

### Responsive :
- **Desktop** : Grille 3 colonnes
- **Mobile** : Colonne unique, layout vertical

## 🔧 Configuration

### Intervalles de mise à jour :
```typescript
// Dans qeel.component.ts
interval(30000) // 30 secondes pour le composant principal

// Dans qeel-compact.component.ts  
setInterval(() => {}, 60000) // 1 minute pour le compact
```

### API Endpoints :
```
GET /user/online-stats     # Toutes les statistiques
GET /user/online-count     # Nombre d'utilisateurs seulement
PUT /user/{id}/online-status?isOnline=true  # Mise à jour statut
```

## 🛠️ Développement

### Données factices (développement) :
Le système utilise des données factices quand l'API n'est pas disponible :
- 25 utilisateurs total, 8 en ligne
- 5 admins total, 2 en ligne
- 12 recruteurs total, 4 en ligne

### TODO - Implémentation backend :
1. Créer une table `user_sessions` pour stocker les sessions actives
2. Implémenter la logique de comptage par rôle dans le service
3. Ajouter un système de timeout pour marquer automatiquement hors ligne
4. Créer des triggers pour mettre à jour les compteurs en temps réel

## 🎭 Exemples visuels

### Dashboard principal :
```
┌─────────────────────────────────────────────┐
│          📊 Qui est en ligne (QEEL)         │
├─────────────────────────────────────────────┤
│ 🌐 Utilisateurs    👮 Admins    👔 Recruteurs │
│    8 / 25            2 / 5        4 / 12    │
│   📊 32% en ligne   📊 40%        📊 33%     │
└─────────────────────────────────────────────┘
```

### Navigation compacte :
```
🟢 8 en ligne  •  25 total
```

## 📊 Métriques et analytics

Le système QEEL peut être étendu pour inclure :
- Graphiques d'évolution du nombre d'utilisateurs
- Statistiques par heure/jour/semaine
- Détection des pics de connexion
- Alertes si trop peu d'admins connectés
