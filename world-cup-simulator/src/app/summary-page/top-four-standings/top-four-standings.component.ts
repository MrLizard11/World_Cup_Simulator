import { Component, Input } from '@angular/core';
import { Team } from '../../models/team.model';

@Component({
  selector: 'app-top-four-standings',
  templateUrl: './top-four-standings.component.html',
  styleUrls: ['./top-four-standings.component.css']
})
export class TopFourStandingsComponent {
  @Input() topFour!: Team[];
}
