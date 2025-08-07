import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Team } from '../models/team.model';
import { Group } from '../models/group.model';
import { MatchesService } from './matches.service';
import { TeamSelectionService } from '../team-selection/team-selection.service';
import { KnockoutStageService } from '../knockout-stage/knockout-stage.service';

@Component({
  selector: 'app-group-stage',
  templateUrl: './group-stage.component.html',
  styleUrls: ['./group-stage.component.css']
})
export class GroupStageComponent implements OnInit, OnDestroy {

  showMatches: boolean = true;
  showGroupStandings: boolean = false;
  selectedTeams: Team[] = [];
  groups: Group[] = [];
  groupStandings: any[] = [];

  constructor(
    private router: Router,
    private matchesService: MatchesService,
    private teamSelectionService: TeamSelectionService,
    private knockoutStageService: KnockoutStageService
  ) {
    // Get the selected teams from sessionStorage
    const storedTeams = sessionStorage.getItem('selectedTeams');
    if (storedTeams) {
      try {
        this.selectedTeams = JSON.parse(storedTeams);
      } catch (error) {
        console.error('Error parsing stored teams:', error);
        this.selectedTeams = [];
      }
    }

    // If no teams were found, redirect back to team selection
    if (this.selectedTeams.length === 0) {
      this.router.navigate(['/team-selection']);
    } else {
      this.initializeGroupStage();
    }
  }

  ngOnInit(): void {
    // Scroll to top when component initializes
    window.scrollTo(0, 0);
  }

  initializeGroupStage() {
    console.log('Received teams for group stage:', this.selectedTeams);
    this.groups = this.matchesService.generateGroupMatches(this.selectedTeams);
    this.groupStandings = this.matchesService.initializeGroupStandings(this.groups);
  }


  goBack() {
    // Clear the stored teams when going back using the service
    this.teamSelectionService.clearSessionStorage();
    this.router.navigate(['/team-selection']);
  }

  getStandingsForGroup(groupId: number): any[] {
    return this.groupStandings
      .filter(standing => standing.groupId === groupId)
      .sort((a, b) => {
        // Sort by points (descending), then goal difference (descending), then goals for (descending)
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
  }

  simulateMatch(match: any) {
    // Simulate the match with random scores, for now, will have some logic later
    match.scoreA = Math.floor(Math.random() * 5);
    match.scoreB = Math.floor(Math.random() * 5);
    match.played = true;

    // Update standings
    this.matchesService.updateStandingsAfterMatch(match, this.groupStandings);

    console.log(`Match simulated: ${match.teamA.name} ${match.scoreA} - ${match.scoreB} ${match.teamB.name}`);
  }



  runAllMatches() {
    // Simulate all matches in all groups
    this.groups.forEach(group => {
      group.matches.forEach(match => {
        if (!match.played) {
          this.simulateMatch(match);
        }
      });
    });
    console.log('All matches simulated!');
  }

  canProceedToNextStage() {
    // Check if all matches have been played
    return this.groups.every(group => group.matches.every(match => match.played));
  }
  
  goToNextStage() {
    if (this.canProceedToNextStage()) {

      const top16 = this.knockoutStageService.getTop16Teams(this.groupStandings);
      if (top16.length === 16) {
        sessionStorage.setItem('top16Teams', JSON.stringify(top16));
        
        this.router.navigate(['/knockout-stage']);
      } else {
        console.error(`Expected 16 teams, but got ${top16.length}. Cannot proceed to knockout stage.`);
      }
    } else {
      console.error('Cannot proceed to next stage, not all matches played');
    }
  }

  ngOnDestroy(): void {
    // Reset the matches service and clear match simulation data
    this.matchesService.resetGroupStage();
    this.groups = [];
    this.groupStandings = [];
    this.showMatches = true;
    this.showGroupStandings = false;
  }
}
