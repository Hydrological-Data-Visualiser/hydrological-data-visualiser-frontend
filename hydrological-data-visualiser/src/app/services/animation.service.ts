import {Injectable} from '@angular/core';
import {SidePanelComponent} from '../components/side-panel/side-panel.component';
import {DataServiceInterface} from './data.service.interface';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private currentPlayData: PlayData | null = null;

  constructor() {
  }

  public setAnimation(startStep: Date,
                      steps: number,
                      timestepMs: number,
                      sidepanel: SidePanelComponent,
                      dataService: DataServiceInterface<any>): void {

    if (this.currentPlayData != null) {
      this.currentPlayData.stopPlaying();
    }
    const playData = new PlayData(startStep, steps, timestepMs, dataService, sidepanel);
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

  getStart(): Date | undefined {
    if (this.currentPlayData != null) {
      return this.currentPlayData.getStart();
    } else {
      return undefined;
    }
  }

}

class PlayData {
  private playing = true;
  private paused = false;
  private currentStep = -1;

  constructor(private startStep: Date,
              private steps: number,
              private timestepMs: number,
              private dataService: DataServiceInterface<any>,
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
      this.dataService.getTimePointAfterAsObservable(this.startStep, this.currentStep).subscribe(frameDate => {
        const date = new Date(frameDate);
        const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
          date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        // propagate that the frame changed
        this.sidepanel.setAnimationPlaybackData(utcDate, this.currentStep);
        this.setFrame(utcDate).then(() => {
          this.sidepanel.setAnimationPlaybackData(utcDate, this.currentStep);
          this.playState();
        });
      });
    }, this.timestepMs);
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
    return this.dataService.update(date);
  }

  getStart(): Date {
    return this.startStep;
  }

}
