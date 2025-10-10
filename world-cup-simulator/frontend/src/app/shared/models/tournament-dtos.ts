// DTOs shared between frontend and API services
export interface CreateTeamRequest {
  name: string;
  country: string;
  elo: number;
  countryCode: string;
}

export interface BulkCreateTeamsRequest {
  teams: CreateTeamRequest[];
}

export interface BulkCreateGroupsRequest {
  groupNames: string[];
}

export interface PopulateDefaultTeamsRequest {
  // kept extensible for future options
}

export interface TeamResponse {
  id: number;
  name: string;
  country: string;
  elo: number;
  countryCode: string;
}

export interface GroupResponse {
  id: number;
  name: string;
  teams: TeamResponse[];
}

export interface BiggestWinResponse {
  matchId?: number;
  winner: TeamResponse;
  loser: TeamResponse;
  goalDifference: number;
}

export interface MostGoalsMatchResponse {
  matchId?: number;
  teamA: TeamResponse;
  teamB: TeamResponse;
  goalsA: number;
  goalsB: number;
}

export interface TournamentStatisticsResponse {
  totalGoals: number;
  averageGoalsPerMatch: number;
  biggestWin: BiggestWinResponse | null;
  penaltyShootouts: number;
  mostGoalsInMatch: MostGoalsMatchResponse | null;
  totalMatches: number;
  completedMatches: number;
}

export interface TeamPerformanceResponse {
  team: TeamResponse;
  matchesPlayed: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
  finalPosition: string;
  path: string[];
}

export interface KnockoutMatchResponse {
  id: number;
  round: string;
  teamA?: TeamResponse | null;
  teamB?: TeamResponse | null;
  scoreA?: number | null;
  scoreB?: number | null;
  decidedByPenalty?: boolean;
}

export interface KnockoutBracketResponse {
  rounds: {
    name: string;
    matches: KnockoutMatchResponse[];
  }[];
}

export interface GenerateKnockoutBracketRequest {
  includeThirdPlace?: boolean;
}

export type SimulationModeString = 'Random' | 'EloSimple' | 'EloRealistic' | 'EloAdvanced';

export interface SimulateMatchResponse {
  scoreA: number;
  scoreB: number;
  winner?: number | null;
  matchId?: number;
}
