import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import moment from 'moment';
import {AnimationInputData} from 'src/app/model/animation-input-data';
import {AnimationService} from 'src/app/services/animation.service';
import {DataProviderService} from '../../services/data-provider.service';
import {SidePanelService} from './side-panel-service';
import {EmitData} from '../../model/emit-data';
import * as PickerColor from '@angular-material-components/color-picker';
import {AbstractControl, FormControl, Validators} from '@angular/forms';
import {ChartDataSets, ChartOptions} from 'chart.js';
import {BaseChartDirective, Label} from 'ng2-charts';
import {HydrologicalData} from '../../model/hydrological-data';
import 'moment/locale/pl';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [{provide: MAT_DATE_LOCALE, useValue: 'pl-PL'}]
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
  hourDropDownList: HourListContainer = new HourListContainer([]);
  // animation
  blockedAnimationHourDropdown = true;
  animationHourDropDownList: HourListContainer = new HourListContainer([]);
  isAnimationDateAndHourSelected = false;
  animationPlaying = false;
  animationPaused = false;
  animationModel = new AnimationInputData(10, 100);
  animationStart: Date | undefined;
  animationEnd: Date | undefined;
  animationLength: number | undefined;
  animationNow: Date | undefined;
  animationPercentage: number | undefined;
  selectedAnimationDate: Date | undefined;
  selectedAnimationHour: string | undefined;
  blockedAnimationRange = true;
  // non animation
  showingDate: Date | undefined; // used for showing displayed non animation data

  clickedData: EmitData = new EmitData(undefined, undefined, undefined, undefined, undefined, undefined);
  opacity = 50;
  minColorCtr: AbstractControl = new FormControl(new PickerColor.Color(255, 243, 0), [Validators.required]);
  maxColorCtr: AbstractControl = new FormControl(new PickerColor.Color(255, 243, 0), [Validators.required]);

  showLoadingScreen = false;
  selected: any;
  selectedAnimationHourDefault: any;
  loadingChart = false;

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public barChartData: ChartDataSets[] = [];
  public barChartLabels: Label[] = [];
  public barChartPlugins = [];
  public barChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      display: false
    },
    scales: {
      xAxes: [{
        display: false,
      }]
    }
  };

  constructor(private dataProvider: DataProviderService, private animationService: AnimationService,
              private sidePanelService: SidePanelService, private adapter: DateAdapter<any>) {
    this.adapter.setLocale('pl');
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
      this.setClickedData(undefined);
      this.clickedOnMap = false;
      this.sidePanelShowStatus = false;

      this.opacity = 50;
      this.isModelSelected = true;
      this.isFormSubmitted = false;

      const newMinColor = this.hexToRgb(this.dataProvider.getActualService().info.minColour);
      const newMaxColor = this.hexToRgb(this.dataProvider.getActualService().info.maxColour);
      this.minColorCtr = new FormControl(new PickerColor.Color(newMinColor[0], newMinColor[1], newMinColor[2]));
      this.maxColorCtr = new FormControl(new PickerColor.Color(newMaxColor[0], newMaxColor[1], newMaxColor[2]));

      // @ts-ignore - open details tab
      document.getElementById('nav-form-tab').click();
      this.stopAnimation();
      this.showingDate = undefined;
      this.clearChart();

      this.init();
    });

    this.sidePanelService.dataEmitter.subscribe(data => {
      let showChart = false;
      if (data.latitude !== this.clickedData.latitude && data.longitude !== this.clickedData.longitude) {
        // @ts-ignore - open details tab
        document.getElementById('nav-details-tab').click();
        showChart = true;
      }
      if (data.latitude === undefined && data.longitude === undefined) {
        this.clickedOnMap = false;
        this.setClickedData(undefined);
      } else {
        this.clickedOnMap = true;
        this.setClickedData(data);
        this.sidePanelShowStatus = false;
      }
      if (!this.animationPaused) {
        this.sidePanelShowStatus = false;
      }
      if (showChart) {
        this.getDataToChart();
      }
    });

    this.sidePanelService.finishEmitter.subscribe(value => this.showLoadingScreen = value);
  }

  clearAfterAnimationDate(): void {
    this.isAnimationDateAndHourSelected = false;
    this.selectedAnimationHour = undefined;
  }

  clearAfterHour(): void {
    this.animationHourDropDownList.hourList = [];
    this.selectedAnimationDate = undefined;
    this.blockedAnimationHourDropdown = true;
    this.clearAfterAnimationDate();
  }

  clear(): void {
    this.hourDropDownList.hourList = [];
    this.selectedHour = undefined;
    this.selectedDate = undefined;
    this.blockedHourDropdown = true;
    this.blockedAnimationRange = true;
    this.isDateAndHourSelected = false;
    this.clearAfterHour();
  }

  setClicked(newItem: boolean): void {
    this.clickedOnMap = newItem;
  }

  openOrHideSidePanel(): void {
    this.sidePanelShowStatus = !this.sidePanelShowStatus;
  }

  updateHourList(formattedDate: Date, hourListContainer: HourListContainer, notBeforeHour: Date | undefined): void {
    hourListContainer.hourList = [];
    const dataProvider = this.dataProvider.getActualService();

    if (dataProvider) {
      dataProvider.getDayTimePointsAsObservable(formattedDate, dataProvider.url).subscribe(
        (data: Date[]) => {
          data.forEach(d => {
            const date = new Date(d);
            const nowUtc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
              date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            if (!notBeforeHour || notBeforeHour.getTime() <= nowUtc.getTime()) {
              hourListContainer.hourList.push(nowUtc);
            }

            // distinct and sort
            // tslint:disable-next-line:no-shadowed-variable
            hourListContainer.hourList = [...new Set(hourListContainer.hourList)].sort((a, b) => {
              return (new Date(b) as any) - (new Date(a) as any);
            });
          });
        }
      );
    }
  }

  onSubmit(): void {
    if (this.selectedDate) {
      const drawDate = this.getSelectedTime();
      this.stopAnimation();
      this.isFormSubmitted = true;
      this.blockedAnimationRange = false;
      this.showingDate = drawDate;
      this.selectedAnimationDate = new Date(this.dataProvider.getActualService().info
        .availableDates[this.dataProvider.getActualService().info.availableDates.length - 1]);
      this.clearAfterAnimationDate();
      this.blockedAnimationHourDropdown = false;
      // this.updateHourList(this.selectedAnimationDate, this.animationHourDropDownList, this.getSelectedTime());
      const dataProvider = this.dataProvider.getActualService();
      dataProvider.getDayTimePointsAsObservable(this.selectedDate, this.dataProvider.getActualService().url).subscribe(
        (data: Date[]) => {
          this.animationHourDropDownList.hourList = [];
          data.forEach(d => {
            const date = new Date(d);
            const nowUtc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
              date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            this.animationHourDropDownList.hourList.push(nowUtc);

            // distinct and sort
            // tslint:disable-next-line:no-shadowed-variable
            this.animationHourDropDownList.hourList = [...new Set(this.animationHourDropDownList.hourList)].sort((a, b) => {
              return (new Date(b) as any) - (new Date(a) as any);
            });
          });
          const animationHour = this.animationHourDropDownList.hourList.sort()[this.animationHourDropDownList.hourList.length - 1];

          this.selectedAnimationHourDefault = animationHour;
          this.selectedAnimationHour = moment(animationHour).format('HH:mm:ss');
          this.isAnimationDateAndHourSelected = true;
          this.getDataToChart();
        });
      const formattedDate = (moment(drawDate)).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
      this.dataProvider.getActualService().setScaleAndColour(formattedDate, 1,
        () => {
          if (drawDate) {
            this.dataProvider.getActualService().draw(drawDate);
          }
        });
      this.animationDateFilter = (date: Date): boolean => {
        const selectedTimelessDate =
          // tslint:disable-next-line: no-non-null-assertion
          new Date(drawDate!.getFullYear(), drawDate!.getMonth(), drawDate!.getDate());

        // tslint:disable-next-line:no-non-null-assertion
        return date >= selectedTimelessDate! && this.dataProvider.getActualService().info.availableDates.sort()
          .map(a => moment(a).format('YYYY-MM-DD')).includes(moment(date).format('YYYY-MM-DD'));
      };
    }
  }

  onHourChange(hour: Date, event: any): void {
    if (event.isUserInput) {
      this.clearAfterHour();
      this.selectedHour = moment(hour).format('HH:mm:ss');
      this.isDateAndHourSelected = true;
      this.selectedAnimationHour = undefined;
      this.clearChart();
    }
  }

  onAnimationHourChange(hour: Date, event: any): void {
    if (event.isUserInput) {
      this.selectedAnimationHour = moment(hour).format('HH:mm:ss');
      this.isAnimationDateAndHourSelected = true;
      this.getDataToChart();
    }
  }

  onValueChange(event: any): void {
    this.clear();
    this.blockedHourDropdown = false;
    this.selectedDate = event.value;
    this.updateHourList(new Date(event.value), this.hourDropDownList, undefined);
    this.clearChart();
  }

  onAnimationDateChange(event: any): void {
    this.clearAfterAnimationDate();
    this.blockedAnimationHourDropdown = false;
    this.selectedAnimationDate = event.value;
    this.updateHourList(new Date(event.value), this.animationHourDropDownList, this.getSelectedTime());
    this.clearChart();
  }

  // animation methods
  playAnimation(): void {
    this.animationService.stop();
    this.animationPaused = false;
    if (this.selectedDate !== undefined && this.selectedAnimationDate !== undefined) {
      // tslint:disable-next-line: no-non-null-assertion
      const startDate = this.getSelectedTime()!;
      // tslint:disable-next-line: no-non-null-assertion
      const endDate = this.getSelectedAnimationTime()!;
      this.animationPlaying = true;
      this.animationStart = startDate;
      this.animationEnd = endDate;
      this.animationNow = startDate;

      this.dataProvider.getActualService()
        .getLengthBetweenObservable(startDate, endDate, this.dataProvider.getActualService().url).subscribe(length => {
        this.setAnimationLength(length);

        const formattedStart = (moment(startDate)).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
        this.dataProvider.getActualService().setScaleAndColour(formattedStart, length,
          () => {
            if (startDate) {
              this.animationService.setAnimation(
                startDate, length, this.animationModel.timestepMs, this, this.dataProvider.getActualService()
              );
            }
            this.animationService.play();
          });
      });
    }
  }

  getParsedTime(date: Date, time: string): Date {
    const copiedDate = new Date(date.getTime());
    copiedDate.setHours(
      // tslint:disable:no-non-null-assertion
      Number.parseInt(time.substr(0, 2), 10),
      Number.parseInt(time.substr(3, 2), 10),
      Number.parseInt(time.substr(6, 2), 10)
    );
    return copiedDate;
  }

  getSelectedTime(): Date | undefined {
    if (this.selectedDate && this.selectedHour) {
      return this.getParsedTime(this.selectedDate!, this.selectedHour);
    } else {
      return undefined;
    }
  }

  getSelectedAnimationTime(): Date | undefined {
    if (this.selectedAnimationDate && this.selectedAnimationHour) {
      return this.getParsedTime(this.selectedAnimationDate!, this.selectedAnimationHour!);
    } else {
      return undefined;
    }
  }

  // called by animationService
  setAnimationPlaybackData(animationNow: Date, currentFrame: number): void {
    if (this.animationLength !== undefined
    ) {
      this.animationPercentage = currentFrame * 100 / (this.animationLength - 1);
    }
    this.animationNow = animationNow;
  }

  setAnimationLength(length: number): void {
    this.animationLength = length;
  }

  pauseAnimation(): void {
    this.animationPaused = !this.animationPaused;
    this.animationService.pause();
  }

  stopAndRevertAnimation(): void {
    const date = this.animationService.getStart();
    this.stopAnimation();

    if (date !== undefined) {
      const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
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
    this.animationEnd = undefined;
    this.animationLength = undefined;
    this.animationNow = undefined;
    this.animationPercentage = 0;
  }

  dateFilter = (date: Date) => {
    return false;
  }

  animationDateFilter = (date: Date) => {
    return false;
  }

  changeOpacity(value: number): void {
    this.dataProvider.getActualService().changeOpacity(value / 100);
  }

  changeColor(minColorCtr: AbstractControl, maxColorCtr: AbstractControl): void {
    this.dataProvider.getActualService().info.minColour = '#' + minColorCtr.value.hex;
    this.dataProvider.getActualService().info.maxColour = '#' + maxColorCtr.value.hex;
    const selectedDate = this.getSelectedTime();
    if (selectedDate) {
      this.dataProvider.getActualService().updateColor(selectedDate);
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

  setClickedData(data: EmitData | undefined): void {
    if (data) {
      this.clickedData.date = data.date;
      this.clickedData.value = data.value;
      this.clickedData.longitude = data.longitude;
      this.clickedData.latitude = data.latitude;
      this.clickedData.station = data.station;
      this.clickedData.metricLabel = data.metricLabel;
    } else {
      this.clickedData.date = undefined;
      this.clickedData.value = undefined;
      this.clickedData.longitude = undefined;
      this.clickedData.latitude = undefined;
      this.clickedData.station = undefined;
      this.clickedData.metricLabel = undefined;
    }
  }

  getDataToChart(): void {
    this.barChartLabels = [];
    this.barChartData = [];
    if (
      this.clickedData.station && this.selectedDate && this.selectedAnimationDate && this.selectedHour && this.selectedAnimationHour) {
      this.loadingChart = true;
      const startDate: Date = new Date(moment(this.selectedDate).format('YYYY-MM-DD[T]') + this.selectedHour);
      const finishDate: Date = new Date(moment(this.selectedAnimationDate).format('YYYY-MM-DD[T]') + this.selectedAnimationHour);
      this.dataProvider.getActualService()
        .getDataBetweenAndStationAsObservable(startDate, finishDate,
          this.clickedData.station, this.dataProvider.getActualService().url)
        .subscribe((data: HydrologicalData[]) => {
          this.createDataChart(data.filter(a => a.date));
        });
    }
  }

  createDataChart(data: HydrologicalData[]): void {
    data = data.sort((a, b) => a.date < b.date ? -1 : 1);
    this.barChartData.push({
      data: data.map(item => item.value),
      label: this.dataProvider.getActualService().info.metricLabel,
      backgroundColor: 'rgba(63, 81, 181)',
      hoverBackgroundColor: 'rgba(255, 68, 132)'
    });
    data.map(item => moment(item.date).format('YYYY-MM-DD HH:mm:ss')).forEach(a => this.barChartLabels.push(a));
    this.chart?.update();
    this.loadingChart = false;
  }

  init(): void {
    this.blockedHourDropdown = false;
    this.hourDropDownList.hourList = [];
    const dataProvider = this.dataProvider.getActualService();
    if (dataProvider) {
      dataProvider.getStationsObservable(this.dataProvider.getActualService().url).subscribe(stations => {
        dataProvider.stationList = stations;
        this.selectedDate = new Date(this.dataProvider.getActualService().info.availableDates[0]);
        this.updateHourList(this.selectedDate, this.hourDropDownList, undefined);
        dataProvider.getDayTimePointsAsObservable(this.selectedDate, this.dataProvider.getActualService().url).subscribe(
          (data: Date[]) => {
            this.hourDropDownList.hourList = [];
            data.forEach(d => {
              const date = new Date(d);
              const nowUtc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
                date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
              this.hourDropDownList.hourList.push(nowUtc);

              // distinct and sort
              // tslint:disable-next-line:no-shadowed-variable
              this.hourDropDownList.hourList = [...new Set(this.hourDropDownList.hourList)].sort((a, b) => {
                return (new Date(b) as any) - (new Date(a) as any);
              });
            });
            this.selectedHour = moment(this.hourDropDownList.hourList.sort()[0]).format('HH:mm:ss');
            this.selected = this.hourDropDownList.hourList.sort()[0];
            this.isDateAndHourSelected = true;
            this.onSubmit();
          });
      });
    }
  }

  clearChart(): void {
    this.barChartLabels = [];
    this.barChartData = [];
    this.chart?.update();
  }
}

export class HourListContainer {
  constructor(public hourList: Date[]) {
  }
}
