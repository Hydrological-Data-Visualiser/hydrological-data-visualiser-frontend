import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  startValue: number | undefined = 0
  endValue: number | undefined = 100
  startColour: string | undefined = "#FFFFFF"
  endColour: string | undefined = "#000FFF"
  metric: string | undefined = "metryka"

  constructor() { }

  ngOnInit(): void {}

  setScale(startValue: number, endValue: number, startColour: string, endColour: string, metric: string) {
    this.startValue = startValue
    this.endValue = endValue
    this.startColour = startColour
    this.endColour = endColour
  }

}
