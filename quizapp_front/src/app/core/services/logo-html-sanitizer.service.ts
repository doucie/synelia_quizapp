import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class LogoHtmlSanitizerService {
  constructor(private sanitizer: DomSanitizer) {}

  sanitize(value: string | null | undefined): string | null {
    const trimmedValue = value?.trim();
    if (!trimmedValue) {
      return null;
    }

    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, trimmedValue)?.trim();
    return sanitized ? sanitized : null;
  }

  sanitizeOrEmpty(value: string | null | undefined): string {
    return this.sanitize(value) ?? '';
  }

  isImageMarkup(value: string | null | undefined): boolean {
    return this.sanitizeOrEmpty(value).toLowerCase().startsWith('<img');
  }
}