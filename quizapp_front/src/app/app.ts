import { Component, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  protected readonly title = signal('Synelia Quiz App');
  
  // Signal pour tracker l'URL actuelle
  private readonly currentUrl = signal('');
  
  // Computed pour déterminer si on est sur une route dashboard
  protected readonly isDashboardRoute = computed(() => {
    return this.currentUrl().startsWith('/dashboard');
  });

  constructor(private router: Router) {
    // Écouter les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.url);
    });
    
    // Initialiser avec l'URL actuelle
    this.currentUrl.set(this.router.url);
  }
}
