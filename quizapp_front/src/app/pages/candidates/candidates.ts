import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-candidates',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './candidates.html',
  styleUrls: ['./candidates.scss']
})
export class CandidatesComponent {}
