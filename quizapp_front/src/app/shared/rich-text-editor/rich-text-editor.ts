import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rich-text-editor.html',
  styleUrl: './rich-text-editor.scss',
  encapsulation: ViewEncapsulation.ShadowDom
})
export class RichTextEditorComponent implements AfterViewInit, OnChanges {
  @Input() value = '';
  @Input() placeholder = '';
  @Input() variables: string[] = [];
  @Input() variableGroups: { label: string; keys: string[]; colorClass?: string; colorVar?: string }[] = [];
  @Input() layoutMode: 'standard' | 'email-document' = 'standard';
  @Input() forcedColorSchemeMode: 'dark' | 'light' | null = null;
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;

  private internalChange = false;
  private emailDocumentShell: { prefix: string; suffix: string } | null = null;

  ngAfterViewInit() {
    this.syncEditorContent(this.value || '');
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['value'] || changes['layoutMode'] || changes['forcedColorSchemeMode'] || changes['variableGroups']) && !this.internalChange && this.editorRef) {
      this.syncEditorContent(this.value || '');
    }
    this.internalChange = false;
  }

  onInput() {
    this.internalChange = true;
    const rawHtml = this.editorRef.nativeElement.innerHTML;
    // Strip rte-var spans before emitting so the stored template contains only clean {{key}}
    // placeholders, not presentation spans that the backend email renderer should not receive.
    const cleanHtml = rawHtml.replace(/<span\b[^>]*\brte-var\b[^>]*>\{\{([^}]+)\}\}<\/span>/g, '{{$1}}');
    this.valueChange.emit(this.getEmittedValue(cleanHtml));
  }

  exec(cmd: string, value?: string) {
    this.editorRef.nativeElement.focus();
    document.execCommand(cmd, false, value);
    this.onInput();
  }

  setFontSize(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    if (val) this.exec('fontSize', val);
  }

  setForeColor(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.exec('foreColor', val);
  }

  insertVariable(v: string, colorVar?: string) {
    this.editorRef.nativeElement.focus();
    const style = colorVar ? ` style="color: var(${colorVar});"` : '';
    // contenteditable="false" makes the span an atomic chip — the cursor cannot enter it,
    // so typing/deleting next to a variable works correctly at the span boundary.
    document.execCommand('insertHTML', false, `<span class="rte-var" contenteditable="false"${style}>{{${v}}}</span>&nbsp;`);
    this.onInput();
  }

  private syncEditorContent(value: string) {
    const editorValue = this.getEditorValue(value);
    const colorized = this.colorizeVariablesInHtml(editorValue);
    this.editorRef.nativeElement.innerHTML = colorized;
  }

  // P16: Build a key → CSS color variable map from variableGroups' colorVar fields.
  private buildVariableColorMap(): Map<string, string> {
    const map = new Map<string, string>();
    for (const group of this.variableGroups) {
      if (group.colorVar) {
        for (const key of group.keys) {
          map.set(key, group.colorVar);
        }
      }
    }
    return map;
  }

  // P16: Colorize {{key}} placeholders in HTML content by wrapping them in
  // colored rte-var spans matching the rte-var-btn badge style (color + background + border).
  // Strips existing rte-var spans first to prevent double-wrapping on re-sync.
  // Only processes {{key}} outside HTML tag attributes.
  private colorizeVariablesInHtml(html: string): string {
    const colorMap = this.buildVariableColorMap();
    if (!colorMap.size) return html;
    // Normalize: strip existing rte-var wrappers so we can re-apply colors
    const normalized = html.replace(/<span\b[^>]*\brte-var\b[^>]*>(\{\{[^}]+\}\})<\/span>/g, '$1');
    // Re-wrap {{key}} tokens in text content (not inside HTML tag attributes)
    return normalized.replace(/(<[^>]*>)|(\{\{([^}]+)\}\})/g, (match, tag, _placeholder, key) => {
      if (tag) return tag;
      const trimmedKey = (key ?? '').trim();
      const colorVar = colorMap.get(trimmedKey);
      if (!colorVar) return match;
      const style = [
        `color: var(${colorVar})`,
        `background: color-mix(in srgb, var(${colorVar}) 10%, transparent)`,
        `border: 1px solid color-mix(in srgb, var(${colorVar}) 28%, transparent)`,
        'border-radius: 3px',
        'padding: 0 2px',
        'font-family: monospace',
        'font-size: 0.85em',
        'white-space: nowrap'
      ].join('; ');
      return `<span class="rte-var" contenteditable="false" style="${style}">{{${trimmedKey}}}</span>`;
    });
  }

  private getEditorValue(value: string): string {
    if (this.layoutMode !== 'email-document') {
      this.emailDocumentShell = null;
      return value;
    }

    const parsed = this.parseEmailDocument(value);
    if (!parsed) {
      this.emailDocumentShell = null;
      return value;
    }

    this.emailDocumentShell = {
      prefix: parsed.prefix,
      suffix: parsed.suffix
    };

    const scopedStyles = this.buildScopedEditorStyles(parsed.styleBlocks);
    return `${scopedStyles}<div class="rte-email-layout" data-rte-email-layout="true">${parsed.body}</div>`;
  }

  private getEmittedValue(editorHtml: string): string {
    if (this.layoutMode !== 'email-document' || !this.emailDocumentShell) {
      return editorHtml;
    }

    return `${this.emailDocumentShell.prefix}${this.extractEditedEmailBody(editorHtml)}${this.emailDocumentShell.suffix}`;
  }

  private parseEmailDocument(value: string): { prefix: string; body: string; suffix: string; styleBlocks: string[] } | null {
    const bodyMatch = value.match(/^([\s\S]*?<body\b[^>]*>)([\s\S]*?)(<\/body>[\s\S]*)$/i);
    if (!bodyMatch) {
      return null;
    }

    const [, prefix, body, suffix] = bodyMatch;
    return {
      prefix,
      body,
      suffix,
      styleBlocks: prefix.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) || []
    };
  }

  private buildScopedEditorStyles(styleBlocks: string[]): string {
    if (!styleBlocks.length) {
      return '';
    }

    return styleBlocks
      .map(block => block.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/i, (_fullMatch, rawAttributes = '', css = '') => {
        const attributes = String(rawAttributes).replace(/\sdata-rte-layout-style=("[^"]*"|'[^']*')/gi, '');
        return `<style${attributes} data-rte-layout-style="true">${this.prepareEmailCssForEditor(String(css))}</style>`;
      }))
      .join('');
  }

  private prepareEmailCssForEditor(css: string): string {
    let nextCss = css;

    if (this.forcedColorSchemeMode) {
      const forcedCss = this.extractColorSchemeMediaBlocks(nextCss, this.forcedColorSchemeMode).join('\n');
      nextCss = this.removeColorSchemeMediaBlocks(nextCss);
      if (forcedCss.trim()) {
        nextCss = `${nextCss}\n${forcedCss}`;
      }
    }

    return this.scopeEmailCssForEditor(nextCss);
  }

  private scopeEmailCssForEditor(css: string): string {
    return css.replace(/(^|\{|})\s*([^@}{]+)\{/g, (_fullMatch, blockPrefix, rawSelectorGroup) => {
      const selectorGroup = String(rawSelectorGroup)
        .split(',')
        .map(selector => this.scopeEmailSelector(selector))
        .join(', ');

      const normalizedPrefix = blockPrefix ? `${blockPrefix} ` : '';
      return `${normalizedPrefix}${selectorGroup}{`;
    });
  }

  private scopeEmailSelector(selector: string): string {
    const trimmedSelector = selector.trim();
    if (!trimmedSelector) {
      return selector;
    }

    const layoutScopedSelector = trimmedSelector
      .replace(/\bhtml\b/g, '.rte-email-layout')
      .replace(/:root\b/g, '.rte-email-layout')
      .replace(/\bbody\b/g, '.rte-email-layout');

    if (layoutScopedSelector === '.rte-email-layout' || layoutScopedSelector.startsWith('.rte-email-layout ')) {
      return layoutScopedSelector;
    }

    if (/^[>+~]/.test(layoutScopedSelector)) {
      return `.rte-email-layout ${layoutScopedSelector}`;
    }

    return `.rte-email-layout ${layoutScopedSelector}`;
  }

  private extractEditedEmailBody(editorHtml: string): string {
    const container = document.createElement('div');
    container.innerHTML = editorHtml;

    const layoutRoot = container.querySelector('[data-rte-email-layout="true"]');
    if (layoutRoot instanceof HTMLDivElement) {
      return layoutRoot.innerHTML;
    }

    return editorHtml;
  }

  private extractColorSchemeMediaBlocks(css: string, mode: 'dark' | 'light'): string[] {
    const blocks: string[] = [];
    const mediaRegex = new RegExp(`@media\\s*\\(\\s*prefers-color-scheme\\s*:\\s*${mode}\\s*\\)\\s*\\{`, 'gi');

    let match: RegExpExecArray | null;
    while ((match = mediaRegex.exec(css)) !== null) {
      const openingBraceIndex = mediaRegex.lastIndex - 1;
      const closingBraceIndex = this.findMatchingCssBrace(css, openingBraceIndex);
      if (closingBraceIndex === -1) {
        break;
      }

      const blockContent = css.slice(openingBraceIndex + 1, closingBraceIndex).trim();
      if (blockContent) {
        blocks.push(blockContent);
      }

      mediaRegex.lastIndex = closingBraceIndex + 1;
    }

    return blocks;
  }

  private removeColorSchemeMediaBlocks(css: string): string {
    const ranges: Array<{ start: number; end: number }> = [];

    for (const mode of ['dark', 'light'] as const) {
      const mediaRegex = new RegExp(`@media\\s*\\(\\s*prefers-color-scheme\\s*:\\s*${mode}\\s*\\)\\s*\\{`, 'gi');
      let match: RegExpExecArray | null;

      while ((match = mediaRegex.exec(css)) !== null) {
        const startIndex = match.index;
        const openingBraceIndex = mediaRegex.lastIndex - 1;
        const closingBraceIndex = this.findMatchingCssBrace(css, openingBraceIndex);
        if (closingBraceIndex === -1) {
          break;
        }

        ranges.push({ start: startIndex, end: closingBraceIndex + 1 });
        mediaRegex.lastIndex = closingBraceIndex + 1;
      }
    }

    if (ranges.length === 0) {
      return css;
    }

    ranges.sort((left, right) => left.start - right.start);
    let cursor = 0;
    let result = '';

    for (const range of ranges) {
      if (range.start < cursor) {
        continue;
      }

      result += css.slice(cursor, range.start);
      cursor = range.end;
    }

    result += css.slice(cursor);
    return result;
  }

  private findMatchingCssBrace(source: string, openingBraceIndex: number): number {
    let depth = 0;
    let quote: '"' | '\'' | null = null;
    let isEscaped = false;

    for (let index = openingBraceIndex; index < source.length; index += 1) {
      const character = source[index];

      if (quote) {
        if (!isEscaped && character === quote) {
          quote = null;
        }
        isEscaped = !isEscaped && character === '\\';
        continue;
      }

      if (character === '"' || character === '\'') {
        quote = character as '"' | '\'';
        isEscaped = false;
        continue;
      }

      if (character === '{') {
        depth += 1;
        continue;
      }

      if (character === '}') {
        depth -= 1;
        if (depth === 0) {
          return index;
        }
      }
    }

    return -1;
  }
}
