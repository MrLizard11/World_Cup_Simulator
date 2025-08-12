import { Component, Input } from '@angular/core';
import { Team } from '../../models/team.model';

@Component({
  selector: 'app-position-info',
  templateUrl: './position-info.component.html',
  styleUrls: ['./position-info.component.css']
})
export class PositionInfoComponent {
  @Input() team!: Team;
  @Input() position!: number;
  @Input() showStats: boolean = true;

  getPositionSuffix(): string {
    const lastDigit = this.position % 10;
    const lastTwoDigits = this.position % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return 'th';
    }
    
    switch (lastDigit) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
}
