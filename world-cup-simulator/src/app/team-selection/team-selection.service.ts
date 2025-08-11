import { Injectable } from '@angular/core';
import { Team } from '../models/team.model';
import { AVAILABLE_TEAMS, COUNTRY_CODE_MAP, ELO_RATINGS } from './data';

@Injectable({
  providedIn: 'root'
})
export class TeamSelectionService {
  private selectedTeams: Team[] = [];

  constructor() { 
    // Check if there are teams in sessionStorage first
    const storedTeams = sessionStorage.getItem('selectedTeams');
    if (storedTeams) {
      try {
        this.selectedTeams = JSON.parse(storedTeams);
        console.log('Loaded teams from sessionStorage in service:', this.selectedTeams.length);
      } catch (error) {
        console.error('Error parsing stored teams in service:', error);
        this.initializeSelectedTeams();
      }
    } else {
      this.initializeSelectedTeams();
    }
  }

  private initializeSelectedTeams() {
    // Take the first 32 teams and convert them to Team objects
    this.selectedTeams = AVAILABLE_TEAMS.slice(0, 32).map(teamName => ({
      name: teamName,
      country: teamName,
      elo: ELO_RATINGS[teamName] || Math.floor(Math.random() * (2000 - 1500 + 1)) + 1500,
      countryCode: COUNTRY_CODE_MAP[teamName] || teamName.substring(0, 3).toUpperCase()
    })); 
    this.updateSessionStorage();
  }

  private updateSessionStorage(): void {
    sessionStorage.setItem('selectedTeams', JSON.stringify(this.selectedTeams));
  }

  // Public methods for component to use
  getSelectedTeams(): Team[] {
    return [...this.selectedTeams];
  }

  getAvailableTeams(): string[] {
    return [...AVAILABLE_TEAMS];
  }

  getSortedSelectedTeams(): Team[] {
    return [...this.selectedTeams].sort((a, b) => b.elo - a.elo);
  }

  addTeam(team: Team): boolean {
    if (this.selectedTeams.length < 32) {
      this.selectedTeams.push(team);
      this.updateSessionStorage();
      return true;
    }
    return false;
  }

  addPreDefinedTeam(teamName: string): { success: boolean; message?: string } {
    if (!teamName) {
      return { success: false, message: 'No team selected' };
    }

    if (this.selectedTeams.length >= 32) {
      return { success: false, message: 'Maximum 32 teams allowed!' };
    }

    // Check if team already exists
    const existingTeam = this.selectedTeams.find(team => 
      team.name === teamName || team.country === teamName
    );
    
    if (existingTeam) {
      return { success: false, message: 'Team already selected!' };
    }

    // Create a team object with proper data
    const newTeam: Team = {
      name: teamName,
      country: teamName,
      elo: ELO_RATINGS[teamName] || Math.floor(Math.random() * (2000 - 1500 + 1)) + 1500,
      countryCode: COUNTRY_CODE_MAP[teamName] || teamName.substring(0, 3).toUpperCase()
    };
    
    this.selectedTeams.push(newTeam);
    this.updateSessionStorage();
    return { success: true };
  }

  removeTeam(index: number): void {
    if (index >= 0 && index < this.selectedTeams.length) {
      this.selectedTeams.splice(index, 1);
      this.updateSessionStorage();
    }
  }

  getSelectedTeamsCount(): number {
    return this.selectedTeams.length;
  }

  canStartTournament(): boolean {
    return this.selectedTeams.length === 32;
  }

  prepareForTournament(): Team[] {
    if (this.canStartTournament()) {
      return [...this.selectedTeams];
    }
    return [];
  }

  clearSessionStorage(): void {
    sessionStorage.removeItem('selectedTeams');
  }

  resetToDefault(): void {
    this.initializeSelectedTeams();
  }
}
