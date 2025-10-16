# 🐛 Debug - Recherche de Recruteurs

## ✅ Modifications appliquées

### Ajout de logs détaillés dans `campaign-form.ts`

```typescript
setupSearch(): void {
  this.recruiterSearchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => {
      console.log('🔍 Recherche déclenchée avec:', query);
      
      const criteria = {
        search_string: query,
        isDeleted: false,  // ✅ NE PAS CHERCHER LES UTILISATEURS SUPPRIMÉS
        size: 20,
        page: 0
      };
      
      console.log('📤 Envoi critères:', criteria);
      return this.userService.getAllUsersByCriteria(criteria);
    })
  ).subscribe({
    next: (response) => {
      console.log('📥 Réponse reçue:', response);
      console.log(`✅ ${response.content.length} utilisateurs trouvés`);
      // Filtrage par rôle + exclusion déjà sélectionnés
    }
  });
}
```

## 🧪 Comment tester

### 1. Ouvrir la console du navigateur
Appuyer sur **F12** pour ouvrir les DevTools Chrome/Edge

### 2. Démarrer l'application
```bash
cd quizapp_front
npm start
```

### 3. Naviguer vers le formulaire
```
http://localhost:4200/dashboard/campaigns/new
```

### 4. Taper dans le champ de recherche
Par exemple : **"john"**, **"admin"**, **"rec"**

### 5. Observer les logs dans la console

#### Logs attendus:
```
🔍 Recherche déclenchée avec: john
📤 Envoi critères de recherche: {search_string: "john", isDeleted: false, size: 20, page: 0}
🚀 Envoi de la requête getAllUsersByCriteria (including deleted): {...}
📥 Réponse reçue: {content: Array(5), totalElements: 5, ...}
✅ 5 utilisateurs trouvés
🎯 3 recruteurs/admins après filtrage par rôle
👥 3 utilisateurs après exclusion des déjà sélectionnés
```

## 🔍 Diagnostic des problèmes

### Problème 1: Aucun utilisateur trouvé (0 résultats)
**Symptôme**: `✅ 0 utilisateurs trouvés`

**Causes possibles**:
1. ❌ Backend ne trouve rien avec `searchString`
2. ❌ Table `users` vide ou pas de correspondance
3. ❌ Paramètre `search_string` mal envoyé

**Solution**:
- Vérifier que le backend reçoit bien `searchString` dans la requête
- Vérifier que la colonne `search_string` existe dans la table `users`
- Vérifier que `search_string` est bien indexée pour recherche LIKE

### Problème 2: Utilisateurs trouvés mais 0 après filtrage
**Symptôme**: `✅ 5 utilisateurs trouvés` puis `🎯 0 recruteurs/admins après filtrage`

**Cause**: Les utilisateurs trouvés n'ont pas les bons rôles

**Solution**:
- Vérifier les valeurs dans la colonne `user_role` de la table `users`
- Les valeurs doivent être exactement: `RECRUITER`, `ADMIN` ou `SUPER_ADMIN`
- Pas de minuscules, pas d'espaces

### Problème 3: Backend renvoie erreur
**Symptôme**: `❌ Erreur recherche utilisateurs: ...`

**Causes possibles**:
1. ❌ API `/users/getByCriteria` non accessible
2. ❌ Erreur 401 (non authentifié)
3. ❌ Erreur 500 (erreur serveur)

**Solution**:
- Vérifier que le backend est démarré
- Vérifier l'authentification (token JWT valide)
- Consulter les logs du backend Spring Boot

## 🔧 Vérifications Backend

### 1. Vérifier la requête reçue
Dans `UserBusiness.java` ou `UserRepository.java`, ajouter:
```java
log.info("🔍 Recherche utilisateurs avec searchString: " + dto.getSearchString());
```

### 2. Vérifier la requête SQL générée
Activer les logs SQL dans `application.properties`:
```properties
spring.jpa.show-sql=true
logging.level.org.hibernate.SQL=DEBUG
```

### 3. Tester manuellement la recherche SQL
```sql
SELECT * FROM users 
WHERE search_string LIKE '%john%' 
  AND is_deleted = false 
  AND user_role IN ('RECRUITER', 'ADMIN', 'SUPER_ADMIN');
```

## 📊 Données de test

### Créer des utilisateurs de test
```sql
INSERT INTO users (first_name, last_name, email, username, user_role, is_deleted, search_string)
VALUES 
  ('John', 'Doe', 'john.doe@test.com', 'johndoe', 'RECRUITER', false, 'john doe johndoe recruiter'),
  ('Jane', 'Admin', 'jane.admin@test.com', 'janeadmin', 'ADMIN', false, 'jane admin janeadmin'),
  ('Bob', 'Super', 'bob.super@test.com', 'bobsuper', 'SUPER_ADMIN', false, 'bob super bobsuper admin');
```

## ✅ Checklist de diagnostic

- [ ] Les logs s'affichent dans la console navigateur
- [ ] Le debounce fonctionne (attente 300ms)
- [ ] Le spinner apparaît pendant la recherche
- [ ] La requête HTTP part vers le backend (onglet Network)
- [ ] Le backend répond avec statut 200
- [ ] La réponse contient `content: Array(X)`
- [ ] Les utilisateurs ont les bons rôles
- [ ] Le dropdown s'affiche si résultats > 0
- [ ] Le message "Aucun recruteur trouvé" s'affiche si résultats = 0

## 🎯 Prochaines étapes

Une fois que les logs montrent le problème:

1. **Si backend ne trouve rien**:
   - Vérifier que `search_string` est bien remplie dans la table
   - Vérifier que la requête LIKE fonctionne
   - Ajouter des logs dans `UserRepository.java`

2. **Si frontend filtre tout**:
   - Vérifier les valeurs `user_role` dans la base
   - Ajuster le filtre si nécessaire (ex: gérer les minuscules)

3. **Si tout fonctionne**:
   - Retirer les logs `console.log` excessifs
   - Garder uniquement les logs d'erreur

---

**Date**: 14 octobre 2025  
**Status**: 🔍 En diagnostic avec logs détaillés
