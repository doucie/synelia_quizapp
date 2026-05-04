import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Guard pour protéger les routes nécessitant une authentification
 * Redirige vers /connexion si l'utilisateur n'est pas connecté
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  console.log('🛡️ AuthGuard - Vérification authentification');
  console.log('👤 User:', user?.email || 'Non connecté');
  console.log('🔓 Authenticated:', isAuthenticated);

  if (isAuthenticated && user) {
    if (authService.requiresPasswordChange() && !state.url.startsWith('/dashboard/profile')) {
      console.log('⚠️ AuthGuard - Mot de passe par défaut détecté, redirection vers /dashboard/profile');
      router.navigate(['/dashboard/profile']);
      return false;
    }

    console.log('✅ AuthGuard - Accès autorisé');
    return true;
  } else {
    console.log('❌ AuthGuard - Redirection vers /connexion');
    router.navigate(['/connexion']);
    return false;
  }
};

/**
 * Guard pour empêcher l'accès aux pages de connexion si déjà connecté
 * Redirige vers /dashboard si l'utilisateur est déjà connecté
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  console.log('🛡️ NoAuthGuard - Vérification non-authentification');
  console.log('👤 User:', user?.email || 'Non connecté');
  console.log('🔓 Authenticated:', isAuthenticated);

  if (!isAuthenticated || !user) {
    console.log('✅ NoAuthGuard - Accès autorisé à la page de connexion');
    return true;
  } else {
    const redirectRoute = authService.getAuthenticatedHomeRoute();
    console.log('❌ NoAuthGuard - Redirection vers', redirectRoute, '(déjà connecté)');
    router.navigate([redirectRoute]);
    return false;
  }
};
