import { TestBed } from '@angular/core/testing';

import { MarkerCreatorService } from './marker-creator.service';

describe('MarkerCreatorService', () => {
  let service: MarkerCreatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkerCreatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
