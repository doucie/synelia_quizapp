# User - Exemples d'occurrences multiples

**Endpoint:** `POST /user/create`  
**Base URL:** `http://localhost:8081`

---

## 📥 Créer le premier utilisateur (Bootstrap)

> **Important:** Créez d'abord cet utilisateur pour pouvoir utiliser `"user": "1"` dans les autres requêtes.

```json
{
    "user": "0",
    "datas": [
        {
            "firstName": "Admin",
            "lastName": "System",
            "username": "admin",
            "email": "admin@system.com",
            "phone": "+33100000000",
            "password": "admin123",
            "userRole": "admin",
            "isOnline": null,
            "isLocked": false,
            "isDefaultPassword": true,
            "lastConnectionDate": null
        }
    ]
}
```

## 📥 Créer les utilisateurs (un par un)

### 👤 Utilisateur 2 - Jean (Admin)
```json
{
    "user": "1",
    "datas": [
        {
            "firstName": "Jean",
            "lastName": "Dupont",
            "username": "jdupont",
            "email": "jean.dupont@example.com",
            "phone": "+33123456789",
            "password": "motdepasse123",
            "userRole": "admin",
            "isOnline": null,
            "isLocked": false,
            "isDefaultPassword": true,
            "lastConnectionDate": null
        }
    ]
}
```

### 👤 Utilisateur 3 - Marie (Manager)
```json
{
    "user": "1",
    "datas": [
        {
            "firstName": "Marie",
            "lastName": "Martin",
            "username": "mmartin",
            "email": "marie.martin@example.com",
            "phone": "+33987654321",
            "password": "password456",
            "userRole": "manager",
            "isOnline": false,
            "isLocked": false,
            "isDefaultPassword": false,
            "lastConnectionDate": null
        }
    ]
}
```

### 👤 Utilisateur 4 - Pierre (Recruiter)
```json
{
    "user": "1",
    "datas": [
        {
            "firstName": "Pierre",
            "lastName": "Durand",
            "username": "pdurand",
            "email": "pierre.durand@example.com",
            "phone": "+33555123456",
            "password": "secure789",
            "userRole": "recruiter",
            "isOnline": null,
            "isLocked": false,
            "isDefaultPassword": true,
            "lastConnectionDate": null
        }
    ]
}
```

### 👤 Utilisateur 5 - Sophie (RH)
```json
{
    "user": "1",
    "datas": [
        {
            "firstName": "Sophie",
            "lastName": "Moreau",
            "username": "smoreau",
            "email": "sophie.moreau@example.com",
            "phone": "+33444987654",
            "password": "mypassword",
            "userRole": null,
            "isOnline": false,
            "isLocked": false,
            "isDefaultPassword": false,
            "lastConnectionDate": null
        }
    ]
}
```

### 👤 Utilisateur 6 - Lucas (Interviewer)
```json
{
    "user": "1",
    "datas": [
        {
            "firstName": "Lucas",
            "lastName": "Petit",
            "username": "lpetit",
            "email": "lucas.petit@example.com",
            "phone": "+33333555777",
            "password": "password2025",
            "userRole": "interviewer",
            "isOnline": null,
            "isLocked": false,
            "isDefaultPassword": true,
            "lastConnectionDate": null
        }
    ]
}
```

---

## 🔍 Vérifier la création
**POST** `/user/getByCriteria`

```json
{
    "user": "1",
    "size": 10,
    "index": 0
}
```
