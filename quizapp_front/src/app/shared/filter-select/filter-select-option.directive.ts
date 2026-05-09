import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

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

  @Input()
  set ngValue(value: FilterOptionValue) {
    this.writeSerializedValue(value);
  }

  @Input()
  set value(value: FilterOptionValue) {
    this.writeSerializedValue(value);
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