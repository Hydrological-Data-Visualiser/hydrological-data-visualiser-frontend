import { Injectable } from '@angular/core';
import { SidePanelComponent } from '../components/side-panel/side-panel.component';
import { PrecipitationService } from './precipitation.service';
import { StationsService } from './stations.service';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private startStep: Date = new Date();
  private steps: number = 0;
  private timestepMs: number = 0;
  private currentStep: number = 0;

  constructor(private stationsService: StationsService) { }

  public setAnimation(startStep: Date, steps: number, timestepMs: number) {
    this.startStep = startStep
    this.steps = steps
    console.log("steps:" + steps)
    this.timestepMs = timestepMs
  }

  play() {
    setTimeout(() => {
      this.currentStep = (this.currentStep + 1) % this.steps
      //console.log("Frame: " + this.currentStep)
      const frameDate = new Date(this.startStep.valueOf());
      frameDate.setDate(frameDate.getDate() + this.currentStep);
      //this.sidePanelComponent.setCurrentDate(frameDate)
      this.setFrame(frameDate).then( () => {
        this.play()
      })
    }, 1)
  }

  private setFrame(date: Date): Promise<void> {
    return this.stationsService.updateMarkers(date)
  }
}
