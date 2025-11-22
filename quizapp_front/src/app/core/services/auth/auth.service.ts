import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LoginResponse } from '../../../shared/models/interfaces';
import { SpringBootResponse, UserApiData } from '../../models/spring-boot.interfaces';
import { OnlineStatusService } from '../online-status.service';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  adminMode?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private onlineStatusService: OnlineStatusService) {
    // Vérifier si un utilisateur est déjà connecté au démarrage
    this.initializeAuthState();
  }

  /**
   * Authentifie un utilisateur à partir de la réponse API
   * Gère la transformation des données et le stockage local
   */
  authenticate(apiResponse: SpringBootResponse<UserApiData>): Observable<LoginResponse> {
    console.log('🔐 AuthService.authenticate() - Processing login response');
    console.log('📥 API Response:', apiResponse);

    if (apiResponse.hasError || !apiResponse.items || apiResponse.items.length === 0) {
      const errorMessage = apiResponse.status?.message || 'Erreur d\'authentification';
      console.error('❌ Authentication failed:', errorMessage);
      throw new Error(errorMessage);
    }

    const userData = apiResponse.items[0];
    const user: User = this.transformUserData(userData);
    const token = this.generateToken(userData);

    const loginResponse: LoginResponse = {
      token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        userRole: user.role,
        adminMode: user.adminMode
      }
    };

    // Stocker les données d'authentification
    this.setAuthData(loginResponse);
    
    // Démarrer le suivi du statut en ligne pour l'utilisateur connecté
    this.onlineStatusService.startOnlineTracking(parseInt(user.id));
    
    console.log('✅ Authentication successful:', user.email);
    return of(loginResponse);
  }

  /**
   * Déconnecte l'utilisateur et arrête le suivi du statut en ligne
   */
  logout(): void {
    console.log('🚪 AuthService.logout()');
    
    // Arrêter le suivi du statut en ligne avant de déconnecter
    this.onlineStatusService.stopOnlineTracking();
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    
    console.log('✅ Logout successful');
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Récupère l'utilisateur courant
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Met à jour l'utilisateur courant (pour admin_mode par exemple)
   */
  updateCurrentUser(updatedUser: User): void {
    console.log('🔄 Mise à jour utilisateur courant:', updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);
  }

  /**
   * Initialise l'état d'authentification au démarrage de l'application
   */
  private initializeAuthState(): void {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user: User = JSON.parse(userStr);
        console.log('🔍 User loaded from localStorage:', user);
        console.log('🔍 User role from localStorage:', user.role);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        
        // Redémarrer le suivi du statut en ligne si l'utilisateur était déjà connecté
        this.onlineStatusService.startOnlineTracking(parseInt(user.id));
        
        console.log('🔄 Auth state restored for:', user.email);
      } catch (error) {
        console.error('❌ Failed to restore auth state:', error);
        this.logout();
      }
    }
  }

  /**
   * Transforme les données utilisateur de l'API vers le format interne
   */
  private transformUserData(apiUser: UserApiData): User {
    console.log('🔍 API User Data:', apiUser);
    console.log('🔍 User Role from API:', apiUser.userRole);
    
    // Le backend ne retourne pas userRole dans toLiteDto, donc on applique une logique
    let role = apiUser.userRole;
    
    if (!role) {
      // Logique pour déterminer le rôle basé sur l'email ou l'ID
      const email = apiUser.email?.toLowerCase() || '';
      const userId = apiUser.id;
      
      if (email.includes('admin') || email.includes('super') || userId === 1) {
        role = 'super';
      } else if (email.includes('recruiter') || email.includes('rec')) {
        role = 'recruiter';
      } else if (email.includes('admin')) {
        role = 'admin';
      } else {
        // Pour le moment, assigner 'admin' par défaut pour les tests
        // TODO: Corriger le backend pour retourner le vraie rôle
        role = 'admin';
      }
      console.log('🔧 Role determined from logic:', role, 'for email:', email, 'ID:', userId);
    } else {
      console.log('✅ Role from API:', role);
    }
    
    return {
      id: apiUser.id?.toString() || '0',
      email: apiUser.email || '',
      firstName: apiUser.firstName || '',
      lastName: apiUser.lastName || '',
      role: role,
      adminMode: apiUser.adminMode || false
    };
  }

  /**
   * Génère un token temporaire (en attendant l'implémentation JWT côté serveur)
   */
  private generateToken(user: UserApiData): string {
    const payload = {
      userId: user.id,
      email: user.email,
      timestamp: Date.now()
    };
    
    // Encodage base64 temporaire - À remplacer par JWT
    return btoa(JSON.stringify(payload));
  }

  /**
   * Stocke les données d'authentification en local
   */
  private setAuthData(loginResponse: LoginResponse): void {
    localStorage.setItem('authToken', loginResponse.token);
    localStorage.setItem('user', JSON.stringify(loginResponse.user));
    
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(loginResponse.user);
  }
}
