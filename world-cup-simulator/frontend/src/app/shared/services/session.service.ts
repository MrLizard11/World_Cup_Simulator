import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

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
    try {
      if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
        return (crypto as any).randomUUID();
      }
    } catch (e) {
    }
    return uuidv4();
  }
}