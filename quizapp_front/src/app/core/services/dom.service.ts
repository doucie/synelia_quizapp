import { Injectable, Renderer2, RendererFactory2, DOCUMENT } from '@angular/core';
import { Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DomService {
  private renderer: Renderer2;

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  addClass(element: HTMLElement, className: string): void {
    this.renderer.addClass(element, className);
  }

  removeClass(element: HTMLElement, className: string): void {
    this.renderer.removeClass(element, className);
  }

  addBodyClass(className: string): void {
    this.renderer.addClass(this.document.body, className);
  }

  removeBodyClass(className: string): void {
    this.renderer.removeClass(this.document.body, className);
  }
}
