import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Guard pour protéger les routes basées sur les rôles
 * Vérifie si l'utilisateur a le rôle requis pour accéder à la route
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  console.log('🛡️ RoleGuard - Vérification des rôles');
  console.log('👤 User:', user?.email || 'Non connecté');
  console.log('🔓 Authenticated:', isAuthenticated);
  console.log('🎭 User Role:', user?.role || 'Aucun rôle');

  // Vérifier d'abord si l'utilisateur est connecté
  if (!isAuthenticated || !user) {
    console.log('❌ RoleGuard - Utilisateur non connecté, redirection vers /connexion');
    router.navigate(['/connexion']);
    return false;
  }

  // Récupérer les rôles requis depuis les données de la route
  const requiredRoles: string[] = route.data?.['roles'] || [];
  console.log('🎯 Required Roles:', requiredRoles);

  // Si aucun rôle n'est requis, autoriser l'accès
  if (requiredRoles.length === 0) {
    console.log('✅ RoleGuard - Aucun rôle requis, accès autorisé');
    return true;
  }

  // Vérifier si l'utilisateur a l'un des rôles requis
  const userRole = user.role;
  const hasRequiredRole = requiredRoles.includes(userRole);

  if (hasRequiredRole) {
    console.log('✅ RoleGuard - Rôle autorisé:', userRole);
    return true;
  } else {
    console.log('❌ RoleGuard - Rôle insuffisant:', userRole, 'requis:', requiredRoles);
    console.log('🚫 RoleGuard - Accès refusé, redirection vers /dashboard');
    router.navigate(['/dashboard'], { 
      queryParams: { 
        error: 'access_denied',
        message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.'
      } 
    });
    return false;
  }
};

/**
 * Guard spécifique pour le rôle "super"
 * Raccourci pour les routes nécessitant uniquement le rôle super
 */
export const superRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  console.log('🛡️ SuperRoleGuard - Vérification du rôle super');

  if (!isAuthenticated || !user) {
    console.log('❌ SuperRoleGuard - Utilisateur non connecté');
    router.navigate(['/connexion']);
    return false;
  }

  if (user.role === 'super') {
    console.log('✅ SuperRoleGuard - Accès autorisé pour le rôle super');
    return true;
  } else {
    console.log('❌ SuperRoleGuard - Accès refusé, rôle:', user.role);
    router.navigate(['/dashboard'], { 
      queryParams: { 
        error: 'access_denied',
        message: 'Accès réservé aux super administrateurs.'
      } 
    });
    return false;
  }
};

/**
 * Guard spécifique pour les rôles admin et super
 * Raccourci pour les routes nécessitant admin ou super
 */
export const adminRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  console.log('🛡️ AdminRoleGuard - Vérification des rôles admin/super');

  if (!isAuthenticated || !user) {
    console.log('❌ AdminRoleGuard - Utilisateur non connecté');
    router.navigate(['/connexion']);
    return false;
  }

  if (user.role === 'super' || user.role === 'admin') {
    console.log('✅ AdminRoleGuard - Accès autorisé pour le rôle:', user.role);
    return true;
  } else {
    console.log('❌ AdminRoleGuard - Accès refusé, rôle:', user.role);
    router.navigate(['/dashboard'], { 
      queryParams: { 
        error: 'access_denied',
        message: 'Accès réservé aux administrateurs.'
      } 
    });
    return false;
  }
};
