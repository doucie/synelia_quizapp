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
 * Interface pour les notifications de la base de donnÃ©es
 */
export interface DbNotification {
  id: number;
  notifType: string;
  notifActor: number;
  notifLink: string;
  isRead: boolean;
  userId: number;
  objectTableName?: string; // Nom de la table de l'objet liÃ© (ex: 'campaigns', 'applications')
  objectTableId?: number; // ID de l'objet dans la table
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
  actorName?: string; // Nom de l'acteur (utilisateur qui a fait l'action)
}

export interface NotificationSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  userId?: number;
  notifType?: string;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface PagedNotificationResponse {
  content: DbNotification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
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

    // Supprimer automatiquement aprÃ¨s la durÃ©e spÃ©cifiÃ©e
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
   * MÃ©thodes de raccourci pour les types de notifications courantes
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
   * MÃ‰THODES POUR LES NOTIFICATIONS DE LA BASE DE DONNÃ‰ES
   * ==================================================================
   */

  /**
   * RÃ©cupÃ¨re les notifications d'un utilisateur depuis la BD
   */
  getUserNotifications(userId: number): Observable<DbNotification[]> {
    console.log('ðŸ“¬ Chargement des notifications pour userId:', userId);

    const requestBody = {
      user: 1,
      data: {
        userId: userId
      },
      index: 0,
      size: 50 // Charger les 50 derniÃ¨res notifications
    };

    return this.http.post<any>(`${environment.apiUrl}/notifications/getByCriteria`, requestBody).pipe(
      map(response => {
        console.log('âœ… Notifications rÃ©cupÃ©rÃ©es:', response);
        if (response && response.items) {
          return response.items;
        }
        return [];
      }),
      catchError(error => {
        console.error('âŒ Erreur lors du chargement des notifications:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Marque une notification comme lue
   */
  markAsRead(notificationId: number): Observable<any> {
    console.log('ðŸ“– Marquage notification comme lue:', notificationId);

    const requestBody = {
      user: 1,
      data: {
        id: notificationId,
        isRead: true
      }
    };

    return this.http.post<any>(`${environment.apiUrl}/notifications/update`, requestBody).pipe(
      map(response => {
        console.log('âœ… Notification marquÃ©e comme lue:', response);
        return response;
      }),
      catchError(error => {
        console.error('âŒ Erreur lors du marquage de la notification:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   */
  markAllAsRead(userId: number, notificationIds: number[]): Observable<any> {
    console.log('ðŸ“– Marquage de toutes les notifications comme lues pour userId:', userId);

    const requestBody = {
      user: 1,
      datas: notificationIds.map(id => ({
        id: id,
        isRead: true
      }))
    };

    return this.http.post<any>(`${environment.apiUrl}/notifications/update`, requestBody).pipe(
      map(response => {
        console.log('âœ… Toutes les notifications marquÃ©es comme lues:', response);
        return response;
      }),
      catchError(error => {
        console.error('âŒ Erreur lors du marquage des notifications:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * CrÃ©e une notification pour un utilisateur
   */
  createDbNotification(notificationData: {
    notifType: string;
    notifActor: number;
    notifLink?: string;
    userId: number;
    objectTableName?: string;
    objectTableId?: number;
  }): Observable<any> {
    console.log('ðŸ“¬ CrÃ©ation notification BD:', notificationData);

    const requestBody = {
      user: 1,
      datas: [{
        ...notificationData,
        isRead: false
      }]
    };

    console.log('ðŸ“¤ Corps de la requÃªte notification:', requestBody);

    return this.http.post<any>(`${environment.apiUrl}/notifications/create`, requestBody).pipe(
      map(response => {
        console.log('âœ… Notification BD crÃ©Ã©e:', response);
        return response;
      }),
      catchError(error => {
        console.error('âŒ Erreur crÃ©ation notification BD:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * CrÃ©e plusieurs notifications en une seule requÃªte
   */
  createMultipleDbNotifications(notifications: Array<{
    notifType: string;
    notifActor: number;
    notifLink?: string;
    userId: number;
    objectTableName?: string;
    objectTableId?: number;
  }>): Observable<any> {
    console.log('ðŸ“¬ CrÃ©ation de plusieurs notifications BD:', notifications);

    const requestBody = {
      user: 1,
      datas: notifications.map(n => ({
        ...n,
        isRead: false
      }))
    };

    console.log('ðŸ“¤ Corps de la requÃªte notifications multiples:', requestBody);

    return this.http.post<any>(`${environment.apiUrl}/notifications/create`, requestBody).pipe(
      map(response => {
        console.log('âœ… Notifications BD crÃ©Ã©es:', response);
        return response;
      }),
      catchError(error => {
        console.error('âŒ Erreur crÃ©ation notifications BD:', error);
        return throwError(() => error);
      })
    );
  }

  getAllNotificationsByCriteria(criteria: NotificationSearchCriteria = {}): Observable<PagedNotificationResponse> {
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || '1' : '1';
    const request = {
      user: currentUserId,
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        id: criteria.idDe || '',
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.userId && { userId: criteria.userId }),
        ...(criteria.notifType && { notifType: criteria.notifType }),
                ...(criteria.dateCreationDe && { dateCreationDe: criteria.dateCreationDe }),
        ...(criteria.dateCreationA && { dateCreationA: criteria.dateCreationA }),
        ...(criteria.dateModificationDe && { dateModificationDe: criteria.dateModificationDe }),
        ...(criteria.dateModificationA && { dateModificationA: criteria.dateModificationA }),
        ...(criteria.idDe && criteria.idDe.trim() && { idStart: criteria.idDe }),
        ...(criteria.idA && criteria.idA.trim() && { idEnd: criteria.idA })
      }
    };
    return this.http.post<any>(`${environment.apiUrl}/notifications/getAllByCriteria`, request).pipe(
      map(response => {
        if (!response || (!response.items && !response.item)) {
          return { content: [], totalElements: 0, totalPages: 0, size: criteria.size || 10, number: criteria.page || 0 };
        }
        const items = response.items || (response.item ? [response.item] : []);
        const totalElements = response.totalCount || response.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements, totalPages: Math.ceil(totalElements / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(error => { console.error('Erreur notifications:', error); return throwError(() => error); })
    );
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/notifications/delete`, { user: 1, datas: [{ id }] });
  }

  restoreNotification(id: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/notifications/update`, { user: 1, datas: [{ id, isDeleted: false }] });
  }
}
