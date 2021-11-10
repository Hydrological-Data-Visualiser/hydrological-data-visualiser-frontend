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
  blocked = true;
  // hour
  hours: string[] = [];
  selectedHour: any;
  // animation
  animationModel = new AnimationInputData(10, 100);
  animationStart: string | undefined;
  animationLength: number | undefined;
  animationNow: string | undefined;
  animationPercentage: number | undefined;

  constructor(private dataProvider: DataProviderService, private animationService: AnimationService) {
  }

  ngOnInit(): void {
    this.dataProvider.getStationsService().clickedMarker$.subscribe(a => {
      this.lat = a?.latitude;
      this.long = a?.longitude;
      this.name = a?.name;
      if (a?.latitude && a.name && a.longitude) {
        this.clicked = true;
      }
    });
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
    this.dataProvider.getPrecipitationService().getDataFromSpecificDate(formattedDate).subscribe(
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

//  form methods below
  onSubmit(): void {
    const date = this.value;
    const formattedDate = (moment(date)).format('YYYY-MM-DD');
    this.animationService.stop();
    this.updateHourList(date);
    this.dataProvider.getRiverService().showKocinkaRiver();
    this.dataProvider.getPrecipitationService().draw(formattedDate);
    this.dataProvider.getKocinkaSurfaceHeightService().draw(formattedDate);
  }

  onValueChange(event: any): void {
    console.log(event.value);
    this.value = event.value;
    this.onSubmit();
    this.blocked = false;
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
      return date === 1 || date === 20 ? 'example-custom-date-class' : '';
    }
    return '';
  }
}
