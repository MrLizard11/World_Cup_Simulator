import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// DTOs matching the backend
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
  // Empty for now, but may have options in the future
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
  teams: any[]; // GroupTeamResponse[]
}

export interface TournamentStatisticsResponse {
  totalGoals: number;
  averageGoalsPerMatch: number;
  biggestWin: any; // BiggestWinResponse
  penaltyShootouts: number;
  mostGoalsInMatch: any; // MostGoalsMatchResponse
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

@Injectable({
  providedIn: 'root'
})
export class TournamentApiService {
  private readonly baseUrl = 'http://localhost:5134/api/tournament';

  constructor(private http: HttpClient) {}

  /**
   * Get tournament statistics
   */
  getTournamentStatistics(): Observable<TournamentStatisticsResponse> {
    return this.http.get<TournamentStatisticsResponse>(`${this.baseUrl}/statistics`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get team performances
   */
  getTeamPerformances(): Observable<TeamPerformanceResponse[]> {
    return this.http.get<TeamPerformanceResponse[]>(`${this.baseUrl}/team-performances`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Reset tournament (session-specific)
   */
  resetTournament(): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Create teams in bulk
   */
  bulkCreateTeams(request: BulkCreateTeamsRequest): Observable<TeamResponse[]> {
    return this.http.post<TeamResponse[]>(`${this.baseUrl}/bulk/teams`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create groups in bulk
   */
  bulkCreateGroups(request: BulkCreateGroupsRequest): Observable<GroupResponse[]> {
    return this.http.post<GroupResponse[]>(`${this.baseUrl}/bulk/groups`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Populate default teams
   */
  populateDefaultTeams(request: PopulateDefaultTeamsRequest = {}): Observable<TeamResponse[]> {
    return this.http.post<TeamResponse[]>(`${this.baseUrl}/populate-default-teams`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Generate knockout bracket
   */
  generateKnockoutBracket(request: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/knockout/generate-bracket`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get knockout bracket
   */
  getKnockoutBracket(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/knockout/bracket`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Simulate a single match
   */
  simulateMatch(teamA: any, teamB: any, mode: string = 'EloRealistic'): Observable<any> {
    // Convert string mode to backend enum value
    let modeValue = 2; // Default to EloRealistic (2)
    switch(mode) {
      case 'Random':
        modeValue = 0;
        break;
      case 'EloSimple':
        modeValue = 1;
        break;
      case 'EloRealistic':
        modeValue = 2;
        break;
      case 'EloAdvanced':
        modeValue = 3;
        break;
    }

    const request = {
      teamA: teamA,
      teamB: teamB,
      mode: modeValue,
      situationalFactors: null
    };
    return this.http.post<any>(`${this.baseUrl.replace('/tournament', '/simulation')}/match`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Simulate multiple matches at once
   */
  simulateBulkMatches(matches: any[], mode: string = 'EloRealistic'): Observable<any[]> {
    // Convert string mode to backend enum value
    let modeValue = 2; // Default to EloRealistic (2)
    switch(mode) {
      case 'Random':
        modeValue = 0;
        break;
      case 'EloSimple':
        modeValue = 1;
        break;
      case 'EloRealistic':
        modeValue = 2;
        break;
      case 'EloAdvanced':
        modeValue = 3;
        break;
    }

    const request = {
      matches: matches,
      mode: modeValue
    };
    return this.http.post<any[]>(`${this.baseUrl.replace('/tournament', '/simulation')}/bulk-matches`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 400 && typeof error.error === 'string') {
        errorMessage = error.error; // Session ID error or other validation error
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}