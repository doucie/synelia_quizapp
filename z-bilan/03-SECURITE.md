# Problèmes de Sécurité

## 🔴 CRITIQUE : Pas d'authentification réelle

### Le problème
`SecurityConfig.java` autorise TOUTES les requêtes sans authentification :
```java
.anyRequest().permitAll()  // Avec un commentaire TODO !
```

**Risque** : N'importe qui peut accéder à tous les endpoints (CRUD utilisateurs, campagnes, évaluations, etc.)

### Action requise
- Configurer Spring Security avec JWT
- Protéger les endpoints par rôle (`hasRole("ADMIN")`, `hasRole("RECRUITER")`)
- Ne laisser en accès libre que : `/userManager/connexion`, `/api/qeel/**`, endpoints publics de candidature

---

## 🔴 CRITIQUE : Tokens générés côté client (forgeable)

### Le problème
Le frontend génère les tokens d'authentification avec un simple `btoa(JSON.stringify(...))` :
```typescript
// auth.service.ts - N'IMPORTE QUI peut forger ce token
private generateToken(user: UserApiData): string {
  return btoa(JSON.stringify(payload));
}
```

Le rôle utilisateur est déterminé par le frontend :
```typescript
// Si pas de rôle → on regarde l'email pour deviner
if (!role) { role = email.includes('admin') ? 'super' : 'admin'; }
```

**Risque** : Un utilisateur peut ouvrir les DevTools, modifier `localStorage.user.role = "super"`, et obtenir un accès admin complet.

### Action requise
1. Le **backend** doit générer un JWT signé lors de la connexion
2. Le **frontend** ne fait que stocker et transmettre le token
3. Chaque requête API vérifie le JWT côté serveur
4. Les rôles sont déterminés **uniquement** par le backend

---

## 🔴 CRITIQUE : CORS trop permissif

### Le problème
```java
// SecurityConfig.java
configuration.setAllowedOriginPatterns(Arrays.asList("*"));
configuration.setAllowCredentials(true);
```

**Risque** : Tout site web externe peut faire des requêtes vers l'API avec les credentials de l'utilisateur.

### Action requise
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:4200",    // développement
    "https://app.synelia.com"   // production
));
```

---

## 🟠 ÉLEVÉ : Endpoints de debug exposés en production

### Endpoints concernés
- `PUT /user/set-users-online` → met 3 utilisateurs en ligne pour test (charge TOUS les users)
- `GET /user/roles-debug` → affiche tous les rôles de tous les utilisateurs

### Action requise
- Supprimer ces endpoints ou les protéger avec `@PreAuthorize("hasRole('SUPER')")`
- Au minimum, les conditionner avec `@Profile("local")` pour qu'ils n'existent qu'en développement

---

## 🟠 ÉLEVÉ : Vulnérabilités XSS côté frontend

### Fichiers concernés
- `icon.component.ts` → utilise `[innerHTML]` pour afficher des SVG
- `dashboard.ts` → utilise `bypassSecurityTrustHtml()` pour les icônes
- `applications.ts` → `bypassSecurityTrustHtml()`

### Action requise
- Remplacer `innerHTML` par des composants SVG Angular dédiés
- Ne jamais utiliser `bypassSecurityTrustHtml()` avec des données venant du backend

---

## 🟡 MOYEN : Credentials email en clair dans les properties

### Le problème
```properties
# application-local.properties
spring.mail.password=zkatprvvujkwynxf
smtp.mail.password=zkatprvvujkwynxf
```

### Action requise
- Utiliser des variables d'environnement : `${SMTP_PASSWORD}`
- Ou Spring Vault / fichier .env exclu du git
