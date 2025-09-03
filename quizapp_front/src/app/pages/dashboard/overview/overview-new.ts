import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.scss']
})
export class OverviewComponent {
  
  currentUser = computed(() => this.authService.getCurrentUser());
  userRole = computed(() => this.currentUser()?.role || '');

  constructor(private authService: AuthService) {}
}
