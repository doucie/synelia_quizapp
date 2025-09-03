# Interviews - Exemples d'occurrences multiples

**Endpoint:** `POST /interviews/create`  
**Base URL:** `http://localhost:8081`

---

## 📥 Créer les entretiens (un par un)

### 🎯 Entretien 1 - Technique Java
```json
{
    "user": "1",
    "datas": [
        {
            "interviewTitle": "Entretien Technique Java",
            "interviewDesc": "Évaluation des compétences techniques Java, Spring Boot et bases de données",
            "interviewDuration": 3600,
            "isActive": true
        }
    ]
}
```

### 🎯 Entretien 2 - Frontend React
```json
{
    "user": "1",
    "datas": [
        {
            "interviewTitle": "Entretien Frontend React",
            "interviewDesc": "Test pratique sur React, TypeScript et intégration d'APIs",
            "interviewDuration": 2700,
            "isActive": true
        }
    ]
}
```

### 🎯 Entretien 3 - RH Motivation
```json
{
    "user": "1",
    "datas": [
        {
            "interviewTitle": "Entretien RH Motivation",
            "interviewDesc": "Évaluation de la motivation, soft skills et culture d'entreprise",
            "interviewDuration": 1800,
            "isActive": true
        }
    ]
}
```

### 🎯 Entretien 4 - Data Science
```json
{
    "user": "1",
    "datas": [
        {
            "interviewTitle": "Entretien Data Science",
            "interviewDesc": "Cas pratique d'analyse de données et machine learning",
            "interviewDuration": 4200,
            "isActive": true
        }
    ]
}
```

### 🎯 Entretien 5 - DevOps
```json
{
    "user": "1",
    "datas": [
        {
            "interviewTitle": "Entretien DevOps",
            "interviewDesc": "Infrastructure as Code, CI/CD et monitoring",
            "interviewDuration": 3000,
            "isActive": true
        }
    ]
}
```

### 🎯 Entretien 6 - Mobile iOS
```json
{
    "user": "1",
    "datas": [
        {
            "interviewTitle": "Entretien Mobile iOS",
            "interviewDesc": "Développement Swift, architecture iOS et publication App Store",
            "interviewDuration": 2400,
            "isActive": true
        }
    ]
}
```
        },
        {
            "interviewTitle": "Entretien Data Science",
            "interviewDesc": "Analyse de données, statistiques et machine learning",
            "interviewDuration": 4200,
            "isActive": true
        },
        {
            "interviewTitle": "Entretien DevOps Pratique",
            "interviewDesc": "Infrastructure cloud, Docker, Kubernetes et CI/CD",
            "interviewDuration": 3900,
            "isActive": true
        },
        {
            "interviewTitle": "Entretien Design UX/UI",
            "interviewDesc": "Portfolio review et exercice de conception d'interface",
            "interviewDuration": 2400,
            "isActive": true
        },
        {
            "interviewTitle": "Entretien Mobile iOS",
            "interviewDesc": "Développement iOS, Swift et architecture d'applications mobiles",
            "interviewDuration": 3300,
            "isActive": true
        },
        {
            "interviewTitle": "Entretien Direction Technique",
            "interviewDesc": "Vision technique, leadership et gestion d'équipe",
            "interviewDuration": 2700,
            "isActive": true
        },
        {
            "interviewTitle": "Entretien Sécurité Informatique",
            "interviewDesc": "Cybersécurité, audit de sécurité et tests de pénétration",
            "interviewDuration": 3600,
            "isActive": false
        },
        {
            "interviewTitle": "Entretien Stage Découverte",
            "interviewDesc": "Entretien pour stagiaires sans expérience professionnelle",
            "interviewDuration": 1500,
            "isActive": true
        }
    ]
}
```

---

## 🔍 Vérifier la création
**POST** `/interviews/getByCriteria`

```json
{
    "user": "1",
    "size": 20,
    "index": 0
}
```
