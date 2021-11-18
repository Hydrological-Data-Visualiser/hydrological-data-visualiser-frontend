import { TestBed } from '@angular/core/testing';

import { KocinkaSurfaceHeightService } from './kocinka-surface-height.service';

describe('KocinkaSurfaceHeightService', () => {
  let service: KocinkaSurfaceHeightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KocinkaSurfaceHeightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
