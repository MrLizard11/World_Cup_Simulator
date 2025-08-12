import { Injectable } from '@angular/core';
import { Team } from '../models';
import { KnockoutMatch } from '../models/knockouts.model';
import { TournamentStats, TeamPerformance, ChampionJourneyMatch, ChampionJourney } from '../models/tournament-stats';
import { TournamentState } from './tournament-state.service';

@Injectable({
  providedIn: 'root'
})
export class TournamentStatisticsService {

  constructor() { }

  /**
   * Calculate comprehensive tournament statistics
   */
  calculateTournamentStats(tournamentState: TournamentState): TournamentStats {
    return {
      totalGoals: tournamentState.totalGoals,
      averageGoalsPerMatch: tournamentState.totalMatches > 0 ? 
        Math.round((tournamentState.totalGoals / tournamentState.totalMatches) * 100) / 100 : 0,
      biggestWin: tournamentState.biggestWin || { match: '', score: '', difference: 0 },
      penaltyShootouts: tournamentState.penaltyShootouts,
      mostGoalsInMatch: this.getMostGoalsInMatch(tournamentState)
    };
  }

  /**
   * Find the match with the most goals
   */
  private getMostGoalsInMatch(tournamentState: TournamentState): { match: string; goals: number } {
    let mostGoals = 0;
    let mostGoalsMatch = '';

    const allMatches = [
      ...tournamentState.roundOf16Matches,
      ...tournamentState.quarterFinalMatches,
      ...tournamentState.semiFinalMatches,
      ...(tournamentState.finalMatch ? [tournamentState.finalMatch] : [])
    ];

    allMatches.forEach(match => {
      if (match.played && match.scoreA !== undefined && match.scoreB !== undefined) {
        const totalGoals = match.scoreA + match.scoreB;
        if (totalGoals > mostGoals) {
          mostGoals = totalGoals;
          mostGoalsMatch = `${match.teamA.name} vs ${match.teamB.name}`;
        }
      }
    });

    return { match: mostGoalsMatch, goals: mostGoals };
  }

  /**
   * Calculate the champion's journey through the tournament
   */
  calculateChampionJourney(champion: Team, tournamentState: TournamentState): ChampionJourney {
    const matches: ChampionJourneyMatch[] = [];
    let totalGoals = 0;
    let totalGoalsConceded = 0;
    let penaltyWins = 0;

    // Helper function to find champion's matches
    const findChampionMatch = (matchArray: KnockoutMatch[], roundName: string): void => {
      matchArray.forEach(match => {
        if (match.played && (match.teamA.name === champion.name || match.teamB.name === champion.name)) {
          const isTeamA = match.teamA.name === champion.name;
          const opponent = isTeamA ? match.teamB : match.teamA;
          const goalsFor = isTeamA ? (match.scoreA || 0) : (match.scoreB || 0);
          const goalsAgainst = isTeamA ? (match.scoreB || 0) : (match.scoreA || 0);
          
          totalGoals += goalsFor;
          totalGoalsConceded += goalsAgainst;
          
          let result: 'win' | 'penalties' = 'win';
          if (match.wentToPenalties) {
            result = 'penalties';
            penaltyWins++;
          }

          const score = match.wentToPenalties 
            ? `${match.scoreA}-${match.scoreB} (${match.penaltyScoreA || 0}-${match.penaltyScoreB || 0} pens)`
            : `${match.scoreA}-${match.scoreB}`;

          matches.push({
            round: roundName,
            opponent,
            score,
            result,
            goalsFor,
            goalsAgainst
          });
        }
      });
    };

    // Search through all knockout rounds
    findChampionMatch(tournamentState.roundOf16Matches, 'Round of 16');
    findChampionMatch(tournamentState.quarterFinalMatches, 'Quarter-finals');
    findChampionMatch(tournamentState.semiFinalMatches, 'Semi-finals');
    
    if (tournamentState.finalMatch) {
      findChampionMatch([tournamentState.finalMatch], 'Final');
    }

    return {
      team: champion,
      matches,
      totalGoals,
      totalGoalsConceded,
      penaltyWins
    };
  }

  /**
   * Create team performance data
   */
  createTeamPerformance(team: Team, position: string): TeamPerformance {
    // This would need more detailed match tracking to be accurate
    return {
      team,
      finalPosition: position,
      matchesPlayed: position.includes('Champion') ? 7 : position.includes('Runner-up') ? 7 : 6,
      goalsScored: Math.floor(Math.random() * 10) + 5, // Placeholder
      goalsConceded: Math.floor(Math.random() * 5) + 2, // Placeholder
      goalDifference: 0,
      path: this.getTeamPath(team, position)
    };
  }

  /**
   * Get the path a team took through the tournament
   */
  private getTeamPath(team: Team, position: string): string[] {
    const path = ['Group Stage'];
    
    if (position.includes('Champion') || position.includes('Runner-up') || position.includes('Semifinalist')) {
      path.push('Round of 16', 'Quarter-finals', 'Semi-finals');
    }
    
    if (position.includes('Champion') || position.includes('Runner-up')) {
      path.push('Final');
    }
    
    return path;
  }

  /**
   * Calculate top performers (champion, runner-up, semifinalists)
   */
  calculateTopPerformers(
    champion: Team | null, 
    runnerUp: Team | null, 
    semiFinalTeams: Team[]
  ): {
    champion: TeamPerformance | null;
    runnerUp: TeamPerformance | null;
    semifinalists: TeamPerformance[];
  } {
    const topPerformers = {
      champion: null as TeamPerformance | null,
      runnerUp: null as TeamPerformance | null,
      semifinalists: [] as TeamPerformance[]
    };

    if (champion) {
      topPerformers.champion = this.createTeamPerformance(champion, '1st - Champion');
    }
    
    if (runnerUp) {
      topPerformers.runnerUp = this.createTeamPerformance(runnerUp, '2nd - Runner-up');
    }
    
    // Get other semifinalists (those who lost in semifinals)
    const otherSemifinalists = semiFinalTeams.filter(team => 
      team.name !== champion?.name && team.name !== runnerUp?.name
    );
    
    topPerformers.semifinalists = otherSemifinalists.map(team => 
      this.createTeamPerformance(team, '3rd/4th - Semifinalist')
    );

    return topPerformers;
  }
}
