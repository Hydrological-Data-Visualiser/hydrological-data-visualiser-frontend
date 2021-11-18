import { TestBed } from '@angular/core/testing';

import { PrecipitationService } from './precipitation.service';

describe('PrecipitationService', () => {
  let service: PrecipitationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrecipitationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
