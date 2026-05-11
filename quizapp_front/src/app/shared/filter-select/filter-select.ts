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

  @Input()
  set value(v: SelectValue) { this._value.set(v); }
  get value(): SelectValue { return this._value(); }

  @Input() disabled = false;
  @Input() ariaLabel = 'Filtre';
  @Input() placeholder = '-- Sélectionner --';

  @Output() readonly valueChange = new EventEmitter<string | number | boolean | null>();

  readonly options = computed<SelectOption[]>(() =>
    this._optionsList().map(d => ({
      label: d.label(),
      value: d.resolvedValue(),
      disabled: d.disabled
    }))
  );

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
      this.isOpen.set(true);
      const currentIdx = this.options().findIndex(o => o.value === this._value());
      this.focusedIndex.set(currentIdx >= 0 ? currentIdx : 0);
      this.scrollToFocused();
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
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
    const opts = this.options();
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
          this.toggle();
        } else {
          this.focusedIndex.update(i => Math.min(i + 1, opts.length - 1));
          this.scrollToFocused();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.toggle();
        } else {
          this.focusedIndex.update(i => Math.max(i - 1, 0));
          this.scrollToFocused();
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this._el.nativeElement.contains(event.target as Node)) {
      this.close();
      this._onTouched();
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

  private scrollToFocused(): void {
    setTimeout(() => {
      const el = this._el.nativeElement.querySelector('.filter-select-option.focused') as HTMLElement | null;
      el?.scrollIntoView({ block: 'nearest' });
    });
  }
}

export { FilterSelectOptionDirective };
