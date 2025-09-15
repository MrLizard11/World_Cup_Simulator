import { Team } from './team.model';

export interface TournamentStats {
  totalGoals: number;
  averageGoalsPerMatch: number;
  biggestWin: { match: string; score: string; difference: number };
  penaltyShootouts: number;
  mostGoalsInMatch: { match: string; goals: number };
}

export interface TeamPerformance {
  team: Team;
  finalPosition: string;
  matchesPlayed: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
  path: string[];
}

export interface ChampionJourneyMatch {
  round: string;
  opponent: Team;
  score: string;
  result: 'win' | 'penalties';
  goalsFor: number;
  goalsAgainst: number;
}

export interface ChampionJourney {
  team: Team;
  matches: ChampionJourneyMatch[];
  totalGoals: number;
  totalGoalsConceded: number;
  penaltyWins: number;
}
