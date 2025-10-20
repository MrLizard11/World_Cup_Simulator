import { Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface RuntimeConfig {
  apiUrl?: string;
}

export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('RUNTIME_CONFIG');

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private config: RuntimeConfig = {};

  constructor(private http: HttpClient) {}

  loadConfig(): Promise<void> {
    return this.http.get<RuntimeConfig>('/assets/config.json')
      .toPromise()
      .then(cfg => {
        this.config = cfg || {};
      })
      .catch(() => {
        // swallow errors — fallback to environment
        this.config = {};
      });
  }

  getConfig(): RuntimeConfig {
    return this.config;
  }
}
