import { TestBed } from '@angular/core/testing';

import { KnockoutStageService } from './knockout-stage.service';

describe('KnockoutStageService', () => {
  let service: KnockoutStageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KnockoutStageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
