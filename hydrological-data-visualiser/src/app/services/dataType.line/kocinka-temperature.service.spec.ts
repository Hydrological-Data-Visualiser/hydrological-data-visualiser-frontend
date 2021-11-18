import { TestBed } from '@angular/core/testing';

import { KocinkaTemperatureService } from './kocinka-temperature.service';

describe('KocinkaTemperatureService', () => {
  let service: KocinkaTemperatureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KocinkaTemperatureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
