import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import * as moment from 'moment';
import {AnimationInputData} from 'src/app/model/animation-input-data';
import {AnimationService} from 'src/app/services/animation.service';
import {DataProviderService} from '../../services/data-provider.service';
import {SidePanelService} from './side-panel-service';
import {EmitData} from '../../model/emit-data';
import * as L from 'leaflet';

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
  data: EmitData = new EmitData(undefined, undefined, undefined, undefined, undefined, undefined);

  constructor(private dataProvider: DataProviderService, private animationService: AnimationService,
              private sidePanelService: SidePanelService) {
  }

  ngOnInit(): void {
    this.sidePanelService.modelEmitter.subscribe(name => {
      const tab = this.dataProvider.getActualService().info.availableDates.sort();
      this.minDate = tab[0];
      this.maxDate = tab[tab.length - 1];
      this.dateFilter = (date: Date): boolean => {
        return tab.map(a => moment(a).format('YYYY-MM-DD')).includes(moment(date).format('YYYY-MM-DD'));
      };
      this.clear();
      this.clearData();
      this.clicked = false;
    });

    this.sidePanelService.dataEmitter.subscribe(data => {
      if (data.latitude === this.data.latitude && data.longitude === this.data.longitude) {
        this.clicked = false;
        this.clearData();
      } else {
        this.clicked = true;
        this.data.date = data.date;
        this.data.value = data.value;
        this.data.longitude = data.longitude;
        this.data.latitude = data.latitude;
        this.data.stationName = data.stationName;
        this.data.metricLabel = data.metricLabel;
      }
    });
  }

  clear(): void {
    this.hours = [];
    this.hour = undefined;
    this.value = undefined;
    this.blockedHourDropdown = true;
    this.isDateAndHourSelected = false;
  }

  setLatLng(newItem: L.LatLng): void {
    if (newItem) {
      this.clearData();
      this.data.latitude = newItem.lat;
      this.data.longitude = newItem.lng;
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
      const formattedDate = (moment(this.value)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
      //   this.dataProvider.getPrecipitationService().setScaleAndColour(formattedDate, 1,
      //     () => {
      //       if (this.value) {
      //         this.dataProvider.getPrecipitationService().draw(this.value);
      //       }
      //     });
      // this.animationService.stop();
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
    this.paused = false;
    const date = this.value;
    this.animationStart = (moment(date)).format('YYYY-MM-DD');
    this.animationLength = this.animationModel.steps;
    this.animationService.stop();

    const formattedStart = (moment(this.value)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    this.dataProvider.getPrecipitationService().setScaleAndColour(formattedStart, this.animationLength,
      () => {
        if (date) {
          this.animationService.setAnimation(
            date, this.animationModel.steps, this.animationModel.timestepMs, this, this.dataProvider.getActualService()
          );
        }
        this.animationService.play();
      });
    // if(date)
    //   this.animationService.setAnimation(
    //     date, this.animationModel.steps, this.animationModel.timestepMs, this, this.dataProvider.getActualService()
    //   );
    // this.animationService.play();
  }

// called by animationService
  setAnimationPlaybackData(animationNow: Date, currentFrame: number): void {
    console.log(animationNow);
    if (this.animationLength !== undefined
    ) {
      this.animationPercentage = currentFrame * 100 / (this.animationLength - 1);
    }
    const formattedDate = (moment(animationNow)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    this.animationNow = formattedDate;
  }

  pauseAnimation(): void {
    this.paused = !this.paused;
    this.animationService.pause();
  }

  dateFilter = (date: Date) => {
    return false;
  }

  clearData(): void {
    this.data.date = undefined;
    this.data.value = undefined;
    this.data.longitude = undefined;
    this.data.latitude = undefined;
    this.data.stationName = undefined;
    this.data.metricLabel = undefined;
  }
}
