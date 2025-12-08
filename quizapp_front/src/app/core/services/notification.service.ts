import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

/**
 * Interface pour les notifications de la base de données
 */
export interface DbNotification {
  id: number;
  notifType: string;
  notifActor: number;
  notifLink: string;
  isRead: boolean;
  userId: number;
  objectTableName?: string; // Nom de la table de l'objet lié (ex: 'campaigns', 'applications')
  objectTableId?: number; // ID de l'objet dans la table
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  actorName?: string; // Nom de l'acteur (utilisateur qui a fait l'action)
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  // Signal pour les notifications toast actives
  notifications = signal<Notification[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Affiche une notification
   */
  show(notification: Omit<Notification, 'id'>): void {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification
    };

    // Ajouter la notification
    this.notifications.update(notifications => [...notifications, newNotification]);

    // Supprimer automatiquement après la durée spécifiée
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newNotification.duration);
    }
  }

  /**
   * Supprime une notification
   */
  remove(id: string): void {
    this.notifications.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }

  /**
   * Supprime toutes les notifications
   */
  clear(): void {
    this.notifications.set([]);
  }

  /**
   * Méthodes de raccourci pour les types de notifications courantes
   */
  success(title: string, message: string, duration?: number): void {
    this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number): void {
    this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number): void {
    this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number): void {
    this.show({ type: 'info', title, message, duration });
  }

  /**
   * ==================================================================
   * MÉTHODES POUR LES NOTIFICATIONS DE LA BASE DE DONNÉES
   * ==================================================================
   */

  /**
   * Récupère les notifications d'un utilisateur depuis la BD
   */
  getUserNotifications(userId: number): Observable<DbNotification[]> {
    console.log('📬 Chargement des notifications pour userId:', userId);

    const requestBody = {
      user: 1,
      data: {
        userId: userId
      },
      index: 0,
      size: 50 // Charger les 50 dernières notifications
    };

    return this.http.post<any>(`${environment.apiUrl}/notifications/getByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Notifications récupérées:', response);
        if (response && response.items) {
          return response.items;
        }
        return [];
      }),
      catchError(error => {
        console.error('❌ Erreur lors du chargement des notifications:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Marque une notification comme lue
   */
  markAsRead(notificationId: number): Observable<any> {
    console.log('📖 Marquage notification comme lue:', notificationId);

    const requestBody = {
      user: 1,
      data: {
        id: notificationId,
        isRead: true
      }
    };

    return this.http.post<any>(`${environment.apiUrl}/notifications/update`, requestBody).pipe(
      map(response => {
        console.log('✅ Notification marquée comme lue:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur lors du marquage de la notification:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   */
  markAllAsRead(userId: number, notificationIds: number[]): Observable<any> {
    console.log('📖 Marquage de toutes les notifications comme lues pour userId:', userId);

    const requestBody = {
      user: 1,
      datas: notificationIds.map(id => ({
        id: id,
        isRead: true
      }))
    };

    return this.http.post<any>(`${environment.apiUrl}/notifications/update`, requestBody).pipe(
      map(response => {
        console.log('✅ Toutes les notifications marquées comme lues:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur lors du marquage des notifications:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crée une notification pour un utilisateur
   */
  createDbNotification(notificationData: {
    notifType: string;
    notifActor: number;
    notifLink?: string;
    userId: number;
    objectTableName?: string;
    objectTableId?: number;
  }): Observable<any> {
    console.log('📬 Création notification BD:', notificationData);

    const requestBody = {
      user: 1,
      datas: [{
        ...notificationData,
        isRead: false
      }]
    };

    console.log('📤 Corps de la requête notification:', requestBody);

    return this.http.post<any>(`${environment.apiUrl}/notifications/create`, requestBody).pipe(
      map(response => {
        console.log('✅ Notification BD créée:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur création notification BD:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crée plusieurs notifications en une seule requête
   */
  createMultipleDbNotifications(notifications: Array<{
    notifType: string;
    notifActor: number;
    notifLink?: string;
    userId: number;
    objectTableName?: string;
    objectTableId?: number;
  }>): Observable<any> {
    console.log('📬 Création de plusieurs notifications BD:', notifications);

    const requestBody = {
      user: 1,
      datas: notifications.map(n => ({
        ...n,
        isRead: false
      }))
    };

    console.log('📤 Corps de la requête notifications multiples:', requestBody);

    return this.http.post<any>(`${environment.apiUrl}/notifications/create`, requestBody).pipe(
      map(response => {
        console.log('✅ Notifications BD créées:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur création notifications BD:', error);
        return throwError(() => error);
      })
    );
  }
}
