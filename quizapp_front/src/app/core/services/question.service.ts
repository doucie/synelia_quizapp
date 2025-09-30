import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
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
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: number;
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

  private readonly apiUrl = '/questions';

  constructor(private http: HttpClient) {
    console.log('🚀 Initialisation QuestionService');
    console.log('📡 URL de l\'API:', this.apiUrl);
  }

  /**
   * Récupère toutes les questions avec critères de recherche
   */
  getAllQuestionsByCriteria(criteria: QuestionSearchCriteria): Observable<PagedResponse<Question>> {
    console.log('📥 Récupération des questions avec critères:', criteria);

    // Préparer le corps de la requête selon le format API backend
    const requestBody = {
      user: "1", // ID utilisateur par défaut
      size: criteria.size || 10,
      index: criteria.page || 0,
      data: criteria // Les critères de recherche dans data
    };

    console.log('🔍 Corps de la requête:', requestBody);

    return this.http.post<any>(`${this.apiUrl}/getByCriteria`, requestBody).pipe(
      map((response: any) => {
        console.log('🔍 Raw API Response (QUESTIONS):', response);
        console.log('🔍 Response keys:', Object.keys(response));
        console.log('🔍 Response.hasError:', response.hasError);
        console.log('🔍 Response.status:', response.status);
        console.log('🔍 Response.items exists:', !!response.items);
        console.log('🔍 Response.items length:', response.items?.length);
        console.log('🔍 Response.content exists:', !!response.content);
        console.log('🔍 Response.content length:', response.content?.length);
        console.log('✅ Réponse reçue:', response);

        // Transformer la réponse backend vers le format frontend attendu
        if (!response || response.hasError) {
          console.warn('⚠️ Erreur dans la réponse API ou aucune donnée');
          return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: criteria.size || 10,
            number: criteria.page || 0,
            first: true,
            last: true,
            empty: true
          };
        }

        // L'API retourne 'items', mais le frontend attend 'content'
        const rawQuestions = response.items || response.content || [];

        // Transformer les données pour correspondre au format attendu par le frontend
        const questions = rawQuestions.map((q: any) => ({
          id: q.id,
          questionText: q.questionContent, // API retourne 'questionContent', frontend attend 'questionText'
          specialityId: q.specialityId,
          specialityName: q.specialityName || `Spécialité ${q.specialityId}`, // Placeholder temporaire
          questionType: q.questionType,
          difficultyLevel: q.difficultyLevel,
          points: q.points,
          timeLimit: q.questionChrono, // API retourne 'questionChrono', interface utilise 'timeLimit'
          isDeleted: q.isDeleted,
          dateCreation: q.createdAt,
          dateModification: q.updatedAt,
          questionChrono: q.questionChrono
        }));

        console.log('🔍 Premier élément des questions transformées:', questions[0]);
        console.log('🔍 Propriétés du premier élément transformé:', questions[0] ? Object.keys(questions[0]) : 'Aucun élément');
        console.log('🔍 Valeurs du premier élément transformé:', questions[0] ? JSON.stringify(questions[0], null, 2) : 'Aucun élément');

        return {
          content: questions,
          totalElements: response.count || response.totalElements || questions.length,
          totalPages: response.totalPages || Math.ceil((response.count || questions.length) / (criteria.size || 10)),
          size: criteria.size || 10,
          number: criteria.page || 0,
          first: (criteria.page || 0) === 0,
          last: (criteria.page || 0) >= Math.ceil((response.count || questions.length) / (criteria.size || 10)) - 1,
          empty: questions.length === 0
        };
      })
    );
  }

  /**
   * Récupère une question par son ID
   */
  getQuestionById(id: number): Observable<Question> {
    console.log('📥 Récupération de la question ID:', id);

    // Préparer le corps de la requête pour récupérer une question spécifique
    const requestBody = {
      user: "1",
      size: 1,
      index: 0,
      data: { id: id }
    };

    return this.http.post<PagedResponse<Question>>(`${this.apiUrl}/getByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Question récupérée:', response);
        if (response.content && response.content.length > 0) {
          return response.content[0];
        } else {
          throw new Error('Question not found');
        }
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

    // Préparer le corps de la requête pour récupérer toutes les questions
    const requestBody = {
      user: "1",
      size: 1000, // Grande taille pour récupérer toutes les questions
      index: 0,
      data: {}
    };

    return this.http.post<PagedResponse<Question>>(`${this.apiUrl}/getByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Toutes les questions récupérées:', response?.content?.length || 0);
        return response?.content || [];
      })
    );
  }

  /**
   * Récupère les questions par spécialité
   */
  getQuestionsBySpeciality(specialityId: number): Observable<Question[]> {
    console.log('📥 Récupération des questions pour la spécialité ID:', specialityId);

    // Préparer le corps de la requête pour récupérer les questions d'une spécialité
    const requestBody = {
      user: "1",
      size: 1000,
      index: 0,
      data: { specialityId: specialityId }
    };

    return this.http.post<PagedResponse<Question>>(`${this.apiUrl}/getByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Questions de la spécialité récupérées:', response.content.length);
        return response.content;
      })
    );
  }

  /**
   * Récupère les questions par type
   */
  getQuestionsByType(questionType: string): Observable<Question[]> {
    console.log('📥 Récupération des questions de type:', questionType);

    // Préparer le corps de la requête pour récupérer les questions d'un type
    const requestBody = {
      user: "1",
      size: 1000,
      index: 0,
      data: { questionType: questionType }
    };

    return this.http.post<PagedResponse<Question>>(`${this.apiUrl}/getByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Questions du type récupérées:', response.content.length);
        return response.content;
      })
    );
  }

  /**
   * Récupère les questions par niveau de difficulté
   */
  getQuestionsByDifficulty(difficultyLevel: string): Observable<Question[]> {
    console.log('📥 Récupération des questions de difficulté:', difficultyLevel);

    // Préparer le corps de la requête pour récupérer les questions d'un niveau de difficulté
    const requestBody = {
      user: "1",
      size: 1000,
      index: 0,
      data: { difficultyLevel: difficultyLevel }
    };

    return this.http.post<PagedResponse<Question>>(`${this.apiUrl}/getByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Questions de difficulté récupérées:', response.content.length);
        return response.content;
      })
    );
  }

  /**
   * Recherche des questions par texte
   */
  searchQuestions(searchText: string): Observable<Question[]> {
    console.log('🔍 Recherche de questions avec le texte:', searchText);

    // Préparer le corps de la requête pour rechercher des questions
    const requestBody = {
      user: "1",
      size: 1000,
      index: 0,
      data: { search_string: searchText }
    };

    return this.http.post<PagedResponse<Question>>(`${this.apiUrl}/getByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Résultats de recherche:', response.content.length);
        return response.content;
      })
    );
  }

  /**
   * Exporte les questions au format CSV
   */
  exportQuestions(criteria?: QuestionSearchCriteria): Observable<Blob> {
    console.log('📤 Export des questions');

    // Préparer le corps de la requête pour l'export
    const requestBody = {
      data: criteria || {},
      size: 10000, // Grande taille pour l'export
      page: 0,
      export: true
    };

    return this.http.post(`${this.apiUrl}/getByCriteria`, requestBody, {
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
   * Récupère TOUTES les questions selon des critères (y compris les supprimées)
   * @param criteria critères de recherche optionnels
   * @returns Observable de la liste paginée de questions incluant les supprimées
   */
  getAllQuestionsIncludingDeleted(criteria: QuestionSearchCriteria = {}): Observable<PagedResponse<Question>> {
    // Récupérer l'ID de l'utilisateur connecté depuis localStorage pour éviter la dépendance circulaire
    const currentUserData = localStorage.getItem('currentUser');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || "1" : "1";

    // Construction de la requête selon le format backend attendu
    const request = {
      // ID de l'utilisateur connecté (requis)
      user: currentUserId,
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      // Données de critères avec tous les champs QuestionDto
      data: {
        id: criteria.idDe || "",  // On utilise idDe comme critère principal pour l'ID
        questionText: criteria.questionText || "",
        specialityId: criteria.specialityId?.toString() || "",
        questionType: criteria.questionType || "",
        difficultyLevel: criteria.difficultyLevel || "",
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : "",
        searchString: criteria.search_string || "",

        // Intervalles d'ID (champs supplémentaires pour le backend)
        idStart: criteria.idDe || "",
        idEnd: criteria.idA || ""
      }
    };

    console.log('🚀 Envoi de la requête getAllQuestionsIncludingDeleted (including deleted):', request);
    console.log('🔍 DÉTAIL de la requête:');
    console.log('  - user (ID connecté):', request.user);
    console.log('  - size (taille page):', request.size);
    console.log('  - index (page):', request.index);
    console.log('  - data.isDeleted:', request.data.isDeleted);
    console.log('  - data complet:', request.data);

    return this.http.post<any>(`${this.apiUrl}/getAllByCriteria`, request).pipe(
      map(response => {
        console.log('🔍 Raw API Response (ALL QUESTIONS):', response);
        console.log('🔍 Response keys:', Object.keys(response));
        console.log('🔍 Response.count:', response.count);
        console.log('🔍 Response.totalCount:', response.totalCount); // ← Nouveau champ !
        console.log('🔍 Response.totalElements:', response.totalElements);
        console.log('🔍 Response.total:', response.total);
        console.log('🔍 Response.items.length:', response.items?.length);

        // Vérifier si la réponse contient des données
        if (!response || (!response.items && !response.item)) {
          console.warn('⚠️ Aucune donnée dans la réponse');
          return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: criteria.size || 10,
            number: criteria.page || 0,
            first: true,
            last: true,
            empty: true
          };
        }

        // Traiter les éléments (items ou item unique)
        const rawQuestions = response.items || (response.item ? [response.item] : []);

        // Transformer la réponse du backend vers le format frontend
        const transformedQuestions: Question[] = rawQuestions.map((q: any) => ({
          id: q.id,
          questionText: q.questionContent || q.questionText || '',
          specialityId: q.specialityId,
          specialityName: q.specialityName || `Spécialité ${q.specialityId}`,
          questionType: q.questionType,
          difficultyLevel: q.difficultyLevel,
          points: q.points,
          timeLimit: q.questionChrono || q.timeLimit, // API retourne 'questionChrono', interface utilise 'timeLimit'
          isDeleted: q.isDeleted || false, // ← Important : inclure le statut de suppression
          dateCreation: q.createdAt || q.dateCreation,
          dateModification: q.updatedAt || q.dateModification
        }));

        console.log('📊 Questions transformées (including deleted):', transformedQuestions);

        return {
          content: transformedQuestions,
          totalElements: response.totalCount || response.count || rawQuestions.length, // Utiliser totalCount en priorité
          totalPages: Math.ceil((response.totalCount || response.count || rawQuestions.length) / (criteria.size || 10)),
          size: criteria.size || 10,
          number: criteria.page || 0,
          first: (criteria.page || 0) === 0,
          last: (criteria.page || 0) >= Math.ceil((response.totalCount || response.count || rawQuestions.length) / (criteria.size || 10)) - 1,
          empty: transformedQuestions.length === 0
        };
      }),
      catchError((error: any) => {
        console.error('❌ Erreur lors de la récupération de TOUTES les questions:', error);
        console.error('❌ Détails de l\'erreur:', error.error);
        return throwError(() => error);
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