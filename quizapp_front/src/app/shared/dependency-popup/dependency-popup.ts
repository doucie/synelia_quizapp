import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DependencyInfo } from '../models/interfaces';

@Component({
  selector: 'app-dependency-popup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dependency-popup.html',
  styleUrls: ['./dependency-popup.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DependencyPopupComponent {
  info = input.required<DependencyInfo>();
  mode = input.required<'delete' | 'restore'>();
  visible = input.required<boolean>();

  cancel = output<void>();
  confirm = output<void>();

  /** For CRITICAL delete: user must check a box before confirming */
  criticalConfirmed = false;

  onOverlayClick(): void {
    this.cancel.emit();
  }

  onCancel(): void {
    this.criticalConfirmed = false;
    this.cancel.emit();
  }

  onConfirm(): void {
    this.criticalConfirmed = false;
    this.confirm.emit();
  }
}
