# Fix : Accès à la page Utilisateurs pour les Recruteurs

## 🐛 Problème identifié

Les recruteurs ne pouvaient pas accéder à la page `/dashboard/users` malgré que le menu leur soit visible. L'erreur "Accès refusé" apparaissait car la route était protégée par `superRoleGuard` qui n'autorise que les super administrateurs.

## 🔍 Analyse

### Route concernée
```typescript
// app.routes.ts - Ligne ~100
{ 
  path: 'users', 
  loadComponent: () => import('./pages/dashboard/users/users').then(m => m.UsersComponent),
  canActivate: [superRoleGuard]  // ❌ N'autorise que 'super'
}
```

### Menu configuré
```typescript
// dashboard.ts - Ligne ~82
{
  id: 'users',
  label: 'Utilisateurs',
  icon: '...',
  route: '/dashboard/users',
  roles: ['admin', 'recruiter']  // ✅ Visible pour admin et recruiter
}
```

### Le conflit
- **Menu** : Visible pour `admin` et `recruiter`
- **Route** : Accessible uniquement pour `super`
- **Résultat** : Clic → Accès refusé

## ✅ Solution implémentée

### 1. Création d'un nouveau guard : `recruiterRoleGuard`

**Fichier** : `core/guards/role.guard.ts`

```typescript
/**
 * Guard spécifique pour les rôles recruiter, admin et super
 * Raccourci pour les routes accessibles aux recruteurs et administrateurs
 */
export const recruiterRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  console.log('🛡️ RecruiterRoleGuard - Vérification des rôles recruiter/admin/super');

  if (!isAuthenticated || !user) {
    console.log('❌ RecruiterRoleGuard - Utilisateur non connecté');
    router.navigate(['/connexion']);
    return false;
  }

  if (user.role === 'super' || user.role === 'admin' || user.role === 'recruiter') {
    console.log('✅ RecruiterRoleGuard - Accès autorisé pour le rôle:', user.role);
    return true;
  } else {
    console.log('❌ RecruiterRoleGuard - Accès refusé, rôle:', user.role);
    router.navigate(['/dashboard'], { 
      queryParams: { 
        error: 'access_denied',
        message: 'Accès réservé aux recruteurs et administrateurs.'
      } 
    });
    return false;
  }
};
```

### 2. Import du nouveau guard

**Fichier** : `app.routes.ts`

```typescript
import { superRoleGuard, recruiterRoleGuard } from './core/guards/role.guard';
```

### 3. Mise à jour de la route

**Fichier** : `app.routes.ts`

```typescript
{ 
  path: 'users', 
  loadComponent: () => import('./pages/dashboard/users/users').then(m => m.UsersComponent),
  canActivate: [recruiterRoleGuard]  // ✅ Autorise 'super', 'admin' et 'recruiter'
}
```

## 🎯 Résultat

Maintenant, les utilisateurs avec les rôles suivants peuvent accéder à `/dashboard/users` :
- ✅ **Super administrateur** (`super`)
- ✅ **Administrateur** (`admin`)
- ✅ **Recruteur** (`recruiter`)

## 📋 Guards disponibles dans l'application

| Guard | Rôles autorisés | Usage |
|-------|----------------|-------|
| `superRoleGuard` | `super` | Pages réservées aux super admins uniquement |
| `adminRoleGuard` | `super`, `admin` | Pages réservées aux administrateurs |
| `recruiterRoleGuard` | `super`, `admin`, `recruiter` | Pages accessibles aux recruteurs (NEW ✨) |
| `authGuard` | Tous (connectés) | Vérifie simplement la connexion |
| `noAuthGuard` | Non connectés | Pages publiques (login, signup, etc.) |

## 🧪 Test de validation

1. Se connecter en tant que **recruteur**
2. Cliquer sur "Utilisateurs" dans la navigation
3. ✅ La page des cards utilisateurs s'affiche correctement
4. ✅ Plus de message "Accès refusé"

## 📝 Notes

- Le guard `recruiterRoleGuard` peut être réutilisé pour d'autres routes accessibles aux recruteurs
- Les logs de console permettent de déboguer les accès facilement
- La hiérarchie est respectée : `super` > `admin` > `recruiter`

## 🔐 Sécurité

Le guard vérifie :
1. ✅ Authentification de l'utilisateur
2. ✅ Présence d'un rôle valide
3. ✅ Correspondance avec les rôles autorisés
4. ✅ Redirection appropriée en cas de refus

Tout est maintenant fonctionnel et sécurisé ! 🎉
