import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Group, TeamStanding } from '../../models/group.model';

@Component({
  selector: 'app-group-stage-standings',
  templateUrl: './group-stage-standings.component.html',
  styleUrls: ['./group-stage-standings.component.css']
})
export class GroupStageStandingsComponent {

  @Input() groups: Group[] = [];
  @Input() groupStandings: TeamStanding[] = [];
  @Input() showGroupStandings: boolean = false;

  @Output() goToNextStage = new EventEmitter<void>();

  constructor(private router: Router) {}

  getStandingsForGroup(groupId: number): TeamStanding[] {
    return this.groupStandings
      .filter(standing => standing.groupId === groupId)
      .sort((a, b) => {
        // Sort by points (descending), then goal difference (descending), then goals for (descending)
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
  }

  onGoToNextStage(): void {
    this.goToNextStage.emit();
  }
}
