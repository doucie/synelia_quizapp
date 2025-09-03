import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inscription',
  imports: [CommonModule, RouterModule],
  templateUrl: './inscription.html',
  styleUrls: ['./inscription.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InscriptionComponent {}
