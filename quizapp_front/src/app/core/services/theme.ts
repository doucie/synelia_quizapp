import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { DomService } from './dom.service';
import { ThemeConfig, ThemeMode } from '../interfaces/theme.interface';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  public readonly isDarkMode$ = this.isDarkMode.asObservable();

  constructor(
    private storageService: StorageService,
    private domService: DomService
  ) {
    this.initializeTheme();
  }

  toggleTheme(): void {
    this.setDarkMode(!this.isDarkMode.value);
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkMode.next(isDark);
    this.applyTheme(isDark);
    this.persistTheme(isDark ? APP_CONSTANTS.THEME_MODES.DARK : APP_CONSTANTS.THEME_MODES.LIGHT);
  }

  getCurrentTheme(): boolean {
    return this.isDarkMode.value;
  }

  getThemeConfig(): ThemeConfig {
    return {
      isDark: this.isDarkMode.value,
      themeName: this.isDarkMode.value ? APP_CONSTANTS.THEME_MODES.DARK : APP_CONSTANTS.THEME_MODES.LIGHT
    };
  }

  private initializeTheme(): void {
    const savedTheme = this.getStoredTheme();
    const prefersDark = this.getSystemPreference();
    const shouldUseDarkMode = savedTheme === APP_CONSTANTS.THEME_MODES.DARK || (!savedTheme && prefersDark);
    this.setDarkMode(shouldUseDarkMode);
  }

  private getStoredTheme(): string | null {
    return this.storageService.getItem(APP_CONSTANTS.STORAGE_KEYS.THEME);
  }

  private getSystemPreference(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private persistTheme(theme: ThemeMode): void {
    this.storageService.setItem(APP_CONSTANTS.STORAGE_KEYS.THEME, theme);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      this.domService.addBodyClass(APP_CONSTANTS.CSS_CLASSES.DARK_MODE);
    } else {
      this.domService.removeBodyClass(APP_CONSTANTS.CSS_CLASSES.DARK_MODE);
    }
  }
}
