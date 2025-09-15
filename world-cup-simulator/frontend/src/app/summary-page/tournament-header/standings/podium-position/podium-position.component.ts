import { Component, Input } from '@angular/core';
import { Team } from '../../../../models/team.model';

@Component({
  selector: 'app-podium-position',
  templateUrl: './podium-position.component.html',
  styleUrls: ['./podium-position.component.css']
})
export class PodiumPositionComponent {
  @Input() team!: Team;
  @Input() position!: number;

  getMedal(): string {
    switch (this.position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  }

  getPositionClass(): string {
    switch (this.position) {
      case 1: return 'first-place';
      case 2: return 'second-place';
      case 3: return 'third-place';
      default: return '';
    }
  }
}
