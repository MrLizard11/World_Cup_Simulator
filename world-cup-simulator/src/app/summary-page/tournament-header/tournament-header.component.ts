import { Component, Input } from '@angular/core';
import { Team } from '../../models';
import { KnockoutMatch } from '../../models/knockouts.model';

interface TeamPerformance {
  team: Team;
  finalPosition: string;
  matchesPlayed: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
  path: string[];
}

@Component({
  selector: 'app-tournament-header',
  templateUrl: './tournament-header.component.html',
  styleUrls: ['./tournament-header.component.css']
})
export class TournamentHeaderComponent {
  @Input() champion: Team | null = null;
  @Input() runnerUp: Team | null = null;
  @Input() semiFinalTeams: Team[] = [];
  @Input() finalMatch: KnockoutMatch | null = null;
  @Input() topPerformers: {
    champion: TeamPerformance | null;
    runnerUp: TeamPerformance | null;
    semifinalists: TeamPerformance[];
  } = {
    champion: null,
    runnerUp: null,
    semifinalists: []
  };
}
