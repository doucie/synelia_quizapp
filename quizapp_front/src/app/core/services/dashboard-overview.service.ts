import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface KpiBlock {
  total: number;
  currentMonth: number;
  previousMonth: number;
  deltaPercent: number | null;
}

export interface EntryCount { key: string; count: number; }
export interface TrendPoint { date: string; count: number; }
export interface TopCampaign { title: string; count: number; }

export interface ConversionFunnel {
  submitted: number;
  preselected: number;
  interviewed: number;
  decided: number;
  accepted: number;
}

export interface OverviewStats {
  kpis: {
    applications: KpiBlock;
    interviews: KpiBlock;
    evaluations: KpiBlock;
    decisions: KpiBlock;
  };
  statusDistribution: EntryCount[];
  quizDistribution: EntryCount[];
  applicationsTrend: TrendPoint[];
  decisionsBreakdown: EntryCount[];
  conversionFunnel: ConversionFunnel;
  topCampaigns: TopCampaign[];
  avgQuizScorePercent: number | null;
  quizCompletedCount: number;
  quizScoreBuckets: EntryCount[];
}

@Injectable({ providedIn: 'root' })
export class DashboardOverviewService {
  private http = inject(HttpClient);

  getOverviewStats(): Observable<OverviewStats> {
    return this.http.get<OverviewStats>('/api/dashboard/overview-stats');
  }
}
