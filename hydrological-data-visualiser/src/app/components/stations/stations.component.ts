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

  constructor(private dataProvider: DataProviderService, private http: HttpClient, private sidePanelService: SidePanelService) {
  }

  ngOnInit(): void {
    this.sidePanelService.modelEmitter.subscribe(name => {
      this.allStations = [];
      if (this.dataProvider.getActualService().info.dataType === DataType.POINTS) {
        this.dataProvider.getActualService().getStationsObservable(this.dataProvider.getActualService().url)
          .subscribe((stations: any[]) => stations.forEach(station => this.allStations.push(station)));
      }
    });
  }

  zoomTo(id: number): void {
    const station = this.allStations.filter(a => a.id === id)[0];
    const map = this.dataProvider.getActualService().map;
    if (station.points[0]) {
      this.query = '';
      map.flyTo([station.points[0][0], station.points[0][1]], 13, {
        animate: true,
        duration: 1
      });
    }
  }
}
