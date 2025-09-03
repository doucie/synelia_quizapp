# README - Guide d'exécution des exemples Postman

## 🎯 Ordre d'exécution recommandé

Pour éviter les erreurs de clés étrangères, exécutez les fichiers dans cet ordre :

### 📋 **Phase 1 - Données de base (aucune dépendance)**
1. [`01-users.md`](01-users.md) - Créer les utilisateurs
2. [`02-departments.md`](02-departments.md) - Créer les départements  
3. [`03-specialities.md`](03-specialities.md) - Créer les spécialités
4. [`04-questions.md`](04-questions.md) - Créer les questions
5. [`05-answers.md`](05-answers.md) - Créer les réponses

### 📋 **Phase 2 - Associations et structures**
6. [`06-questions-answers.md`](06-questions-answers.md) - Associer questions et réponses
7. [`07-campaigns.md`](07-campaigns.md) - Créer les campagnes (dépend de departments et specialities)
8. [`08-source-token.md`](08-source-token.md) - Créer les tokens de source
9. [`10-interviews.md`](10-interviews.md) - Créer les entretiens

### 📋 **Phase 3 - Candidatures et évaluations**
10. [`09-applications.md`](09-applications.md) - Créer les candidatures (dépend de source-token)
11. [`11-evaluations.md`](11-evaluations.md) - Créer les évaluations (dépend de applications et users)
12. [`12-notifications.md`](12-notifications.md) - Créer les notifications (dépend de users)

---

## ⚙️ Configuration Postman

### 🌐 Variables d'environnement
Créez un environnement Postman avec :
```
base_url = http://localhost:8081
user_id = 1
```

### 📬 Headers globaux
Ajoutez à toutes les requêtes :
```
Content-Type: application/json
Accept: application/json
```

---

## 🚨 Points importants

### ✅ **Format des données**
- Dates : Format ISO `"2025-08-22T14:30:00"`
- Booléens : `true`, `false`, ou `null` (jamais de chaînes vides)
- Champs optionnels : Utilisez `null` au lieu de `""`

### 🔗 **Dépendances**
- Les IDs référencés doivent exister avant l'insertion
- Consultez les prérequis de chaque fichier
- Vérifiez la création avec les requêtes `getByCriteria`

### 📊 **Validation**
Après chaque création, exécutez la requête de vérification fournie pour confirmer l'insertion.

---

## 🛠️ Dépannage

### 🔴 **Erreur 500 - Date parsing**
```
Solution: Remplacez les chaînes vides par null pour les dates
❌ "lastConnectionDate": ""
✅ "lastConnectionDate": null
```

### 🔴 **Erreur clé étrangère**
```
Solution: Vérifiez que l'ID référencé existe
- Consultez la table parente avec getByCriteria
- Ajustez les IDs dans votre JSON
```

### 🔴 **Port 8080 occupé**
```
Solution: L'application tourne sur le port 8081
✅ Base URL: http://localhost:8081
```

---

## 📈 Statistiques des données de test

| Table | Occurrences | Description |
|-------|-------------|-------------|
| Users | 5 | Différents rôles (admin, manager, recruiter, hr, interviewer) |
| Departments | 8 | Départements complets d'entreprise |
| Specialities | 10 | Spécialités techniques diverses |
| Questions | 12 | Questions techniques variées |
| Answers | 20 | Réponses correctes et incorrectes |
| Questions-Answers | 20 | Associations avec bonnes réponses |
| Campaigns | 8 | Campagnes actives et inactives |
| Source Tokens | 8 | Sources de recrutement variées |
| Applications | 8 | Candidatures avec statuts différents |
| Interviews | 10 | Types d'entretiens variés |
| Evaluations | 10 | Évaluations avec commentaires |
| Notifications | 12 | Notifications de tous types |

**Total : ~135 enregistrements de test** 🎯

---

## 🌟 Conseils d'utilisation

1. **Sauvegardez vos collections** Postman avant les tests
2. **Testez sur une base de données de développement** uniquement
3. **Documentez vos modifications** pour l'équipe
4. **Vérifiez les logs** de l'application en cas d'erreur
5. **Utilisez les variables** Postman pour les IDs récurrents

---

Bon test ! 🚀
