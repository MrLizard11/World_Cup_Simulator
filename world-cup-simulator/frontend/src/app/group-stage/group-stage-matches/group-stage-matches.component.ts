import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Group, Match } from '../../models/group.model';

@Component({
  selector: 'app-group-stage-matches',
  templateUrl: './group-stage-matches.component.html',
  styleUrls: ['./group-stage-matches.component.css']
})
export class GroupStageMatchesComponent {

  @Input() groups: Group[] = [];
  @Input() showMatches: boolean = true;

  @Output() matchSimulated = new EventEmitter<Match>();

  onSimulateMatch(match: Match): void {
    this.matchSimulated.emit(match);
  }
}
