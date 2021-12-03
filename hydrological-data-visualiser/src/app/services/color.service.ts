import {Injectable} from '@angular/core';
import {LegendComponent} from '../components/legend/legend.component';

// https://www.npmjs.com/package/color-interpolate
declare var require: any;
const interpolate = require('color-interpolate');

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  private colormap: any = interpolate(['#FFFFFF', '#0000FF']);
  private minValue = 0;
  private maxValue = 50; // mock values
  private legend: LegendComponent | undefined;

  setLegend(legend: LegendComponent): void {
    this.legend = legend;
  }

  setColorMap(minValue: number, maxValue: number, startColor: string, endColor: string, metricLabel: string): void {
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.colormap = interpolate([startColor, endColor]);
    if (this.legend) {
      this.legend.setScale(minValue, maxValue, startColor, endColor, metricLabel);
    }
  }

  getColor(value: number | null): string {
    if (this.minValue === this.maxValue) {
      return this.colormap(0);
    }
    if (value === null || value === undefined) {
      return '#000000';
    }
    return this.colormap((value - this.minValue) / (this.maxValue - this.minValue));
  }
}
