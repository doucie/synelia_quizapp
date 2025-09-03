# Source Token - Exemples d'occurrences multiples

**Endpoint:** `POST /sourcetoken/create`  
**Base URL:** `http://localhost:8081`

---

## 📥 Créer les tokens de source (un par un)

### 🎯 Source Token 1 - LinkedIn
```json
{
    "user": "1",
    "datas": [
        {
            "tokenValue": "linkedin_2025_q3",
            "sourceName": "LinkedIn",
            "sourceDesc": "Candidatures provenant de LinkedIn pour le Q3 2025",
            "isActive": true
        }
    ]
}
```

### 🎯 Source Token 2 - Indeed
```json
{
    "user": "1",
    "datas": [
        {
            "tokenValue": "indeed_september",
            "sourceName": "Indeed",
            "sourceDesc": "Annonces Indeed pour septembre 2025",
            "isActive": true
        }
    ]
}
```

### 🎯 Source Token 3 - Site Web Direct
```json
{
    "user": "1",
    "datas": [
        {
            "tokenValue": "website_direct",
            "sourceName": "Site Web Direct",
            "sourceDesc": "Candidatures directes via le site web de l'entreprise",
            "isActive": true
        }
    ]
}
```

### 🎯 Source Token 4 - Pôle Emploi
```json
{
    "user": "1",
    "datas": [
        {
            "tokenValue": "pole_emploi_2025",
            "sourceName": "Pôle Emploi",
            "sourceDesc": "Candidatures via Pôle Emploi",
            "isActive": true
        }
    ]
}
```

### 🎯 Source Token 5 - Welcome to the Jungle
```json
{
    "user": "1",
    "datas": [
        {
            "tokenValue": "wttj_tech_jobs",
            "sourceName": "Welcome to the Jungle",
            "sourceDesc": "Offres tech sur Welcome to the Jungle",
            "isActive": true
        }
    ]
}
```

### 🎯 Source Token 6 - Cooptation
```json
{
    "user": "1",
    "datas": [
        {
            "tokenValue": "employee_referral",
            "sourceName": "Cooptation",
            "sourceDesc": "Candidatures par cooptation interne",
            "isActive": true
        }
    ]
}
```
        },
        {
            "tokenValue": "pole_emploi_ref",
            "sourceName": "Pôle Emploi",
            "sourceDesc": "Candidatures référées par Pôle Emploi",
            "isActive": true
        },
        {
            "tokenValue": "apec_premium",
            "sourceName": "APEC",
            "sourceDesc": "Candidatures APEC pour profils cadres",
            "isActive": true
        },
        {
            "tokenValue": "monster_tech",
            "sourceName": "Monster",
            "sourceDesc": "Profils techniques via Monster.fr",
            "isActive": false
        },
        {
            "tokenValue": "glassdoor_ref",
            "sourceName": "Glassdoor",
            "sourceDesc": "Candidatures via Glassdoor",
            "isActive": true
        },
        {
            "tokenValue": "cooptation_interne",
            "sourceName": "Cooptation",
            "sourceDesc": "Candidatures par cooptation d'employés",
            "isActive": true
        }
    ]
}
```

---

## 🔍 Vérifier la création
**POST** `/sourcetoken/getByCriteria`

```json
{
    "user": "1",
    "size": 20,
    "index": 0
}
```
