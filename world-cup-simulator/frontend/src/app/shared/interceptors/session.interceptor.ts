import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from '../services/session.service';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {

  constructor(private sessionService: SessionService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only add session header to API requests (not external URLs)
    if (req.url.includes('/api/')) {
      const sessionId = this.sessionService.getSessionId();
      
      // Clone the request and add the session header
      const sessionReq = req.clone({
        headers: req.headers.set('X-Session-Id', sessionId)
      });

      console.log(`API Request to ${req.url} with session: ${sessionId.substring(0, 8)}...`);
      
      return next.handle(sessionReq);
    }

    // For non-API requests, proceed without modification
    return next.handle(req);
  }
}