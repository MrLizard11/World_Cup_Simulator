import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KnockoutMatch } from '../../models/knockouts.model';

@Component({
  selector: 'app-bracket-section',
  templateUrl: './bracket-section.component.html',
  styleUrls: ['./bracket-section.component.css']
})
export class BracketSectionComponent {

  @Input() matches: KnockoutMatch[] = [];
  @Input() side: 'left' | 'right' | 'center' = 'center';
  @Input() round: 'round-of-16' | 'quarter-finals' | 'semi-finals' | 'final' = 'round-of-16';

  @Output() simulateMatch = new EventEmitter<KnockoutMatch>();

  onSimulateMatch(match: KnockoutMatch) {
    this.simulateMatch.emit(match);
  }

  getSectionClasses(): { [key: string]: boolean } {
    return {
      'left-bracket': this.side === 'left',
      'right-bracket': this.side === 'right',
      'center-bracket': this.side === 'center',
      [`${this.round}-round`]: true
    };
  }
}
