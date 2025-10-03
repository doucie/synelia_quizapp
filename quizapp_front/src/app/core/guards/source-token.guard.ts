import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SourceTokenService } from '../../services/source-token.service';

/**
 * Guard pour vérifier qu'un source token est valide avant d'accéder au formulaire de candidature
 */
export const sourceTokenGuard: CanActivateFn = (route, state) => {
  const sourceTokenService = inject(SourceTokenService);
  const router = inject(Router);
  
  const tokenString = route.paramMap.get('sourceToken');
  
  if (!tokenString) {
    router.navigate(['/']);
    return false;
  }

  // Validation basique du format (6 caractères alphanumériques)
  const tokenRegex = /^[a-z0-9]{6}$/i;
  if (!tokenRegex.test(tokenString)) {
    router.navigate(['/'], { 
      queryParams: { 
        error: 'token_invalid',
        message: 'Format de token invalide'
      }
    });
    return false;
  }

  // Validation via API backend
  return sourceTokenService.validateToken(tokenString).pipe(
    map(validation => {
      if (validation.isValid) {
        return true;
      } else {
        router.navigate(['/'], { 
          queryParams: { 
            error: 'token_invalid',
            message: validation.message || 'Ce lien de candidature est invalide ou expiré'
          }
        });
        return false;
      }
    })
  );
};
