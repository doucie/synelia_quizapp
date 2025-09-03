# Campaigns - Exemples d'occurrences multiples

**Endpoint:** `POST /campaigns/create`  
**Base URL:** `http://localhost:8081`

---

## 📥 Créer les campagnes (un par un)

> **Prérequis:** Avoir créé des départements et spécialités avant d'exécuter ces requêtes

### 🎯 Campagne 1 - Développeur Java Senior
```json
{
    "user": "1",
    "datas": [
        {
            "campaignName": "Recrutement Développeur Java Senior",
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

### 🎯 Campagne 2 - Stage Frontend React
```json
{
    "user": "1",
    "datas": [
        {
            "campaignName": "Stage Développeur Frontend React",
            "campaignDesc": "Recherche de stagiaires en développement frontend pour 6 mois",
            "campaignStart": "2025-08-25T08:00:00",
            "campaignEnd": "2025-09-30T18:00:00",
            "campaignDuration": 2400,
            "isActive": true,
            "departmentsId": 1,
            "specialitiesId": 2
        }
    ]
}
```

### 🎯 Campagne 3 - Data Scientist
```json
{
    "user": "1",
    "datas": [
        {
            "campaignName": "Recrutement Data Scientist",
            "campaignDesc": "Poste de data scientist pour projets d'IA et machine learning",
            "campaignStart": "2025-09-10T10:00:00",
            "campaignEnd": "2025-11-01T16:00:00",
            "campaignDuration": 4200,
            "isActive": true,
            "departmentsId": 2,
            "specialitiesId": 3
        }
    ]
}
```

### 🎯 Campagne 4 - Ingénieur DevOps
```json
{
    "user": "1",
    "datas": [
        {
            "campaignName": "Ingénieur DevOps Cloud",
            "campaignDesc": "Spécialiste infrastructure cloud et automatisation CI/CD",
            "campaignStart": "2025-08-20T08:30:00",
            "campaignEnd": "2025-10-10T17:30:00",
            "campaignDuration": 3000,
            "isActive": true,
            "departmentsId": 1,
            "specialitiesId": 4
        }
    ]
}
```

### 🎯 Campagne 5 - Développeur iOS
```json
{
    "user": "1",
    "datas": [
        {
            "campaignName": "Développeur iOS Swift",
            "campaignDesc": "Développement d'applications mobiles iOS natives",
            "campaignStart": "2025-09-15T09:30:00",
            "campaignEnd": "2025-11-15T18:00:00",
            "campaignDuration": 3300,
            "isActive": true,
            "departmentsId": 3,
            "specialitiesId": 5
        }
    ]
}
```
            "campaignDuration": 2700,
            "isActive": true,
            "departmentsId": 1,
            "specialitiesId": 2
        },
        {
            "campaignName": "Data Scientist Junior",
            "campaignDesc": "Poste de data scientist pour analyse de données et machine learning",
            "campaignStart": "2025-09-15T10:00:00",
            "campaignEnd": "2025-11-01T16:00:00",
            "campaignDuration": 4200,
            "isActive": true,
            "departmentsId": 6,
            "specialitiesId": 3
        },
        {
            "campaignName": "Ingénieur DevOps",
            "campaignDesc": "Recherche d'un ingénieur DevOps pour infrastructure cloud",
            "campaignStart": "2025-10-01T09:30:00",
            "campaignEnd": "2025-11-15T17:30:00",
            "campaignDuration": 3900,
            "isActive": true,
            "departmentsId": 1,
            "specialitiesId": 4
        },
        {
            "campaignName": "Développeur Mobile iOS",
            "campaignDesc": "Développement d'applications mobiles iOS en Swift",
            "campaignStart": "2025-09-10T08:30:00",
            "campaignEnd": "2025-10-25T17:00:00",
            "campaignDuration": 3300,
            "isActive": true,
            "departmentsId": 1,
            "specialitiesId": 5
        },
        {
            "campaignName": "Administrateur Base de Données",
            "campaignDesc": "Administration et optimisation de bases de données MySQL/PostgreSQL",
            "campaignStart": "2025-11-01T09:00:00",
            "campaignEnd": "2025-12-15T16:00:00",
            "campaignDuration": 3000,
            "isActive": false,
            "departmentsId": 1,
            "specialitiesId": 7
        },
        {
            "campaignName": "Designer UX/UI",
            "campaignDesc": "Conception d'interfaces utilisateur et expérience utilisateur",
            "campaignStart": "2025-09-05T10:00:00",
            "campaignEnd": "2025-10-20T18:00:00",
            "campaignDuration": 2400,
            "isActive": true,
            "departmentsId": 3,
            "specialitiesId": 9
        },
        {
            "campaignName": "Chef de Projet Technique",
            "campaignDesc": "Gestion de projets IT et coordination d'équipes techniques",
            "campaignStart": "2025-10-15T09:00:00",
            "campaignEnd": "2025-12-01T17:00:00",
            "campaignDuration": 3600,
            "isActive": true,
            "departmentsId": 1,
            "specialitiesId": 10
        }
    ]
}
```

---

## 🔍 Vérifier la création
**POST** `/campaigns/getByCriteria`

```json
{
    "user": "1",
    "size": 20,
    "index": 0
}
```
