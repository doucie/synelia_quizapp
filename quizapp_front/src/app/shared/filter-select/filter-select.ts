import { AfterViewInit, Component, ContentChildren, ElementRef, EventEmitter, forwardRef, Input, OnDestroy, Output, QueryList, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FilterSelectOptionDirective } from './filter-select-option.directive';

type SelectValue = string | number | boolean | null | undefined;

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
export class FilterSelectComponent implements ControlValueAccessor {
  private onChange: (value: SelectValue) => void = () => {};
  private onTouched: () => void = () => {};
  private optionsChangesSubscription: Subscription | null = null;
  private syncScheduled = false;

  @ContentChildren(FilterSelectOptionDirective, { descendants: true })
  private readonly projectedOptions?: QueryList<FilterSelectOptionDirective>;

  @ViewChild('selectElement', { read: ElementRef })
  private readonly selectElement?: ElementRef<HTMLSelectElement>;

  @Input() value: SelectValue = null;
  @Input() disabled = false;
  @Input() ariaLabel = 'Filtre';

  @Output() valueChange = new EventEmitter<string | number | boolean | null>();

  ngAfterViewInit(): void {
    this.scheduleValueSync();
    this.optionsChangesSubscription = this.projectedOptions?.changes.subscribe(() => {
      this.scheduleValueSync();
    }) ?? null;
  }

  ngOnDestroy(): void {
    this.optionsChangesSubscription?.unsubscribe();
  }

  onValueChange(value: SelectValue): void {
    this.value = value;
    this.valueChange.emit(value ?? null);
    this.onChange(value);
  }

  onNativeChange(): void {
    const select = this.selectElement?.nativeElement;
    const selectedOption = select?.selectedOptions.item(0) ?? null;
    const value = this.deserializeOptionValue(selectedOption);

    this.onValueChange(value);
  }

  writeValue(value: SelectValue): void {
    this.value = value;
    this.scheduleValueSync();
  }

  registerOnChange(fn: (value: SelectValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectBlur(): void {
    this.onTouched();
  }

  private scheduleValueSync(): void {
    if (this.syncScheduled) {
      return;
    }

    this.syncScheduled = true;
    Promise.resolve().then(() => {
      this.syncScheduled = false;
      this.syncSelectedOption();
      this.ensureVisibleSelection();
    });
  }

  private syncSelectedOption(): void {
    const select = this.selectElement?.nativeElement;

    if (!select || select.options.length === 0) {
      return;
    }

    const serializedValue = this.serializeValue(this.value);

    for (const option of Array.from(select.options)) {
      const matches = option.getAttribute('data-filter-select-type') === serializedValue.type
        && (option.getAttribute('data-filter-select-value') ?? '') === serializedValue.value;

      option.selected = matches;
    }
  }

  private ensureVisibleSelection(): void {
    const select = this.selectElement?.nativeElement;

    if (!select || select.options.length === 0 || select.selectedIndex >= 0) {
      return;
    }

    select.selectedIndex = 0;
  }

  private deserializeOptionValue(option: HTMLOptionElement | null): SelectValue {
    const optionType = option?.getAttribute('data-filter-select-type');
    const optionValue = option?.getAttribute('data-filter-select-value') ?? '';

    switch (optionType) {
      case 'undefined':
        return undefined;
      case 'null':
        return null;
      case 'boolean':
        return optionValue === 'true';
      case 'number': {
        const parsed = Number(optionValue);
        return Number.isNaN(parsed) ? null : parsed;
      }
      case 'string':
        return optionValue;
      default:
        return option?.value ?? null;
    }
  }

  private serializeValue(value: SelectValue): { type: string; value: string } {
    if (value === undefined) {
      return { type: 'undefined', value: '' };
    }

    if (value === null) {
      return { type: 'null', value: '' };
    }

    if (typeof value === 'boolean') {
      return { type: 'boolean', value: value ? 'true' : 'false' };
    }

    if (typeof value === 'number') {
      return { type: 'number', value: `${value}` };
    }

    return { type: 'string', value };
  }
}

export { FilterSelectOptionDirective };