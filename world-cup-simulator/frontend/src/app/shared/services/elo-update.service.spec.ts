import { TestBed } from '@angular/core/testing';

import { EloUpdateService } from './elo-update.service';

describe('EloUpdateService', () => {
  let service: EloUpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EloUpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
