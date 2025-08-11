import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KnockoutMatch } from '../../../models/knockouts.model';

// Interface for group stage matches (to support both match types)
interface GroupMatch {
  teamA: { name: string };
  teamB: { name: string };
  scoreA: number;
  scoreB: number;
  played: boolean;
}

@Component({
  selector: 'app-match-details',
  templateUrl: './match-details.component.html',
  styleUrls: ['./match-details.component.css']
})
export class MatchDetailsComponent {
  @Input() match: KnockoutMatch | GroupMatch | any;
  @Input() showSimulateButton: boolean = true;
  @Input() buttonText: string = 'Simulate';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() layout: 'vertical' | 'horizontal' = 'vertical';
  @Input() showPlayedIndicator: boolean = true;

  @Output() simulateMatch = new EventEmitter<any>();
  @Output() matchClick = new EventEmitter<any>();

  isWinner(team: 'A' | 'B'): boolean {
    if (!this.match?.played || !this.match?.winner) return false;
    const teamName = team === 'A' ? this.match.teamA.name : this.match.teamB.name;
    return this.match.winner === teamName;
  }

  getScoreDisplay(): string {
    if (!this.match?.played) return '0 - 0';

    let display = `${this.match.scoreA || 0} - ${this.match.scoreB || 0}`;

    // Handle penalty scores for knockout matches
    if (this.match.wentToPenalties && 
        this.match.penaltyScoreA !== undefined && 
        this.match.penaltyScoreB !== undefined) {
      display += ` (${this.match.penaltyScoreA} - ${this.match.penaltyScoreB} pens)`;
    }

    return display;
  }

  onSimulate() {
    this.simulateMatch.emit(this.match);
  }

  onMatchClick() {
    this.matchClick.emit(this.match);
  }
}
