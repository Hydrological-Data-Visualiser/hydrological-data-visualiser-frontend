import { TestBed } from '@angular/core/testing';

import { UniversalMarkerCreatorServiceService } from './universal-marker-creator-service.service';

describe('UniversalMarkerCreatorServiceService', () => {
  let service: UniversalMarkerCreatorServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniversalMarkerCreatorServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
