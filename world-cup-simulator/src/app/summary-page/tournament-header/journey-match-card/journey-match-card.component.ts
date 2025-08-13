import { Component, Input } from '@angular/core';
import { ChampionJourneyMatch } from '../../../models/tournament-stats';

@Component({
  selector: 'app-journey-match-card',
  templateUrl: './journey-match-card.component.html',
  styleUrls: ['./journey-match-card.component.css']
})
export class JourneyMatchCardComponent {
  @Input() match!: ChampionJourneyMatch;
  @Input() isLast: boolean = false;
}
