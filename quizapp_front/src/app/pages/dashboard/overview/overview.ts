import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import {
  DashboardOverviewService,
  OverviewStats,
  EntryCount,
  TrendPoint
} from '../../../core/services/dashboard-overview.service';
import { APPLICATION_STATUS_LABELS } from '../../../core/constants/application-status.constants';
import { QeelModernComponent } from '../../../components/qeel/qeel-modern.component';

interface BarDatum { label: string; value: number; color: string; }
interface DonutSlice { label: string; value: number; color: string; offset: number; arc: number; }
interface FunnelStep { key: string; label: string; value: number; widthPercent: number; color: string; }
interface TrendUiPoint { date: string; label: string; value: number; }
interface KpiCard {
  key: 'applications' | 'interviews' | 'evaluations' | 'decisions';
  label: string;
  value: number;
  deltaPercent: number | null;
  deltaState: 'up' | 'down' | 'flat' | 'new';
}

const PALETTE = [
  'var(--primary)',
  'var(--success)',
  'var(--info)',
  'var(--warning)',
  'var(--secondary)',
  'var(--accent)',
  'var(--primary-light)',
  'var(--error)'
];

const QUIZ_COLORS: Record<string, string> = {
  COMPLETED:    'var(--success)',
  IN_PROGRESS:  'var(--info)',
  STARTED:      'var(--info)',
  PENDING:      'var(--text-tertiary)',
  EXPIRED:      'var(--error)',
  CANCELLED:    'var(--error)',
  NOT_REQUIRED: 'var(--primary-light)'
};

const QUIZ_LABELS: Record<string, string> = {
  COMPLETED:    'Terminé',
  IN_PROGRESS:  'En cours',
  STARTED:      'En cours',
  PENDING:      'En attente',
  EXPIRED:      'Expiré',
  CANCELLED:    'Annulé',
  NOT_REQUIRED: 'Non requis'
};

const DECISION_COLORS: Record<string, string> = {
  PRE_SCREEN_ACCEPTED: 'var(--info)',
  PRE_SCREEN_REJECTED: 'var(--warning)',
  FINAL_ACCEPTED:      'var(--success)',
  FINAL_REJECTED:      'var(--error)'
};

const DECISION_LABELS: Record<string, string> = {
  PRE_SCREEN_ACCEPTED: 'Présélection acceptée',
  PRE_SCREEN_REJECTED: 'Présélection refusée',
  FINAL_ACCEPTED:      'Décision finale : accepté',
  FINAL_REJECTED:      'Décision finale : refusé'
};

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, QeelModernComponent],
  templateUrl: './overview.html',
  styleUrls: ['./overview.scss']
})
export class OverviewComponent implements OnInit {

  currentUser = computed(() => this.authService.getCurrentUser());
  userRole = computed(() => this.currentUser()?.role || '');

  stats = signal<OverviewStats | null>(null);
  loading = signal(true);
  loadError = signal(false);

  kpiCards = computed<KpiCard[]>(() => {
    const s = this.stats();
    if (!s) return this.placeholderKpis();
    return [
      this.makeKpi('applications', 'Candidatures', s.kpis.applications),
      this.makeKpi('interviews',   'Entretiens',   s.kpis.interviews),
      this.makeKpi('evaluations',  'Évaluations',  s.kpis.evaluations),
      this.makeKpi('decisions',    'Décisions',    s.kpis.decisions)
    ];
  });

  hasData = computed(() => {
    const s = this.stats();
    return !!s && s.kpis.applications.total > 0;
  });

  statusOrder = ['SUBMITTED', 'PENDING', 'PRE_SCREEN_ACCEPTED', 'INTERVIEWING',
                 'FINAL_ACCEPTED', 'PRE_SCREEN_REJECTED', 'FINAL_REJECTED'];

