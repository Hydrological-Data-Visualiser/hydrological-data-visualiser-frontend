import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {SidePanelComponent} from '../components/side-panel/side-panel.component';
import {PrecipitationService} from './precipitation.service';
import {StationsService} from './stations.service';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private currentPlayData: PlayData | null = null;

  constructor(private stationsService: StationsService, private precipitationService: PrecipitationService) {
  }

  public setAnimation(startStep: Date, steps: number, timestepMs: number, sidepanel: SidePanelComponent): void {
    if (this.currentPlayData != null) {
      this.currentPlayData.stopPlaying();
    }
    const playData = new PlayData(startStep, steps, timestepMs, this.stationsService, this.precipitationService, sidepanel);
    this.currentPlayData = playData;
  }

  play(): void {
    if (this.currentPlayData != null) {
      this.currentPlayData.playState();
    }
  }

  pause(): void {
    if (this.currentPlayData != null) {
      if (this.currentPlayData.isPaused()) {
        this.currentPlayData.unpause();
      } else {
        this.currentPlayData.pause();
      }
    }
  }

  stop(): void {
    if (this.currentPlayData != null) {
      this.currentPlayData.stopPlaying();
    }
    this.currentPlayData = null;
  }

}

class PlayData {
  private playing = true;
  private paused = false;
  private currentStep = -1;

  constructor(private startStep: Date,
              private steps: number,
              private timestepMs: number,
              private stationsService: StationsService,
              private precipitationService: PrecipitationService,
              private sidepanel: SidePanelComponent) {
  }

  playState(): void {
    setTimeout(() => {
      if (this.paused) {
        this.pauseState();
        return;
      }
      if (!this.playing) {
        return;
      }

      this.currentStep = (this.currentStep + 1) % this.steps;
      const frameDate = new Date(this.startStep.valueOf());
      frameDate.setDate(frameDate.getDate() + this.currentStep);
      this.sidepanel.setAnimationPlaybackData((moment(frameDate)).format('YYYY-MM-DD'), this.currentStep);
      this.setFrame(frameDate).then(() => {
        this.playState();
      });
    }, this.timestepMs);
  }

  private pauseState(): void {
    setTimeout(() => {
      if (!this.playing) {
        return;
      }
      if (this.paused) {
        this.pauseState();
      } else {
        this.playState();
        return;
      }
    }, 100);
  }

  private setFrame(date: Date): Promise<void> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD');
    return this.precipitationService
      .updateMarkers(formattedDate, this.precipitationService.getStations(), this.precipitationService.getData());
  }

  stopPlaying(): void {
    this.playing = false;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  pause(): void {
    this.paused = true;
  }

  unpause(): void {
    this.paused = false;
  }

  isPaused(): boolean {
    return this.paused;
  }

}
