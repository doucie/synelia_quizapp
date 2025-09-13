import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      @for (notification of notifications(); track notification.id) {
        <div 
          class="notification" 
          [class]="'notification--' + notification.type"
          (click)="close(notification.id)"
        >
          <div class="notification__icon">
            @switch (notification.type) {
              @case ('success') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              }
              @case ('error') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              }
              @case ('warning') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              }
              @default {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              }
            }
          </div>
          <div class="notification__content">
            <div class="notification__title">{{ notification.title }}</div>
            <div class="notification__message">{{ notification.message }}</div>
          </div>
          <button class="notification__close" (click)="close(notification.id); $event.stopPropagation()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .notification {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      background: var(--mono-bg);
      border: 1px solid var(--mono-borders);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
      transition: all 0.2s ease;
    }

    .notification:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 12px -1px rgba(0, 0, 0, 0.15);
    }

    .notification--success {
      border-left: 4px solid #10B981;
    }

    .notification--success .notification__icon {
      color: #10B981;
    }

    .notification--error {
      border-left: 4px solid #EF4444;
    }

    .notification--error .notification__icon {
      color: #EF4444;
    }

    .notification--warning {
      border-left: 4px solid #F59E0B;
    }

    .notification--warning .notification__icon {
      color: #F59E0B;
    }

    .notification--info {
      border-left: 4px solid #3B82F6;
    }

    .notification--info .notification__icon {
      color: #3B82F6;
    }

    .notification__icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .notification__content {
      flex: 1;
      min-width: 0;
    }

    .notification__title {
      font-weight: 600;
      font-size: 14px;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .notification__message {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .notification__close {
      flex-shrink: 0;
      border: none;
      background: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: 2px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .notification__close:hover {
      color: var(--text-primary);
      background: var(--mono-bg-secondary);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class NotificationsComponent {
  notifications = computed(() => this.notificationService.notifications());

  constructor(private notificationService: NotificationService) {}

  close(id: string): void {
    this.notificationService.remove(id);
  }
}
