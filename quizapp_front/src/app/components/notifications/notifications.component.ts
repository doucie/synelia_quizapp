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
          (click)="handleNotificationClick(notification)"
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
      max-width: 420px;
      pointer-events: none;
    }

    .notification {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 18px 20px;
      border-radius: 12px;
      background: var(--surface);
      border: 1px solid var(--border);
      box-shadow: 0 10px 25px -5px var(--shadow-medium), 0 4px 10px -2px var(--shadow-light);
      cursor: pointer;
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: auto;
      backdrop-filter: blur(10px);
    }

    .notification:hover {
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 15px 35px -5px var(--shadow-heavy), 0 8px 15px -2px var(--shadow-medium);
      border-color: var(--border-hover);
    }

    .notification--success {
      border-left: 4px solid var(--success);
      background: linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--success) 5%, var(--surface)) 100%);
    }

    .notification--success .notification__icon {
      color: var(--success);
      background: color-mix(in srgb, var(--success) 10%, transparent);
      padding: 8px;
      border-radius: 8px;
    }

    .notification--error {
      border-left: 4px solid var(--error);
      background: linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--error) 5%, var(--surface)) 100%);
    }

    .notification--error .notification__icon {
      color: var(--error);
      background: color-mix(in srgb, var(--error) 10%, transparent);
      padding: 8px;
      border-radius: 8px;
    }

    .notification--warning {
      border-left: 4px solid var(--warning);
      background: linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--warning) 5%, var(--surface)) 100%);
    }

    .notification--warning .notification__icon {
      color: var(--warning);
      background: color-mix(in srgb, var(--warning) 10%, transparent);
      padding: 8px;
      border-radius: 8px;
    }

    .notification--info {
      border-left: 4px solid var(--info);
      background: linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--info) 5%, var(--surface)) 100%);
    }

    .notification--info .notification__icon {
      color: var(--info);
      background: color-mix(in srgb, var(--info) 10%, transparent);
      padding: 8px;
      border-radius: 8px;
    }

    .notification__icon {
      flex-shrink: 0;
      margin-top: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification__content {
      flex: 1;
      min-width: 0;
    }

    .notification__title {
      font-weight: 600;
      font-size: 15px;
      color: var(--text-primary);
      margin-bottom: 6px;
      letter-spacing: -0.01em;
    }

    .notification__message {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .notification__close {
      flex-shrink: 0;
      border: none;
      background: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification__close:hover {
      color: var(--text-primary);
      background: var(--surface-variant);
      transform: rotate(90deg);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(120%) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @media (max-width: 640px) {
      .notifications-container {
        left: 20px;
        right: 20px;
        max-width: none;
      }
    }
  `]
})
export class NotificationsComponent {
  notifications = computed(() => this.notificationService.notifications());

  constructor(private notificationService: NotificationService) {}

  async handleNotificationClick(notification: Notification): Promise<void> {
    if (notification.type !== 'error') {
      this.close(notification.id);
      return;
    }

    const copied = await this.copyToClipboard(notification.message || notification.title);
    this.close(notification.id);

    if (copied) {
      this.notificationService.success('Copié', 'Le message d\'erreur a été copié.');
      return;
    }

    this.notificationService.warning('Copie impossible', 'Impossible de copier automatiquement le message.');
  }

  close(id: string): void {
    this.notificationService.remove(id);
  }

  private async copyToClipboard(text: string): Promise<boolean> {
    if (!text) {
      return false;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback below.
    }

    return this.copyToClipboardFallback(text);
  }

  private copyToClipboardFallback(text: string): boolean {
    if (typeof document === 'undefined') {
      return false;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}
