import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mot-de-passe-oublie',
  imports: [CommonModule, RouterModule],
  templateUrl: './mot-de-passe-oublie.html',
  styleUrls: ['./mot-de-passe-oublie.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotDePasseOublieComponent {}
