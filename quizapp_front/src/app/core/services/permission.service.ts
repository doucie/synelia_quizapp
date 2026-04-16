import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SpringBootRequest, SpringBootResponse } from '../models/spring-boot.interfaces';
import { AuthPermissionsData, BusinessGroup } from '../models/permission.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  /** Rôle système de l'utilisateur connecté */
  systemRole = signal<string>('');

  /** Groupes métiers de l'utilisateur */
  businessGroups = signal<BusinessGroup[]>([]);

  /** Permissions effectives résolues (algorithme complet backend) */
  permissions = signal<string[]>([]);

  /** Indique si les permissions ont été chargées */
  loaded = signal<boolean>(false);

  /** SUPER_ADMIN bypass complet */
  isSuperAdmin = computed(() => this.systemRole().toUpperCase() === 'SUPER_ADMIN');

  /** ADMIN — plancher immuable */
  isAdmin = computed(() => this.systemRole().toUpperCase() === 'ADMIN');

  constructor(private http: HttpClient) {}

  /**
   * Charge les permissions depuis le backend.
   * Appelé après le login, une fois le token JWT disponible.
   */
  async loadPermissions(userId: number): Promise<void> {
    try {
      const request: SpringBootRequest<any> = {
        data: {},
        user: userId
      };

      const response = await firstValueFrom(
        this.http.post<SpringBootResponse<AuthPermissionsData>>(
          '/authPermissions/me',
          request
        )
      );

      if (!response.hasError && response.items && response.items.length > 0) {
        const data = response.items[0];
        this.systemRole.set(data.userRole || '');
        this.businessGroups.set(data.businessGroups || []);
        this.permissions.set(data.effectivePermissions || []);
        this.loaded.set(true);
      }
    } catch (error) {
      console.error('Erreur chargement permissions:', error);
      this.reset();
    }
  }

  /**
   * Vérifie si l'utilisateur a une permission donnée.
   * SUPER_ADMIN → toujours true (bypass).
   */
  hasPermission(functionality: string): boolean {
    if (this.isSuperAdmin()) return true;
    return this.permissions().includes(functionality);
  }

  /**
   * Vérifie si l'utilisateur a AU MOINS UNE des permissions listées.
   * SUPER_ADMIN → toujours true.
   */
  hasAnyPermission(functionalities: string[]): boolean {
    if (this.isSuperAdmin()) return true;
    return functionalities.some(f => this.permissions().includes(f));
  }

  /**
   * Réinitialise les permissions (logout).
   */
  reset(): void {
    this.systemRole.set('');
    this.businessGroups.set([]);
    this.permissions.set([]);
    this.loaded.set(false);
  }
}
