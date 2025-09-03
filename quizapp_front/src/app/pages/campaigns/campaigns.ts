import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './campaigns.html',
  styleUrl: './campaigns.scss'
})
export class CampaignsComponent {}
