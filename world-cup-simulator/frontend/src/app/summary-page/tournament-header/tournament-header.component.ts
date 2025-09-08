import { Component, Input } from '@angular/core';
import { Team } from '../../models';
import { KnockoutMatch } from '../../models/knockouts.model';
import { TeamPerformance } from '../../models/tournament-stats';

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

  getTopFourTeams(): Team[] {
    const topFour: Team[] = [];
    
    if (this.champion) {
      topFour.push(this.champion);
    }
    
    if (this.runnerUp) {
      topFour.push(this.runnerUp);
    }
    
    // Add semifinal teams (3rd and 4th place)
    this.semiFinalTeams.forEach(team => {
      if (topFour.length < 4) {
        topFour.push(team);
      }
    });
    
    return topFour;
  }
}
