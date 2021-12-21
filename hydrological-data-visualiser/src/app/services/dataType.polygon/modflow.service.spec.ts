import { TestBed } from '@angular/core/testing';

import { ModflowService } from './modflow.service';

describe('ModflowService', () => {
  let service: ModflowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModflowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
