import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interface pour la réponse d'upload de fichier
 */
export interface FileUploadResponse {
  success: boolean;
  filePath?: string;
  fileName?: string;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly baseUrl = environment.apiUrl || 'http://localhost:8080';
  private readonly uploadUrl = `${this.baseUrl}/files/upload`;

  // Types de fichiers acceptés pour les CV
  private readonly ACCEPTED_CV_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  private readonly ACCEPTED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];
  
  // Taille maximale : 5 Mo
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes

  constructor(private http: HttpClient) {}

  /**
   * Valide un fichier CV
   * @param file Fichier à valider
   * @returns Object avec isValid et errorMessage
   */
  validateCvFile(file: File): { isValid: boolean; errorMessage?: string } {
    // Vérifier la taille
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        errorMessage: `Le fichier est trop volumineux. La taille maximale autorisée est de 5 Mo. Votre fichier fait ${(file.size / 1024 / 1024).toFixed(2)} Mo.`
      };
    }

    // Vérifier le type MIME
    if (!this.ACCEPTED_CV_TYPES.includes(file.type)) {
      return {
        isValid: false,
        errorMessage: 'Type de fichier non supporté. Veuillez utiliser un fichier PDF, DOC ou DOCX.'
      };
    }

    // Vérifier l'extension
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!this.ACCEPTED_CV_EXTENSIONS.includes(fileExtension)) {
      return {
        isValid: false,
        errorMessage: 'Extension de fichier non supportée. Veuillez utiliser un fichier avec l\'extension .pdf, .doc ou .docx.'
      };
    }

    return { isValid: true };
  }

  /**
   * Upload un fichier CV
   * @param file Fichier à uploader
   * @param candidateEmail Email du candidat (pour organiser les fichiers)
   * @returns Observable<FileUploadResponse>
   */
  uploadCvFile(file: File, candidateEmail: string): Observable<FileUploadResponse> {
    // Validation du fichier
    const validation = this.validateCvFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errorMessage);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidateEmail', candidateEmail);
    formData.append('fileType', 'cv');

    // Pour l'upload de fichiers, on n'utilise pas Content-Type: application/json
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    return this.http.post<FileUploadResponse>(`${this.uploadUrl}/cv`, formData, { headers });
  }

  /**
   * Méthode temporaire pour simuler l'upload (à utiliser si l'endpoint d'upload n'est pas encore implémenté)
   * @param file Fichier à "uploader"
   * @param candidateEmail Email du candidat
   * @returns Promise<FileUploadResponse>
   */
  simulateUpload(file: File, candidateEmail: string): Promise<FileUploadResponse> {
    return new Promise((resolve, reject) => {
      // Validation du fichier
      const validation = this.validateCvFile(file);
      if (!validation.isValid) {
        reject(new Error(validation.errorMessage));
        return;
      }

      // Simuler un délai d'upload
      setTimeout(() => {
        // Générer un chemin de fichier simulé
        const timestamp = new Date().getTime();
        const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
        const simulatedPath = `uploads/cv/${candidateEmail.replace('@', '_at_').replace('.', '_')}_${timestamp}${fileExtension}`;

        resolve({
          success: true,
          filePath: simulatedPath,
          fileName: file.name,
          message: 'Fichier uploadé avec succès (simulation)'
        });
      }, 1500); // Simuler 1.5 seconde d'upload
    });
  }

  /**
   * Formate la taille d'un fichier en format lisible
   * @param bytes Taille en bytes
   * @returns String formatée (ex: "2.5 Mo")
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 o';
    
    const sizes = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}