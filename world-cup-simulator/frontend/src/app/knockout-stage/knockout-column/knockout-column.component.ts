import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KnockoutMatch } from '../../models/knockouts.model';

@Component({
  selector: 'app-knockout-column',
  templateUrl: './knockout-column.component.html',
  styleUrls: ['./knockout-column.component.css']
})
export class KnockoutColumnComponent {

  @Input() leftMatches: KnockoutMatch[] = [];
  @Input() rightMatches: KnockoutMatch[] = [];
  @Input() roundLabel: string = '';
  @Input() columnClass: string = '';
  @Input() showBothSides: boolean = true; // For rounds that have left/right splits
  @Input() isThirdPlaceMatchPlayed: boolean = false;

  @Output() simulateMatch = new EventEmitter<KnockoutMatch>();

  onSimulateMatch(match: KnockoutMatch) {
    this.simulateMatch.emit(match);
  }

  getRoundType(): 'round-of-16' | 'quarter-finals' | 'semi-finals' | 'final' {
    if (this.columnClass.includes('round-of-16')) return 'round-of-16';
    if (this.columnClass.includes('quarter-finals')) return 'quarter-finals';
    if (this.columnClass.includes('semi-finals')) return 'semi-finals';
    return 'final';
  }
}
