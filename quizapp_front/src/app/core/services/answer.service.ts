import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interface pour les réponses
export interface Answer {
  id: number;
  answerText?: string;
  questionId?: number;
  questionText?: string;
  isCorrect?: boolean;
  displayOrder?: number;
  isDeleted?: boolean;
  dateCreation?: string;
  dateModification?: string;
}

// Interface pour les critères de recherche des réponses
export interface AnswerSearchCriteria {
  // Frontend field names
  idDe?: string;
  idA?: string;
  answerText?: string;
  questionId?: number;
  isCorrect?: boolean;
  isDeleted?: boolean;

  // Recherche générale
  search_string?: string;

  // Pagination
  size?: number;
  page?: number;
}

// Interface pour la réponse paginée
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  private readonly apiUrl = `${environment.apiUrl}/answers`;

  constructor(private http: HttpClient) {
    console.log('🚀 Initialisation AnswerService');
    console.log('📡 URL de l\'API:', this.apiUrl);
  }

  /**
   * Récupère toutes les réponses avec critères de recherche
   */
  getAllAnswersByCriteria(criteria: AnswerSearchCriteria): Observable<PagedResponse<Answer>> {
    console.log('📥 Récupération des réponses avec critères:', criteria);

    let params = new HttpParams();

    // Ajouter les paramètres de recherche
    if (criteria.idDe) params = params.set('idDe', criteria.idDe);
    if (criteria.idA) params = params.set('idA', criteria.idA);
    if (criteria.answerText) params = params.set('answerText', criteria.answerText);
    if (criteria.questionId) params = params.set('questionId', criteria.questionId.toString());
    if (criteria.isCorrect !== undefined) params = params.set('isCorrect', criteria.isCorrect.toString());
    if (criteria.isDeleted !== undefined) params = params.set('isDeleted', criteria.isDeleted.toString());
    if (criteria.search_string) params = params.set('search_string', criteria.search_string);

    // Paramètres de pagination
    if (criteria.size) params = params.set('size', criteria.size.toString());
    if (criteria.page !== undefined) params = params.set('page', criteria.page.toString());

    console.log('🔍 Paramètres HTTP:', params.toString());

    return this.http.get<PagedResponse<Answer>>(this.apiUrl, { params }).pipe(
      map(response => {
        console.log('✅ Réponse reçue:', response);
        return response;
      })
    );
  }

  /**
   * Récupère une réponse par son ID
   */
  getAnswerById(id: number): Observable<Answer> {
    console.log('📥 Récupération de la réponse ID:', id);
    return this.http.get<Answer>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        console.log('✅ Réponse récupérée:', response);
        return response;
      })
    );
  }

  /**
   * Crée une nouvelle réponse
   */
  createAnswer(answer: Answer): Observable<Answer> {
    console.log('➕ Création d\'une nouvelle réponse:', answer);

    // Préparer les données pour l'API
    const answerData = {
      answerText: answer.answerText,
      questionId: answer.questionId,
      isCorrect: answer.isCorrect || false,
      displayOrder: answer.displayOrder || 1
    };

    return this.http.post<Answer>(this.apiUrl, answerData).pipe(
      map(response => {
        console.log('✅ Réponse créée:', response);
        return response;
      })
    );
  }

  /**
   * Met à jour une réponse existante
   */
  updateAnswer(id: number, answer: Answer): Observable<Answer> {
    console.log('✏️ Mise à jour de la réponse ID:', id, answer);

    // Préparer les données pour l'API
    const answerData = {
      answerText: answer.answerText,
      questionId: answer.questionId,
      isCorrect: answer.isCorrect || false,
      displayOrder: answer.displayOrder || 1
    };

    return this.http.put<Answer>(`${this.apiUrl}/${id}`, answerData).pipe(
      map(response => {
        console.log('✅ Réponse mise à jour:', response);
        return response;
      })
    );
  }

  /**
   * Supprime une réponse (soft delete)
   */
  deleteAnswer(id: number): Observable<void> {
    console.log('🗑️ Suppression de la réponse ID:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        console.log('✅ Réponse supprimée');
      })
    );
  }

  /**
   * Restaure une réponse supprimée
   */
  restoreAnswer(id: number): Observable<Answer> {
    console.log('♻️ Restauration de la réponse ID:', id);
    return this.http.patch<Answer>(`${this.apiUrl}/${id}/restore`, {}).pipe(
      map(response => {
        console.log('✅ Réponse restaurée:', response);
        return response;
      })
    );
  }

  /**
   * Récupère toutes les réponses (sans pagination)
   */
  getAllAnswers(): Observable<Answer[]> {
    console.log('📥 Récupération de toutes les réponses');
    return this.http.get<Answer[]>(`${this.apiUrl}/all`).pipe(
      map(response => {
        console.log('✅ Toutes les réponses récupérées:', response.length);
        return response;
      })
    );
  }

  /**
   * Récupère les réponses par question
   */
  getAnswersByQuestion(questionId: number): Observable<Answer[]> {
    console.log('📥 Récupération des réponses pour la question ID:', questionId);
    return this.http.get<Answer[]>(`${this.apiUrl}/question/${questionId}`).pipe(
      map(response => {
        console.log('✅ Réponses de la question récupérées:', response.length);
        return response;
      })
    );
  }

  /**
   * Recherche des réponses par texte
   */
  searchAnswers(searchText: string): Observable<Answer[]> {
    console.log('🔍 Recherche de réponses avec le texte:', searchText);
    const params = new HttpParams().set('search', searchText);
    return this.http.get<Answer[]>(`${this.apiUrl}/search`, { params }).pipe(
      map(response => {
        console.log('✅ Résultats de recherche:', response.length);
        return response;
      })
    );
  }

  /**
   * Exporte les réponses au format CSV
   */
  exportAnswers(criteria?: AnswerSearchCriteria): Observable<Blob> {
    console.log('📤 Export des réponses');

    let params = new HttpParams();
    if (criteria) {
      if (criteria.answerText) params = params.set('answerText', criteria.answerText);
      if (criteria.questionId) params = params.set('questionId', criteria.questionId.toString());
      if (criteria.isCorrect !== undefined) params = params.set('isCorrect', criteria.isCorrect.toString());
      if (criteria.isDeleted !== undefined) params = params.set('isDeleted', criteria.isDeleted.toString());
    }

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    }).pipe(
      map(response => {
        console.log('✅ Export terminé');
        return response;
      })
    );
  }

  /**
   * Importe des réponses depuis un fichier CSV
   */
  importAnswers(file: File): Observable<{ imported: number; errors: string[] }> {
    console.log('📥 Import de réponses depuis le fichier:', file.name);

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ imported: number; errors: string[] }>(`${this.apiUrl}/import`, formData).pipe(
      map(response => {
        console.log('✅ Import terminé:', response);
        return response;
      })
    );
  }

  /**
   * Duplique une réponse
   */
  duplicateAnswer(id: number): Observable<Answer> {
    console.log('📋 Duplication de la réponse ID:', id);
    return this.http.post<Answer>(`${this.apiUrl}/${id}/duplicate`, {}).pipe(
      map(response => {
        console.log('✅ Réponse dupliquée:', response);
        return response;
      })
    );
  }

  /**
   * Met à jour le statut d'une réponse (activée/désactivée)
   */
  updateAnswerStatus(id: number, isActive: boolean): Observable<Answer> {
    console.log('🔄 Mise à jour du statut de la réponse ID:', id, 'actif:', isActive);
    return this.http.patch<Answer>(`${this.apiUrl}/${id}/status`, { isActive }).pipe(
      map(response => {
        console.log('✅ Statut mis à jour:', response);
        return response;
      })
    );
  }

  /**
   * Valide une réponse avant sauvegarde
   */
  validateAnswer(answer: Answer): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!answer.answerText || answer.answerText.trim().length === 0) {
      errors.push('Le texte de la réponse est requis');
    }

    if (!answer.questionId) {
      errors.push('La question associée est requise');
    }

    if (answer.isCorrect === undefined) {
      errors.push('Le statut correct/incorrect doit être défini');
    }

    if (answer.displayOrder !== undefined && answer.displayOrder < 1) {
      errors.push('L\'ordre d\'affichage doit être supérieur à 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Nettoie les données d'une réponse avant envoi à l'API
   */
  sanitizeAnswer(answer: Answer): Answer {
    return {
      ...answer,
      answerText: answer.answerText?.trim(),
      displayOrder: answer.displayOrder || 1
    };
  }

  /**
   * Met à jour l'ordre d'affichage des réponses pour une question
   */
  updateAnswersOrder(questionId: number, answers: { id: number; displayOrder: number }[]): Observable<void> {
    console.log('🔄 Mise à jour de l\'ordre des réponses pour la question ID:', questionId);
    return this.http.patch<void>(`${this.apiUrl}/question/${questionId}/order`, { answers }).pipe(
      map(() => {
        console.log('✅ Ordre des réponses mis à jour');
      })
    );
  }

  /**
   * Vérifie si une réponse peut être supprimée (pas d'associations)
   */
  checkAssociatedData(answerId: number): Observable<{ canDelete: boolean; associatedCount: number }> {
    console.log('🔍 Vérification des données associées pour la réponse ID:', answerId);
    return this.http.get<{ canDelete: boolean; associatedCount: number }>(`${this.apiUrl}/${answerId}/check-associations`).pipe(
      map(response => {
        console.log('✅ Vérification terminée:', response);
        return response;
      })
    );
  }
}