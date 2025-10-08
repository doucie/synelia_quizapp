import { Component, signal, ChangeDetectionStrategy, computed, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
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
export class AppComponent implements AfterViewInit, OnDestroy {
  protected readonly title = signal('Synelia Quiz App');
  
  // Signal pour tracker l'URL actuelle
  private readonly currentUrl = signal('');
  
  // Computed pour déterminer si on est sur une route dashboard
  protected readonly isDashboardRoute = computed(() => {
    return this.currentUrl().startsWith('/dashboard');
  });

  // Hauteur du header
  private readonly headerHeight = signal(0);
  private resizeObserver: ResizeObserver | null = null;

  @ViewChild('headerElement', { static: false }) headerElement!: ElementRef<HTMLElement>;

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

  ngAfterViewInit() {
    // Attendre que le composant soit rendu
    setTimeout(() => {
      if (this.headerElement && this.headerElement.nativeElement) {
        // Calculer la hauteur initiale
        this.updateHeaderHeight();

        // Observer les changements de taille
        this.resizeObserver = new ResizeObserver(() => {
          this.updateHeaderHeight();
        });
        this.resizeObserver.observe(this.headerElement.nativeElement);
      }
    });
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private updateHeaderHeight() {
    if (this.headerElement && this.headerElement.nativeElement) {
      const height = this.headerElement.nativeElement.offsetHeight;
      this.headerHeight.set(height);

      // Mettre à jour la variable CSS
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    } else {
      // Valeur par défaut si le header n'est pas disponible
      this.headerHeight.set(0);
      document.documentElement.style.setProperty('--header-height', '0px');
    }
  }
}
