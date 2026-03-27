# Modifications effectuées (24 Mars 2026)

## 1. Changement de port backend : 8081 → 8085

### Fichiers modifiés

**Backend :**
- `quizapp/src/main/resources/application-local.properties` → `server.port=8085`
- `quizapp/src/main/resources/filtered/application-local.properties` → `server.port=8085`

**Frontend :**
- `quizapp_front/src/environments/environment.ts` → `apiUrl: 'http://localhost:8085'`
- `quizapp_front/src/environments/environment.prod.ts` → `apiUrl: 'http://localhost:8085'`
- `quizapp_front/proxy.conf.json` → toutes les entrées mises à jour vers `localhost:8085`
- `quizapp_front/src/app/services/qeel-websocket.service.ts` → URLs fetch et WebSocket
- `quizapp_front/src/app/core/services/online-status.service.ts` → URLs sendBeacon
- `quizapp_front/src/app/core/interceptors/api.interceptor.ts` → messages d'erreur
- `quizapp_front/src/test-api.html` → URL de test

---

## 2. Suppression des logs QEEL (utilisateurs en ligne)

### Problème
Les endpoints `/user/online-stats`, `/user/online-count`, `/user/{id}/online-status` et `/api/qeel/stats` sont appelés par polling toutes les 5-10 secondes. Les logs `INFO` de ces appels polluaient massivement le terminal.

### Solution appliquée

**Approche 1 - Configuration logging (application-local.properties) :**
```properties
# Suppression des logs QEEL/online-stats (polling trop fréquent)
logging.level.tech.synelia.quizapp.rest.api.QeelController=WARN
logging.level.tech.synelia.quizapp.websocket.QeelWebSocketHandler=WARN
logging.level.tech.synelia.quizapp.business.OnlineStatsBusiness=WARN
```

**Approche 2 - Code source (UserController.java + QeelController.java) :**
- Tous les `slf4jLogger.info(...)` des méthodes `updateOnlineStatus`, `getOnlineStats`, `getOnlineUsersCount` ont été changés en `slf4jLogger.debug(...)`
- Les logs d'erreur (`error`) sont conservés pour le diagnostic en cas de problème

### Résultat
- En fonctionnement normal : **aucun log** pour ces endpoints
- En cas d'erreur : les logs `WARN`/`ERROR` apparaîtront toujours
- Pour débugger : passer temporairement le niveau à `DEBUG` dans les properties
