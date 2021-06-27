import {AfterViewInit, Component, OnInit} from '@angular/core';
import {StationsService} from 'src/app/services/stations.service';
import {Station} from '../../model/Station';

@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.css']
})
export class StationsComponent implements AfterViewInit, OnInit {
  allStations: Station[] = [];
  // searchTerm = ' ';
  query: any;

  constructor(private stationService: StationsService) {
  }

  ngAfterViewInit(): void {
  }

  zoomTo(id: number): void {
    const station = this.allStations.filter(a => a.id === id)[0];
    const map = this.stationService.map;
    if (station.latitude && station.longitude) {
      map.setView([station.latitude, station.longitude], 13, {
        animate: true,
        animation: true,
        // duration: 2
      });
    }
  }

  ngOnInit(): void {
    this.stationService.stations$.subscribe(station => {
      if (station) {
        this.allStations.push(station);
      }
    });
  }
}
