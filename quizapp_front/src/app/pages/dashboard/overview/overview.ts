import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { DashboardStatsService } from '../../../core/services/dashboard-stats.service';
import { QeelModernComponent } from '../../../components/qeel/qeel-modern.component';

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

  candidatesCount = signal(0);
  interviewsCount = signal(0);
  evaluationsCount = signal(0);
  decisionsCount = signal(0);
  statsLoading = signal(true);

  constructor(
    private authService: AuthService,
    private statsService: DashboardStatsService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  private loadStats() {
    this.statsService.getCounts().subscribe({
      next: (counts) => {
        this.candidatesCount.set(counts['applications'] || 0);
        this.interviewsCount.set(counts['interviews'] || 0);
        this.evaluationsCount.set(counts['evaluations'] || 0);
        this.decisionsCount.set(counts['decisions'] || 0);
        this.statsLoading.set(false);
      },
      error: () => {
        this.statsLoading.set(false);
      }
    });
  }
}
