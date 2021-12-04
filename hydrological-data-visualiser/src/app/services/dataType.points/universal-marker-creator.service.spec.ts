import { TestBed } from '@angular/core/testing';
import {UniversalMarkerCreatorService} from './universal-marker-creator.service';


describe('UniversalMarkerCreatorService', () => {
  let service: UniversalMarkerCreatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniversalMarkerCreatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
