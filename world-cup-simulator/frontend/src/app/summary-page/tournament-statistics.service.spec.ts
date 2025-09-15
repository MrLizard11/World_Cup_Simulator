import { TestBed } from '@angular/core/testing';

import { TournamentStatisticsService } from './tournament-statistics.service';

describe('TournamentStatisticsService', () => {
  let service: TournamentStatisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TournamentStatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
