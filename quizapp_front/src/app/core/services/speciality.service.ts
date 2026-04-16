import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Speciality {
  id: number;
  nom?: string;           // Backend utilise name
  specialityName?: string;
  description?: string;   // Backend utilise description
  departmentId?: number;  // ID du département
  departmentName?: string; // Nom du département
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
  private apiUrl = '/specialities';

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste paginée des spécialités
   * @param criteria les critères de recherche
   * @returns Observable de la réponse paginée
   */
  getAll(criteria: SpecialitySearchCriteria = {}): Observable<PagedResponse<Speciality>> {
    // Récupération de l'ID utilisateur depuis localStorage ou valeur par défaut
    const currentUserId = localStorage.getItem('user')?.includes('id') ?
      JSON.parse(localStorage.getItem('user')!)?.id?.toString() : '1';

    // Construction de la requête
    const rawData = {
      idDe: criteria.idDe || '',
      idA: criteria.idA || '',
      specialityName: criteria.nom || '',
      specialityDesc: criteria.description || '',
      isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted : undefined, // undefined = tous, false = actifs seulement
      dateCreationDe: criteria.dateCreationDe || '',
      dateCreationA: criteria.dateCreationA || '',
      dateModificationDe: criteria.dateModificationDe || '',
      dateModificationA: criteria.dateModificationA || '',
      searchString: criteria.search_string || ''
    };

    console.log('🔧 Données brutes spécialités avant nettoyage:', rawData);
    console.log('🔍 Recherche rapide - searchString:', criteria.search_string);
    console.log('🔍 Recherche rapide - quickSearch value:', criteria.search_string?.trim());
    console.log('🔍 Recherche rapide - searchString length:', criteria.search_string?.length);
    console.log('🔍 Recherche rapide - searchString is empty?', !criteria.search_string?.trim());

    const cleanedData = this.cleanEmptyFields(rawData);
    console.log('🔧 Données spécialités après nettoyage:', cleanedData);
    console.log('🔍 Données nettoyées - searchString:', cleanedData.searchString);
    console.log('🔍 Données nettoyées - searchString existe?', 'searchString' in cleanedData);

    const request = {
      user: currentUserId,
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: cleanedData
    };

    console.log('🚀 Envoi de la requête getAll spécialités:', request);
    console.log('📊 PARAMÈTRES DE PAGINATION:');
    console.log('  - criteria.page:', criteria.page);
    console.log('  - criteria.size:', criteria.size);
    console.log('  - request.index:', request.index);
    console.log('  - request.size:', request.size);

    // Utiliser toujours getAllByCriteria pour inclure les spécialités supprimés
    const endpoint = `${this.apiUrl}/getAllByCriteria`;

    console.log('🌐 URL complète appelée:', endpoint);
    console.log('📡 Méthode HTTP: POST');
    console.log('📦 Corps de la requête:', JSON.stringify(request, null, 2));

    return this.http.post<any>(endpoint, request).pipe(
      map(response => {
        console.log('🔍 Raw API Response (SPECIALITIES):', response);
        console.log('🔍 Response keys:', Object.keys(response));
        console.log('🔍 Response.count:', response.count);
        console.log('🔍 Response.totalCount:', response.totalCount);
        console.log('🔍 Response.items.length:', response.items?.length);
        console.log('🔍 Premier item (si existe):', response.items?.[0]);
        console.log('🔍 TOUS LES CHAMPS DE LA RÉPONSE:', response);

        // Vérifier si la réponse contient des données
        if (!response || (!response.items && !response.item)) {
          console.warn('⚠️ Aucune donnée dans la réponse spécialités');
          return {
            items: [],
            totalElements: 0,
            totalPages: 0,
            currentPage: criteria.page || 0,
            pageSize: criteria.size || 10,
            hasNext: false,
            hasPrevious: false
          };
        }

        // Traiter les éléments (items ou item unique)
        const rawSpecialities = response.items || (response.item ? [response.item] : []);

        // Transformer la réponse du backend vers le format frontend
        const transformedSpecialities: Speciality[] = rawSpecialities.map((spec: any) => ({
          id: spec.id,
          nom: spec.nom || spec.name || spec.specialityName || '',
          description: spec.description || spec.specialityDesc || '',
          departmentId: spec.departmentId,
          departmentName: spec.departmentName,
          isDeleted: spec.isDeleted || false,
          dateCreation: spec.dateCreation || spec.createdAt,
          dateModification: spec.dateModification || spec.updatedAt,

          // Champs backend
          name: spec.name || spec.specialityName,
          createdAt: spec.createdAt,
          updatedAt: spec.updatedAt
        }));

        return {
          items: transformedSpecialities,
          totalElements: response.totalCount || response.count || rawSpecialities.length,
          totalPages: Math.ceil((response.totalCount || response.count || rawSpecialities.length) / (criteria.size || 10)),
          currentPage: criteria.page || 0,
          pageSize: criteria.size || 10,
          hasNext: ((criteria.page || 0) + 1) * (criteria.size || 10) < (response.totalCount || response.count || rawSpecialities.length),
          hasPrevious: (criteria.page || 0) > 0
        };
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des spécialités:', error);
        console.error('❌ Détails de l\'erreur:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error
        });
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
    console.log('📥 Récupération de la spécialité ID:', id);

    // Préparer le corps de la requête pour récupérer une spécialité spécifique
    const requestBody = {
      user: "1",
      size: 1,
      index: 0,
      data: { id: id }
    };

    return this.http.post<any>(`${this.apiUrl}/getByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Spécialité récupérée:', response);
        // L'API retourne {items: [...], count: number, ...}
        if (response.items && response.items.length > 0) {
          return this.mapBackendToFrontend(response.items[0]);
        } else {
          throw new Error('Speciality not found');
        }
      }),
      catchError(error => {
        console.error(`❌ Erreur lors de la récupération de la spécialité ${id}:`, error);
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
    // Récupération de l'ID utilisateur depuis localStorage ou valeur par défaut
    const currentUserId = localStorage.getItem('user')?.includes('id') ?
      JSON.parse(localStorage.getItem('user')!)?.id?.toString() : '1';

    // Pour la restauration, on utilise updateAll avec isDeleted: false
    const request = {
      user: currentUserId,
      datas: [{
        id: specialityId,
        isDeleted: false  // Champ explicite pour la restauration
      }]
    };

    console.log('🔧 Restore speciality request payload:', request);
    console.log('🔧 Restore request datas:', request.datas);
    console.log('🔧 Restore request user:', request.user);

    return this.http.post<any>(`${this.apiUrl}/updateAll`, request).pipe(
      map(response => {
        console.log('✅ Speciality restored successfully:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Error restoring speciality:', error);
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

  /**
   * Nettoie les champs vides d'un objet pour éviter les erreurs de parsing côté backend
   * @param obj L'objet à nettoyer
   * @returns L'objet nettoyé
   */
  private cleanEmptyFields(obj: any): any {
    const cleaned: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        // Ne pas inclure les chaînes vides pour les champs non-String (dates, nombres)
        // Mais garder les chaînes vides pour les champs String (pour la recherche)
        // Exception pour les champs de date qui commencent par "date"
        if (typeof value === 'string' && value.trim() === '' &&
            (key.includes('At') || key.includes('By') || key.includes('Id')) &&
            !key.startsWith('date')) {
          // Ne pas ajouter le champ s'il est vide et concerne une date ou un ID (mais pas les champs de recherche de date)
          continue;
        }

        // Pour les autres types, garder la valeur
        cleaned[key] = value;
      }
    }

    return cleaned;
  }
}