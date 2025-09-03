# Applications - Exemples d'occurrences multiples

**Endpoint:** `POST /applications/create`  
**Base URL:** `http://localhost:8081`

---

## 📥 Créer les candidatures (un par un)

> **Prérequis:** Avoir créé des tokens de source avant d'exécuter ces requêtes

### 🎯 Candidature 1 - Marie Martin
```json
{
    "user": "1",
    "datas": [
        {
            "candidateFirstName": "Marie",
            "candidateLastName": "Martin",
            "candidateEmail": "marie.martin@email.com",
            "candidatePhone": "+33987654321",
            "candidateCvPath": "/uploads/cv_marie_martin.pdf",
            "emailVerified": true,
            "quizScore": 85,
            "evaluationScore": 4.2,
            "applicationStatus": "accepted",
            "visitToken": "visit_token_marie_123",
            "sourceTokenId": 1
        }
    ]
}
```

### 🎯 Candidature 2 - Thomas Dubois
```json
{
    "user": "1",
    "datas": [
        {
            "candidateFirstName": "Thomas",
            "candidateLastName": "Dubois",
            "candidateEmail": "thomas.dubois@email.com",
            "candidatePhone": "+33876543210",
            "candidateCvPath": "/uploads/cv_thomas_dubois.pdf",
            "emailVerified": true,
            "quizScore": 72,
            "evaluationScore": 3.8,
            "applicationStatus": "pending",
            "visitToken": "visit_token_thomas_456",
            "sourceTokenId": 2
        }
    ]
}
```

### 🎯 Candidature 3 - Sarah Chen
```json
{
    "user": "1",
    "datas": [
        {
            "candidateFirstName": "Sarah",
            "candidateLastName": "Chen",
            "candidateEmail": "sarah.chen@email.com",
            "candidatePhone": "+33765432109",
            "candidateCvPath": "/uploads/cv_sarah_chen.pdf",
            "emailVerified": true,
            "quizScore": 91,
            "evaluationScore": 4.7,
            "applicationStatus": "accepted",
            "visitToken": "visit_token_sarah_789",
            "sourceTokenId": 3
        }
    ]
}
```

### 🎯 Candidature 4 - Alexandre Rodriguez
```json
{
    "user": "1",
    "datas": [
        {
            "candidateFirstName": "Alexandre",
            "candidateLastName": "Rodriguez",
            "candidateEmail": "alex.rodriguez@email.com",
            "candidatePhone": "+33654321098",
            "candidateCvPath": "/uploads/cv_alex_rodriguez.pdf",
            "emailVerified": false,
            "quizScore": 67,
            "evaluationScore": 3.3,
            "applicationStatus": "rejected",
            "visitToken": "visit_token_alex_101",
            "sourceTokenId": 4
        }
    ]
}
```

### 🎯 Candidature 5 - Julie Lefevre
```json
{
    "user": "1",
    "datas": [
        {
            "candidateFirstName": "Julie",
            "candidateLastName": "Lefevre",
            "candidateEmail": "julie.lefevre@email.com",
            "candidatePhone": "+33543210987",
            "candidateCvPath": "/uploads/cv_julie_lefevre.pdf",
            "emailVerified": true,
            "quizScore": 78,
            "evaluationScore": 4.0,
            "applicationStatus": "interview",
            "visitToken": "visit_token_julie_202",
            "sourceTokenId": 5
        }
    ]
}
```
            "candidateLastName": "Dubois",
            "candidateEmail": "thomas.dubois@email.com",
            "candidatePhone": "+33123456789",
            "candidateCvPath": "/uploads/cv_thomas_dubois.pdf",
            "emailVerified": true,
            "quizScore": 72,
            "evaluationScore": 3.8,
            "applicationStatus": "pending",
            "visitToken": "visit_token_thomas_456",
            "sourceTokenId": 2
        },
        {
            "candidateFirstName": "Julie",
            "candidateLastName": "Lefevre",
            "candidateEmail": "julie.lefevre@email.com",
            "candidatePhone": "+33555123789",
            "candidateCvPath": "/uploads/cv_julie_lefevre.pdf",
            "emailVerified": false,
            "quizScore": null,
            "evaluationScore": null,
            "applicationStatus": "pending",
            "visitToken": "visit_token_julie_789",
            "sourceTokenId": 3
        },
        {
            "candidateFirstName": "Alexandre",
            "candidateLastName": "Moreau",
            "candidateEmail": "alexandre.moreau@email.com",
            "candidatePhone": "+33444987123",
            "candidateCvPath": "/uploads/cv_alexandre_moreau.pdf",
            "emailVerified": true,
            "quizScore": 91,
            "evaluationScore": 4.7,
            "applicationStatus": "accepted",
            "visitToken": "visit_token_alex_101",
            "sourceTokenId": 1
        },
        {
            "candidateFirstName": "Emma",
            "candidateLastName": "Rousseau",
            "candidateEmail": "emma.rousseau@email.com",
            "candidatePhone": "+33333555999",
            "candidateCvPath": "/uploads/cv_emma_rousseau.pdf",
            "emailVerified": true,
            "quizScore": 67,
            "evaluationScore": 3.4,
            "applicationStatus": "rejected",
            "visitToken": "visit_token_emma_202",
            "sourceTokenId": 4
        },
        {
            "candidateFirstName": "Nicolas",
            "candidateLastName": "Petit",
            "candidateEmail": "nicolas.petit@email.com",
            "candidatePhone": "+33666777888",
            "candidateCvPath": "/uploads/cv_nicolas_petit.pdf",
            "emailVerified": true,
            "quizScore": 78,
            "evaluationScore": 4.0,
            "applicationStatus": "pending",
            "visitToken": "visit_token_nicolas_303",
            "sourceTokenId": 5
        },
        {
            "candidateFirstName": "Camille",
            "candidateLastName": "Garcia",
            "candidateEmail": "camille.garcia@email.com",
            "candidatePhone": "+33777888999",
            "candidateCvPath": "/uploads/cv_camille_garcia.pdf",
            "emailVerified": false,
            "quizScore": null,
            "evaluationScore": null,
            "applicationStatus": "pending",
            "visitToken": "visit_token_camille_404",
            "sourceTokenId": 7
        },
        {
            "candidateFirstName": "Maxime",
            "candidateLastName": "Bernard",
            "candidateEmail": "maxime.bernard@email.com",
            "candidatePhone": "+33888999111",
            "candidateCvPath": "/uploads/cv_maxime_bernard.pdf",
            "emailVerified": true,
            "quizScore": 88,
            "evaluationScore": 4.5,
            "applicationStatus": "accepted",
            "visitToken": "visit_token_maxime_505",
            "sourceTokenId": 8
        }
    ]
}
```

---

## 🔍 Vérifier la création
**POST** `/applications/getByCriteria`

```json
{
    "user": "1",
    "size": 20,
    "index": 0
}
```
