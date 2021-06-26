import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {StationsService} from 'src/app/services/stations.service';
import {Station} from '../../model/Station';

@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.css']
})
export class StationsComponent implements AfterViewInit, OnInit {
  list: Station[] = [];

  constructor(private stationService: StationsService) {
  }

  ngAfterViewInit(): void {
  }

  zoomTo(id: number): void {
    const station = this.list.filter(a => a.id === id)[0];
    const map = this.stationService.map;
    if (station.latitude && station.longitude) {
      map.flyTo([station.latitude, station.longitude], 13, {
        animate: true,
        animation: true,
        // duration: 2
      });
    }
  }

  ngOnInit(): void {
    this.list = this.stationService.getDataRecordsArrayFromCSVFile();
  }
}
