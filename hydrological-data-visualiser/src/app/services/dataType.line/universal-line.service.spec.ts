import { TestBed } from '@angular/core/testing';

import { UniversalLineService } from './universal-line.service';

describe('UniversalLineService', () => {
  let service: UniversalLineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniversalLineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
