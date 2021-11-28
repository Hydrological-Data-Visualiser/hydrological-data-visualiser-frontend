import { TestBed } from '@angular/core/testing';

import { UniversalPolygonsService } from './universal-polygons.service';

describe('UniversalPolygonsService', () => {
  let service: UniversalPolygonsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniversalPolygonsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
