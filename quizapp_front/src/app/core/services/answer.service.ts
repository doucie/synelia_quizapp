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

  private readonly apiUrl = '/answers';

  constructor(private http: HttpClient) {
    console.log('🚀 Initialisation AnswerService');
    console.log('📡 URL de l\'API:', this.apiUrl);
  }

  /**
   * Récupère toutes les réponses avec critères de recherche
   */
  getAllAnswersByCriteria(criteria: AnswerSearchCriteria): Observable<PagedResponse<Answer>> {
    console.log('📥 Récupération des réponses avec critères:', criteria);

    // Préparer le corps de la requête selon le format attendu par l'API backend
    const requestBody = {
      user: "1",
      size: criteria.size || 10,
      index: criteria.page || 0,
      data: {
        idDe: criteria.idDe,
        idA: criteria.idA,
        answerText: criteria.answerText,
        questionId: criteria.questionId,
        isDeleted: criteria.isDeleted,
        search_string: criteria.search_string
      }
    };

    console.log('🔍 Corps de la requête:', JSON.stringify(requestBody, null, 2));

    return this.http.post<PagedResponse<Answer>>(`${this.apiUrl}/getByCriteria`, requestBody).pipe(
      map((response: any) => {
        console.log('🔍 Raw API Response (ANSWERS):', response);
        console.log('🔍 Response keys:', Object.keys(response));
        console.log('🔍 Response.items exists:', !!response.items);
        console.log('🔍 Response.items length:', response.items?.length);

        // Transformer la réponse pour correspondre au format attendu par le frontend
        if (!response || !response.items) {
          console.warn('⚠️ Erreur dans la réponse API ou aucune donnée');
          return {
            content: [],
            totalElements: 0,
            totalPages: 1,
            size: criteria.size || 10,
            number: criteria.page || 0,
            first: true,
            last: true,
            empty: true
          };
        }

        // Transformer les données pour correspondre au format attendu par le frontend
        const answers = response.items.map((a: any) => ({
          id: a.id,
          answerText: a.answerContent || a.answerText, // API retourne 'answerContent', frontend attend 'answerText'
          questionId: a.questionId,
          questionText: a.questionText || `Question ${a.questionId}`, // Placeholder si pas fourni
          displayOrder: a.displayOrder,
          isDeleted: a.isDeleted,
          dateCreation: a.createdAt || a.dateCreation,
          dateModification: a.updatedAt || a.dateModification
        }));

        console.log('🔍 Premier élément des réponses transformées:', answers[0]);
        console.log('🔍 Propriétés du premier élément transformé:', answers[0] ? Object.keys(answers[0]) : 'Aucun élément');

        return {
          content: answers,
          totalElements: response.count || response.items.length,
          totalPages: Math.ceil((response.count || response.items.length) / (criteria.size || 10)),
          size: criteria.size || 10,
          number: criteria.page || 0,
          first: (criteria.page || 0) === 0,
          last: (criteria.page || 0) >= Math.ceil((response.count || response.items.length) / (criteria.size || 10)) - 1,
          empty: response.items.length === 0
        };
      })
    );
  }

  /**
   * Récupère une réponse par son ID
   */
  getAnswerById(id: number): Observable<Answer> {
    console.log('📥 Récupération de la réponse ID:', id);
    return this.http.get<Answer>(`${this.apiUrl}/${id}`).pipe(
      map((response: any) => {
        console.log('🔍 Raw API Response (SINGLE ANSWER):', response);

        // Transformer les données pour correspondre au format attendu par le frontend
        const answer = {
          id: response.id,
          answerText: response.answerContent || response.answerText, // API peut retourner 'answerContent', frontend attend 'answerText'
          questionId: response.questionId,
          questionText: response.questionText || `Question ${response.questionId}`, // Placeholder si pas fourni
          isCorrect: response.isCorrect,
          displayOrder: response.displayOrder,
          isDeleted: response.isDeleted,
          dateCreation: response.createdAt || response.dateCreation,
          dateModification: response.updatedAt || response.dateModification
        };

        console.log('✅ Réponse transformée:', answer);
        return answer;
      })
    );
  }

  /**
   * Crée une nouvelle réponse
   */
  createAnswer(answer: Answer): Observable<Answer> {
    console.log('➕ Création d\'une nouvelle réponse:', answer);

    // Préparer les données pour l'API - utiliser le format attendu par l'API
    const answerData = {
      answerText: answer.answerText, // Frontend utilise 'answerText', API peut attendre 'answerContent'
      questionId: answer.questionId,
      displayOrder: answer.displayOrder || 1
    };

    return this.http.post<Answer>(this.apiUrl, answerData).pipe(
      map((response: any) => {
        console.log('🔍 Raw API Response (CREATE ANSWER):', response);

        // Transformer la réponse pour correspondre au format frontend
        const createdAnswer = {
          id: response.id,
          answerText: response.answerContent || response.answerText,
          questionId: response.questionId,
          questionText: response.questionText || `Question ${response.questionId}`,
          isCorrect: response.isCorrect,
          displayOrder: response.displayOrder,
          isDeleted: response.isDeleted,
          dateCreation: response.createdAt || response.dateCreation,
          dateModification: response.updatedAt || response.dateModification
        };

        console.log('✅ Réponse créée et transformée:', createdAnswer);
        return createdAnswer;
      })
    );
  }

  /**
   * Met à jour une réponse existante
   */
  updateAnswer(id: number, answer: Answer): Observable<Answer> {
    console.log('✏️ Mise à jour de la réponse ID:', id, answer);

    // Préparer les données pour l'API - utiliser le format attendu par l'API
    const answerData = {
      answerText: answer.answerText, // Frontend utilise 'answerText', API peut attendre 'answerContent'
      questionId: answer.questionId,
      displayOrder: answer.displayOrder || 1
    };

    return this.http.put<Answer>(`${this.apiUrl}/${id}`, answerData).pipe(
      map((response: any) => {
        console.log('🔍 Raw API Response (UPDATE ANSWER):', response);

        // Transformer la réponse pour correspondre au format frontend
        const updatedAnswer = {
          id: response.id,
          answerText: response.answerContent || response.answerText,
          questionId: response.questionId,
          questionText: response.questionText || `Question ${response.questionId}`,
          isCorrect: response.isCorrect,
          displayOrder: response.displayOrder,
          isDeleted: response.isDeleted,
          dateCreation: response.createdAt || response.dateCreation,
          dateModification: response.updatedAt || response.dateModification
        };

        console.log('✅ Réponse mise à jour et transformée:', updatedAnswer);
        return updatedAnswer;
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
      map((response: any) => {
        console.log('🔍 Raw API Response (RESTORE ANSWER):', response);

        // Transformer la réponse pour correspondre au format frontend
        const restoredAnswer = {
          id: response.id,
          answerText: response.answerContent || response.answerText,
          questionId: response.questionId,
          questionText: response.questionText || `Question ${response.questionId}`,
          isCorrect: response.isCorrect,
          displayOrder: response.displayOrder,
          isDeleted: response.isDeleted,
          dateCreation: response.createdAt || response.dateCreation,
          dateModification: response.updatedAt || response.dateModification
        };

        console.log('✅ Réponse restaurée et transformée:', restoredAnswer);
        return restoredAnswer;
      })
    );
  }

  /**
   * Récupère toutes les réponses (sans pagination)
   */
  getAllAnswers(): Observable<Answer[]> {
    console.log('📥 Récupération de toutes les réponses');
    return this.http.get<Answer[]>(`${this.apiUrl}/all`).pipe(
      map((response: any[]) => {
        console.log('🔍 Raw API Response (ALL ANSWERS):', response);

        // Transformer les données pour correspondre au format attendu par le frontend
        const answers = response.map((a: any) => ({
          id: a.id,
          answerText: a.answerContent || a.answerText,
          questionId: a.questionId,
          questionText: a.questionText || `Question ${a.questionId}`,
          isCorrect: a.isCorrect,
          displayOrder: a.displayOrder,
          isDeleted: a.isDeleted,
          dateCreation: a.createdAt || a.dateCreation,
          dateModification: a.updatedAt || a.dateModification
        }));

        console.log('✅ Toutes les réponses transformées:', answers.length);
        return answers;
      })
    );
  }

  /**
   * Récupère les réponses par question
   */
  getAnswersByQuestion(questionId: number): Observable<Answer[]> {
    console.log('📥 Récupération des réponses pour la question ID:', questionId);
    return this.http.get<Answer[]>(`${this.apiUrl}/question/${questionId}`).pipe(
      map((response: any[]) => {
        console.log('🔍 Raw API Response (ANSWERS BY QUESTION):', response);

        // Transformer les données pour correspondre au format attendu par le frontend
        const answers = response.map((a: any) => ({
          id: a.id,
          answerText: a.answerContent || a.answerText,
          questionId: a.questionId,
          questionText: a.questionText || `Question ${a.questionId}`,
          isCorrect: a.isCorrect,
          displayOrder: a.displayOrder,
          isDeleted: a.isDeleted,
          dateCreation: a.createdAt || a.dateCreation,
          dateModification: a.updatedAt || a.dateModification
        }));

        console.log('✅ Réponses de la question transformées:', answers.length);
        return answers;
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
      map((response: any[]) => {
        console.log('🔍 Raw API Response (SEARCH ANSWERS):', response);

        // Transformer les données pour correspondre au format attendu par le frontend
        const answers = response.map((a: any) => ({
          id: a.id,
          answerText: a.answerContent || a.answerText,
          questionId: a.questionId,
          questionText: a.questionText || `Question ${a.questionId}`,
          isCorrect: a.isCorrect,
          displayOrder: a.displayOrder,
          isDeleted: a.isDeleted,
          dateCreation: a.createdAt || a.dateCreation,
          dateModification: a.updatedAt || a.dateModification
        }));

        console.log('✅ Résultats de recherche transformés:', answers.length);
        return answers;
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
      map((response: any) => {
        console.log('🔍 Raw API Response (DUPLICATE ANSWER):', response);

        // Transformer la réponse pour correspondre au format frontend
        const duplicatedAnswer = {
          id: response.id,
          answerText: response.answerContent || response.answerText,
          questionId: response.questionId,
          questionText: response.questionText || `Question ${response.questionId}`,
          isCorrect: response.isCorrect,
          displayOrder: response.displayOrder,
          isDeleted: response.isDeleted,
          dateCreation: response.createdAt || response.dateCreation,
          dateModification: response.updatedAt || response.dateModification
        };

        console.log('✅ Réponse dupliquée et transformée:', duplicatedAnswer);
        return duplicatedAnswer;
      })
    );
  }

  /**
   * Met à jour le statut d'une réponse (activée/désactivée)
   */
  updateAnswerStatus(id: number, isActive: boolean): Observable<Answer> {
    console.log('🔄 Mise à jour du statut de la réponse ID:', id, 'actif:', isActive);
    return this.http.patch<Answer>(`${this.apiUrl}/${id}/status`, { isActive }).pipe(
      map((response: any) => {
        console.log('🔍 Raw API Response (UPDATE STATUS):', response);

        // Transformer la réponse pour correspondre au format frontend
        const updatedAnswer = {
          id: response.id,
          answerText: response.answerContent || response.answerText,
          questionId: response.questionId,
          questionText: response.questionText || `Question ${response.questionId}`,
          isCorrect: response.isCorrect,
          displayOrder: response.displayOrder,
          isDeleted: response.isDeleted,
          dateCreation: response.createdAt || response.dateCreation,
          dateModification: response.updatedAt || response.dateModification
        };

        console.log('✅ Statut mis à jour et réponse transformée:', updatedAnswer);
        return updatedAnswer;
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