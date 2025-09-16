import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interface pour les données d'un département
 */
export interface Department {
  id: number;
  nom?: string;           // Backend utilise name
  description?: string;   // Backend utilise description
  isDeleted?: boolean;    // Indicateur si le département est supprimé
  dateCreation?: string;  // Backend utilise createdAt
  dateModification?: string; // Backend utilise updatedAt

  // Champs du backend pour mapping
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface pour les critères de recherche des départements
 */
export interface DepartmentSearchCriteria {
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
  size?: number;
  page?: number;
}

/**
 * Interface pour la réponse paginée
 */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Service pour gérer les départements
 */
@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = `${environment.apiUrl}/departments`;

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Récupère tous les départements selon des critères
   * @param criteria critères de recherche optionnels
   * @returns Observable de la liste paginée des départements
   */
  getAllDepartmentsByCriteria(criteria: DepartmentSearchCriteria = {}): Observable<PagedResponse<Department>> {
    // Récupération de l'ID utilisateur depuis localStorage ou valeur par défaut
    const currentUserId = localStorage.getItem('user')?.includes('id') ?
      JSON.parse(localStorage.getItem('user')!)?.id?.toString() : '1';

    // Construction de la requête
    const rawData = {
      idDe: criteria.idDe || '',
      idA: criteria.idA || '',
      departmentName: criteria.nom || '',
      departmentDesc: criteria.description || '',
      // Ne pas envoyer isDeleted si on veut tous les départements (incluant supprimés)
      // isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted : false,
      dateCreationDe: criteria.dateCreationDe || '',
      dateCreationA: criteria.dateCreationA || '',
      dateModificationDe: criteria.dateModificationDe || '',
      dateModificationA: criteria.dateModificationA || '',
      search_string: criteria.search_string || ''
    };

    console.log('🔧 Données brutes avant nettoyage:', rawData);

    const cleanedData = this.cleanEmptyFields(rawData);
    console.log('🔧 Données après nettoyage:', cleanedData);

    const request = {
      user: currentUserId,
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: cleanedData
    };

    console.log('🚀 Envoi de la requête getAllDepartmentsByCriteria:', request);
    console.log('🔍 DÉTAIL de la requête:');
    console.log('  - user (ID connecté):', request.user);
    console.log('  - size (taille page):', request.size);
    console.log('  - index (page):', request.index);
    console.log('  - data.departmentName:', request.data.departmentName);
    console.log('  - data.departmentDesc:', request.data.departmentDesc);
    console.log('  - data complet:', request.data);

    // Utiliser toujours getAllByCriteria pour inclure les départements supprimés
    const endpoint = `${this.apiUrl}/getAllByCriteria`;

    console.log('🌐 URL complète appelée:', endpoint);
    console.log('📡 Méthode HTTP: POST');
    console.log('📦 Corps de la requête:', JSON.stringify(request, null, 2));

    return this.http.post<any>(endpoint, request).pipe(
      map(response => {
        console.log('🔍 Raw API Response (DEPARTMENTS):', response);
        console.log('🔍 Response keys:', Object.keys(response));
        console.log('🔍 Response.count:', response.count);
        console.log('🔍 Response.totalCount:', response.totalCount);
        console.log('🔍 Response.items.length:', response.items?.length);
        console.log('🔍 Premier item (si existe):', response.items?.[0]);

        // Vérifier si la réponse contient des données
        if (!response || (!response.items && !response.item)) {
          console.warn('⚠️ Aucune donnée dans la réponse');
          return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: criteria.size || 10,
            number: criteria.page || 0
          };
        }

        // Traiter les éléments (items ou item unique)
        const rawDepartments = response.items || (response.item ? [response.item] : []);

        // Transformer la réponse du backend vers le format frontend
        const transformedDepartments: Department[] = rawDepartments.map((dept: any) => ({
          id: dept.id,
          nom: dept.nom || dept.name || dept.departmentName || '',
          description: dept.description || dept.departmentDesc || '',
          isDeleted: dept.isDeleted || false,
          dateCreation: dept.dateCreation || dept.createdAt,
          dateModification: dept.dateModification || dept.updatedAt,

          // Champs backend
          name: dept.name || dept.departmentName,
          createdAt: dept.createdAt,
          updatedAt: dept.updatedAt
        }));

        return {
          content: transformedDepartments,
          totalElements: response.totalCount || response.count || rawDepartments.length,
          totalPages: Math.ceil((response.totalCount || response.count || rawDepartments.length) / (criteria.size || 10)),
          size: criteria.size || 10,
          number: criteria.page || 0
        };
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des départements:', error);
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
   * Met à jour un département
   * @param id l'identifiant du département
   * @param department les nouvelles données du département
   * @returns Observable du département mis à jour
   */
  update(id: number, department: Partial<Department>): Observable<Department> {
    // Récupération de l'ID utilisateur depuis localStorage ou valeur par défaut
    const currentUserId = localStorage.getItem('user')?.includes('id') ?
      JSON.parse(localStorage.getItem('user')!)?.id?.toString() : '1';

    // Mapper les champs frontend vers backend
    const backendDepartment = {
      id: id,
      departmentName: department.nom,
      departmentDesc: department.description,
      isDeleted: department.isDeleted !== undefined ? department.isDeleted : undefined
    };

    // Retirer les champs undefined pour éviter d'envoyer null
    Object.keys(backendDepartment).forEach(key => {
      if (backendDepartment[key as keyof typeof backendDepartment] === undefined) {
        delete backendDepartment[key as keyof typeof backendDepartment];
      }
    });

    const request = {
      datas: [backendDepartment],  // Array avec l'objet département à mettre à jour
      user: currentUserId    // ID utilisateur connecté
    };

    console.log('🔧 Update department request payload:', request);
    console.log('🔧 Update request datas:', request.datas);
    console.log('🔧 Update request user:', request.user);

    return this.http.post<any>(`${this.apiUrl}/update`, request).pipe(
      map(response => response.items?.[0] || response)
    );
  }

  /**
   * Supprime un département
   * @param id l'identifiant du département à supprimer
   * @returns Observable de la confirmation de suppression
   */
  delete(id: number): Observable<any> {
    // Récupération de l'ID utilisateur depuis localStorage ou valeur par défaut
    const currentUserId = localStorage.getItem('user')?.includes('id') ?
      JSON.parse(localStorage.getItem('user')!)?.id?.toString() : '1';

    const request = {
      datas: [{ id: id }],  // Array avec l'objet contenant l'ID
      user: currentUserId   // ID utilisateur connecté
    };

    return this.http.post<any>(`${this.apiUrl}/delete`, request);
  }

  /**
   * Restaure un département supprimé
   * @param departmentId l'identifiant du département à restaurer
   * @returns Observable du département restauré
   */
  restore(departmentId: number): Observable<Department> {
    // Construction des données au format attendu par update
    const departmentData = {
      id: departmentId,
      isDeleted: false
    };

    return this.update(departmentId, departmentData).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
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
        if (typeof value === 'string' && value.trim() === '' &&
            (key.includes('At') || key.includes('By') || key.includes('Id'))) {
          // Ne pas ajouter le champ s'il est vide et concerne une date ou un ID
          continue;
        }

        // Pour les autres types, garder la valeur
        cleaned[key] = value;
      }
    }

    return cleaned;
  }
}