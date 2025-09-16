import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interface pour les données d'une spécialité
 */
export interface Speciality {
  id: number;
  nom?: string;           // Backend utilise name
  description?: string;   // Backend utilise description
  isDeleted?: boolean;    // Indicateur si la spécialité est supprimée
  dateCreation?: string;  // Backend utilise createdAt
  dateModification?: string; // Backend utilise updatedAt

  // Champs du backend pour mapping
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface pour les critères de recherche des spécialités
 */
export interface SpecialitySearchCriteria {
  // Frontend field names
  idDe?: string;
  idA?: string;
  nom?: string;
  description?: string;
  isDeleted?: boolean;

  // Intervalles de dates
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;

  // Recherche générale
  search_string?: string;

  // Pagination
  page?: number;
  size?: number;
}

/**
 * Interface pour la réponse paginée
 */
export interface PagedResponse<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SpecialityService {
  private apiUrl = `${environment.apiUrl}/specialities`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste paginée des spécialités
   * @param criteria les critères de recherche
   * @returns Observable de la réponse paginée
   */
  getAll(criteria: SpecialitySearchCriteria = {}): Observable<PagedResponse<Speciality>> {
    // Structure de requête attendue par l'API Spring Boot
    const requestBody = {
      user: 1,
      size: criteria.size || 20,
      index: criteria.page || 0,
      datas: [],
      data: {}
    };

    // Choisir l'endpoint selon si on veut inclure les éléments supprimés
    const endpoint = criteria.isDeleted === true
      ? `${this.apiUrl}/getAllByCriteria`  // Inclut les supprimés
      : `${this.apiUrl}/getByCriteria`;    // Exclut les supprimés

    return this.http.post<any>(endpoint, requestBody).pipe(
      map(response => {
        // Transformation de la réponse backend vers le format frontend
        const items = response.items?.map((item: any) => this.mapBackendToFrontend(item)) || [];
        const totalElements = response.count || 0;
        const pageSize = criteria.size || 20;
        const currentPage = criteria.page || 0;

        return {
          items,
          totalElements,
          totalPages: Math.ceil(totalElements / pageSize),
          currentPage,
          pageSize,
          hasNext: (currentPage + 1) * pageSize < totalElements,
          hasPrevious: currentPage > 0
        };
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des spécialités:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Recherche des spécialités avec critères avancés
   * @param criteria les critères de recherche
   * @returns Observable de la réponse paginée
   */
  search(criteria: SpecialitySearchCriteria): Observable<PagedResponse<Speciality>> {
    return this.getAll(criteria);
  }

  /**
   * Récupère une spécialité par son ID
   * @param id l'identifiant de la spécialité
   * @returns Observable de la spécialité
   */
  getById(id: number): Observable<Speciality> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.mapBackendToFrontend(response)),
      catchError(error => {
        console.error(`Erreur lors de la récupération de la spécialité ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crée une nouvelle spécialité
   * @param speciality les données de la spécialité à créer
   * @returns Observable de la spécialité créée
   */
  create(speciality: Partial<Speciality>): Observable<Speciality> {
    // Récupération de l'ID utilisateur depuis localStorage ou valeur par défaut
    const currentUserId = localStorage.getItem('user')?.includes('id') ?
      JSON.parse(localStorage.getItem('user')!)?.id?.toString() : '1';

    const request = {
      datas: [{
        name: speciality.nom || speciality.name,
        description: speciality.description,
        isDeleted: false
      }],
      user: currentUserId
    };

    return this.http.post<any>(`${this.apiUrl}/create`, request).pipe(
      map(response => this.mapBackendToFrontend(response.items?.[0] || response)),
      catchError(error => {
        console.error('Erreur lors de la création de la spécialité:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour une spécialité existante
   * @param id l'identifiant de la spécialité à mettre à jour
   * @param speciality les nouvelles données de la spécialité
   * @returns Observable de la spécialité mise à jour
   */
  update(id: number, speciality: Partial<Speciality>): Observable<Speciality> {
    // Récupération de l'ID utilisateur depuis localStorage ou valeur par défaut
    const currentUserId = localStorage.getItem('user')?.includes('id') ?
      JSON.parse(localStorage.getItem('user')!)?.id?.toString() : '1';

    const request = {
      datas: [{
        id: id,
        name: speciality.nom || speciality.name,
        description: speciality.description,
        isDeleted: speciality.isDeleted
      }],
      user: currentUserId
    };

    return this.http.post<any>(`${this.apiUrl}/update`, request).pipe(
      map(response => this.mapBackendToFrontend(response.items?.[0] || response)),
      catchError(error => {
        console.error(`Erreur lors de la mise à jour de la spécialité ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour plusieurs spécialités en une seule requête (y compris les supprimées)
   * @param specialities tableau des spécialités à mettre à jour
   * @returns Observable du tableau des spécialités mises à jour
   */
  updateAll(specialities: Partial<Speciality>[]): Observable<Speciality[]> {
    // Récupération de l'ID utilisateur depuis localStorage ou valeur par défaut
    const currentUserId = localStorage.getItem('user')?.includes('id') ?
      JSON.parse(localStorage.getItem('user')!)?.id?.toString() : '1';

    const request = {
      datas: specialities.map(speciality => ({
        id: speciality.id,
        specialityName: speciality.nom || speciality.name,
        specialityDesc: speciality.description,
        isDeleted: speciality.isDeleted,
        createdBy: (speciality as any).createdBy,
        updatedBy: (speciality as any).updatedBy,
        createdAt: (speciality as any).createdAt,
        updatedAt: (speciality as any).updatedAt
      })),
      user: currentUserId
    };

    return this.http.post<any>(`${this.apiUrl}/updateAll`, request).pipe(
      map(response => {
        if (response.items && Array.isArray(response.items)) {
          return response.items.map((item: any) => this.mapBackendToFrontend(item));
        }
        return [];
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour en masse des spécialités:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprime une spécialité
   * @param id l'identifiant de la spécialité à supprimer
   * @returns Observable de la confirmation de suppression
   */
  delete(id: number): Observable<any> {
    // Récupération de l'ID utilisateur depuis localStorage ou valeur par défaut
    const currentUserId = localStorage.getItem('user')?.includes('id') ?
      JSON.parse(localStorage.getItem('user')!)?.id?.toString() : '1';

    const request = {
      datas: [{ id: id }],
      user: currentUserId
    };

    return this.http.post<any>(`${this.apiUrl}/delete`, request);
  }

  /**
   * Restaure une spécialité supprimée
   * @param specialityId l'identifiant de la spécialité à restaurer
   * @returns Observable de la spécialité restaurée
   */
  restore(specialityId: number): Observable<Speciality> {
    const specialityData = {
      id: specialityId,
      isDeleted: false
    };

    return this.update(specialityId, specialityData).pipe(
      map(response => response),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Mapping des données backend vers frontend
   * @param backendData les données du backend
   * @returns les données mappées pour le frontend
   */
  private mapBackendToFrontend(backendData: any): Speciality {
    return {
      id: backendData.id,
      nom: backendData.specialityName || backendData.name,
      description: backendData.specialityDesc || backendData.description,
      isDeleted: backendData.isDeleted,
      dateCreation: backendData.createdAt,
      dateModification: backendData.updatedAt,

      // Conserver les champs originaux du backend
      name: backendData.specialityName,
      createdAt: backendData.createdAt,
      updatedAt: backendData.updatedAt
    };
  }
}