# Specialities - Exemples d'occurrences multiples

**Endpoint:** `POST /specialities/create`  
**Base URL:** `http://localhost:8081`

---

## 📥 Créer les spécialités (un par un)

### 🎯 Spécialité 1 - Java Development
```json
{
    "user": "1",
    "datas": [
        {
            "specialityName": "Java Development",
            "specialityDesc": "Développement d'applications Java, Spring Boot, microservices"
        }
    ]
}
```

### 🎯 Spécialité 2 - Frontend React
```json
{
    "user": "1",
    "datas": [
        {
            "specialityName": "Frontend React",
            "specialityDesc": "Développement d'interfaces utilisateur avec React, Redux, TypeScript"
        }
    ]
}
```

### 🎯 Spécialité 3 - Python Data Science
```json
{
    "user": "1",
    "datas": [
        {
            "specialityName": "Python Data Science",
            "specialityDesc": "Analyse de données, machine learning avec Python, pandas, scikit-learn"
        }
    ]
}
```

### 🎯 Spécialité 4 - DevOps
```json
{
    "user": "1",
    "datas": [
        {
            "specialityName": "DevOps",
            "specialityDesc": "Infrastructure cloud, Docker, Kubernetes, CI/CD"
        }
    ]
}
```

### 🎯 Spécialité 5 - Mobile iOS
```json
{
    "user": "1",
    "datas": [
        {
            "specialityName": "Mobile iOS",
            "specialityDesc": "Développement d'applications iOS avec Swift et SwiftUI"
        }
    ]
}
```

---

## 🔍 Vérifier la création
**POST** `/specialities/getByCriteria`

```json
{
    "user": "1",
    "size": 20,
    "index": 0
}
```
