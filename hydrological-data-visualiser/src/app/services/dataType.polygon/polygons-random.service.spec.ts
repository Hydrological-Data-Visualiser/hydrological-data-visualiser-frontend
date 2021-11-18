import { TestBed } from '@angular/core/testing';

import { PolygonsRandomService } from './polygons-random.service';

describe('PolygonsRandomService', () => {
  let service: PolygonsRandomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolygonsRandomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
