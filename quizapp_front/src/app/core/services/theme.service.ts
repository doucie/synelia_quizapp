import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, COLOR_SCHEMES } from './app-config.service';

interface SchemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primary600: string;
  primaryTranslucent: string;
  gradientPrimary: string;
}

const SCHEME_MAP: Record<string, SchemeColors> = {
  violet: {
    primary: '#7C3AED', primaryDark: '#5B21B6', primaryLight: '#A78BFA', primary600: '#6D28D9',
    primaryTranslucent: 'rgba(124, 58, 237, 0.1)',
    gradientPrimary: 'linear-gradient(135deg, #7C3AED, #EC4899)'
  },
  blue: {
    primary: '#2563EB', primaryDark: '#1D4ED8', primaryLight: '#60A5FA', primary600: '#1E40AF',
    primaryTranslucent: 'rgba(37, 99, 235, 0.1)',
    gradientPrimary: 'linear-gradient(135deg, #2563EB, #3B82F6)'
  },
  green: {
    primary: '#059669', primaryDark: '#047857', primaryLight: '#34D399', primary600: '#065F46',
    primaryTranslucent: 'rgba(5, 150, 105, 0.1)',
    gradientPrimary: 'linear-gradient(135deg, #059669, #10B981)'
  },
  red: {
    primary: '#DC2626', primaryDark: '#B91C1C', primaryLight: '#F87171', primary600: '#991B1B',
    primaryTranslucent: 'rgba(220, 38, 38, 0.1)',
    gradientPrimary: 'linear-gradient(135deg, #DC2626, #EF4444)'
  },
  orange: {
    primary: '#EA580C', primaryDark: '#C2410C', primaryLight: '#FB923C', primary600: '#9A3412',
    primaryTranslucent: 'rgba(234, 88, 12, 0.1)',
    gradientPrimary: 'linear-gradient(135deg, #EA580C, #F97316)'
  },
  teal: {
    primary: '#0D9488', primaryDark: '#0F766E', primaryLight: '#2DD4BF', primary600: '#115E59',
    primaryTranslucent: 'rgba(13, 148, 136, 0.1)',
    gradientPrimary: 'linear-gradient(135deg, #0D9488, #14B8A6)'
  },
  indigo: {
    primary: '#4F46E5', primaryDark: '#4338CA', primaryLight: '#818CF8', primary600: '#3730A3',
    primaryTranslucent: 'rgba(79, 70, 229, 0.1)',
    gradientPrimary: 'linear-gradient(135deg, #4F46E5, #6366F1)'
  },
  rose: {
    primary: '#E11D48', primaryDark: '#BE123C', primaryLight: '#FB7185', primary600: '#9F1239',
    primaryTranslucent: 'rgba(225, 29, 72, 0.1)',
    gradientPrimary: 'linear-gradient(135deg, #E11D48, #F43F5E)'
  }
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  activeConfig = signal<AppConfig | null>(null);
  companyName = signal('Synelia');
  logoHtml = signal('');

  constructor(private http: HttpClient) {}

  loadActiveConfig(): Promise<void> {
    return new Promise(resolve => {
      this.http.post<any>('/appConfig/getByCriteria', {
        user: 1,
        size: 1,
        index: 0,
        isSimpleLoading: false,
        data: { isActive: true, isDeleted: false }
      }).subscribe({
        next: (resp) => {
          const config: AppConfig | undefined = resp.items?.[0];
          if (config) {
            this.activeConfig.set(config);
            this.companyName.set(config.companyName || 'Synelia');
            this.logoHtml.set(config.logoHtml || '');
            this.applyTheme(config);
          }
          resolve();
        },
        error: () => resolve() // fail silently, keep defaults
      });
    });
  }

  applyTheme(config: AppConfig) {
    const scheme = config.colorScheme || 'violet';
    const colors = SCHEME_MAP[scheme];
    if (!colors) return;

    const root = document.documentElement;
    // Use custom primaryColor if it differs from scheme default
    const schemeDefault = COLOR_SCHEMES.find(s => s.key === scheme);
    const useCustomColor = config.primaryColor && schemeDefault && config.primaryColor !== schemeDefault.primary;

    if (useCustomColor) {
      root.style.setProperty('--primary', config.primaryColor!);
      root.style.setProperty('--primary-dark', this.darken(config.primaryColor!, 15));
      root.style.setProperty('--primary-light', this.lighten(config.primaryColor!, 20));
      root.style.setProperty('--primary-600', this.darken(config.primaryColor!, 25));
      root.style.setProperty('--primary-translucent', this.hexToRgba(config.primaryColor!, 0.1));
      root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${config.primaryColor}, ${this.lighten(config.primaryColor!, 15)})`);
    } else {
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--primary-dark', colors.primaryDark);
      root.style.setProperty('--primary-light', colors.primaryLight);
      root.style.setProperty('--primary-600', colors.primary600);
      root.style.setProperty('--primary-translucent', colors.primaryTranslucent);
      root.style.setProperty('--gradient-primary', colors.gradientPrimary);
    }

    // Also set scrollbar colors
    root.style.setProperty('--scrollbar-thumb', 'var(--primary)');
    root.style.setProperty('--scrollbar-thumb-hover', 'var(--primary-dark)');
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private darken(hex: string, percent: number): string {
    return this.adjustBrightness(hex, -percent);
  }

  private lighten(hex: string, percent: number): string {
    return this.adjustBrightness(hex, percent);
  }

  private adjustBrightness(hex: string, percent: number): string {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, Math.max(0, Math.round(r + (r * percent / 100))));
    g = Math.min(255, Math.max(0, Math.round(g + (g * percent / 100))));
    b = Math.min(255, Math.max(0, Math.round(b + (b * percent / 100))));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
