import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  BulkCreateGroupsRequest,
  BulkCreateTeamsRequest,
  GenerateKnockoutBracketRequest,
  GroupResponse,
  KnockoutBracketResponse,
  SimulateMatchResponse,
  SimulationModeString,
  TeamPerformanceResponse,
  TeamResponse,
  TournamentStatisticsResponse
} from '../models/tournament-dtos';

@Injectable({ providedIn: 'root' })
export class TournamentApiService {
  private readonly baseUrl = 'http://localhost:5134/api/tournament';

  constructor(private http: HttpClient) {}

  getTournamentStatistics(): Observable<TournamentStatisticsResponse> {
    return this.http.get<TournamentStatisticsResponse>(`${this.baseUrl}/statistics`).pipe(catchError(this.handleError));
  }

  getTeamPerformances(): Observable<TeamPerformanceResponse[]> {
    return this.http.get<TeamPerformanceResponse[]>(`${this.baseUrl}/team-performances`).pipe(catchError(this.handleError));
  }

  resetTournament(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reset`, {}).pipe(catchError(this.handleError));
  }

  bulkCreateTeams(request: BulkCreateTeamsRequest): Observable<TeamResponse[]> {
    return this.http.post<TeamResponse[]>(`${this.baseUrl}/bulk/teams`, request).pipe(catchError(this.handleError));
  }

  bulkCreateGroups(request: BulkCreateGroupsRequest): Observable<GroupResponse[]> {
    return this.http.post<GroupResponse[]>(`${this.baseUrl}/bulk/groups`, request).pipe(catchError(this.handleError));
  }

  generateKnockoutBracket(request: GenerateKnockoutBracketRequest): Observable<KnockoutBracketResponse> {
    return this.http.post<KnockoutBracketResponse>(`${this.baseUrl}/knockout/generate-bracket`, request).pipe(catchError(this.handleError));
  }

  getKnockoutBracket(): Observable<KnockoutBracketResponse> {
    return this.http.get<KnockoutBracketResponse>(`${this.baseUrl}/knockout/bracket`).pipe(catchError(this.handleError));
  }

  simulateMatch(
    teamA: TeamResponse | { name: string; country: string; elo: number; countryCode: string },
    teamB: TeamResponse | { name: string; country: string; elo: number; countryCode: string },
    mode: SimulationModeString = 'EloRealistic'
  ): Observable<SimulateMatchResponse> {
    const modeValue = this.mapModeToBackendValue(mode);
    const url = this.baseUrl.replace('/tournament', '/simulation') + '/match';
    return this.http.post<SimulateMatchResponse>(url, { teamA, teamB, mode: modeValue, situationalFactors: null }).pipe(catchError(this.handleError));
  }

  simulateBulkMatches(
    matches: { teamA: TeamResponse | { name: string; country: string; elo: number; countryCode: string }; teamB: TeamResponse | { name: string; country: string; elo: number; countryCode: string }; situationalFactors?: unknown }[],
    mode: SimulationModeString = 'EloRealistic'
  ): Observable<SimulateMatchResponse[]> {
    const modeValue = this.mapModeToBackendValue(mode);
    const url = this.baseUrl.replace('/tournament', '/simulation') + '/bulk-matches';
    return this.http.post<SimulateMatchResponse[]>(url, { matches, mode: modeValue }).pipe(catchError(this.handleError));
  }

  private mapModeToBackendValue(mode: SimulationModeString): number {
    switch (mode) {
      case 'Random':
        return 0;
      case 'EloSimple':
        return 1;
      case 'EloRealistic':
        return 2;
      case 'EloAdvanced':
        return 3;
      default:
        return 2;
    }
  }

  private handleError(error: HttpErrorResponse) {
    const msg = (error.error && (error.error as any).message) || error.message || 'Unknown error';
    console.error('[TournamentApiService]', msg);
    return throwError(() => new Error(msg));
  }
}