import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeotiffComponent } from './geotiff.component';

describe('GeotiffComponent', () => {
  let component: GeotiffComponent;
  let fixture: ComponentFixture<GeotiffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeotiffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeotiffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
