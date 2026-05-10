import {
  Component, Input, Output, EventEmitter,
  ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges
} from '@angular/core';

/**
 * Single-line contenteditable input that colorizes {{variable}} tokens.
 * - Spans get only `color: var(--X)` — no background, box-shadow or border.
 * - Emits plain text ({{key}} restored, no HTML) on every change.
 * - Prevents multi-line input (Enter key blocked).
 * - Placeholder rendered via CSS ::before / attr(data-placeholder).
 */
@Component({
  selector: 'app-variable-token-input',
  standalone: true,
  template: `
    <div #contentEl
      class="vti-input"
      contenteditable="true"
      [attr.data-placeholder]="placeholder"
      (focus)="onFocus()"
      (blur)="onBlur()"
      (input)="onInput()"
      (keydown.enter)="$event.preventDefault(); $event.stopPropagation()"
      (paste)="onPaste($event)">
    </div>
  `,
  styleUrl: './variable-token-input.scss'
})
export class VariableTokenInputComponent implements AfterViewInit, OnChanges {
  @Input() value = '';
  @Input() placeholder = '';
  /** Map from variable key → CSS custom-property name (e.g. '--primary', '--info'). */
  @Input() colorMap: Map<string, string> = new Map();
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('contentEl') contentEl!: ElementRef<HTMLDivElement>;

  private focused = false;

  ngAfterViewInit() {
    this.render();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.contentEl) return;
    // Never reset innerHTML while user is typing — only sync on external changes.
    if (!this.focused && (changes['value'] || changes['colorMap'])) {
      this.render();
    }
  }

  onFocus() {
    this.focused = true;
  }

  onBlur() {
    this.focused = false;
    // Re-colorize after the user finishes editing so typed {{key}} tokens get colored.
    this.render();
  }

  onInput() {
    const plain = this.extractPlainText(this.contentEl.nativeElement.innerHTML);
    this.valueChange.emit(plain);
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') ?? '';
    // Insert as plain text at cursor position.
    document.execCommand('insertText', false, text);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private render() {
    if (!this.contentEl) return;
    this.contentEl.nativeElement.innerHTML = this.colorize(this.value ?? '');
  }

  /** Replace {{key}} tokens with color-only spans (no bg, no shadow, no border). */
  private colorize(text: string): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const colorVar = this.colorMap.get(key.trim()) ?? '--text-tertiary';
      return `<span class="vti-var" style="color:var(${colorVar})">${match}</span>`;
    });
  }

  /** Strip vti-var spans and HTML entities, restoring {{key}} plain text. */
  private extractPlainText(html: string): string {
    return html
      .replace(/<span\b[^>]*\bvti-var\b[^>]*>\{\{([^}]+)\}\}<\/span>/g, '{{$1}}')
      .replace(/<br\s*\/?>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
  }
}
