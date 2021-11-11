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
  private colormap: any = interpolate(["#FFFFFF", "#0000FF"])
  private minValue: number = 0
  private maxValue: number = 50 // mock values
  
  setColorMap(minValue: number, maxValue: number, startColor: string, endColor: string): void {
    this.minValue = minValue
    this.maxValue = maxValue
    this.colormap = interpolate([startColor, endColor])
  }

  getColor(value: number): string {
    return this.colormap((value - this.minValue)/(this.maxValue - this.minValue))
  }
}
