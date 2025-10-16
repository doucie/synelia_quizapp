# Sécurisation du système de Quiz

## 📋 Vue d'ensemble

Le système de quiz a été sécurisé pour empêcher quelqu'un de répondre au quiz d'un autre candidat.

## 🔒 Nouvelles fonctionnalités de sécurité

### 1. **Champs ajoutés à la table `applications`**

```sql
- quiz_token VARCHAR(64) UNIQUE  -- Token sécurisé pour accéder au quiz
- quiz_status ENUM('pending', 'started', 'completed')  -- Statut du quiz
```

### 2. **Flux sécurisé**

```
1. Candidat crée une application
   └─> quiz_status = 'pending' (défaut)
   └─> quiz_token = NULL

2. Candidat reçoit l'email de vérification

3. Candidat clique sur le lien de vérification
   └─> Email vérifié: email_verified = true
   └─> Token généré: quiz_token = UUID (32 caractères hexadécimaux)
   └─> Le quiz_token est retourné au frontend

4. Redirection automatique vers le quiz
   └─> URL: /quiz/{applicationId}/{quizToken}
   └─> Exemple: http://localhost:4200/quiz/302/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

5. Chargement du quiz
   └─> Frontend envoie: applicationId + quizToken
   └─> Backend valide: quiz_token correspond à l'application
   └─> Si valide et status != 'completed':
       - Status 'pending' → 'started'
       - Retourne les questions/réponses
   └─> Si invalide: HTTP 403 Forbidden

6. Soumission du quiz
   └─> quiz_status = 'completed'
   └─> Plus de modification possible
```

## 🛡️ Protections mises en place

### **Protection 1: Token unique et imprévisible**
- Génération: `UUID.randomUUID()` (128 bits d'entropie)
- Format: 32 caractères hexadécimaux
- Exemple: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- Impossible à deviner ou brute-forcer

### **Protection 2: Validation stricte**
```java
// Backend valide que le quiz_token correspond à l'application
if (!quizToken.equals(application.getQuizToken())) {
    return HTTP 403 FORBIDDEN;
}
```

### **Protection 3: Une seule tentative**
```java
// Le quiz ne peut être fait qu'une seule fois
if (quiz_status == 'completed') {
    return "Ce quiz a déjà été complété";
}
```

### **Protection 4: Tracking du statut**
- `pending`: Quiz pas encore commencé
- `started`: Quiz en cours (dès le premier chargement)
- `completed`: Quiz terminé (plus de modification)

## 📁 Fichiers modifiés

### **Backend (Java)**

1. **Migration SQL**
   ```
   V1_011__add_quiz_token_and_status_to_applications.sql
   ```
   - Ajout des colonnes `quiz_token` et `quiz_status`
   - Index pour performance et sécurité

2. **Entité**
   ```
   Applications.java
   ```
   - Ajout des propriétés `quizToken` et `quizStatus`

3. **Enum**
   ```
   QuizStatus.java (NOUVEAU)
   ```
   - Enum pour les statuts: PENDING, STARTED, COMPLETED

4. **Business Logic**
   ```
   ApplicationsBusiness.java
   ```
   - `verifyEmail()`: Génère le quiz_token après vérification
   - `getQuizForApplication()`: Valide le quiz_token avant d'envoyer le quiz

### **Frontend (Angular)**

1. **Route**
   ```
   app.routes.ts
   ```
   - Avant: `/quiz/:applicationId`
   - Maintenant: `/quiz/:applicationId/:quizToken`

2. **Component Verify-Email**
   ```
   verify-email.ts
   ```
   - Récupère le quiz_token depuis `response.items[0].searchString`
   - Redirige vers: `/quiz/{id}/{token}`

3. **Component Quiz**
   ```
   quiz.ts
   ```
   - Récupère `applicationId` ET `quizToken` depuis l'URL
   - Validation: Les deux doivent être présents

4. **Service**
   ```
   application.service.ts
   ```
   - `getQuiz(applicationId, quizToken)`: Envoie les deux au backend

## 🔐 Exemple de flux complet

```typescript
// 1. Email vérifié → Backend génère le token
POST /applications/verify-email
Request: { token: "email-verification-token" }
Response: { 
  items: [{ 
    id: 302,
    searchString: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" // quiz_token
  }]
}

// 2. Redirection
window.location = "/quiz/302/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"

// 3. Chargement du quiz
POST /applications/get-quiz
Request: { 
  data: { 
    id: 302,
    searchString: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  }
}
Response: { 
  items: [{ 
    searchString: "{ quiz data as JSON }"
  }]
}
```

## 🚀 Pour tester

1. **Démarrer le backend**
   ```bash
   cd quizapp
   mvn spring-boot:run
   ```
   - La migration V1_011 s'exécute automatiquement au démarrage

2. **Démarrer le frontend**
   ```bash
   cd quizapp_front
   npm start
   ```

3. **Scénario de test**
   - Créer une candidature
   - Vérifier l'email via le lien
   - Observer la redirection: `/quiz/302/a1b2c3d4...`
   - Le quiz se charge uniquement avec le bon token
   - Essayer de modifier l'URL → Erreur 403

## ⚠️ Important

- **Ne jamais exposer le quiz_token** sauf dans l'URL sécurisée
- Le token est **à usage unique** (une seule session de quiz)
- Après `completed`, le quiz **ne peut plus être modifié**
- Le token est **unique par application** (colonne UNIQUE en DB)

## 📊 Indexes créés pour performance

```sql
idx_applications_quiz_token          -- Recherche rapide par token
idx_applications_quiz_status          -- Filtrage par statut
idx_applications_id_quiz_token        -- Validation (id + token)
```

---

**Date**: 2025-10-09  
**Migration**: V1_011  
**Sécurité**: ✅ Renforcée