  statusBars = computed<BarDatum[]>(() => {
    const items = this.stats()?.statusDistribution ?? [];
    const sorted = [...items].sort((a, b) => {
      const ia = this.statusOrder.indexOf(a.key);
      const ib = this.statusOrder.indexOf(b.key);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    return sorted.map((e, i) => ({
      label: APPLICATION_STATUS_LABELS[e.key] || e.key,
      value: e.count,
      color: PALETTE[i % PALETTE.length]
    }));
  });

  maxStatusBar = computed(() => Math.max(1, ...this.statusBars().map(b => b.value)));
  totalStatus  = computed(() => this.statusBars().reduce((s, b) => s + b.value, 0));
  dominantStatus = computed<BarDatum | null>(() => {
    const list = this.statusBars();
    if (!list.length) return null;
    return list.reduce((a, b) => (a.value >= b.value ? a : b));
  });

  readonly DONUT_RADIUS = 50;
  readonly DONUT_CIRC = 2 * Math.PI * 50;

  quizSlices = computed<DonutSlice[]>(() => {
    const items = this.stats()?.quizDistribution ?? [];
    const total = items.reduce((s, e) => s + e.count, 0) || 1;
    let offset = 0;
    return items.map(e => {
      const arc = (e.count / total) * this.DONUT_CIRC;
      const slice: DonutSlice = {
        label: QUIZ_LABELS[e.key] || e.key,
        value: e.count,
        color: QUIZ_COLORS[e.key] || 'var(--text-tertiary)',
        offset,
        arc
      };
      offset += arc;
      return slice;
    });
  });

  quizTotal = computed(() => this.quizSlices().reduce((s, c) => s + c.value, 0));

  readonly TREND_W = 600;
  readonly TREND_H = 160;
  readonly TREND_PAD = 10;

  trendPoints = computed<TrendUiPoint[]>(() => {
    const items: TrendPoint[] = this.stats()?.applicationsTrend ?? [];
    return items.map(p => ({
      date: p.date,
      label: this.shortDate(p.date),
      value: p.count
    }));
  });

  trendMax    = computed(() => Math.max(1, ...this.trendPoints().map(p => p.value)));
  trendTotal  = computed(() => this.trendPoints().reduce((s, p) => s + p.value, 0));

  trendPath = computed(() => {
    const pts = this.trendPoints();
    if (!pts.length) return '';
    const max = this.trendMax();
    const step = (this.TREND_W - this.TREND_PAD * 2) / Math.max(1, pts.length - 1);
    return pts.map((p, i) => {
      const x = this.TREND_PAD + i * step;
      const y = this.TREND_H - this.TREND_PAD - (p.value / max) * (this.TREND_H - this.TREND_PAD * 2);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  });

  trendArea = computed(() => {
    const pts = this.trendPoints();
    if (!pts.length) return '';
    const max = this.trendMax();
    const step = (this.TREND_W - this.TREND_PAD * 2) / Math.max(1, pts.length - 1);
    const top = pts.map((p, i) => {
      const x = this.TREND_PAD + i * step;
      const y = this.TREND_H - this.TREND_PAD - (p.value / max) * (this.TREND_H - this.TREND_PAD * 2);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
    const lastX = (this.TREND_PAD + (pts.length - 1) * step).toFixed(1);
    return `${top} L ${lastX} ${this.TREND_H - this.TREND_PAD} L ${this.TREND_PAD} ${this.TREND_H - this.TREND_PAD} Z`;
  });

  trendGridYs = computed(() => {
    const usable = this.TREND_H - this.TREND_PAD * 2;
    return [0, 1, 2, 3, 4].map(i => +(this.TREND_PAD + usable * (i / 4)).toFixed(1));
  });

  trendDots = computed(() => {
    const pts = this.trendPoints();
    if (!pts.length) return [] as { cx: number; cy: number }[];
    const max = this.trendMax();
    const step = (this.TREND_W - this.TREND_PAD * 2) / Math.max(1, pts.length - 1);
    return pts.map((p, i) => ({
      cx: +(this.TREND_PAD + i * step).toFixed(1),
      cy: +(this.TREND_H - this.TREND_PAD - (p.value / max) * (this.TREND_H - this.TREND_PAD * 2)).toFixed(1)
    }));
  });

  funnelSteps = computed<FunnelStep[]>(() => {
    const f = this.stats()?.conversionFunnel;
    if (!f) return [];
    const max = f.submitted || 1;
    const defs: { key: keyof typeof f; label: string; color: string; }[] = [
      { key: 'submitted',   label: 'Candidatures soumises',  color: 'var(--info)' },
      { key: 'preselected', label: 'Présélectionnés',        color: 'var(--primary)' },
      { key: 'interviewed', label: 'En entretien',           color: 'var(--secondary)' },
      { key: 'decided',     label: 'Décision finale prise',  color: 'var(--warning)' },
      { key: 'accepted',    label: 'Acceptés',               color: 'var(--success)' }
    ];
    return defs.map(d => {
      const v = f[d.key] as number;
      return {
        key: d.key as string,
        label: d.label,
        value: v,
        widthPercent: Math.round((v / max) * 100),
        color: d.color
      };
    });
  });

  topCampaigns = computed(() => {
    const list = this.stats()?.topCampaigns ?? [];
    const max = Math.max(1, ...list.map(c => c.count));
    return list.map((c, i) => ({
      title: c.title,
      count: c.count,
      widthPercent: Math.round((c.count / max) * 100),
      color: PALETTE[i % PALETTE.length]
    }));
  });

  decisionBars = computed<BarDatum[]>(() => {
    const items: EntryCount[] = this.stats()?.decisionsBreakdown ?? [];
    return items.map(e => ({
      label: DECISION_LABELS[e.key] || e.key,
      value: e.count,
      color: DECISION_COLORS[e.key] || 'var(--text-tertiary)'
    }));
  });

  maxDecisionBar = computed(() => Math.max(1, ...this.decisionBars().map(b => b.value)));
  totalDecisions = computed(() => this.decisionBars().reduce((s, b) => s + b.value, 0));

  scoreBuckets = computed(() => {
    const items: EntryCount[] = this.stats()?.quizScoreBuckets ?? [];
    const max = Math.max(1, ...items.map(b => b.count));
    const palette = ['var(--error)', 'var(--warning)', 'var(--info)', 'var(--primary)', 'var(--success)'];
    return items.map((e, i) => ({
      label: e.key,
      value: e.count,
      heightPercent: Math.round((e.count / max) * 100),
      color: palette[i] || 'var(--primary)'
    }));
  });

  avgQuizScore    = computed(() => this.stats()?.avgQuizScorePercent ?? null);
  quizCompletedCt = computed(() => this.stats()?.quizCompletedCount ?? 0);

  constructor(
    private authService: AuthService,
    private overviewService: DashboardOverviewService
  ) {}

  ngOnInit() { this.loadStats(); }

  reload() { this.loadStats(); }

  private loadStats() {
    this.loading.set(true);
    this.loadError.set(false);
    this.overviewService.getOverviewStats().subscribe({
      next: (s) => { this.stats.set(s); this.loading.set(false); },
      error: () => { this.loadError.set(true); this.loading.set(false); }
    });
  }

  shouldShowTrendLabel(index: number): boolean {
    const total = this.trendPoints().length;
    if (total <= 7) return true;
    return index === 0 || index === total - 1 || index % 5 === 0;
  }

  statusBarWidth(value: number): number {
    const max = this.maxStatusBar();
    return max > 0 ? Math.round((value / max) * 100) : 0;
  }

  decisionBarWidth(value: number): number {
    const max = this.maxDecisionBar();
    return max > 0 ? Math.round((value / max) * 100) : 0;
  }

  formatDelta(d: number | null): string {
    if (d === null) return 'Nouveau';
    const sign = d > 0 ? '+' : '';
    return `${sign}${d.toFixed(1)}%`;
  }

  trackByLabel(_: number, item: { label: string }) { return item.label; }
  trackByKey(_: number, item: { key: string }) { return item.key; }
  trackByTitle(_: number, item: { title: string }) { return item.title; }

  private makeKpi(
    key: KpiCard['key'],
    label: string,
    block: { total: number; deltaPercent: number | null }
  ): KpiCard {
    const d = block.deltaPercent;
    let state: KpiCard['deltaState'];
    if (d === null) state = 'new';
    else if (d > 0.5) state = 'up';
    else if (d < -0.5) state = 'down';
    else state = 'flat';
    return { key, label, value: block.total, deltaPercent: d, deltaState: state };
  }

  private placeholderKpis(): KpiCard[] {
    return [
      { key: 'applications', label: 'Candidatures', value: 0, deltaPercent: 0, deltaState: 'flat' },
      { key: 'interviews',   label: 'Entretiens',   value: 0, deltaPercent: 0, deltaState: 'flat' },
      { key: 'evaluations',  label: 'Évaluations',  value: 0, deltaPercent: 0, deltaState: 'flat' },
      { key: 'decisions',    label: 'Décisions',    value: 0, deltaPercent: 0, deltaState: 'flat' }
    ];
  }

  private shortDate(key: string): string {
    const [, m, d] = key.split('-');
    return `${d}/${m}`;
  }
}
