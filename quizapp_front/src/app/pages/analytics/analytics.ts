import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.scss']
})
export class AnalyticsComponent {}
