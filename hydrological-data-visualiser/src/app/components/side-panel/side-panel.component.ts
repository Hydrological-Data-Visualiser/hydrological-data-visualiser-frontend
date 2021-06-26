import {Component, OnInit} from '@angular/core';
import {StationsService} from '../../services/stations.service';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.css']
})
export class SidePanelComponent implements OnInit {
  status = true;
  clicked = false;
  long: number | undefined;
  lat: number | undefined;
  name: string | undefined;

  constructor(private stationService: StationsService) {
  }

  ngOnInit(): void {
    this.stationService.clickedMarker$.subscribe(a => {
      this.lat = a?.latitude;
      this.long = a?.longitude;
      this.name = a?.name;
      if (a?.latitude && a.name && a.longitude) {
        this.clicked = true;
      }
    });
  }

  setLong(newItem: number): void {
    this.long = Number(newItem.toFixed(6));
  }

  setLat(newItem: number): void {
    this.lat = Number(newItem.toFixed(6));
  }

  setClicked(newItem: boolean): void {
    this.clicked = newItem;
    this.name = undefined;
  }

  clickEvent(): void {
    this.status = !this.status;
  }
}
