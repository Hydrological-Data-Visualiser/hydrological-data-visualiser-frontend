import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, ApplicationRef } from '@angular/core';
import { ColorService } from 'src/app/services/color.service';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  scaleData = new ScaleData(0, 100, "#FFFFFF", "#000FFF", "metryka")
  
  constructor(private colorService: ColorService) { 
    colorService.setLegend(this)
  }

  ngOnInit(): void { }

  setScale(startValue: number, endValue: number, startColour: string, endColour: string, metric: string) {
    console.log("scale")
    this.scaleData = new ScaleData(startValue, endValue, startColour, endColour, metric)
  }
}

class ScaleData {
  constructor(
    public startValue: number,
    public endValue: number,
    public startColour: string,
    public endColour: string,
    public metric: string) {}
}