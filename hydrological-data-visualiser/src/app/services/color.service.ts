import { Injectable } from '@angular/core';

// https://www.npmjs.com/package/color-interpolate
declare var require: any;
const interpolate = require('color-interpolate');

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor() { }
  @Injectable({
    providedIn: 'root'
  })
  private colormap: any = interpolate(["#000000", "#0000FF"])
  private minValue: number = 0
  private maxValue: number = 1000
  
  setColorMap(startValue: string, endValue: string): void {
    this.colormap = interpolate([startValue, endValue])
  }

  getColor(value: number): string {
    return this.colormap((value - this.minValue)/(this.maxValue - this.minValue))
  }
}
