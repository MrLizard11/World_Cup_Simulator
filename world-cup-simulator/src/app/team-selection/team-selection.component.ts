import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Team } from '../models/team.model';
import { TeamSelectionService } from './team-selection.service';

@Component({
  selector: 'app-team-selection',
  templateUrl: './team-selection.component.html',
  styleUrls: ['./team-selection.component.css']
})
export class TeamSelectionComponent implements OnInit {
  showAddTeamForm = false;

  constructor(private router: Router, private teamSelectionService: TeamSelectionService) {
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  get selectedTeams(): Team[] {
    return this.teamSelectionService.getSelectedTeams();
  }

  get teams(): string[] {
    return this.teamSelectionService.getAvailableTeams();
  }

  get sortedSelectedTeams(): Team[] {
    return this.teamSelectionService.getSortedSelectedTeams();
  }



  addTeam() {
    this.showAddTeamForm = true;
  }

  onTeamAdded(team: Team) {
    const success = this.teamSelectionService.addTeam(team);
    if (success) {
      this.showAddTeamForm = false;
    } else {
      alert('Maximum 32 teams allowed!');
    }
  }

  onFormClosed() {
    this.showAddTeamForm = false;
  }

  addPreDefinedTeam() {
    const select = document.getElementById('teamSelect') as HTMLSelectElement;
    const selectedTeam = select.value;
    
    const result = this.teamSelectionService.addPreDefinedTeam(selectedTeam);
    
    if (result.success) {
      select.value = ''; // Reset the dropdown
    } else {
      alert(result.message);
    }
  }

  removeTeam(index: number) {
    this.teamSelectionService.removeTeam(index);
  }

  startTournament() {
    if (this.teamSelectionService.canStartTournament()) {
      const teams = this.teamSelectionService.prepareForTournament();
      console.log('Starting tournament with teams:', teams);
      // Teams are automatically stored in sessionStorage by the service
      this.router.navigate(['/group-stage']);
    } else {
      const count = this.teamSelectionService.getSelectedTeamsCount();
      alert(`Please select exactly 32 teams. Currently selected: ${count}`);
    }
  }
}
