# Plan d'Action Priorisé

## Phase 1 — Sécurité (URGENT)
*Estimation : 1-2 jours*

### 1.1 Implémenter JWT côté backend
- [x] Ajouter la dépendance `jjwt` dans pom.xml
- [x] Créer `JwtService` : génération et validation de tokens signés
- [x] Modifier `/userManager/connexion` pour retourner un JWT dans la réponse
- [x] Créer un `JwtFilter` (OncePerRequestFilter) qui valide le JWT à chaque requête

### 1.2 Sécuriser les endpoints
- [x] Modifier `SecurityConfig.java` :
  - Endpoints publics : `/userManager/connexion`, `/api/qeel/**`, `/applications/create`, `/candidateToken/**`
  - Endpoints ADMIN : `/user/**`, `/departments/**`, `/specialities/**`
  - Endpoints RECRUITER : `/campaigns/**`, `/interviews/**`, `/evaluations/**`
- [x] Ajouter `@PreAuthorize` sur les endpoints sensibles

### 1.3 Corriger le CORS
- [x] Remplacer `*` par les origines autorisées dans `SecurityConfig.java`

### 1.4 Adapter le frontend
- [x] `auth.service.ts` : stocker le JWT reçu du backend au lieu de le générer
- [x] `api.interceptor.ts` : ajouter `Authorization: Bearer <token>` à chaque requête
- [x] Supprimer `generateToken()` du frontend

### 1.5 Nettoyer les endpoints de debug
- [x] Supprimer ou sécuriser `/user/set-users-online` (déplacé dans `UserDebugController` avec `@Profile("local")`)
- [x] Supprimer ou sécuriser `/user/roles-debug` (déplacé dans `UserDebugController` avec `@Profile("local")`)
- [x] Externaliser les credentials mail dans des variables d'environnement

---

## Phase 2 — Stabilité Frontend (Important)
*Estimation : 2-3 jours*

### 2.1 Corriger les fuites mémoire
- [x] Ajouter `private destroy$ = new Subject<void>()` + `takeUntil` dans les composants avec subscribe (entities-users, entities-departments)
- [x] Ajouter `ngOnDestroy()` avec `clearInterval()` pour tous les timers
- [x] Fichiers prioritaires : `evaluations.ts`, `applications.ts`, tous les `entities-*.ts`

### 2.2 Consolider les services online
- [x] Fusionner `online-stats.service.ts` et `qeel-websocket.service.ts` en un seul service
- [x] Garder `online-status.service.ts` pour le heartbeat utilisateur
- [x] Supprimer les fetch() hardcodés → utiliser HttpClient + environment.apiUrl

### 2.3 Fusionner les composants QEEL
- [x] Un seul `QeelModernComponent` conservé (les 4 variantes obsolètes supprimées)
- [x] Supprimé `qeel-compact-modern.component.ts` (fichier vide)
- [x] Supprimé `qeel-websocket.service.ts` (fusionné dans `OnlineStatsService`)

---

## Phase 3 — Performance Backend (Moyen terme)
*Estimation : 2-3 jours*

### 3.1 Optimiser les statistiques QEEL
- [x] Créer une seule requête `@Query` GROUP BY dans `UserRepository`
- [x] Remplacer les 6 COUNT séparés dans `OnlineStatsBusiness`
- [x] Ajouté cache Redis avec TTL 30s (`@Cacheable("qeelStats")` + `CacheConfig.java`)

### 3.2 Ajouter la pagination
- [x] Pagination déjà implémentée côté backend (`RequestBase.size`/`index` → `setFirstResult`/`setMaxResults`)
- [x] Frontend envoie déjà `size` et `index` dans les services (user, speciality, interview, evaluation, etc.)
- [x] `ResponseBase.count`/`totalCount` déjà retournés par tous les Business

### 3.3 Corriger les patterns N+1
- [x] `UserBusiness.delete()` : utiliser cascade JPA ou batch delete
- [x] `CandidateAnswersBusiness` : remplacer `parallelStream()` par stream séquentiel
- [x] `UserController.setUsersOnline` : déplacé dans `UserDebugController` (profile local)

### 3.4 Refactorer UserController
- [x] Supprimer `@Autowired UserRepository` du controller
- [x] Déplacer `updateOnlineStatus` dans `UserBusiness`
- [x] Le controller ne doit appeler que la couche Business

---

## Phase 4 — Qualité de code (Long terme)
*Estimation : 3-5 jours*

### 4.1 Backend
- [x] Remplacer `SimpleDateFormat` par `java.time.DateTimeFormatter`
- [x] Créer `enum UserRole { SUPER, ADMIN, RECRUITER, CANDIDATE }` et l'utiliser partout
- [x] Standardiser les réponses d'erreur (toujours `Response<T>`)
- [x] Ajouté `LoggingAspect.java` (AOP `@Around` sur tous les controllers, log durée + erreurs)

### 4.2 Frontend
- [x] Créer `EntityCrudBase<T,C,R>` générique (`shared/entity-crud-base.ts`) — classe abstraite avec pagination, recherche, CRUD complet
- [x] Refactorer `evaluations.ts` (273→50 lignes), `applications.ts` (446→115 lignes) et `interviews.ts` (343→108 lignes) via héritage EntityCrudBase
- [x] Utiliser `StorageService` partout au lieu de `localStorage` direct
- [x] Supprimer les `bypassSecurityTrustHtml()` → utiliser des composants SVG

### 4.3 Nettoyage général
- [x] Supprimer les fichiers identifiés dans `02-FICHIERS-SUPPRIMABLES.md`

---

## Résumé

| Phase | Priorité | Effort | Impact |
|-------|----------|--------|--------|
| 1. Sécurité | 🔴 URGENTE | 1-2 jours | Protège les données et empêche l'usurpation |
| 2. Stabilité frontend | 🟠 HAUTE | 2-3 jours | Élimine les fuites mémoire et la duplication |
| 3. Performance backend | 🟡 MOYENNE | 2-3 jours | Réduit la charge DB et les temps de réponse |
| 4. Qualité de code | 🟢 BASSE | 3-5 jours | Améliore la maintenabilité long terme |
| **Total** | | **8-13 jours** | |

---

## Post-correction : Score cible

| Critère | Actuel | Cible |
|---------|--------|-------|
| Sécurité | 🔴 2/10 | ✅ 8/10 |
| Architecture Backend | 🟠 5/10 | ✅ 8/10 |
| Performance Backend | 🟠 4/10 | ✅ 7/10 |
| Qualité Frontend | 🟡 5/10 | ✅ 8/10 |
| Séparation Front/Back | 🟠 4/10 | ✅ 8/10 |
| **Score Global** | **🟠 4.2/10** | **✅ 7.8/10** |
