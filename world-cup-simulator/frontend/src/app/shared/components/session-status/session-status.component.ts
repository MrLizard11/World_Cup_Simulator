import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { SessionService } from '../../services/session.service';
import { TournamentApiService } from '../../services/tournament-api.service';

/**
 * Session Status Component
 * 
 * Displays current multi-user session information and provides session management controls.
 * Allows users to create new sessions, test API connectivity, and reset tournament data.
 */
@Component({
  selector: 'app-session-status',
  templateUrl: './session-status.component.html',
  styleUrls: ['./session-status.component.css']
})
export class SessionStatusComponent implements OnInit, OnDestroy {
  displaySessionId = '';
  statusMessage = '';
  statusClass = '';
  isTestingApi = false;
  isResetting = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly sessionService: SessionService,
    private readonly tournamentApi: TournamentApiService
  ) {}

  ngOnInit(): void {
    this.updateSessionDisplay();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  copySessionId(): void {
    const fullSessionId = this.sessionService.getSessionId();
    
    navigator.clipboard.writeText(fullSessionId)
      .then(() => this.showStatus('Session ID copied to clipboard!', 'success'))
      .catch(() => this.showStatus('Failed to copy session ID', 'error'));
  }

  createNewSession(): void {
    this.sessionService.generateNewSession();
    this.updateSessionDisplay();
    this.showStatus('New session created! All tournament data is now isolated.', 'success');
  }

  testApi(): void {
    this.isTestingApi = true;
    this.showStatus('Testing API connection...', 'info');
    
    this.tournamentApi.getTournamentStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showStatus('✅ API connection successful! Multi-user system is working.', 'success');
          this.isTestingApi = false;
        },
        error: (error) => {
          this.showStatus(`❌ API Error: ${error.message}`, 'error');
          this.isTestingApi = false;
        }
      });
  }

  resetTournament(): void {
    if (!this.confirmReset()) {
      return;
    }
    
    this.isResetting = true;
    this.showStatus('Resetting tournament...', 'info');
    
    this.tournamentApi.resetTournament()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showStatus('✅ Tournament reset successfully! Only your session was affected.', 'success');
          this.isResetting = false;
        },
        error: (error) => {
          this.showStatus(`❌ Reset Error: ${error.message}`, 'error');
          this.isResetting = false;
        }
      });
  }

  private updateSessionDisplay(): void {
    const fullSessionId = this.sessionService.getSessionId();
    this.displaySessionId = `${fullSessionId.substring(0, 8)}...${fullSessionId.slice(-4)}`;
  }

  private confirmReset(): boolean {
    return confirm('Are you sure you want to reset your tournament? This only affects your session.');
  }

  private showStatus(message: string, type: 'success' | 'error' | 'info'): void {
    this.statusMessage = message;
    this.statusClass = `status-${type}`;
    
    setTimeout(() => {
      this.statusMessage = '';
      this.statusClass = '';
    }, 5000);
  }
}