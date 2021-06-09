import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.css']
})
export class SidePanelComponent implements OnInit {
  status = true;
  clicked = false;
  long = 0;
  lat = 0;

  // @Input() long!: number;
  // @Input() lat!: number;
  // @Input('master') masterName = ''; // tslint:disable-line: no-input-rename

  constructor() {

  }

//   @ViewChild(MapComponent) child!: MapComponent;
// set pane(v: MapComponent) {
//   this.long = v.long;
//   this.lat = v.lat;
//   console.log('aa' + this.long);
// }

  ngOnInit(): void {
  }

  setLong(newItem: number): void {
    this.long = newItem;
  }

  setLat(newItem: number): void {
    this.lat = newItem;
  }

  setClicked(newItem: boolean): void {
    this.clicked = newItem;
  }

  clickEvent(): void {
    this.status = !this.status;
  }

}
