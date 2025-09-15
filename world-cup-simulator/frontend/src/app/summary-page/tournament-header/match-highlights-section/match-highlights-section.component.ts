import { Component, Input } from '@angular/core';
import { TournamentStats } from '../../../models/tournament-stats';

@Component({
  selector: 'app-match-highlights-section',
  templateUrl: './match-highlights-section.component.html',
  styleUrls: ['./match-highlights-section.component.css']
})
export class MatchHighlightsSectionComponent {
  @Input() tournamentStats!: TournamentStats;
}
