import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginCredentials } from '../../../shared/models/interfaces';
import { SpringBootRequest, SpringBootResponse, UserApiData } from '../../models/spring-boot.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ConnexionService {
  private readonly apiUrl = '/userManager';

  constructor(private http: HttpClient) {}

  /**
   * Appel API pour la connexion utilisateur
   * Gère uniquement la communication avec l'API Spring Boot
   * Hash le mot de passe avec BCrypt avant l'envoi
   */
  login(credentials: LoginCredentials): Observable<SpringBootResponse<UserApiData>> {
    console.log('🌐 ConnexionService.login() - API call');
    console.log('📧 Email:', credentials.email);
    console.log('🔗 URL:', `${this.apiUrl}/connexion`);
    
    const request: SpringBootRequest<LoginCredentials> = {
      data: {
        email: credentials.email,
        password: credentials.password // Mot de passe en clair, hachage côté serveur
      },
      sessionUser: null,
      size: null,
      index: null,
      lang: 'fr',
      businessLineCode: null,
      caseEngine: null,
      isAnd: null,
      user: null,
      isSimpleLoading: true
    };
    
    console.log('📤 Request payload:', JSON.stringify({
      ...request,
      data: { ...request.data, password: '[PROTECTED]' }
    }, null, 2));
    
    return this.http.post<SpringBootResponse<UserApiData>>(`${this.apiUrl}/connexion`, request);
  }

  /**
   * Validation des credentials côté client
   */
  validateCredentials(credentials: LoginCredentials): string | null {
    if (!credentials.email || !credentials.email.trim()) {
      return 'L\'email est requis';
    }
    
    if (!credentials.password || !credentials.password.trim()) {
      return 'Le mot de passe est requis';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      return 'Format d\'email invalide';
    }
    
    return null;
  }
}
