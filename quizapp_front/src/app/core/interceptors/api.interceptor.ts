import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Vérifie si le token JWT est expiré en décodant le payload (base64).
 * Retourne true si le token est expiré ou invalide.
 */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    // exp est en secondes, Date.now() en millisecondes
    return (payload.exp * 1000) < Date.now();
  } catch {
    return true;
  }
}

/** Évite de déclencher plusieurs redirections simultanées */
let isRedirecting = false;

function handleSessionExpired(router: Router): void {
  if (isRedirecting) return;
  isRedirecting = true;

  localStorage.removeItem('authToken');
  localStorage.removeItem('user');

  router.navigate(['/connexion'], {
    queryParams: { expired: 'true' }
  }).then(() => {
    isRedirecting = false;
  });
}

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // ⚠️ IMPORTANT : Ne pas forcer Content-Type sur les requêtes multipart (upload de fichiers)
  const isMultipartRequest = req.body instanceof FormData;
  
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };
  
  if (!isMultipartRequest) {
    headers['Content-Type'] = 'application/json';
  }

  // Ajouter le token JWT si disponible et non expiré
  const token = localStorage.getItem('authToken');
  if (token) {
    if (isTokenExpired(token)) {
      // Token expiré côté client → redirection immédiate sans appel API
      handleSessionExpired(router);
      return throwError(() => new Error('Session expirée'));
    }
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const modifiedReq = req.clone({
    setHeaders: headers
  });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('🚨 HTTP Error in interceptor:', error);

      // 401 Unauthorized → session expirée côté serveur
      if (error.status === 401) {
        console.warn('⏰ Session expirée (401) — redirection vers la page de connexion');
        handleSessionExpired(router);
        return throwError(() => new Error('Session expirée. Veuillez vous reconnecter.'));
      }

      // 403 Forbidden → pas les droits
      if (error.status === 403) {
        console.warn('🚫 Accès interdit (403)');
        return throwError(() => new Error('Vous n\'avez pas les droits pour effectuer cette action.'));
      }
      
      if (error.status === 0) {
        console.error('❌ Connexion refusée - Backend Spring Boot non accessible sur le port 8085');
        return throwError(() => new Error('Backend non accessible. Vérifiez que le serveur Spring Boot est démarré sur le port 8085.'));
      }
      
      if (error.status === 500) {
        console.error('❌ Erreur serveur - Vérifiez les logs du backend Spring Boot');
        
        if (error.error?.status?.message) {
          console.log('📋 Erreur métier détectée, transmission du message spécifique:', error.error.status.message);
          return throwError(() => error);
        }
        
        return throwError(() => new Error('Erreur serveur. Vérifiez les logs du backend.'));
      }
      
      return throwError(() => error);
    })
  );
};
