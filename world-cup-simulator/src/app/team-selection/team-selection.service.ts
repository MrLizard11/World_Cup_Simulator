import { Injectable } from '@angular/core';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamSelectionService {
  private selectedTeams: Team[] = [];

  // Pre-defined teams for the dropdown
  private teams: string[] = [
    'Brazil', 'Argentina', 'France', 'Germany', 'Spain', 'England', 
    'Italy', 'Netherlands', 'Portugal', 'Belgium', 'Croatia', 'Uruguay',
    'Mexico', 'Colombia', 'Chile', 'Peru', 'Ecuador', 'Venezuela',
    'United States', 'Canada', 'Japan', 'South Korea', 'Australia',
    'Saudi Arabia', 'Iran', 'Qatar', 'Morocco', 'Tunisia', 'Egypt',
    'Ghana', 'Nigeria', 'Senegal'
  ];

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

    // FIFA country codes mapping
    private countryCodeMap: { [key: string]: string } = {
      'Brazil': 'BRA',
      'Argentina': 'ARG',
      'France': 'FRA',
      'Germany': 'GER',
      'Spain': 'ESP',
      'England': 'ENG',
      'Italy': 'ITA',
      'Netherlands': 'NED',
      'Portugal': 'POR',
      'Belgium': 'BEL',
      'Croatia': 'CRO',
      'Uruguay': 'URU',
      'Mexico': 'MEX',
      'Colombia': 'COL',
      'Chile': 'CHI',
      'Peru': 'PER',
      'Ecuador': 'ECU',
      'Venezuela': 'VEN',
      'United States': 'USA',
      'Canada': 'CAN',
      'Japan': 'JPN',
      'South Korea': 'KOR',
      'Australia': 'AUS',
      'Saudi Arabia': 'KSA',
      'Iran': 'IRN',
      'Qatar': 'QAT',
      'Morocco': 'MAR',
      'Tunisia': 'TUN',
      'Egypt': 'EGY',
      'Ghana': 'GHA',
      'Nigeria': 'NGA',
      'Senegal': 'SEN'
    };
  
    // Approximate ELO ratings (based on recent FIFA rankings)
    private eloRatings: { [key: string]: number } = {
      'Brazil': 2001,
      'Argentina': 2131,
      'France': 2055,
      'Germany': 1913,
      'Spain': 2156,
      'England': 1984,
      'Italy': 1881,
      'Netherlands': 1975,
      'Portugal': 2030,
      'Belgium': 1846,
      'Croatia': 1926,
      'Uruguay': 1901,
      'Mexico': 1860,
      'Colombia': 1951,
      'Chile': 1688,
      'Peru': 1743,
      'Ecuador': 1905,
      'Venezuela': 1745,
      'United States': 1696,
      'Canada': 1768,
      'Japan': 1881,
      'South Korea': 1752,
      'Australia': 1773,
      'Saudi Arabia': 1567,
      'Iran': 1799,
      'Qatar': 1517,
      'Morocco': 1812,
      'Tunisia': 1614,
      'Egypt': 1667,
      'Ghana': 1478,
      'Nigeria': 1578,
      'Senegal': 1784
    };

    private initializeSelectedTeams() {
      // Take the first 32 teams and convert them to Team objects
      this.selectedTeams = this.teams.slice(0, 32).map(teamName => ({
        name: teamName,
        country: teamName,
        elo: this.eloRatings[teamName] || Math.floor(Math.random() * (2000 - 1500 + 1)) + 1500,
        countryCode: this.countryCodeMap[teamName] || teamName.substring(0, 3).toUpperCase()
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
      return [...this.teams];
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
        elo: this.eloRatings[teamName] || Math.floor(Math.random() * (2000 - 1500 + 1)) + 1500,
        countryCode: this.countryCodeMap[teamName] || teamName.substring(0, 3).toUpperCase()
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
