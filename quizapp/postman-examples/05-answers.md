# Answers - Exemples d'occurrences multiples

**Endpoint:** `POST /answers/create`  
**Base URL:** `http://localhost:8081`

---

## 📥 Créer les réponses (un par un)

### 🎯 Réponse 1 - Encapsulation correcte
```json
{
    "user": "1",
    "datas": [
        {
            "answerContent": "L'encapsulation est un principe de la POO qui consiste à cacher les détails d'implémentation en rendant les attributs privés et en fournissant des méthodes publiques pour y accéder."
        }
    ]
}
```

### 🎯 Réponse 2 - Encapsulation protection
```json
{
    "user": "1",
    "datas": [
        {
            "answerContent": "L'encapsulation permet de protéger les données contre les accès non autorisés."
        }
    ]
}
```

### 🎯 Réponse 3 - Encapsulation incorrecte
```json
{
    "user": "1",
    "datas": [
        {
            "answerContent": "L'encapsulation est l'utilisation de packages en Java."
        }
    ]
}
```

### 🎯 Réponse 4 - Encapsulation fausse
```json
{
    "user": "1",
    "datas": [
        {
            "answerContent": "L'encapsulation concerne uniquement les méthodes statiques."
        }
    ]
}
```

### 🎯 Réponse 5 - Interface vs Classe abstraite
```json
{
    "user": "1",
    "datas": [
        {
            "answerContent": "Une interface ne peut contenir que des méthodes abstraites (avant Java 8) tandis qu'une classe abstraite peut contenir des méthodes concrètes et abstraites."
        }
    ]
}
```

### 🎯 Réponse 6 - Héritage multiple
```json
{
    "user": "1",
    "datas": [
        {
            "answerContent": "Une interface supporte l'héritage multiple, une classe abstraite non."
        }
    ]
}

```Json
{
    [
        {
            "answerContent": "Il n'y a pas de différence, ce sont des synonymes."
        },
        {
            "answerContent": "Une classe abstraite est plus rapide qu'une interface."
        },
        {
            "answerContent": "Le garbage collector libère automatiquement la mémoire des objets qui ne sont plus référencés."
        },
        {
            "answerContent": "Il faut appeler manuellement System.gc() pour déclencher le garbage collector."
        },
        {
            "answerContent": "Le garbage collector supprime les variables locales."
        },
        {
            "answerContent": "Le garbage collector ne fonctionne que pour les primitives."
        },
        {
            "answerContent": "Spring Boot simplifie la configuration et le déploiement d'applications Spring avec des conventions par défaut."
        },
        {
            "answerContent": "Spring Boot permet de créer des applications standalone avec un serveur embarqué."
        },
        {
            "answerContent": "Spring Boot est uniquement pour les applications web."
        },
        {
            "answerContent": "Spring Boot remplace complètement Spring Framework."
        },
        {
            "answerContent": "L'injection de dépendances permet de fournir les dépendances d'un objet plutôt que de les créer à l'intérieur de l'objet."
        },
        {
            "answerContent": "Cela favorise le couplage faible et facilite les tests unitaires."
        },
        {
            "answerContent": "L'injection de dépendances consiste à hériter d'une classe parente."
        },
        {
            "answerContent": "C'est la même chose que l'encapsulation."
        }
    ]
}
```

---

## 🔍 Vérifier la création
**POST** `/answers/getByCriteria`

```json
{
    "user": "1",
    "size": 30,
    "index": 0
}
```
