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

### 🎯 Spécialité 6 - Android Development
```json
{
    "user": "1",
    "datas": [
        {
            "specialityName": "Android Development",
            "specialityDesc": "Développement d'applications Android avec Kotlin et Jetpack Compose"
        }
    ]
}
```

### 🎯 Spécialité 7 - Full Stack JavaScript
```json
{
    "user": "1",
    "datas": [
        {
            "specialityName": "Full Stack JavaScript",
            "specialityDesc": "Développement complet avec Node.js, Express, React/Vue.js"
        }
    ]
}
```

### 🎯 Spécialité 8 - Cloud Architecture
```json
{
    "user": "1",
    "datas": [
        {
            "specialityName": "Cloud Architecture",
            "specialityDesc": "Architecture cloud, AWS/Azure/GCP, serverless, microservices"
        }
    ]
}
```

### 🎯 Spécialité 9 - Cybersecurity
```json
{
    "user": "1",
    "datas": [
        {
            "specialityName": "Cybersecurity",
            "specialityDesc": "Sécurité informatique, pentesting, cryptographie, conformité"
        }
    ]
}
```

### 🎯 Spécialité 10 - Data Engineering
```json
{
    "user": "1",
    "datas": [
        {
            "specialityName": "Data Engineering",
            "specialityDesc": "Ingénierie des données, ETL, data warehousing, big data"
        }
    ]
}
```

---

## 🗑️ Suppression d'une spécialité (pour avoir un exemple supprimé)

### ❌ Supprimer la spécialité "Mobile iOS"
**POST** `/specialities/delete`

```json
{
    "user": "1",
    "id": 5
}
```

### 🔍 Vérifier la suppression
**POST** `/specialities/getByCriteria`

```json
{
    "user": "1",
    "size": 20,
    "index": 0,
    "isDeleted": true
}
```

---

## 🔄 Restauration d'une spécialité supprimée

### ✅ Restaurer la spécialité "Mobile iOS"
**POST** `/specialities/restore`

```json
{
    "user": "1",
    "id": 5
}
```

---

## 📊 Vérification finale - Toutes les spécialités

### 🔍 Lister toutes les spécialités (actives)
**POST** `/specialities/getByCriteria`

```json
{
    "user": "1",
    "size": 20,
    "index": 0,
    "isDeleted": false
}
```

### 🔍 Lister toutes les spécialités (y compris supprimées)
**POST** `/specialities/getByCriteria`

```json
{
    "user": "1",
    "size": 20,
    "index": 0
}
```

---

## 🎯 Spécialités disponibles pour tests

Après exécution des exemples ci-dessus, vous aurez :

### ✅ **Spécialités Actives (14)**
1. **Java Development** - Développement d'applications Java, Spring Boot, microservices *(Développement)*
2. **Frontend React** - Développement d'interfaces utilisateur avec React, Redux, TypeScript *(Développement)*
3. **Python Data Science** - Analyse de données, machine learning avec Python, pandas, scikit-learn *(Développement)*
4. **DevOps** - Infrastructure cloud, Docker, Kubernetes, CI/CD *(Développement)*
5. **Android Development** - Développement d'applications Android avec Kotlin et Jetpack Compose *(Développement)*
6. **Full Stack JavaScript** - Développement complet avec Node.js, Express, React/Vue.js *(Développement)*
7. **Cloud Architecture** - Architecture cloud, AWS/Azure/GCP, serverless, microservices *(Développement)*
8. **Database Administration** - Administration et optimisation des bases de données *(Développement)*
9. **Quality Assurance** - Tests logiciels, automatisation, assurance qualité *(Développement)*
10. **UI/UX Design** - Conception d'interfaces utilisateur et expérience utilisateur *(Gestion de Produit)*
11. **Technical Writing** - Rédaction technique, documentation, guides utilisateur *(Gestion de Produit)*
12. **Project Management** - Gestion de projets IT, méthodologies agiles, Scrum *(Gestion de Projet)*
13. **Cybersecurity** - Sécurité informatique, pentesting, cryptographie, conformité *(Sécurité)*
14. **Data Engineering** - Ingénierie des données, ETL, data warehousing, big data *(Développement)*

### 🗑️ **Spécialités Supprimées (1)**
15. **Mobile iOS** - Développement d'applications iOS avec Swift et SwiftUI *(Développement)*

---

## � Comment insérer les exemples

### Option 1: Migration automatique (recommandée)
La migration `V1_003__insert_specialities_examples.sql` sera exécutée automatiquement au prochain démarrage de l'application Spring Boot.

### Option 2: Script manuel
Exécutez le script `insert_specialities_examples.sql` dans votre base de données MySQL :

```bash
mysql -u votre_user -p quizapp_db < insert_specialities_examples.sql
```

---

## �🔧 Utilisation dans l'interface

Ces spécialités seront visibles dans l'interface Angular via :
- **Page Entités → Spécialités**
- Possibilité d'afficher/masquer les spécialités supprimées
- Fonctionnalités CRUD complètes (Créer, Lire, Modifier, Supprimer, Restaurer)

### 📊 Tests disponibles
- ✅ Pagination avec 15 spécialités au total (2 pages avec 10 par page)
- ✅ Recherche par nom et description sur 14 spécialités actives
- ✅ Filtrage des spécialités supprimées (1 spécialité masquée)
- ✅ Modification et suppression de spécialités actives
- ✅ Restauration de la spécialité supprimée (Mobile iOS)
- ✅ Création de nouvelles spécialités
