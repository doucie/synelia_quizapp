import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-home">
      <h1>Bienvenue sur le Dashboard</h1>
      <p>Sélectionnez une option dans le menu de gauche pour commencer.</p>
      
      <!-- Cartes statistiques -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Candidatures</h3>
          <div class="stat-number">0</div>
        </div>
        <div class="stat-card">
          <h3>Entretiens</h3>
          <div class="stat-number">0</div>
        </div>
        <div class="stat-card">
          <h3>Utilisateurs</h3>
          <div class="stat-number">0</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-home {
      padding: 20px;
    }

    .dashboard-home h1 {
      color: #1e293b;
      margin-bottom: 10px;
    }

    .dashboard-home p {
      color: #64748b;
      margin-bottom: 30px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-card h3 {
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
      margin: 0 0 8px 0;
    }

    .stat-number {
      font-size: 32px;
      font-weight: 700;
      color: #1e293b;
    }
  `]
})
export class DashboardHomeComponent {}
