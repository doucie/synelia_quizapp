import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interface pour les questions (même que dans le composant)
export interface Question {
  id: number;
  questionText?: string;
  specialityId?: number;
  specialityName?: string;
  questionType?: string; // SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, TEXT
  difficultyLevel?: string; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  points?: number;
  timeLimit?: number;
  isDeleted?: boolean;
  dateCreation?: string;
  dateModification?: string;
}

// Interface pour les critères de recherche des questions
export interface QuestionSearchCriteria {
  // Frontend field names
  idDe?: string;
  idA?: string;
  questionText?: string;
  specialityId?: number;
  questionType?: string;
  difficultyLevel?: string;
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
export class QuestionService {

  private readonly apiUrl = `${environment.apiUrl}/questions`;

  constructor(private http: HttpClient) {
    console.log('🚀 Initialisation QuestionService');
    console.log('📡 URL de l\'API:', this.apiUrl);
  }

  /**
   * Récupère toutes les questions avec critères de recherche
   */
  getAllQuestionsByCriteria(criteria: QuestionSearchCriteria): Observable<PagedResponse<Question>> {
    console.log('📥 Récupération des questions avec critères:', criteria);

    let params = new HttpParams();

    // Ajouter les paramètres de recherche
    if (criteria.idDe) params = params.set('idDe', criteria.idDe);
    if (criteria.idA) params = params.set('idA', criteria.idA);
    if (criteria.questionText) params = params.set('questionText', criteria.questionText);
    if (criteria.specialityId) params = params.set('specialityId', criteria.specialityId.toString());
    if (criteria.questionType) params = params.set('questionType', criteria.questionType);
    if (criteria.difficultyLevel) params = params.set('difficultyLevel', criteria.difficultyLevel);
    if (criteria.isDeleted !== undefined) params = params.set('isDeleted', criteria.isDeleted.toString());
    if (criteria.search_string) params = params.set('search_string', criteria.search_string);

    // Paramètres de pagination
    if (criteria.size) params = params.set('size', criteria.size.toString());
    if (criteria.page !== undefined) params = params.set('page', criteria.page.toString());

    console.log('🔍 Paramètres HTTP:', params.toString());

    return this.http.get<PagedResponse<Question>>(this.apiUrl, { params }).pipe(
      map(response => {
        console.log('✅ Réponse reçue:', response);
        return response;
      })
    );
  }

