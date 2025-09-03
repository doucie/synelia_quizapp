import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Add any global HTTP configuration here
  const modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
      // Add other default headers as needed
    }
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
        return throwError(() => new Error('Erreur serveur. Vérifiez les logs du backend.'));
      }
      
      return throwError(() => error);
    })
  );
};
