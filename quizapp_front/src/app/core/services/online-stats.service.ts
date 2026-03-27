import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { timeout, catchError, tap, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface OnlineStats {
  totalUsers: number;
  onlineUsers: number;
  totalAdmins: number;
  onlineAdmins: number;
  totalRecruiters: number;
  onlineRecruiters: number;
  onlinePercentage: number;
  adminOnlinePercentage: number;
  recruiterOnlinePercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class OnlineStatsService implements OnDestroy {
  private readonly TIMEOUT_MS = 2000;

  private statsSubject = new BehaviorSubject<OnlineStats>(this.getFallbackStats());
  private initialLoadComplete = false;

  // WebSocket
  private socket: WebSocket | null = null;
  private wsConnected = false;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT = 5;
  private readonly RECONNECT_INTERVAL = 5000;
  private pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

  constructor(private http: HttpClient) {
    this.loadStatsViaHttp();
    this.scheduleTimeout(() => this.connectWebSocket(), 500);
  }

  /** Observable des stats (émet après le premier chargement réussi). */
  getOnlineStatsStream(): Observable<OnlineStats> {
    return this.statsSubject.asObservable().pipe(filter(() => this.initialLoadComplete));
  }

  /** Observable brut (émet immédiatement le fallback puis les mises à jour). */
  getOnlineStats(): Observable<OnlineStats | null> {
    return this.statsSubject.asObservable();
  }

  /** Force un refresh HTTP one-shot. */
  forceRefresh(): Observable<OnlineStats> {
    return this.http.get<OnlineStats>(`${environment.apiUrl}/user/online-stats`).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(() => of(this.getFallbackStats())),
      tap(stats => this.applyAndEmit(stats))
    );
  }

  /** Reconnexion manuelle (WebSocket + HTTP). */
  reconnect(): void {
    this.disconnectWebSocket();
    this.reconnectAttempts = 0;
    this.scheduleTimeout(() => {
      this.connectWebSocket();
      this.scheduleTimeout(() => this.loadStatsViaHttp(), 200);
    }, 100);
  }

  isWebSocketConnected(): boolean {
    return this.wsConnected && this.socket?.readyState === WebSocket.OPEN;
  }

  ngOnDestroy(): void {
    this.disconnectWebSocket();
  }

  // ── HTTP ──────────────────────────────────────────

  private loadStatsViaHttp(): void {
    this.http.get<OnlineStats>(`${environment.apiUrl}/user/online-stats`).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(() => of(this.getFallbackStats()))
    ).subscribe({
      next: stats => {
        this.applyAndEmit(stats);
        this.initialLoadComplete = true;
      },
      error: () => {
        this.statsSubject.next(this.getFallbackStats());
        this.initialLoadComplete = true;
      }
    });
  }

  // ── WebSocket ─────────────────────────────────────

  private connectWebSocket(): void {
    const wsUrl = environment.apiUrl.replace('http', 'ws') + '/ws/qeel';
    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.wsConnected = true;
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const stats: OnlineStats = JSON.parse(event.data);
          this.applyAndEmit(stats);
        } catch { /* ignore parse errors */ }
      };

      this.socket.onclose = () => {
        this.wsConnected = false;
        this.handleReconnect();
      };

      this.socket.onerror = () => { this.wsConnected = false; };
    } catch {
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.MAX_RECONNECT) {
      this.reconnectAttempts++;
      this.scheduleTimeout(() => this.connectWebSocket(), this.RECONNECT_INTERVAL);
    }
  }

  private disconnectWebSocket(): void {
    this.pendingTimeouts.forEach(id => clearTimeout(id));
    this.pendingTimeouts = [];
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.wsConnected = false;
    }
  }

  // ── Helpers ───────────────────────────────────────

  private applyAndEmit(stats: OnlineStats): void {
    stats.onlinePercentage = this.pct(stats.onlineUsers, stats.totalUsers);
    stats.adminOnlinePercentage = this.pct(stats.onlineAdmins, stats.totalAdmins);
    stats.recruiterOnlinePercentage = this.pct(stats.onlineRecruiters, stats.totalRecruiters);
    this.statsSubject.next(stats);
  }

  private pct(online: number, total: number): number {
    return total === 0 ? 0 : Math.round((online / total) * 100);
  }

  private getFallbackStats(): OnlineStats {
    return {
      totalUsers: 0, onlineUsers: 0,
      totalAdmins: 0, onlineAdmins: 0,
      totalRecruiters: 0, onlineRecruiters: 0,
      onlinePercentage: 0, adminOnlinePercentage: 0, recruiterOnlinePercentage: 0
    };
  }

  private scheduleTimeout(fn: () => void, delay: number): void {
    const id = setTimeout(() => {
      this.pendingTimeouts = this.pendingTimeouts.filter(t => t !== id);
      fn();
    }, delay);
    this.pendingTimeouts.push(id);
  }
}
