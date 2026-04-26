import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appEllipsisTooltip]',
  standalone: true
})
export class EllipsisTooltipDirective {
  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    const element = this.el.nativeElement;
    if (element.scrollWidth > element.clientWidth) {
      element.title = element.textContent?.trim() || '';
    } else {
      element.title = '';
    }
  }
}
