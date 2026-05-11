import { Directive, ElementRef, Input, Renderer2, booleanAttribute } from '@angular/core';

type FilterOptionValue = string | number | boolean | null | undefined;

@Directive({
  selector: 'option',
  standalone: true
})
export class FilterSelectOptionDirective {
  constructor(
    private readonly elementRef: ElementRef<HTMLOptionElement>,
    private readonly renderer: Renderer2
  ) {}

  @Input({ transform: booleanAttribute })
  disabled = false;

  @Input()
  set ngValue(value: FilterOptionValue) {
    this.writeSerializedValue(value);
  }

  @Input()
  set value(value: FilterOptionValue) {
    this.writeSerializedValue(value);
  }

  resolvedValue(): FilterOptionValue {
    const el = this.elementRef.nativeElement;
    const type = el.getAttribute('data-filter-select-type');
    const val = el.getAttribute('data-filter-select-value') ?? '';
    switch (type) {
      case 'undefined': return undefined;
      case 'null':      return null;
      case 'boolean':   return val === 'true';
      case 'number': {
        const parsed = Number(val);
        return Number.isNaN(parsed) ? null : parsed;
      }
      case 'string':    return val;
      default:          return el.value ?? null;
    }
  }

  label(): string {
    return this.elementRef.nativeElement.textContent?.trim() ?? '';
  }

  private writeSerializedValue(value: FilterOptionValue): void {
    const element = this.elementRef.nativeElement;

    if (value === undefined) {
      this.renderer.setAttribute(element, 'data-filter-select-type', 'undefined');
      this.renderer.setAttribute(element, 'data-filter-select-value', '');
      return;
    }

    if (value === null) {
      this.renderer.setAttribute(element, 'data-filter-select-type', 'null');
      this.renderer.setAttribute(element, 'data-filter-select-value', '');
      return;
    }

    if (typeof value === 'boolean') {
      this.renderer.setAttribute(element, 'data-filter-select-type', 'boolean');
      this.renderer.setAttribute(element, 'data-filter-select-value', value ? 'true' : 'false');
      return;
    }

    if (typeof value === 'number') {
      this.renderer.setAttribute(element, 'data-filter-select-type', 'number');
      this.renderer.setAttribute(element, 'data-filter-select-value', `${value}`);
      return;
    }

    this.renderer.setAttribute(element, 'data-filter-select-type', 'string');
    this.renderer.setAttribute(element, 'data-filter-select-value', value);
  }
}