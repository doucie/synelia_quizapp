# Departments - Exemples d'occurrences multiples

**Endpoint:** `POST /departments/create`  
**Base URL:** `http://localhost:8081`

---

## 📥 Créer les départements (un par un)

### 🏢 Département 1 - Informatique
```json
{
    "user": "1",
    "datas": [
        {
            "departmentName": "Informatique",
            "departmentDesc": "Département de développement logiciel et infrastructure IT"
        }
    ]
}
```

### 🏢 Département 2 - Ressources Humaines
```json
{
    "user": "1",
    "datas": [
        {
            "departmentName": "Ressources Humaines",
            "departmentDesc": "Gestion du personnel, recrutement et formation"
        }
    ]
}
```

### 🏢 Département 3 - Marketing
```json
{
    "user": "1",
    "datas": [
        {
            "departmentName": "Marketing",
            "departmentDesc": "Promotion des produits et communication digitale"
        }
    ]
}
```

### 🏢 Département 4 - Finance
```json
{
    "user": "1",
    "datas": [
        {
            "departmentName": "Finance",
            "departmentDesc": "Gestion financière, comptabilité et contrôle de gestion"
        }
    ]
}
```

### 🏢 Département 5 - Commercial
```json
{
    "user": "1",
    "datas": [
        {
            "departmentName": "Commercial",
            "departmentDesc": "Ventes, relation client et développement business"
        }
    ]
}
```

### 🏢 Département 6 - R&D
```json
{
    "user": "1",
    "datas": [
        {
            "departmentName": "R&D",
            "departmentDesc": "Recherche et développement, innovation produit"
        }
    ]
}
```

---

## 🔍 Vérifier la création
**POST** `/departments/getByCriteria`

```json
{
    "user": "1",
    "size": 20,
    "index": 0
}
```
