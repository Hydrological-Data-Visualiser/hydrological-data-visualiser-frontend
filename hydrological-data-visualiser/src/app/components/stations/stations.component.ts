import {Component, OnInit} from '@angular/core';
import {Station} from '../../model/station';
import {HttpClient} from '@angular/common/http';
import {DataProviderService} from '../../services/data-provider.service';
import {SidePanelService} from '../side-panel/side-panel-service';
import {DataType} from '../../model/data-type';

@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.css']
})
export class StationsComponent implements OnInit {
  allStations: Station[] = [];
  query = '';

  // items = Array.from({length: 200000}).map((_, i) => `Item ${i}`);

  constructor(private dataProvider: DataProviderService, private http: HttpClient, private sidePanelService: SidePanelService) {
    // this.dataProvider.getPrecipitationService().getStationsObservable()
    //   .subscribe(stations => stations.forEach(station => this.allStations.push(station)));
    // this.dataProvider.getKocinkaSurfaceHeightService().getStationsObservable()
    //   .subscribe(stations => stations.forEach(station => this.allStations.push(station)));
  }

  ngOnInit(): void {
    this.sidePanelService.modelEmitter.subscribe(name => {
      this.allStations = [];
      if (this.dataProvider.getActualService().info.dataType === DataType.POINTS) {
        // @ts-ignore
        this.dataProvider.getActualService().getStationsObservable()
          .subscribe((stations: any[]) => stations.forEach(station => this.allStations.push(station)));
      }
    });
  }

  zoomTo(id: number): void {
    const station = this.allStations.filter(a => a.id === id)[0];
    const map = this.dataProvider.getPrecipitationService().map;
    if (station.latitude && station.longitude) {
      this.query = '';
      map.setView([station.latitude, station.longitude], 13, {
        animate: true,
        animation: true,
        duration: 2
      });
    }
  }
}
