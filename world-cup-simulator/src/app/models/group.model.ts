import { Team } from "./team.model";

export interface Group {
  id: number;
  name: string;
  teams: Team[];
  matches: Match[];
}

export interface Match {
  id: number;
  teamA: Team;
  teamB: Team;
  scoreA: number;
  scoreB: number;
  played: boolean;
}

export interface GroupStandings {
  groupId: number;
  standings: {
    team: Team;
    points: number;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
  }[];
}

export interface TeamStanding {
  groupId: number;
  groupName: string;
  team: Team;
  points: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}