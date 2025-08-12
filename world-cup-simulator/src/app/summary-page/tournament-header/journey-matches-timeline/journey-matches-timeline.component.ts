import { Component, Input } from '@angular/core';
import { ChampionJourney } from '../../../models/tournament-stats';

@Component({
  selector: 'app-journey-matches-timeline',
  templateUrl: './journey-matches-timeline.component.html',
  styleUrls: ['./journey-matches-timeline.component.css']
})
export class JourneyMatchesTimelineComponent {
  @Input() championJourney!: ChampionJourney;
}
