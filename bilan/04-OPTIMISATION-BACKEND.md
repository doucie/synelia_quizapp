# Optimisation Backend

## Architecture

### ✅ Points positifs
- Spring Boot 3.5.6 + Java 21 (stack moderne)
- Structure en couches : Controller → Business → Repository
- MapStruct pour le mapping DTO ↔ Entity
- Lombok pour réduire le boilerplate
- SpringDoc OpenAPI pour la documentation API

### 🔴 Violations d'architecture

#### UserController accède directement au Repository
```java
// UserController.java - MAUVAIS
@Autowired
private UserRepository userRepository;  // Bypass la couche Business !
```
Les méthodes `updateOnlineStatus`, `setUsersOnline`, `debugRoles` appellent directement `userRepository` au lieu de passer par `UserBusiness`.

**Correction** : Déplacer toute la logique dans `UserBusiness` et supprimer l'injection du repository dans le controller.

---

## Performance

### 🔴 6 requêtes SQL pour les statistiques QEEL

`OnlineStatsBusiness.java` exécute 6 requêtes COUNT séparées :
```java
stats.setTotalUsers(userRepository.countTotalUsers());           // Query 1
stats.setOnlineUsers(userRepository.countOnlineUsers());          // Query 2
stats.setTotalAdmins(userRepository.countUsersByRole("admin"));   // Query 3
stats.setOnlineAdmins(userRepository.countOnlineUsersByRole("admin")); // Query 4
stats.setTotalRecruiters(userRepository.countUsersByRole("recruiter")); // Query 5
stats.setOnlineRecruiters(userRepository.countOnlineUsersByRole("recruiter")); // Query 6
```

Ces 6 requêtes sont exécutées **toutes les 10 secondes** via le WebSocket broadcast.

**Correction** : Une seule requête GROUP BY :
```sql
SELECT user_role, 
       COUNT(*) as total, 
       SUM(CASE WHEN is_online = true THEN 1 ELSE 0 END) as online
FROM users 
WHERE is_deleted = false 
GROUP BY user_role
```

### 🟠 Pas de pagination

Aucun endpoint n'utilise `Pageable`. Les endpoints `getAllByCriteria` retournent potentiellement des milliers d'enregistrements.

**Risque** : Temps de réponse dégradé et consommation mémoire excessive avec la croissance des données.

**Correction** : Ajouter `Pageable` aux endpoints de listing.

### 🟠 N+1 dans la suppression d'utilisateurs

`UserBusiness.java` exécute 5 requêtes séparées pour un seul delete :
```java
User existingUser = userRepository.findOne(dto.getId(), false);      // 1
List<Notifications> notifs = notificationsRepository.findByUserId(); // 2
List<Campaigns> campaigns = campaignsRepository.findByCreatorId();   // 3
List<InterviewCrud> interviews = interviewCrudRepository.findByUserId(); // 4
List<CampaignCrud> campCrud = campaignCrudRepository.findByUserId(); // 5
```

**Correction** : Configurer les cascades JPA ou utiliser des requêtes batch.

### 🟠 Save en boucle au lieu de saveAll

```java
// UserController.java - set-users-online
.forEach(user -> {
    userRepository.save(user);  // 3 requêtes INSERT/UPDATE séparées
});
```

**Correction** : `userRepository.saveAll(usersList);`

### 🟡 parallelStream() sur des opérations DB

```java
// CandidateAnswersBusiness.java
itemsDto.parallelStream().forEach(dto -> {
    dto = getFullInfos(dto, ...);  // Accès DB en parallèle !
});
```

**Risque** : Épuisement du pool de connexions HikariCP.

**Correction** : Utiliser un stream séquentiel pour les opérations DB.

---

## Qualité du code

### 🟡 SimpleDateFormat non thread-safe

```java
// UserBusiness.java
private SimpleDateFormat dateFormat;  // Partagé entre threads !
```

**Correction** : Utiliser `java.time.format.DateTimeFormatter` (thread-safe).

### 🟡 Rôles hardcodés

Les chaînes "admin", "recruiter", "super" sont dispersées partout dans le code.

**Correction** : Centraliser dans une enum `UserRole`.

### 🟡 Gestion d'erreur incohérente

Certains endpoints retournent `Response<Dto>`, d'autres retournent du JSON brut :
```java
// JSON brut
return ResponseEntity.ok("{\"status\":\"success\"}");

// vs DTO structuré
return ResponseEntity.ok(response);
```

**Correction** : Standardiser sur le pattern `Response<T>` existant.

### 🟡 Logging répétitif

Chaque méthode a le pattern :
```java
log.info("start method X");
// ...
log.info("end method X");
```

**Correction** : Utiliser un aspect AOP `@Around` pour logger automatiquement les entrées/sorties.

---

## Résumé des priorités

| # | Problème | Sévérité | Effort estimé |
|---|----------|----------|---------------|
| 1 | 6 COUNT → 1 requête GROUP BY | 🔴 Haute | 2h |
| 2 | Repository dans UserController | 🔴 Haute | 4h |
| 3 | Ajout pagination | 🟠 Moyenne | 8h |
| 4 | N+1 suppression utilisateur | 🟠 Moyenne | 3h |
| 5 | SimpleDateFormat → java.time | 🟡 Basse | 1h |
| 6 | Centralisation des rôles | 🟡 Basse | 1h |
| 7 | Standardisation erreurs | 🟡 Basse | 2h |
