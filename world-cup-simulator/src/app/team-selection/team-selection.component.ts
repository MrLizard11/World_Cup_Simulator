import { Component } from '@angular/core';
import { Team } from '../add-team-form/add-team-form.component';

@Component({
  selector: 'app-team-selection',
  templateUrl: './team-selection.component.html',
  styleUrls: ['./team-selection.component.css']
})
export class TeamSelectionComponent {
  showAddTeamForm = false;
  selectedTeams: Team[] = [];
  
  // Pre-defined teams for the dropdown
  teams: string[] = [
    'Brazil', 'Argentina', 'France', 'Germany', 'Spain', 'England', 
    'Italy', 'Netherlands', 'Portugal', 'Belgium', 'Croatia', 'Uruguay',
    'Mexico', 'Colombia', 'Chile', 'Peru', 'Ecuador', 'Venezuela',
    'United States', 'Canada', 'Japan', 'South Korea', 'Australia',
    'Saudi Arabia', 'Iran', 'Qatar', 'Morocco', 'Tunisia', 'Egypt',
    'Ghana', 'Nigeria', 'Senegal'
  ];

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

  constructor() {
    this.initializeSelectedTeams();
  }

  // Getter to return teams sorted by ELO rating (highest to lowest)
  get sortedSelectedTeams(): Team[] {
    return [...this.selectedTeams].sort((a, b) => b.elo - a.elo);
  }

  private initializeSelectedTeams() {
    // Take the first 32 teams and convert them to Team objects
    this.selectedTeams = this.teams.slice(0, 32).map(teamName => ({
      name: teamName,
      country: teamName,
      elo: this.eloRatings[teamName] || Math.floor(Math.random() * (2000 - 1500 + 1)) + 1500, //initial ELO rating but random if not defined
      countryCode: this.countryCodeMap[teamName] || teamName.substring(0, 3).toUpperCase()
    })); 
  }

  addTeam() {
    this.showAddTeamForm = true;
  }

  onTeamAdded(team: Team) {
    if (this.selectedTeams.length < 32) {
      this.selectedTeams.push(team);
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
    
    if (selectedTeam && this.selectedTeams.length < 32) {
      // Check if team already exists
      const existingTeam = this.selectedTeams.find(team => 
        team.name === selectedTeam || team.country === selectedTeam
      );
      
      if (!existingTeam) {
        // Create a team object with proper data
        const newTeam: Team = {
          name: selectedTeam,
          country: selectedTeam,
          elo: this.eloRatings[selectedTeam] || Math.floor(Math.random() * (2000 - 1500 + 1)) + 1500,
          countryCode: this.countryCodeMap[selectedTeam] || selectedTeam.substring(0, 3).toUpperCase()
        };
        this.selectedTeams.push(newTeam);
        select.value = ''; // Reset the dropdown
      } else {
        alert('Team already selected!');
      }
    } else if (this.selectedTeams.length >= 32) {
      alert('Maximum 32 teams allowed!');
    }
  }

  removeTeam(index: number) {
    this.selectedTeams.splice(index, 1);
  }

  startTournament() {
    if (this.selectedTeams.length === 32) {
      console.log('Starting tournament with teams:', this.selectedTeams);
    } else {
      alert(`Please select exactly 32 teams. Currently selected: ${this.selectedTeams.length}`);
    }
    //will do after this page
  }
}
