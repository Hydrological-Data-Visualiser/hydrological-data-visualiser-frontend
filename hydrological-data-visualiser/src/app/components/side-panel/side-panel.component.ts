import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import * as moment from 'moment';
import {AnimationInputData} from 'src/app/model/animation-input-data';
import {AnimationService} from 'src/app/services/animation.service';
import {DataProviderService} from '../../services/data-provider.service';
import {SidePanelService} from './side-panel-service';
import {EmitData} from '../../model/emit-data';
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
  sidePanelShowStatus = false;
  clickedOnMap = false;
  // form attributes
  public minDate: Date = new Date();
  public maxDate: Date = new Date();
  public selectedDate: Date | undefined;
  public selectedHour: string | undefined;
  blockedHourDropdown = true;
  isModelSelected = false;
  isDateAndHourSelected = false;
  isFormSubmitted = false;
  hourDropDownList: Date[] = [];
  // animation
  animationPlaying = false;
  animationPaused = false;
  animationModel = new AnimationInputData(10, 100);
  animationStart: string | undefined;
  animationLength: number | undefined;
  animationNow: string | undefined;
  animationPercentage: number | undefined;
  clickedData: EmitData = new EmitData(undefined, undefined, undefined, undefined, undefined, undefined);
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
      this.clearEmitData();
      this.clickedOnMap = false;
      this.sidePanelShowStatus = false;

      this.opacity = 50;
      this.isModelSelected = true;
      this.isFormSubmitted = false;

      const newMinColor = this.hexToRgb(this.dataProvider.getActualService().info.minColour);
      const newMaxColor = this.hexToRgb(this.dataProvider.getActualService().info.maxColour);
      this.minColorCtr = new FormControl(new Color(newMinColor[0], newMinColor[1], newMinColor[2]));
      this.maxColorCtr = new FormControl(new Color(newMaxColor[0], newMaxColor[1], newMaxColor[2]));

      // @ts-ignore - open details tab
      document.getElementById('nav-form-tab').click();
      this.stopAnimation();
    });

    this.sidePanelService.dataEmitter.subscribe(data => {
      if (!data.latitude && !data.longitude && !data.value && !data.date && !data.stationName && !data.metricLabel) {
        this.clickedOnMap = false;
        this.clearEmitData();
      } else if (data.latitude === this.clickedData.latitude && data.longitude === this.clickedData.longitude) {
        this.clickedOnMap = false;
        this.clearEmitData();
      } else {
        this.clickedOnMap = true;
        this.clickedData.date = data.date;
        this.clickedData.value = data.value;
        this.clickedData.longitude = data.longitude;
        this.clickedData.latitude = data.latitude;
        this.clickedData.stationName = data.stationName;
        this.clickedData.metricLabel = data.metricLabel;
        this.sidePanelShowStatus = false;
        // @ts-ignore - open details tab
        document.getElementById('nav-details-tab').click();
      }
      this.clickedData = new EmitData(data.stationName, data.latitude, data.longitude, data.date, data.value, data.metricLabel);
      if (!this.animationPaused) {
        this.sidePanelShowStatus = false;
      }
    });
  }

  clear(): void {
    this.hourDropDownList = [];
    this.selectedHour = undefined;
    this.selectedDate = undefined;
    this.blockedHourDropdown = true;
    this.isDateAndHourSelected = false;
  }

  setClicked(newItem: boolean): void {
    this.clickedOnMap = newItem;
  }

  openOrHideSidePanel(): void {
    this.sidePanelShowStatus = !this.sidePanelShowStatus;
  }

  updateHourList(formattedDate: Date): void {
    this.hourDropDownList = [];
    const dataProvider = this.dataProvider.getActualService();

    if (dataProvider) {
      dataProvider.getDayTimePointsAsObservable(formattedDate).subscribe(
        (data: Date[]) => {
          data.forEach(d => {
            const date = new Date(d);
            const nowUtc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
              date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            this.hourDropDownList.push(nowUtc);

            // distinct and sort
            // tslint:disable-next-line:no-shadowed-variable
            this.hourDropDownList = [...new Set(this.hourDropDownList)].sort((a, b) => {
              return (new Date(b) as any) - (new Date(a) as any);
            });
          });
        }
      );
    }
  }

  onSubmit(): void {
    if (this.selectedDate) {
      this.selectedDate
        .setHours(
          // tslint:disable:no-non-null-assertion
          Number.parseInt(this.selectedHour!.substr(0, 2), 10),
          Number.parseInt(this.selectedHour!.substr(3, 2), 10),
          Number.parseInt(this.selectedHour!.substr(6, 2), 10)
        );
      this.stopAnimation();
      this.isFormSubmitted = true;
      const formattedDate = (moment(this.selectedDate)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
      this.dataProvider.getActualService().setScaleAndColour(formattedDate, 1,
        () => {
          if (this.selectedDate) {
            this.dataProvider.getActualService().draw(this.selectedDate);
          }
        });
    }
  }

  onHourChange(hour: Date): void {
    this.selectedHour = moment(hour).format('HH:mm:SS');
    this.isDateAndHourSelected = true;
  }

  onValueChange(event: any): void {
    this.clear();
    this.blockedHourDropdown = false;
    this.selectedDate = event.value;
    this.updateHourList(new Date(event.value));
  }

  // animation methods
  playAnimation(): void {
    this.animationPaused = false;
    const date = this.selectedDate;
    this.animationPlaying = true;
    this.animationStart = (moment(date)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    this.animationLength = this.animationModel.steps;
    this.animationService.stop();

    const formattedStart = (moment(this.selectedDate)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
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
    this.animationPaused = !this.animationPaused;
    this.animationService.pause();
  }

  stopAndRevertAnimation(): void {
    const date = this.animationService.getStart();
    this.stopAnimation();

    if (date !== undefined) {
      const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
      this.dataProvider.getActualService().setScaleAndColour(formattedDate, 1,
        () => {
          if (date) {
            this.dataProvider.getActualService().draw(date);
          }
        });
    }
  }

  stopAnimation(): void {
    this.animationService.stop();
    this.animationPlaying = false;
    this.animationStart = undefined;
    this.animationLength = undefined;
    this.animationNow = undefined;
    this.animationPercentage = 0;
  }

  dateFilter = (date: Date) => {
    return false;
  }

  clearEmitData(): void {
    this.clickedData.date = undefined;
    this.clickedData.value = undefined;
    this.clickedData.longitude = undefined;
    this.clickedData.latitude = undefined;
    this.clickedData.stationName = undefined;
    this.clickedData.metricLabel = undefined;
  }

  changeOpacity(value: number): void {
    this.dataProvider.getActualService().changeOpacity(value / 100);
  }

  changeColor(minColorCtr: AbstractControl, maxColorCtr: AbstractControl): void {
    this.dataProvider.getActualService().info.minColour = '#' + minColorCtr.value.hex;
    this.dataProvider.getActualService().info.maxColour = '#' + maxColorCtr.value.hex;
    if (this.selectedDate) {
      this.dataProvider.getActualService().updateColor(this.selectedDate);
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
