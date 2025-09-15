import { Component, Input } from '@angular/core';
import { ChampionJourney } from '../../../models/tournament-stats';

@Component({
  selector: 'app-journey-summary-stats',
  templateUrl: './journey-summary-stats.component.html',
  styleUrls: ['./journey-summary-stats.component.css']
})
export class JourneySummaryStatsComponent {
  @Input() championJourney!: ChampionJourney;
}
