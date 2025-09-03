# Guide API Postman - QuizApp

**Base URL:** `http://localhost:8081`

## 🚨 Important
- Remplacez tous les champs de date vides par `null` (pas de chaînes vides `""`)
- Utilisez `null` pour les valeurs booléennes non définies
- Les champs obligatoires sont marqués avec ⭐

### "user"
\utils\contract\RequestBase.java

### "datas"
\utils\contract\Request.java

---

## 1. User Management

### ➕ Créer un utilisateur
**POST** `/user/create`

```json
{
    "user": "1",
    "datas": [
        {
            "firstName": "Jean", ⭐
            "lastName": "Dupont", ⭐
            "username": "jdupont", ⭐
            "email": "jean.dupont@example.com", ⭐
            "phone": "+33123456789",
            "password": "motdepasse123", ⭐
            "userRole": "admin",
            "isOnline": null,
            "isLocked": null,
            "isDefaultPassword": null,
            "lastConnectionDate": null
        }
    ]
}
```

### 🔍 Lister les utilisateurs
**POST** `/user/getByCriteria`

```json
{
    "user": "1",
    "size": 10,
    "index": 0
}
```

---

## 2. Applications (Candidatures)

### ➕ Créer une candidature
**POST** `/applications/create`

```json
{
    "user": "1",
    "datas": [
        {
            "candidateFirstName": "Marie", ⭐
            "candidateLastName": "Martin", ⭐
            "candidateEmail": "marie.martin@example.com", ⭐
            "candidatePhone": "+33987654321",
            "candidateCvPath": "/uploads/cv_marie_martin.pdf",
            "emailVerified": false,
            "quizScore": null,
            "evaluationScore": null,
            "applicationStatus": "pending",
            "visitToken": "token_abc123",
            "sourceTokenId": 1
        }
    ]
}
```

---

## 3. Departments (Départements)

### ➕ Créer un département
**POST** `/departments/create`

```json
{
    "user": "1",
    "datas": [
        {
            "departmentName": "Informatique", ⭐
            "departmentDesc": "Département de développement logiciel et infrastructure"
        }
    ]
}
```

---

## 4. Specialities (Spécialités)

### ➕ Créer une spécialité
**POST** `/specialities/create`

```json
{
    "user": "1",
    "datas": [
        {
            "specialityName": "Java Development", ⭐
            "specialityDesc": "Développement d'applications Java/Spring"
        }
    ]
}
```

---

## 5. Questions

### ➕ Créer une question
**POST** `/questions/create`

```json
{
    "user": "1",
    "datas": [
        {
            "questionContent": "Qu'est-ce que l'encapsulation en Java ?", ⭐
            "questionChrono": 120
        }
    ]
}
```

---

## 6. Answers (Réponses)

### ➕ Créer une réponse
**POST** `/answers/create`

```json
{
    "user": "1",
    "datas": [
        {
            "answerContent": "L'encapsulation est un principe de la POO qui consiste à cacher les détails d'implémentation d'une classe." ⭐
        }
    ]
}
```

---

## 7. Questions-Answers (Association Question-Réponse)

### ➕ Créer une association question-réponse
**POST** `/questionsanswers/create`

```json
{
    "user": "1",
    "datas": [
        {
            "questionsId": 1, ⭐
            "answersId": 1, ⭐
            "isCorrect": true,
            "answerOrder": 1
        }
    ]
}
```

---

## 8. Campaigns (Campagnes)

### ➕ Créer une campagne
**POST** `/campaigns/create`

```json
{
    "user": "1",
    "datas": [
        {
            "campaignName": "Recrutement Développeur Java Senior", ⭐
            "campaignDesc": "Campagne de recrutement pour poste de développeur Java avec 5+ ans d'expérience",
            "campaignStart": "2025-09-01T09:00:00",
            "campaignEnd": "2025-10-15T17:00:00",
            "campaignDuration": 3600,
            "isActive": true,
            "departmentsId": 1,
            "specialitiesId": 1
        }
    ]
}
```

---

## 9. Campaign Questions (Questions de Campagne)

### ➕ Associer question à campagne
**POST** `/campaignquestions/create`

```json
{
    "user": "1",
    "datas": [
        {
            "campaignsId": 1, ⭐
            "questionsId": 1, ⭐
            "questionOrder": 1
        }
    ]
}
```

---

## 10. Campaign CRUD (Permissions Campagne)

### ➕ Créer permissions campagne
**POST** `/campaigncrud/create`

```json
{
    "user": "1",
    "datas": [
        {
            "canUpdate": true,
            "canDelete": false,
            "canEvaluate": true,
            "follow": true,
            "campaignsId": 1,
            "userId": 1
        }
    ]
}
```

---

## 11. Source Token (Token de Source)

### ➕ Créer un token de source
**POST** `/sourcetoken/create`

```json
{
    "user": "1",
    "datas": [
        {
            "tokenValue": "src_token_linkedin_2025", ⭐
            "sourceName": "LinkedIn",
            "sourceDesc": "Candidatures provenant de LinkedIn",
            "isActive": true
        }
    ]
}
```

---

## 12. Candidate Token (Token Candidat)

