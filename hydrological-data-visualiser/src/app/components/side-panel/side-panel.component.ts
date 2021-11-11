import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import * as moment from 'moment';
import {AnimationInputData} from 'src/app/model/animation-input-data';
import {AnimationService} from 'src/app/services/animation.service';
import {FormInputData} from '../../model/form-input-data';
import {DataProviderService} from '../../services/data-provider.service';
import {MatCalendarCellClassFunction} from '@angular/material/datepicker';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SidePanelComponent implements OnInit {
  // details attributes
  paused = false;
  status = true;
  clicked = false;
  long: number | undefined;
  lat: number | undefined;
  name: string | undefined;
  // form attributes
  public minDate: Date = new Date('05/07/2017');
  public maxDate: Date = new Date('08/27/2017');
  public value: Date = new Date();
  public hour: string | undefined;
  blocked = true;
  // hour
  hours: string[] = [];
  // animation
  animationModel = new AnimationInputData(10, 100);
  animationStart: string | undefined;
  animationLength: number | undefined;
  animationNow: string | undefined;
  animationPercentage: number | undefined;

  constructor(private dataProvider: DataProviderService, private animationService: AnimationService) {
  }

  ngOnInit(): void {
    // this.dataProvider.getStationsService().clickedMarker$.subscribe(a => {
    //   this.lat = a?.latitude;
    //   this.long = a?.longitude;
    //   this.name = a?.name;
    //   if (a?.latitude && a.name && a.longitude) {
    //     this.clicked = true;
    //   }
    // });
  }

  setLong(newItem: number): void {
    if (newItem) {
      this.long = Number(newItem.toFixed(6));
    }
  }

  setLat(newItem: number): void {
    if (newItem) {
      this.lat = Number(newItem.toFixed(6));
    }
  }

  setClicked(newItem: boolean): void {
    this.clicked = newItem;
    this.name = undefined;
  }

  clickEvent(): void {
    this.status = !this.status;
  }

  updateHourList(formattedDate: Date): void {
    this.hours = [];
    if (this.dataProvider.selectedModel === 'river') {
      this.hours.push('00:00:00');
    }
    if (this.dataProvider.selectedModel === 'IMGW') {
      this.dataProvider.getPrecipitationService().getDataInstantFromSpecificDate(formattedDate).subscribe(
        a => {
          a.forEach(b => {
              const date = new Date(b.date);
              const nowUtc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
                date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());

              const value = (moment(nowUtc)).format('HH:mm:ss');

              if (this.hours.filter(hour => hour === value).length === 0) {
                this.hours.push(value);
              }
            }
          );
        }
      );
    }

    if (this.dataProvider.selectedModel === 'riverPressure') {
      this.dataProvider.getKocinkaSurfaceHeightService().getDataFromSpecificDate(formattedDate).subscribe(
        a => {
          a.forEach(b => {
              const date = new Date(b.date);
              const nowUtc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
                date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
              const value = (moment(nowUtc)).format('HH:mm:ss');

              if (this.hours.filter(hour => hour === value).length === 0) {
                this.hours.push(value);
              }
            }
          );
        }
      );
    }
  }

  onSubmit(): void {
    console.log(this.value);
    this.value
      .setHours(
        Number.parseInt(this.hour!.substr(0, 2), 10),
        Number.parseInt(this.hour!.substr(3, 2), 10),
        Number.parseInt(this.hour!.substr(6, 2), 10)
      );

    if (this.dataProvider.selectedModel === 'river') {
      this.dataProvider.getRiverService().showKocinkaRiver();
    }
    if (this.dataProvider.selectedModel === 'IMGW') {
      const formattedDate = (moment(this.value)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
      this.dataProvider.getPrecipitationService().draw(formattedDate);
    }
    if (this.dataProvider.selectedModel === 'riverPressure') {
      const formattedDate = (moment(this.value)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
      this.dataProvider.getKocinkaSurfaceHeightService().draw(formattedDate);
    }
  }

  onHourChange(hour: string): void {
    this.hour = hour;
  }

  onValueChange(event: any): void {
    this.hour = undefined;
    this.hours = [];
    this.value = event.value;
    this.blocked = false;
    this.updateHourList(new Date(event.value));
    this.animationService.stop();
  }

  // animation methods
  playAnimation(): void {
    this.paused = false;
    const date = this.value;
    this.animationStart = (moment(date)).format('YYYY-MM-DD');
    this.animationLength = this.animationModel.steps;

    this.animationService.setAnimation(date, this.animationModel.steps, this.animationModel.timestepMs, this);
    this.animationService.play();
  }

  // called by animationService
  setAnimationPlaybackData(animationNow: string, currentFrame: number): void {
    console.log(animationNow);
    if (this.animationLength !== undefined) {
      this.animationPercentage = currentFrame * 100 / (this.animationLength - 1);
    }
    this.animationNow = animationNow;
  }

  pauseAnimation(): void {
    this.paused = !this.paused;
    this.animationService.pause();
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only highligh dates inside the month view.
    if (view === 'month') {
      const date = cellDate.getDate();

      // Highlight the 1st and 20th day of each month.
      return date === 1 ? 'example-custom-date-class' : '';
    }
    return '';
  }
}
