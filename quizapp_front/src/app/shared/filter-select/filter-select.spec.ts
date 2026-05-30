import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { FilterSelectComponent } from './filter-select';
import { FilterSelectOptionDirective } from './filter-select-option.directive';

@Component({
  standalone: true,
  imports: [FormsModule, FilterSelectComponent, FilterSelectOptionDirective],
  template: `
    <div class="host-shell" (click)="$event.stopPropagation()">
      <app-filter-select [(ngModel)]="selectedValue" ariaLabel="Question type">
        <option [ngValue]="null">Toutes</option>
        <option [ngValue]="'A'">Option A</option>
        <option [ngValue]="'B'">Option B</option>
      </app-filter-select>
    </div>
    <button type="button" class="outside-target">Outside</button>
  `
})
class FilterSelectHostTestComponent {
  selectedValue: string | null = null;
}

describe('FilterSelectComponent', () => {
  let fixture: ComponentFixture<FilterSelectHostTestComponent>;
  let hostComponent: FilterSelectHostTestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterSelectHostTestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterSelectHostTestComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('closes the dropdown on outside pointerdown even when the surrounding container stops click propagation', () => {
    const selectDebugElement = fixture.debugElement.query(By.directive(FilterSelectComponent));
    const selectInstance = selectDebugElement.componentInstance as FilterSelectComponent;
    const trigger = fixture.nativeElement.querySelector('.filter-select-trigger') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();

    expect(selectInstance.isOpen()).toBeTrue();

    document.querySelector('.outside-target')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    fixture.detectChanges();

    expect(selectInstance.isOpen()).toBeFalse();
  });

  it('keeps the dropdown open when the pointerdown happens inside the component', () => {
    const selectDebugElement = fixture.debugElement.query(By.directive(FilterSelectComponent));
    const selectInstance = selectDebugElement.componentInstance as FilterSelectComponent;
    const trigger = fixture.nativeElement.querySelector('.filter-select-trigger') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();

    trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    fixture.detectChanges();

    expect(selectInstance.isOpen()).toBeTrue();
  });

  it('still writes back the selected option through ngModel', () => {
    const trigger = fixture.nativeElement.querySelector('.filter-select-trigger') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();

    const options = Array.from(fixture.nativeElement.querySelectorAll('.filter-select-option')) as HTMLLIElement[];
    options[1].click();
    fixture.detectChanges();

    expect(hostComponent.selectedValue).toBe('A');
  });
});