### ➕ Créer un token candidat
**POST** `/candidatetoken/create`

```json
{
    "user": "1",
    "datas": [
        {
            "tokenValue": "candidate_token_123", ⭐
            "tokenExpiry": "2025-12-31T23:59:59",
            "isUsed": false,
            "applicationsId": 1 ⭐
        }
    ]
}
```

---

## 13. Candidate Ask (Demande Candidat)

### ➕ Créer une demande candidat
**POST** `/candidateask/create`

```json
{
    "user": "1",
    "datas": [
        {
            "requestType": "interview",
            "requestStatus": "pending",
            "applicationsId": 1 ⭐
        }
    ]
}
```

---

## 14. Candidate Answers (Réponses Candidat)

### ➕ Créer réponse candidat
**POST** `/candidateanswers/create`

```json
{
    "user": "1",
    "datas": [
        {
            "candidateResponse": "L'encapsulation permet de protéger les données d'une classe",
            "isCorrect": true,
            "responseTime": 45,
            "applicationsId": 1, ⭐
            "questionsId": 1, ⭐
            "answersId": 1
        }
    ]
}
```

---

## 15. Interviews (Entretiens)

### ➕ Créer un entretien
**POST** `/interviews/create`

```json
{
    "user": "1",
    "datas": [
        {
            "interviewTitle": "Entretien technique Java", ⭐
            "interviewDesc": "Entretien technique pour évaluer les compétences Java",
            "interviewDuration": 3600,
            "isActive": true
        }
    ]
}
```

---

## 16. Interview CRUD (Permissions Entretien)

### ➕ Créer permissions entretien
**POST** `/interviewcrud/create`

```json
{
    "user": "1",
    "datas": [
        {
            "canCreate": true,
            "canUpdate": true,
            "canDelete": false,
            "canEvaluate": true,
            "interviewsId": 1,
            "userId": 1
        }
    ]
}
```

---

## 17. Candidate Interview (Entretien Candidat)

### ➕ Programmer entretien candidat
**POST** `/candidateinterview/create`

```json
{
    "user": "1",
    "datas": [
        {
            "interviewStart": "2025-09-15T10:00:00",
            "interviewEnd": "2025-09-15T11:00:00",
            "interviewStatus": "scheduled",
            "applicationsId": 1, ⭐
            "interviewsId": 1
        }
    ]
}
```

---

## 18. Evaluations

### ➕ Créer une évaluation
**POST** `/evaluations/create`

```json
{
    "user": "1",
    "datas": [
        {
            "candidateMark": 85,
            "evaluatorComments": "Excellente maîtrise des concepts Java, bonne logique de programmation",
            "applicationsId": 1, ⭐
            "userId": 1
        }
    ]
}
```

---

## 19. Notifications

### ➕ Créer une notification
**POST** `/notifications/create`

```json
{
    "user": "1",
    "datas": [
        {
            "notificationTitle": "Nouveau candidat", ⭐
            "notificationMessage": "Un nouveau candidat a postulé pour le poste Java Developer",
            "notificationType": "info",
            "isRead": false,
            "userId": 1
        }
    ]
}
```

---

## 🔧 Requêtes de Consultation Génériques

### 📋 Lister tous les éléments d'une table
**POST** `/{table-name}/getByCriteria`

```json
{
    "user": "1",
    "size": 50,
    "index": 0,
    "isAnd": true
}
```

### 🔍 Rechercher par critères
**POST** `/{table-name}/getByCriteria`

```json
{
    "user": "1",
    "size": 10,
    "index": 0,
    "isAnd": true,
    "data": {
        "fieldName": "valueToSearch"
    }
}
```

### 📝 Mettre à jour
**POST** `/{table-name}/update`

```json
{
    "user": "1",
    "data": {
        "id": 1,
        "fieldToUpdate": "newValue"
    }
}
```

### 🗑️ Supprimer
**POST** `/{table-name}/delete`

```json
{
    "user": "1",
    "data": {
        "id": 1
    }
}
```

---

## 🎯 Tables disponibles

1. **user** - Gestion des utilisateurs
2. **applications** - Candidatures
3. **departments** - Départements
4. **specialities** - Spécialités
5. **questions** - Questions de quiz
6. **answers** - Réponses possibles
7. **questionsanswers** - Association question-réponse
8. **campaigns** - Campagnes de recrutement
9. **campaignquestions** - Questions par campagne
10. **campaigncrud** - Permissions sur campagnes
11. **sourcetoken** - Tokens de source
12. **candidatetoken** - Tokens candidats
13. **candidateask** - Demandes candidats
14. **candidateanswers** - Réponses des candidats
15. **interviews** - Entretiens
16. **interviewcrud** - Permissions entretiens
17. **candidateinterview** - Planning entretiens
18. **evaluations** - Évaluations
19. **notifications** - Notifications

---

## 🌟 Tips
- Toujours inclure `"user": "1"` dans vos requêtes
- Utilisez `null` au lieu de chaînes vides pour les champs optionnels
- Les champs `createdAt`, `updatedAt`, `createdBy`, `updatedBy` sont gérés automatiquement
- Pour les dates, utilisez le format ISO : `"2025-08-22T14:30:00"`
