import { Component, Input, Output, EventEmitter, signal, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnDef } from '../entity-crud-base';
import { FilterCheckboxComponent } from '../filter-checkbox/filter-checkbox';

@Component({
  selector: 'app-column-visibility-manager',
  standalone: true,
  imports: [CommonModule, FilterCheckboxComponent],
  templateUrl: './column-visibility-manager.html',
  styleUrls: ['./column-visibility-manager.scss']
})
export class ColumnVisibilityManagerComponent {
  @Input() columns: ColumnDef[] = [];
  @Input() visibleColumns: Set<string> = new Set();
  @Input() hiddenCount = 0;

  @Output() toggleColumn = new EventEmitter<string>();
  @Output() showAll = new EventEmitter<void>();
  @Output() resetColumns = new EventEmitter<void>();

  isOpen = signal(false);

  constructor(private elementRef: ElementRef) {}

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  isVisible(key: string): boolean {
    return this.visibleColumns.size === 0 || this.visibleColumns.has(key);
  }

  isLocked(key: string): boolean {
    return key === 'actions';
  }

  onToggle(key: string): void {
    if (this.isLocked(key)) return;
    this.toggleColumn.emit(key);
  }

  onShowAll(): void {
    this.showAll.emit();
  }

  onReset(): void {
    this.resetColumns.emit();
  }
}
