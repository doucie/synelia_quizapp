export interface ThemeConfig {
  isDark: boolean;
  themeName: string;
}

export interface SystemPreferences {
  prefersDarkMode: boolean;
  prefersReducedMotion: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'auto';
