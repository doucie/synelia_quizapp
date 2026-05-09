import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextUniqueId = 0;

@Component({
  selector: 'app-filter-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterCheckboxComponent),
      multi: true
    }
  ],
  templateUrl: './filter-checkbox.html',
  styleUrl: './filter-checkbox.scss'
})
export class FilterCheckboxComponent implements AfterViewInit, ControlValueAccessor {
  private readonly fallbackId = `filter-checkbox-${nextUniqueId++}`;
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  @Input() inputId: string | null = null;
  @Input() label = '';
  @Input() hint: string | null = null;
  @Input() checked = false;
  @Input() disabled = false;
  @Input() ariaLabel: string | null = null;
  @Input() variant: 'filter' | 'inline' | 'switch' = 'filter';

  @Output() checkedChange = new EventEmitter<boolean>();

  transitionsReady = false;

  get resolvedInputId(): string {
    const trimmedId = this.inputId?.trim();
    return trimmedId ? trimmedId : this.fallbackId;
  }

  get resolvedAriaLabel(): string | null {
    const trimmedLabel = this.ariaLabel?.trim();
    if (trimmedLabel) {
      return trimmedLabel;
    }

    return this.label ? null : 'Checkbox';
  }

  get isInlineVariant(): boolean {
    return this.variant === 'inline';
  }

  get isSwitchVariant(): boolean {
    return this.variant === 'switch';
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.transitionsReady = true;
    });
  }

  writeValue(value: boolean | null): void {
    this.checked = Boolean(value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onCheckedChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.checked = Boolean(input?.checked);
    this.checkedChange.emit(this.checked);
    this.onChange(this.checked);
    this.onTouched();
  }

  onInputBlur(): void {
    this.onTouched();
  }
}