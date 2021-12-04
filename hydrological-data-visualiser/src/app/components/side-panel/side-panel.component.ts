import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import * as moment from 'moment';
import {AnimationInputData} from 'src/app/model/animation-input-data';
import {AnimationService} from 'src/app/services/animation.service';
import {DataProviderService} from '../../services/data-provider.service';
import {SidePanelService} from './side-panel-service';
import {EmitData} from '../../model/emit-data';
import * as L from 'leaflet';
import {Color} from '@angular-material-components/color-picker';
import {AbstractControl, FormControl, Validators} from '@angular/forms';

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
  isModelSelected = false;
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
  opacity = 50;
  minColorCtr: AbstractControl = new FormControl(new Color(255, 243, 0), [Validators.required]);
  maxColorCtr: AbstractControl = new FormControl(new Color(255, 243, 0), [Validators.required]);

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
      this.status = false;
      this.opacity = 50;
      this.isModelSelected = true;

      const newMinColor = this.hexToRgb(this.dataProvider.getActualService().info.minColour);
      const newMaxColor = this.hexToRgb(this.dataProvider.getActualService().info.maxColour);
      this.minColorCtr = new FormControl(new Color(newMinColor[0], newMinColor[1], newMinColor[2]));
      this.maxColorCtr = new FormControl(new Color(newMaxColor[0], newMaxColor[1], newMaxColor[2]));

      // @ts-ignore - open details tab
      document.getElementById('nav-form-tab').click();
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
        this.status = false;
        // @ts-ignore - open details tab
        document.getElementById('nav-details-tab').click();
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

    if (dataProvider) {
      dataProvider.getDayTimePointsAsObservable(formattedDate).subscribe(
        (data: Date[]) => {
          data.forEach(d => {
            const date = new Date(d);
            const nowUtc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
              date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            this.hours.push(nowUtc);

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
      this.dataProvider.getActualService().setScaleAndColour(formattedDate, 1,
        () => {
          if (this.value) {
            this.dataProvider.getActualService().draw(this.value);
          }
        });
      this.animationService.stop();
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
    this.dataProvider.getActualService().setScaleAndColour(formattedStart, this.animationLength,
      () => {
        if (date) {
          this.animationService.setAnimation(
            date, this.animationModel.steps, this.animationModel.timestepMs, this, this.dataProvider.getActualService()
          );
        }
        this.animationService.play();
      });
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

  changeOpacity(value: number): void {
    this.dataProvider.getActualService().changeOpacity(value / 100);
  }

  clearData(): void {
    this.data.date = undefined;
    this.data.value = undefined;
    this.data.longitude = undefined;
    this.data.latitude = undefined;
    this.data.stationName = undefined;
    this.data.metricLabel = undefined;
  }

  changeColor(minColorCtr: AbstractControl, maxColorCtr: AbstractControl): void {
    this.dataProvider.getActualService().info.minColour = '#' + minColorCtr.value.hex;
    this.dataProvider.getActualService().info.maxColour = '#' + maxColorCtr.value.hex;
    if (this.value) {
      this.dataProvider.getActualService().updateColor(this.value);
    }
    this.opacity = 50;
  }

  hexToRgb(hex: string): number[] {
    // @ts-ignore
    return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
      , (m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1).match(/.{2}/g)
      .map(x => parseInt(x, 16));
  }

}
