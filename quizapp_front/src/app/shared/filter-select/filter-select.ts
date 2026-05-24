import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  QueryList,
  computed,
  forwardRef,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FilterSelectOptionDirective } from './filter-select-option.directive';

type SelectValue = string | number | boolean | null | undefined;

interface SelectOption {
  label: string;
  value: SelectValue;
  disabled: boolean;
}

@Component({
  selector: 'app-filter-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterSelectComponent),
      multi: true
    }
  ],
  templateUrl: './filter-select.html',
  styleUrl: './filter-select.scss'
})
export class FilterSelectComponent implements AfterContentInit, ControlValueAccessor, OnDestroy {
  private _onChange: (value: SelectValue) => void = () => {};
  private _onTouched: () => void = () => {};
  private _optionsChangeSub: Subscription | null = null;

  @ContentChildren(FilterSelectOptionDirective, { descendants: true })
  private projectedOptions?: QueryList<FilterSelectOptionDirective>;

  private readonly _optionsList = signal<FilterSelectOptionDirective[]>([]);
  private readonly _value = signal<SelectValue>(null);

  readonly isOpen = signal(false);
  readonly focusedIndex = signal(-1);
  readonly dropdownDirection = signal<'down' | 'up'>('down');
  readonly dropdownMaxHeight = signal(240);
  readonly searchQuery = signal('');

  @Input()
  set value(v: SelectValue) { this._value.set(v); }
  get value(): SelectValue { return this._value(); }

  @Input() disabled = false;
  @Input() ariaLabel = 'Filtre';
  @Input() placeholder = '-- Sélectionner --';
  @Input() searchable = false;
  @Input() searchPlaceholder = 'Rechercher...';

  @Output() readonly valueChange = new EventEmitter<string | number | boolean | null>();

  readonly options = computed<SelectOption[]>(() =>
    this._optionsList().map(d => ({
      label: d.label(),
      value: d.resolvedValue(),
      disabled: d.disabled
    }))
  );

  readonly visibleOptions = computed<SelectOption[]>(() => {
    const query = this.searchable ? this.searchQuery().trim().toLowerCase() : '';
    if (!query) {
      return this.options();
    }

    return this.options().filter(option => option.label.toLowerCase().includes(query));
  });

  readonly currentLabel = computed(() => {
    const current = this._value();
    return this.options().find(o => o.value === current)?.label ?? this.placeholder;
  });

  constructor(private readonly _el: ElementRef) {}

  ngAfterContentInit(): void {
    this._optionsList.set(this.projectedOptions?.toArray() ?? []);
    this._optionsChangeSub = this.projectedOptions?.changes.subscribe(() => {
      this._optionsList.set(this.projectedOptions?.toArray() ?? []);
    }) ?? null;
  }

  ngOnDestroy(): void {
    this._optionsChangeSub?.unsubscribe();
  }

  toggle(): void {
    if (this.disabled) return;
    if (this.isOpen()) {
      this.close();
    } else {
      this.openDropdown();
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
    this.searchQuery.set('');
  }

  selectOption(opt: SelectOption): void {
    if (opt.disabled) return;
    this._value.set(opt.value);
    this.valueChange.emit(opt.value ?? null);
    this._onChange(opt.value);
    this._onTouched();
    this.close();
  }

  onTriggerBlur(): void {
    if (!this.isOpen()) {
      this._onTouched();
    }
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    const opts = this.visibleOptions();
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.isOpen()) {
          const focused = opts[this.focusedIndex()];
          if (focused) this.selectOption(focused);
        } else {
          this.toggle();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
        } else {
          this.moveFocus(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
        } else {
          this.moveFocus(-1);
        }
        break;
      case 'Escape':
        if (this.isOpen()) {
          this.close();
          this._onTouched();
        }
        break;
      case 'Tab':
        if (this.isOpen()) {
          this.close();
        }
        break;
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.resetFocusedOption();
    this.scrollToFocused();
  }

  onSearchKeydown(event: KeyboardEvent): void {
    const opts = this.visibleOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocus(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocus(-1);
        break;
      case 'Enter': {
        const focused = opts[this.focusedIndex()];
        if (focused) {
          event.preventDefault();
          this.selectOption(focused);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        this._onTouched();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this._el.nativeElement.contains(event.target as Node)) {
      this.close();
      this._onTouched();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isOpen()) {
      this.updateDropdownPlacement();
    }
  }

  writeValue(value: SelectValue): void {
    this._value.set(value);
  }

  registerOnChange(fn: (value: SelectValue) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private openDropdown(): void {
    this.isOpen.set(true);
    this.searchQuery.set('');
    this.updateDropdownPlacement();
    this.resetFocusedOption();
    this.scrollToFocused();
    if (this.searchable) {
      this.focusSearchInput();
    }
  }

  private resetFocusedOption(): void {
    const opts = this.visibleOptions();
    const currentIdx = opts.findIndex(option => option.value === this._value());
    this.focusedIndex.set(currentIdx >= 0 ? currentIdx : (opts.length > 0 ? 0 : -1));
  }

  private moveFocus(step: number): void {
    const opts = this.visibleOptions();
    if (opts.length === 0) {
      this.focusedIndex.set(-1);
      return;
    }

    const currentIdx = this.focusedIndex();
    const nextIdx = currentIdx < 0
      ? (step > 0 ? 0 : opts.length - 1)
      : Math.max(0, Math.min(currentIdx + step, opts.length - 1));

    this.focusedIndex.set(nextIdx);
    this.scrollToFocused();
  }

  private updateDropdownPlacement(): void {
    setTimeout(() => {
      const trigger = this._el.nativeElement.querySelector('.filter-select-trigger') as HTMLElement | null;
      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const viewportMargin = 16;
      const preferredHeight = this.searchable ? 320 : 240;
      const spaceBelow = Math.max(0, viewportHeight - rect.bottom - viewportMargin);
      const spaceAbove = Math.max(0, rect.top - viewportMargin);
      const openUpwards = spaceBelow < 220 && spaceAbove > spaceBelow;
      const availableSpace = openUpwards ? spaceAbove : spaceBelow;
      const fallbackSpace = Math.max(spaceAbove, spaceBelow);
      const maxHeight = availableSpace > 0 ? availableSpace : fallbackSpace;

      this.dropdownDirection.set(openUpwards ? 'up' : 'down');
      this.dropdownMaxHeight.set(Math.floor(Math.min(preferredHeight, maxHeight || preferredHeight)));
    });
  }

  private focusSearchInput(): void {
    setTimeout(() => {
      const input = this._el.nativeElement.querySelector('.filter-select-search-input') as HTMLInputElement | null;
      input?.focus();
      input?.select();
    });
  }

  private scrollToFocused(): void {
    setTimeout(() => {
      const el = this._el.nativeElement.querySelector('.filter-select-option.focused') as HTMLElement | null;
      el?.scrollIntoView({ block: 'nearest' });
    });
  }
}

export { FilterSelectOptionDirective };
