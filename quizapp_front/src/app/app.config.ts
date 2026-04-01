import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { ThemeService } from './core/services/theme.service';

import { routes } from './app.routes';

function initializeTheme(themeService: ThemeService) {
  return () => themeService.loadActiveConfig();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTheme,
      deps: [ThemeService],
      multi: true
    }
  ]
};
