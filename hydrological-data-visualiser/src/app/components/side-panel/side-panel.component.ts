import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import * as moment from 'moment';
import {AnimationInputData} from 'src/app/model/animation-input-data';
import {AnimationService} from 'src/app/services/animation.service';
import {DataProviderService} from '../../services/data-provider.service';
import {SidePanelService} from './side-panel-service';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SidePanelComponent implements OnInit {
  // details attributes
  paused = false;
  status = false;
  clicked = false;
  long: number | undefined;
  lat: number | undefined;
  name: string | undefined;
  // form attributes
  public minDate: Date = new Date();
  public maxDate: Date = new Date();
  public value: Date | undefined;
  public hour: string | undefined;
  blockedHourDropdown = true;
  isDateAndHourSelected = false;
  // hour
  hours: Date[] = [];
  // animation
  animationModel = new AnimationInputData(10, 100);
  animationStart: string | undefined;
  animationLength: number | undefined;
  animationNow: string | undefined;
  animationPercentage: number | undefined;

  constructor(private dataProvider: DataProviderService, private animationService: AnimationService,
              private sidePanelService: SidePanelService
  ) {
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

    this.sidePanelService.modelEmitter.subscribe(name => {
      const tab = this.dataProvider.getActualService().info.availableDates.sort();
      this.minDate = tab[0];
      this.maxDate = tab[tab.length - 1];
      this.dateFilter = (date: Date): boolean => {
        return !!tab.includes(moment(date).format('YYYY-MM-DD'));
      };
      this.clear();
    });
  }

  clear(): void {
    this.hours = [];
    this.hour = undefined;
    this.value = undefined;
    this.blockedHourDropdown = true;
    this.isDateAndHourSelected = false;
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
    const dataProvider = this.dataProvider.getActualService();

    // IT IS IMPORTANT THAT ALL DATAPROVIDERS HAVE THE SAME METHODS!!! IT IS DEALING HERE WITH `ANY` TYPE
    if (dataProvider) {
      dataProvider.getDataFromDateAsObservableUsingDate(formattedDate).subscribe(
        (data: any[]) => {
          data.forEach(b => {
            const date = new Date(b.date);
            const nowUtc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
              date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            // const value = (moment(nowUtc)).format('HH:mm:SS');
            if (this.hours.filter(val => val.getTime() === nowUtc.getTime()).length === 0) {
              if (this.hours.filter(
                val => val.getTime() - (1000 * 60 * 15) < nowUtc.getTime() &&
                  val.getTime() + (1000 * 60 * 15) > nowUtc.getTime()).length === 0) {
                this.hours.push(nowUtc);
              }
            }
            // distinct and sort
            // tslint:disable-next-line:no-shadowed-variable
            this.hours = [...new Set(this.hours)].sort((a, b) => {
              return (new Date(b) as any) - (new Date(a) as any);
            });
          });
        }
      );
    }
  }

  onSubmit(): void {
    if (this.value) {
      this.value
        .setHours(
          // tslint:disable:no-non-null-assertion
          Number.parseInt(this.hour!.substr(0, 2), 10),
          Number.parseInt(this.hour!.substr(3, 2), 10),
          Number.parseInt(this.hour!.substr(6, 2), 10)
        );
      if (this.dataProvider.selectedModel === 'IMGW') {
        this.dataProvider.getPrecipitationService().onSet()
      }
      this.dataProvider.getActualService().draw(this.value);
    }
  }

  onHourChange(hour: Date): void {
    this.hour = moment(hour).format('HH:mm:SS');
    this.isDateAndHourSelected = true;
  }

  onValueChange(event: any): void {
    this.clear();
    this.blockedHourDropdown = false;
    this.value = event.value;
    this.updateHourList(new Date(event.value));
    this.animationService.stop();
  }

  // animation methods
  playAnimation(): void {
    if (this.value) {
      this.paused = false;
      const date = this.value;
      this.animationStart = (moment(date)).format('YYYY-MM-DD');
      this.animationLength = this.animationModel.steps;

      this.animationService.setAnimation(date, this.animationModel.steps, this.animationModel.timestepMs, this);
      this.animationService.play();
    }
  }

// called by animationService
  setAnimationPlaybackData(animationNow: string, currentFrame: number): void {
    console.log(animationNow);
    if (this.animationLength !== undefined
    ) {
      this.animationPercentage = currentFrame * 100 / (this.animationLength - 1);
    }
    this.animationNow = animationNow;
  }

  pauseAnimation(): void {
    this.paused = !this.paused;
    this.animationService.pause();
  }

  dateFilter = (date: Date) => {
    return false;
  }
}
