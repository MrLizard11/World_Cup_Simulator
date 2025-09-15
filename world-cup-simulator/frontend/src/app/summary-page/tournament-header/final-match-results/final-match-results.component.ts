import { Component, Input } from '@angular/core';
import { KnockoutMatch } from '../../../models/knockouts.model';

@Component({
  selector: 'app-final-match-results',
  templateUrl: './final-match-results.component.html',
  styleUrls: ['./final-match-results.component.css']
})
export class FinalMatchResultsComponent {
  @Input() finalMatch!: KnockoutMatch;
}
