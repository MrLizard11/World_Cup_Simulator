import { TestBed } from '@angular/core/testing';

import { KnockoutStage2ndService } from './knockout-stage-2nd.service';

describe('KnockoutStage2ndService', () => {
  let service: KnockoutStage2ndService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KnockoutStage2ndService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
