# Questions - Exemples d'occurrences multiples

**Endpoint:** `POST /questions/create`  
**Base URL:** `http://localhost:8081`

---

## 📥 Créer les questions (un par un)

### 🎯 Question 1 - Encapsulation Java
```json
{
    "user": "1",
    "datas": [
        {
            "questionContent": "Qu'est-ce que l'encapsulation en Java ?",
            "questionChrono": 120
        }
    ]
}
```

### 🎯 Question 2 - Interface vs Classe abstraite
```json
{
    "user": "1",
    "datas": [
        {
            "questionContent": "Quelle est la différence entre une interface et une classe abstraite en Java ?",
            "questionChrono": 180
        }
    ]
}
```

### 🎯 Question 3 - Garbage Collector
```json
{
    "user": "1",
    "datas": [
        {
            "questionContent": "Comment fonctionne le garbage collector en Java ?",
            "questionChrono": 200
        }
    ]
}
```

### 🎯 Question 4 - Spring Boot
```json
{
    "user": "1",
    "datas": [
        {
            "questionContent": "Qu'est-ce que Spring Boot et quels sont ses avantages ?",
            "questionChrono": 150
        }
    ]
}
```

### 🎯 Question 5 - Injection de dépendances
```json
{
    "user": "1",
    "datas": [
        {
            "questionContent": "Expliquez le principe de l'injection de dépendances",
            "questionChrono": 160
        }
    ]
}
```

### 🎯 Question 6 - REST vs SOAP
```json
{
    "user": "1",
    "datas": [
        {
            "questionContent": "Quelle est la différence entre REST et SOAP ?",
            "questionChrono": 140
        }
    ]
}
```

### 🎯 Question 7 - Optimisation SQL
```json
{
    "user": "1",
    "datas": [
        {
            "questionContent": "Comment optimiser une requête SQL lente ?",
            "questionChrono": 220
        }
    ]
}
```

### 🎯 Question 8 - Docker
```json
{
    "user": "1",
    "datas": [
        {
            "questionContent": "Qu'est-ce que Docker et pourquoi l'utiliser ?",
            "questionChrono": 180
        }
    ]
}
```

### 🎯 Question 9 - Pattern MVC
```json
{
    "user": "1",
    "datas": [
        {
            "questionContent": "Expliquez le pattern MVC",
            "questionChrono": 130
        }
    ]
}
```

### 🎯 Question 10 - Git merge vs rebase
```json
{
    "user": "1",
    "datas": [
        {
            "questionContent": "Quelle est la différence entre Git merge et Git rebase ?",
            "questionChrono": 170
        }
    ]
}
```

### 🎯 Question 11 - Sécurité API REST
```json
{
    "user": "1",
    "datas": [
        {
            "questionContent": "Comment gérez-vous la sécurité dans une API REST ?",
            "questionChrono": 200
        }
    ]
}
```

### 🎯 Question 12 - TDD
```json
{
    "user": "1",
    "datas": [
        {
            "questionContent": "Qu'est-ce que le TDD (Test Driven Development) ?",
            "questionChrono": 150
        }
    ]
}
```

---

## 🔍 Vérifier la création
**POST** `/questions/getByCriteria`

```json
{
    "user": "1",
    "size": 20,
    "index": 0
}
```
