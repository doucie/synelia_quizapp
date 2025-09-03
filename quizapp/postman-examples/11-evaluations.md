# Evaluations - Exemples d'occurrences multiples

**Endpoint:** `POST /evaluations/create`  
**Base URL:** `http://localhost:8081`

---

## 📥 Créer les évaluations (un par un)

> **Prérequis:** Avoir créé des applications et des utilisateurs avant d'exécuter ces requêtes

### 🎯 Évaluation 1 - Marie Martin
```json
{
    "user": "1",
    "datas": [
        {
            "candidateMark": 85,
            "evaluatorComments": "Excellente maîtrise des concepts Java, bonne logique de programmation. Très bon potentiel technique.",
            "applicationsId": 1,
            "userId": 1
        }
    ]
}
```

### 🎯 Évaluation 2 - Thomas Dubois
```json
{
    "user": "1",
    "datas": [
        {
            "candidateMark": 72,
            "evaluatorComments": "Bonnes bases techniques mais manque d'expérience sur les frameworks modernes. À former sur Spring Boot.",
            "applicationsId": 2,
            "userId": 2
        }
    ]
}
```

### 🎯 Évaluation 3 - Sarah Chen
```json
{
    "user": "1",
    "datas": [
        {
            "candidateMark": 91,
            "evaluatorComments": "Candidat exceptionnel ! Très solide techniquement avec une excellente capacité d'analyse. Recommandé pour embauche immédiate.",
            "applicationsId": 3,
            "userId": 1
        }
    ]
}
```

### 🎯 Évaluation 4 - Alexandre Rodriguez
```json
{
    "user": "1",
    "datas": [
        {
            "candidateMark": 67,
            "evaluatorComments": "Niveau technique insuffisant pour le poste. Manque de connaissances sur les bonnes pratiques de développement.",
            "applicationsId": 4,
            "userId": 3
        }
    ]
}
```

### 🎯 Évaluation 5 - Julie Lefevre
```json
{
    "user": "1",
    "datas": [
        {
            "candidateMark": 78,
            "evaluatorComments": "Profil intéressant avec de bonnes bases. Motivation évidente mais à confirmer en entretien technique approfondi.",
            "applicationsId": 5,
            "userId": 2
        }
    ]
}
```
            "applicationsId": 4,
            "userId": 1
        },
        {
            "candidateMark": 67,
            "evaluatorComments": "Compétences techniques correctes mais communication difficile. Problème pour expliquer son raisonnement.",
            "applicationsId": 5,
            "userId": 3
        },
        {
            "candidateMark": 78,
            "evaluatorComments": "Profil intéressant avec de bonnes connaissances théoriques. Manque de pratique sur projets réels.",
            "applicationsId": 6,
            "userId": 2
        },
        {
            "candidateMark": 88,
            "evaluatorComments": "Très bon candidat avec une approche méthodique. Expérience pertinente et motivation évidente.",
            "applicationsId": 8,
            "userId": 1
        },
        {
            "candidateMark": 94,
            "evaluatorComments": "Candidat senior exceptionnellement qualifié. Leadership naturel et expertise technique remarquable. Top candidat !",
            "applicationsId": 4,
            "userId": 4
        },
        {
            "candidateMark": 63,
            "evaluatorComments": "Compétences de base présentes mais niveau insuffisant pour le poste. Peut convenir pour un poste junior.",
            "applicationsId": 2,
            "userId": 3
        },
        {
            "candidateMark": 81,
            "evaluatorComments": "Bon équilibre entre technique et relationnel. Curieux et adaptable, bon potentiel d'évolution.",
            "applicationsId": 6,
            "userId": 1
        },
        {
            "candidateMark": 76,
            "evaluatorComments": "Profil correct avec quelques lacunes sur les nouvelles technologies. Formation nécessaire mais candidat motivé.",
            "applicationsId": 8,
            "userId": 5
        }
    ]
}
```

---

## 🔍 Vérifier la création
**POST** `/evaluations/getByCriteria`

```json
{
    "user": "1",
    "size": 20,
    "index": 0
}
```
