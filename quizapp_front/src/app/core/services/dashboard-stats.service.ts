import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, Subject } from 'rxjs';
import { DependencyInfo } from '../../shared/models/interfaces';

@Injectable({ providedIn: 'root' })
export class DashboardStatsService {
  private http = inject(HttpClient);
  private refresh$ = new Subject<void>();
  private cache$?: Observable<Record<string, number>>;

  /**
   * Returns all entity counts in a single API call.
   * Result is cached and shared across subscribers until refresh() is called.
   */
  getCounts(): Observable<Record<string, number>> {
    if (!this.cache$) {
      this.cache$ = this.http.get<Record<string, number>>('/api/dashboard/counts').pipe(
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  /** Invalidate the cache so the next getCounts() call fetches fresh data */
  refresh(): void {
    this.cache$ = undefined;
  }

  /** Check FK dependencies before deleting an entity */
  checkDependencies(entityType: string, id: number): Observable<DependencyInfo> {
    return this.http.get<DependencyInfo>(`/api/dashboard/check-dependencies/${entityType}/${id}`);
  }

  /** Check if parent entities are deleted before restoring */
  checkParent(entityType: string, id: number): Observable<DependencyInfo> {
    return this.http.get<DependencyInfo>(`/api/dashboard/check-parent/${entityType}/${id}`);
  }
}
