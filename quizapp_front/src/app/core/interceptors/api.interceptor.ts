import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Add any global HTTP configuration here
  
  // ⚠️ IMPORTANT : Ne pas forcer Content-Type sur les requêtes multipart (upload de fichiers)
  // Angular/HttpClient gère automatiquement le Content-Type pour FormData
  const isMultipartRequest = req.body instanceof FormData;
  
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };
  
  // N'ajouter Content-Type que si ce n'est PAS une requête multipart
  if (!isMultipartRequest) {
    headers['Content-Type'] = 'application/json';
  }
  
  const modifiedReq = req.clone({
    setHeaders: headers
  });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('🚨 HTTP Error in interceptor:', error);
      
      if (error.status === 0) {
        // Erreur CORS ou connexion refusée
        console.error('❌ Connexion refusée - Backend Spring Boot non accessible sur le port 8081');
        return throwError(() => new Error('Backend non accessible. Vérifiez que le serveur Spring Boot est démarré sur le port 8081.'));
      }
      
      if (error.status === 500) {
        console.error('❌ Erreur serveur - Vérifiez les logs du backend Spring Boot');
        
        // Vérifier si c'est une erreur métier avec un message spécifique
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
