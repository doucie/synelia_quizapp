import { computed, signal } from '@angular/core';
import { ColumnDef } from './entity-crud-base';

export type { ColumnDef } from './entity-crud-base';

export class EntityColumnVisibilityState {
  readonly visibleColumns = signal<Set<string>>(new Set());
  readonly hiddenColumnsCount = computed(() => {
    if (this.columns.length === 0) return 0;
    return this.columns.length - this.visibleColumns().size;
  });

  private manualVisibleColumns: Set<string> | null = null;
  private hostElement: HTMLElement | null = null;
  private observedContainer: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private correctionFrame: number | null = null;

  constructor(
    readonly columns: ColumnDef[],
    private readonly storageKey: string,
  ) {
    this.init();
  }

  isColumnVisible(key: string): boolean {
    const columns = this.visibleColumns();
    return columns.size === 0 || columns.has(key);
  }

  toggleColumnVisibility(key: string): void {
    if (key === 'actions') return;

    const current = new Set(this.manualVisibleColumns ?? this.visibleColumns());
    if (current.has(key)) {
      if (current.size > 1) {
        current.delete(key);
      }
    } else {
      current.add(key);
    }

    current.add('actions');
    this.manualVisibleColumns = current;
    this.visibleColumns.set(current);
    this.save(current);
  }

  showAllColumns(): void {
    const all = new Set(this.columns.map(column => column.key));
    all.add('actions');
    this.manualVisibleColumns = all;
    this.visibleColumns.set(all);
    this.save(all);
  }

  resetColumnVisibility(): void {
    this.manualVisibleColumns = null;
    localStorage.removeItem(this.storageKey);
    this.applyAutoHideForHost();
  }

  observeHost(hostElement: HTMLElement): void {
    this.hostElement = hostElement;
    this.refreshObservedContainer();
    this.mutationObserver?.disconnect();
    this.mutationObserver = new MutationObserver(() => this.refreshObservedContainer());
    this.mutationObserver.observe(hostElement, { childList: true, subtree: true });
    this.applyAutoHideForHost();
  }

  disconnect(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    if (this.correctionFrame !== null) {
      cancelAnimationFrame(this.correctionFrame);
      this.correctionFrame = null;
    }
  }

  ensureCellTitle(target: EventTarget | null): void {
    const element = target instanceof HTMLElement ? target : null;
    const cell = element?.closest('.data-table td');
    if (!(cell instanceof HTMLTableCellElement) || cell.classList.contains('actions-cell')) return;
    if (cell.getAttribute('title')) return;

    const text = (cell.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (text && text !== '-') {
      cell.setAttribute('title', text);
    }
  }

  applyAutoHide(width: number = this.getViewportWidth()): void {
    if (this.manualVisibleColumns) {
      this.visibleColumns.set(new Set(this.manualVisibleColumns));
      return;
    }

    const visible = this.calculateDefaultVisible(width);
    this.visibleColumns.set(visible);
    this.scheduleOverflowCorrection();
  }

  applyAutoHideForHost(): void {
    const width = this.observedContainer?.clientWidth || this.getViewportWidth();
    this.applyAutoHide(width);
  }

  private init(): void {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const keys: string[] = JSON.parse(saved);
        const validKeys = keys.filter(key => this.columns.some(column => column.key === key));
        if (validKeys.length > 0) {
          const savedColumns = new Set(validKeys);
          savedColumns.add('actions');
          this.manualVisibleColumns = savedColumns;
          this.visibleColumns.set(savedColumns);
          return;
        }
      } catch {
        localStorage.removeItem(this.storageKey);
      }
    }

    this.applyAutoHide();
  }

  private calculateDefaultVisible(width: number): Set<string> {
    const visible = new Set(this.columns.map(column => column.key));
    visible.add('actions');

    const removable = [...this.columns]
      .filter(column => column.priority > 1 && column.key !== 'actions')
      .sort((left, right) => right.priority - left.priority || this.estimateColumnWidth(right) - this.estimateColumnWidth(left));

    let estimatedWidth = this.estimateVisibleWidth(visible);
    const availableWidth = Math.max(360, Math.min(width, 1400));

    for (const column of removable) {
      if (estimatedWidth <= availableWidth) break;
      visible.delete(column.key);
      estimatedWidth -= this.estimateColumnWidth(column);
    }

    return visible;
  }

  private estimateVisibleWidth(visible: Set<string>): number {
    return this.columns
      .filter(column => visible.has(column.key))
      .reduce((total, column) => total + this.estimateColumnWidth(column), 0);
  }

  private estimateColumnWidth(column: ColumnDef): number {
    const key = column.key.toLowerCase();

    if (key === 'actions') return 172;
    if (key === 'id' || key.endsWith('id')) return 84;
    if (key.includes('date') || key.includes('created') || key.includes('updated') || key.includes('expiration')) return 180;
    if (key.includes('status') || key.includes('role') || key.includes('type') || key.includes('score') || key.includes('active') || key.includes('correct')) return 140;
    if (key.includes('description') || key.includes('text') || key.includes('token')) return 340;
    if (key.includes('email')) return 240;
    if (column.priority === 1) return 210;
    if (column.priority === 2) return 180;
    return 160;
  }

  private refreshObservedContainer(): void {
    const container = this.hostElement?.querySelector('.data-table-container');
    if (!(container instanceof HTMLElement) || container === this.observedContainer) return;

    this.resizeObserver?.disconnect();
    this.observedContainer = container;
    this.resizeObserver = new ResizeObserver(() => this.applyAutoHideForHost());
    this.resizeObserver.observe(container);
    this.applyAutoHideForHost();
  }

  private scheduleOverflowCorrection(attempt = 0): void {
    if (this.manualVisibleColumns || !this.observedContainer || attempt > this.columns.length) return;

    if (this.correctionFrame !== null) {
      cancelAnimationFrame(this.correctionFrame);
    }

    this.correctionFrame = requestAnimationFrame(() => {
      this.correctionFrame = null;
      const container = this.observedContainer;
      if (!container || this.manualVisibleColumns) return;
      if (container.scrollWidth <= container.clientWidth + 2) return;

      const visible = new Set(this.visibleColumns());
      const nextColumn = [...this.columns]
        .filter(column => visible.has(column.key) && column.priority > 1 && column.key !== 'actions')
        .sort((left, right) => right.priority - left.priority || this.estimateColumnWidth(right) - this.estimateColumnWidth(left))[0];

      if (!nextColumn) return;
      visible.delete(nextColumn.key);
      visible.add('actions');
      this.visibleColumns.set(visible);
      this.scheduleOverflowCorrection(attempt + 1);
    });
  }

  private save(columns: Set<string>): void {
    localStorage.setItem(this.storageKey, JSON.stringify([...columns]));
  }

  private getViewportWidth(): number {
    if (typeof window === 'undefined') return 1400;
    return Math.min(Math.max(window.innerWidth - 48, 360), 1400);
  }
}