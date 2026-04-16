import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { PermissionService } from '../services/permission.service';

/**
 * Factory : crée un guard qui vérifie si l'utilisateur a AU MOINS UNE
 * des permissions listées.  SUPER_ADMIN → bypass complet.
 */
export function permissionGuard(requiredPermissions: string[]): CanActivateFn {
  return (_route, _state) => {
    const authService = inject(AuthService);
    const router      = inject(Router);
    const permService = inject(PermissionService);

    if (!authService.isAuthenticated() || !authService.getCurrentUser()) {
      router.navigate(['/connexion']);
      return false;
    }

    if (permService.hasAnyPermission(requiredPermissions)) {
      return true;
    }

    router.navigate(['/dashboard'], {
      queryParams: {
        error: 'access_denied',
        message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.'
      }
    });
    return false;
  };
}

/**
 * Guard générique par données de route : route.data['roles']
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated || !user) {
    router.navigate(['/connexion']);
    return false;
  }

  const requiredRoles: string[] = route.data?.['roles'] || [];
  if (requiredRoles.length === 0) return true;

  if (requiredRoles.includes(user.role)) {
    return true;
  }

  router.navigate(['/dashboard'], {
    queryParams: {
      error: 'access_denied',
      message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.'
    }
  });
  return false;
};
