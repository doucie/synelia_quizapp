# Séparation Front / Back

## Analyse : Ce qui est mal placé

### 🔴 Dans le FRONT alors que ça devrait être dans le BACK

#### 1. Génération de tokens d'authentification
- **Fichier** : `auth.service.ts`
- **Problème** : Le frontend génère le token avec `btoa(JSON.stringify(payload))` et détermine le rôle de l'utilisateur
- **Correction** : Le backend doit générer un JWT signé et retourner le rôle dans la réponse de connexion

#### 2. Détermination du rôle utilisateur
- **Fichier** : `auth.service.ts` (lignes 134-150)
- **Problème** : Le frontend devine le rôle à partir du pattern de l'email ou met "admin" par défaut
- **Correction** : Le rôle doit venir exclusivement de la réponse backend lors du login

#### 3. Calcul du seuil "en ligne" des évaluateurs
- **Fichier** : `evaluations.ts` (ligne 466)
- **Problème** : Le frontend décide si un utilisateur est "en ligne" basé sur un délai de 15-20 secondes
- **Correction** : Le backend devrait déterminer le statut en ligne basé sur le dernier heartbeat serveur (plus fiable que le temps côté navigateur)

#### 4. Gestion de la présence par visibilité d'onglet
- **Fichier** : `online-status.service.ts` (ligne 112)
- **Problème** : Le frontend marque l'utilisateur offline quand l'onglet est caché (5 min timeout)
- **Correction** : Le backend devrait gérer le timeout de présence (si pas de heartbeat depuis X minutes → offline)

#### 5. Formatage de dates pour l'API
- **Fichier** : `interview-crud.service.ts` (lignes 153-159)
- **Problème** : Le frontend formate manuellement les dates en `dd/MM/yyyy HH:mm:ss` avant envoi
- **Correction** : Envoyer des dates ISO 8601 et laisser le backend gérer la sérialisation

---

### 🟠 Dans le BACK alors que ce n'est pas nécessaire

#### 1. Endpoints de debug qui ne sont pas du code métier
- **Fichier** : `UserController.java`
- `GET /user/roles-debug` → charge tous les utilisateurs pour afficher leurs rôles
- `POST /user/set-users-online` → met arbitrairement 3 utilisateurs en ligne
- **Correction** : Supprimer ou conditionner avec `@Profile("local")`

---

### ✅ Ce qui est bien placé

| Responsabilité | Emplacement | Verdict |
|---------------|-------------|---------|
| CRUD données (create, update, delete) | Backend | ✅ Correct |
| Validation des données | Backend (Business layer) | ✅ Correct |
| Sérialisation/mapping DTO | Backend (MapStruct) | ✅ Correct |
| Envoi d'emails | Backend (EmailBusiness) | ✅ Correct |
| Stockage fichiers (MinIO) | Backend | ✅ Correct |
| Affichage/UI/navigation | Frontend | ✅ Correct |
| Guards de route | Frontend | ✅ Correct (mais doit être doublé côté back) |
| Thème light/dark | Frontend (localStorage) | ✅ Correct |
| WebSocket stats temps réel | Backend (broadcast) + Frontend (écoute) | ✅ Correct |

---

## Diagramme de la situation actuelle vs idéale

### Situation actuelle
```
FRONTEND                              BACKEND
┌─────────────────────┐               ┌─────────────────────┐
│ Génère tokens ❌     │               │ SecurityConfig:      │
│ Détermine rôles ❌   │──── HTTP ────│  permitAll() ❌      │
│ Calcule online ❌    │               │                     │
│ Gère timeout ❌      │               │ Pas de validation   │
│ Formate dates ❌     │               │  de token ❌        │
│                     │               │                     │
│ Stocke token local  │               │ Endpoints debug     │
│ Guards localStorage  │               │  exposés ❌         │
└─────────────────────┘               └─────────────────────┘
```

### Situation idéale
```
FRONTEND                              BACKEND
┌─────────────────────┐               ┌─────────────────────┐
│ Affichage/UI        │               │ Génère JWT ✅        │
│ Navigation          │──── HTTP ────│ Valide JWT ✅        │
│ Stocke token        │  + Bearer    │ Détermine rôles ✅   │
│ Guards (+ backend)  │   token      │ Autorise par rôle ✅ │
│ Envoie heartbeat    │               │ Gère timeout ✅      │
│ Écoute WebSocket    │               │ Formate dates ✅     │
│                     │               │ Endpoints sécurisés ✅│
└─────────────────────┘               └─────────────────────┘
```

---

## Score de séparation

| Aspect | Score | Commentaire |
|--------|-------|-------------|
| CRUD / Données | ✅ 9/10 | Bien géré côté backend |
| Authentification | 🔴 2/10 | Token forgé côté client |
| Autorisation | 🔴 2/10 | Rôles déterminés côté client |
| Présence en ligne | 🟠 5/10 | Logique partagée mais mal distribuée |
| Formatage données | 🟡 7/10 | Quelques formats côté client |
| Validation | 🟡 7/10 | Validations métier correctement dans le backend |
| **Score moyen** | **🟠 5.3/10** | |
