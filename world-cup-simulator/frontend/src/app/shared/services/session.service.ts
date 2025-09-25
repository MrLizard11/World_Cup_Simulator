import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly SESSION_KEY = 'worldcup_session_id';
  private sessionId: string;

  constructor() {
    // Get existing session ID from localStorage or generate new one
    this.sessionId = this.getStoredSessionId() || this.generateNewSession();
    this.storeSessionId(this.sessionId);
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Generate a new session ID and store it
   */
  generateNewSession(): string {
    this.sessionId = this.generateUUID();
    this.storeSessionId(this.sessionId);
    console.log('Generated new session ID:', this.sessionId);
    return this.sessionId;
  }

  /**
   * Reset current session (creates new ID)
   */
  resetSession(): string {
    return this.generateNewSession();
  }

  /**
   * Get session ID from localStorage
   */
  private getStoredSessionId(): string | null {
    try {
      return localStorage.getItem(this.SESSION_KEY);
    } catch (error) {
      console.warn('Could not access localStorage:', error);
      return null;
    }
  }

  /**
   * Store session ID in localStorage
   */
  private storeSessionId(sessionId: string): void {
    try {
      localStorage.setItem(this.SESSION_KEY, sessionId);
    } catch (error) {
      console.warn('Could not store session ID:', error);
    }
  }

  /**
   * Generate a UUID v4
   */
  private generateUUID(): string {
    // Use crypto.randomUUID() if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}