import { TestBed } from '@angular/core/testing';

import { KocinkaRandomService } from './kocinka-random.service';

describe('KocinkaRandomService', () => {
  let service: KocinkaRandomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KocinkaRandomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
