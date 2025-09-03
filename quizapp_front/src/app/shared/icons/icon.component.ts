import { Component, Input } from '@angular/core';
import { SVG_ICONS, IconName } from './svg-icons';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<div class="icon-container" [innerHTML]="iconSvg" [style.color]="color"></div>`,
  styles: [`
    .icon-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      
      :deep(svg) {
        width: var(--icon-size, 24px);
        height: var(--icon-size, 24px);
        fill: currentColor;
      }
    }
  `]
})
export class IconComponent {
  @Input() name!: IconName;
  @Input() size: string = '24px';
  @Input() color?: string;

  get iconSvg(): string {
    return SVG_ICONS[this.name] || '';
  }

  ngOnInit() {
    // Set CSS custom property for icon size
    if (this.size) {
      const element = document.querySelector('app-icon') as HTMLElement;
      if (element) {
        element.style.setProperty('--icon-size', this.size);
      }
    }
  }
}
