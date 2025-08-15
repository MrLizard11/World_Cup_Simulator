import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Team } from '../models/team.model';
import { Group, Match, TeamStanding } from '../models/group.model';
import { MatchesService } from './matches.service';
import { TeamSelectionService } from '../team-selection/team-selection.service';
import { KnockoutStageService } from '../knockout-stage/knockout-stage.service';
import { TournamentStateService } from '../summary-page/tournament-state.service';
import { SimulationMode, SimulationModeService } from '../shared/services/simulation-mode.service';

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
  groupStandings: TeamStanding[] = [];

  constructor(
    private router: Router,
    private matchesService: MatchesService,
    private teamSelectionService: TeamSelectionService,
    private knockoutStageService: KnockoutStageService,
    private tournamentState: TournamentStateService,
    private simulationModeService: SimulationModeService
  ) {}

  ngOnInit(): void {
    // Scroll to top when component initializes
    window.scrollTo(0, 0);
    try {
      // Initialize from session storage using service
      const { selectedTeams, shouldRedirect } = this.matchesService.initializeFromSessionStorage();
      
      if (shouldRedirect || selectedTeams.length === 0) {
        this.router.navigate(['/team-selection']);
      } else {
        this.selectedTeams = selectedTeams;
        this.initializeGroupStage();
      }
    } catch (error) {
      console.error('Error initializing group stage:', error);
      this.router.navigate(['/team-selection']);
    }
  }

  initializeGroupStage() {
    try {
      const { groups, groupStandings } = this.matchesService.initializeGroupStageData(this.selectedTeams);
      this.groups = groups;
      this.groupStandings = groupStandings;
    } catch (error) {
      console.error('Error initializing group stage data:', error);
      // Navigate back to team selection on critical error
      this.router.navigate(['/team-selection']);
    }
  }


  goBack() {
    // Clear the stored teams when going back using the service
    this.teamSelectionService.clearSessionStorage();
    this.router.navigate(['/team-selection']);
  }

  getStandingsForGroup(groupId: number): TeamStanding[] {
    return this.matchesService.getStandingsForGroup(groupId, this.groupStandings);
  }

  simulateMatch(match: Match) {
    this.matchesService.simulateMatchInPlace(match, this.groupStandings);
  }

  onSimulationModeChanged(mode: SimulationMode): void {
    this.simulationModeService.setSimulationMode(mode);
    console.log('Simulation mode updated to:', mode);
  }

  runAllMatches() {
    try {
      this.matchesService.runAllMatchesInGroups(this.groups, this.groupStandings);
    } catch (error) {
      console.error('Error running all matches:', error);
      alert('Failed to simulate all matches. Please try individual match simulation.');
    }
  }

  canProceedToNextStage() {
    return this.matchesService.canProceedToNextStage(this.groups);
  }

  onToggleMatches(showMatches: boolean) {
    this.showMatches = showMatches;
  }

  onToggleStandings(showStandings: boolean) {
    this.showGroupStandings = showStandings;
  }

  private resetComponentState(): void {
    // Reset component state to default values
    this.groups = [];
    this.groupStandings = [];
    this.showMatches = true;
    this.showGroupStandings = false;
  }
  
  goToNextStage() {
    if (this.canProceedToNextStage()) {
      const result = this.matchesService.processNextStageTransition(
        this.groupStandings, 
        this.groups, 
        this.tournamentState
      );
      
      if (result.success) {
        this.router.navigate(['/knockout-stage']);
      } else {
        console.error(result.error);
      }
    } else {
      console.error('Cannot proceed to next stage, not all matches played');
    }
  }

  ngOnDestroy(): void {
    // Cleanup using service
    this.matchesService.cleanupGroupStage();
    
    // Reset component state using dedicated method
    this.resetComponentState();
  }
}
