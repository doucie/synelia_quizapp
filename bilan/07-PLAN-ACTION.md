# Plan d'Action Priorisé

## Phase 1 — Sécurité (URGENT)
*Estimation : 1-2 jours*

### 1.1 Implémenter JWT côté backend
- [ ] Ajouter la dépendance `jjwt` dans pom.xml
- [ ] Créer `JwtService` : génération et validation de tokens signés
- [ ] Modifier `/userManager/connexion` pour retourner un JWT dans la réponse
- [ ] Créer un `JwtFilter` (OncePerRequestFilter) qui valide le JWT à chaque requête

### 1.2 Sécuriser les endpoints
- [ ] Modifier `SecurityConfig.java` :
  - Endpoints publics : `/userManager/connexion`, `/api/qeel/**`, `/applications/create`, `/candidateToken/**`
  - Endpoints ADMIN : `/user/**`, `/departments/**`, `/specialities/**`
  - Endpoints RECRUITER : `/campaigns/**`, `/interviews/**`, `/evaluations/**`
- [ ] Ajouter `@PreAuthorize` sur les endpoints sensibles

### 1.3 Corriger le CORS
- [ ] Remplacer `*` par les origines autorisées dans `SecurityConfig.java`

### 1.4 Adapter le frontend
- [ ] `auth.service.ts` : stocker le JWT reçu du backend au lieu de le générer
- [ ] `api.interceptor.ts` : ajouter `Authorization: Bearer <token>` à chaque requête
- [ ] Supprimer `generateToken()` du frontend

### 1.5 Nettoyer les endpoints de debug
- [ ] Supprimer ou sécuriser `/user/set-users-online`
- [ ] Supprimer ou sécuriser `/user/roles-debug`
- [ ] Externaliser les credentials mail dans des variables d'environnement

---

## Phase 2 — Stabilité Frontend (Important)
*Estimation : 2-3 jours*

### 2.1 Corriger les fuites mémoire
- [ ] Ajouter `private destroy$ = new Subject<void>()` + `takeUntil` dans tous les composants avec subscribe
- [ ] Ajouter `ngOnDestroy()` avec `clearInterval()` pour tous les timers
- [ ] Fichiers prioritaires : `evaluations.ts`, `applications.ts`, tous les `entities-*.ts`

### 2.2 Consolider les services online
- [ ] Fusionner `online-stats.service.ts` et `qeel-websocket.service.ts` en un seul service
- [ ] Garder `online-status.service.ts` pour le heartbeat utilisateur
- [ ] Supprimer les fetch() hardcodés → utiliser HttpClient + environment.apiUrl

### 2.3 Fusionner les composants QEEL
- [ ] Créer un seul `QeelComponent` avec `@Input() variant`
- [ ] Supprimer les 4 autres variantes
- [ ] Mettre à jour les imports dans les pages

---

## Phase 3 — Performance Backend (Moyen terme)
*Estimation : 2-3 jours*

### 3.1 Optimiser les statistiques QEEL
- [ ] Créer une seule requête `@Query` GROUP BY dans `UserRepository`
- [ ] Remplacer les 6 COUNT séparés dans `OnlineStatsBusiness`
- [ ] Ajouter un cache Redis avec TTL 10s (le broadcast est toutes les 10s)

### 3.2 Ajouter la pagination
- [ ] Modifier les contrôleurs `getAllByCriteria` pour accepter `Pageable`
- [ ] Adapter le frontend pour envoyer `page` et `size` en paramètres
- [ ] Commencer par les entités les plus volumineuses : Users, Questions, Applications

### 3.3 Corriger les patterns N+1
- [ ] `UserBusiness.delete()` : utiliser cascade JPA ou batch delete
- [ ] `CandidateAnswersBusiness` : remplacer `parallelStream()` par stream séquentiel
- [ ] `UserController.setUsersOnline` : utiliser `saveAll()` au lieu de save en boucle

### 3.4 Refactorer UserController
- [ ] Supprimer `@Autowired UserRepository` du controller
- [ ] Déplacer `updateOnlineStatus`, `getOnlineStats`, `getOnlineUsersCount` dans `UserBusiness`
- [ ] Le controller ne doit appeler que la couche Business

---

## Phase 4 — Qualité de code (Long terme)
*Estimation : 3-5 jours*

### 4.1 Backend
- [ ] Remplacer `SimpleDateFormat` par `java.time.DateTimeFormatter`
- [ ] Créer `enum UserRole { SUPER, ADMIN, RECRUITER, CANDIDATE }` et l'utiliser partout
- [ ] Standardiser les réponses d'erreur (toujours `Response<T>`)
- [ ] Ajouter un aspect AOP pour le logging automatique

### 4.2 Frontend
- [ ] Créer `EntityCrudComponent<T>` générique pour les 9 entités
- [ ] Refactorer `evaluations.ts` et `applications.ts` (trop volumineux)
- [ ] Utiliser `StorageService` partout au lieu de `localStorage` direct
- [ ] Supprimer les `bypassSecurityTrustHtml()` → utiliser des composants SVG

### 4.3 Nettoyage général
- [ ] Supprimer les fichiers identifiés dans `02-FICHIERS-SUPPRIMABLES.md`
- [ ] Supprimer les `.spec.ts` vides
- [ ] Supprimer `test-api.html`

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
