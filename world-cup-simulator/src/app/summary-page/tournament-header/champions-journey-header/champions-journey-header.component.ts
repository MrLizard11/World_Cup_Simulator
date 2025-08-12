import { Component, Input } from '@angular/core';
import { Team } from '../../../models/team.model';

@Component({
  selector: 'app-champions-journey-header',
  templateUrl: './champions-journey-header.component.html',
  styleUrls: ['./champions-journey-header.component.css']
})
export class ChampionsJourneyHeaderComponent {
  @Input() champion!: Team;
}
