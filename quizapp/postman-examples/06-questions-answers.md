# Questions-Answers - Exemples d'occurrences multiples

**Endpoint:** `POST /questionsanswers/create`  
**Base URL:** `http://localhost:8081`

---

## 📥 Créer les associations question-réponse (un par un)

> **Prérequis:** Avoir créé au moins 12 questions et 20 réponses avant d'exécuter ces requêtes

### 🎯 Association 1 - Question 1, Réponse 1 (correcte)
```json
{
    "user": "1",
    "datas": [
        {
            "questionsId": 1,
            "answersId": 1,
            "isCorrect": true,
            "answerOrder": 1
        }
    ]
}
```

### 🎯 Association 2 - Question 1, Réponse 2 (incorrecte)
```json
{
    "user": "1",
    "datas": [
        {
            "questionsId": 1,
            "answersId": 2,
            "isCorrect": false,
            "answerOrder": 2
        }
    ]
}
```

### 🎯 Association 3 - Question 1, Réponse 3 (incorrecte)
```json
{
    "user": "1",
    "datas": [
        {
            "questionsId": 1,
            "answersId": 3,
            "isCorrect": false,
            "answerOrder": 3
        }
    ]
}
```

### 🎯 Association 4 - Question 1, Réponse 4 (incorrecte)
```json
{
    "user": "1",
    "datas": [
        {
            "questionsId": 1,
            "answersId": 4,
            "isCorrect": false,
            "answerOrder": 4
        }
    ]
}
```

### 🎯 Association 5 - Question 2, Réponse 5 (correcte)
```json
{
    "user": "1",
    "datas": [
        {
            "questionsId": 2,
            "answersId": 5,
            "isCorrect": true,
            "answerOrder": 1
        }
    ]
}
```

### 🎯 Association 6 - Question 2, Réponse 6 (correcte)
```json
{
    "user": "1",
    "datas": [
        {
            "questionsId": 2,
            "answersId": 6,
            "isCorrect": true,
            "answerOrder": 2
        }
    ]
}
```
            "isCorrect": false,
            "answerOrder": 3
        },
        {
            "questionsId": 1,
            "answersId": 4,
            "isCorrect": false,
            "answerOrder": 4
        },
        {
            "questionsId": 2,
            "answersId": 5,
            "isCorrect": true,
            "answerOrder": 1
        },
        {
            "questionsId": 2,
            "answersId": 6,
            "isCorrect": true,
            "answerOrder": 2
        },
        {
            "questionsId": 2,
            "answersId": 7,
            "isCorrect": false,
            "answerOrder": 3
        },
        {
            "questionsId": 2,
            "answersId": 8,
            "isCorrect": false,
            "answerOrder": 4
        },
        {
            "questionsId": 3,
            "answersId": 9,
            "isCorrect": true,
            "answerOrder": 1
        },
        {
            "questionsId": 3,
            "answersId": 10,
            "isCorrect": false,
            "answerOrder": 2
        },
        {
            "questionsId": 3,
            "answersId": 11,
            "isCorrect": false,
            "answerOrder": 3
        },
        {
            "questionsId": 3,
            "answersId": 12,
            "isCorrect": false,
            "answerOrder": 4
        },
        {
            "questionsId": 4,
            "answersId": 13,
            "isCorrect": true,
            "answerOrder": 1
        },
        {
            "questionsId": 4,
            "answersId": 14,
            "isCorrect": true,
            "answerOrder": 2
        },
        {
            "questionsId": 4,
            "answersId": 15,
            "isCorrect": false,
            "answerOrder": 3
        },
        {
            "questionsId": 4,
            "answersId": 16,
            "isCorrect": false,
            "answerOrder": 4
        },
        {
            "questionsId": 5,
            "answersId": 17,
            "isCorrect": true,
            "answerOrder": 1
        },
        {
            "questionsId": 5,
            "answersId": 18,
            "isCorrect": true,
            "answerOrder": 2
        },
        {
            "questionsId": 5,
            "answersId": 19,
            "isCorrect": false,
            "answerOrder": 3
        },
        {
            "questionsId": 5,
            "answersId": 20,
            "isCorrect": false,
            "answerOrder": 4
        }
    ]
}
```

---

## 🔍 Vérifier la création
**POST** `/questionsanswers/getByCriteria`

```json
{
    "user": "1",
    "size": 30,
    "index": 0
}
```
