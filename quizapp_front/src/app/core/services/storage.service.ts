import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  getJson<T>(key: string): T | null {
    const raw = this.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Handle storage quota exceeded or other errors silently
    }
  }

  setJson(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Handle storage quota exceeded or other errors silently
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Handle errors silently
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      // Handle errors silently
    }
  }
}
