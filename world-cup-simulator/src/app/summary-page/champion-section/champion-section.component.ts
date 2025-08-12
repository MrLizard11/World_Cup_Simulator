import { Component, Input } from '@angular/core';
import { Team } from '../../models';

@Component({
  selector: 'app-champion-section',
  templateUrl: './champion-section.component.html',
  styleUrls: ['./champion-section.component.css']
})
export class ChampionSectionComponent {
  @Input() champion: Team | null = null;
}
