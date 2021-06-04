import { TestBed } from '@angular/core/testing';

import { RiverService } from './river.service';

describe('RiverService', () => {
  let service: RiverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RiverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