  /**
   * Récupère une question par son ID
   */
  getQuestionById(id: number): Observable<Question> {
    console.log('📥 Récupération de la question ID:', id);
    return this.http.get<Question>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        console.log('✅ Question récupérée:', response);
        return response;
      })
    );
  }

  /**
   * Crée une nouvelle question
   */
  createQuestion(question: Question): Observable<Question> {
    console.log('➕ Création d\'une nouvelle question:', question);

    // Préparer les données pour l'API
    const questionData = {
      questionText: question.questionText,
      specialityId: question.specialityId,
      questionType: question.questionType,
      difficultyLevel: question.difficultyLevel,
      points: question.points || 0,
      timeLimit: question.timeLimit || 0
    };

    return this.http.post<Question>(this.apiUrl, questionData).pipe(
      map(response => {
        console.log('✅ Question créée:', response);
        return response;
      })
    );
  }

  /**
   * Met à jour une question existante
   */
  updateQuestion(id: number, question: Question): Observable<Question> {
    console.log('✏️ Mise à jour de la question ID:', id, question);

    // Préparer les données pour l'API
    const questionData = {
      questionText: question.questionText,
      specialityId: question.specialityId,
      questionType: question.questionType,
      difficultyLevel: question.difficultyLevel,
      points: question.points || 0,
      timeLimit: question.timeLimit || 0
    };

    return this.http.put<Question>(`${this.apiUrl}/${id}`, questionData).pipe(
      map(response => {
        console.log('✅ Question mise à jour:', response);
        return response;
      })
    );
  }

  /**
   * Supprime une question (soft delete)
   */
  deleteQuestion(id: number): Observable<void> {
    console.log('🗑️ Suppression de la question ID:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        console.log('✅ Question supprimée');
      })
    );
  }

  /**
   * Restaure une question supprimée
   */
  restoreQuestion(id: number): Observable<Question> {
    console.log('♻️ Restauration de la question ID:', id);
    return this.http.patch<Question>(`${this.apiUrl}/${id}/restore`, {}).pipe(
      map(response => {
        console.log('✅ Question restaurée:', response);
        return response;
      })
    );
  }

  /**
   * Vérifie si une question peut être supprimée (pas d'associations)
   */
  checkAssociatedAnswers(questionId: number): Observable<{ canDelete: boolean; associatedCount: number }> {
    console.log('🔍 Vérification des réponses associées pour la question ID:', questionId);
    return this.http.get<{ canDelete: boolean; associatedCount: number }>(`${this.apiUrl}/${questionId}/check-answers`).pipe(
      map(response => {
        console.log('✅ Vérification terminée:', response);
        return response;
      })
    );
  }

  /**
   * Récupère toutes les questions (sans pagination)
   */
  getAllQuestions(): Observable<Question[]> {
    console.log('📥 Récupération de toutes les questions');
    return this.http.get<Question[]>(`${this.apiUrl}/all`).pipe(
      map(response => {
        console.log('✅ Toutes les questions récupérées:', response.length);
        return response;
      })
    );
  }

  /**
   * Récupère les questions par spécialité
   */
  getQuestionsBySpeciality(specialityId: number): Observable<Question[]> {
    console.log('📥 Récupération des questions pour la spécialité ID:', specialityId);
    return this.http.get<Question[]>(`${this.apiUrl}/speciality/${specialityId}`).pipe(
      map(response => {
        console.log('✅ Questions de la spécialité récupérées:', response.length);
        return response;
      })
    );
  }

  /**
   * Récupère les questions par type
   */
  getQuestionsByType(questionType: string): Observable<Question[]> {
    console.log('📥 Récupération des questions de type:', questionType);
    return this.http.get<Question[]>(`${this.apiUrl}/type/${questionType}`).pipe(
      map(response => {
        console.log('✅ Questions du type récupérées:', response.length);
        return response;
      })
    );
  }

  /**
   * Récupère les questions par niveau de difficulté
   */
  getQuestionsByDifficulty(difficultyLevel: string): Observable<Question[]> {
    console.log('📥 Récupération des questions de difficulté:', difficultyLevel);
    return this.http.get<Question[]>(`${this.apiUrl}/difficulty/${difficultyLevel}`).pipe(
      map(response => {
        console.log('✅ Questions de difficulté récupérées:', response.length);
        return response;
      })
    );
  }

  /**
   * Recherche des questions par texte
   */
  searchQuestions(searchText: string): Observable<Question[]> {
    console.log('🔍 Recherche de questions avec le texte:', searchText);
    const params = new HttpParams().set('search', searchText);
    return this.http.get<Question[]>(`${this.apiUrl}/search`, { params }).pipe(
      map(response => {
        console.log('✅ Résultats de recherche:', response.length);
        return response;
      })
    );
  }

  /**
   * Exporte les questions au format CSV
   */
  exportQuestions(criteria?: QuestionSearchCriteria): Observable<Blob> {
    console.log('📤 Export des questions');

    let params = new HttpParams();
    if (criteria) {
      if (criteria.questionText) params = params.set('questionText', criteria.questionText);
      if (criteria.specialityId) params = params.set('specialityId', criteria.specialityId.toString());
      if (criteria.questionType) params = params.set('questionType', criteria.questionType);
      if (criteria.difficultyLevel) params = params.set('difficultyLevel', criteria.difficultyLevel);
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
   * Importe des questions depuis un fichier CSV
   */
  importQuestions(file: File): Observable<{ imported: number; errors: string[] }> {
    console.log('📥 Import de questions depuis le fichier:', file.name);

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
   * Duplique une question
   */
  duplicateQuestion(id: number): Observable<Question> {
    console.log('📋 Duplication de la question ID:', id);
    return this.http.post<Question>(`${this.apiUrl}/${id}/duplicate`, {}).pipe(
      map(response => {
        console.log('✅ Question dupliquée:', response);
        return response;
      })
    );
  }

  /**
   * Met à jour le statut d'une question (activée/désactivée)
   */
  updateQuestionStatus(id: number, isActive: boolean): Observable<Question> {
    console.log('🔄 Mise à jour du statut de la question ID:', id, 'actif:', isActive);
    return this.http.patch<Question>(`${this.apiUrl}/${id}/status`, { isActive }).pipe(
      map(response => {
        console.log('✅ Statut mis à jour:', response);
        return response;
      })
    );
  }

  /**
   * Valide une question avant sauvegarde
   */
  validateQuestion(question: Question): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!question.questionText || question.questionText.trim().length === 0) {
      errors.push('Le texte de la question est requis');
    }

    if (!question.specialityId) {
      errors.push('La spécialité est requise');
    }

    if (!question.questionType) {
      errors.push('Le type de question est requis');
    }

    if (!question.difficultyLevel) {
      errors.push('Le niveau de difficulté est requis');
    }

    if (question.points !== undefined && (question.points < 0 || question.points > 100)) {
      errors.push('Les points doivent être entre 0 et 100');
    }

    if (question.timeLimit !== undefined && question.timeLimit < 0) {
      errors.push('Le temps limite ne peut pas être négatif');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Nettoie les données d'une question avant envoi à l'API
   */
  sanitizeQuestion(question: Question): Question {
    return {
      ...question,
      questionText: question.questionText?.trim(),
      points: question.points || 0,
      timeLimit: question.timeLimit || 0
    };
  }
}