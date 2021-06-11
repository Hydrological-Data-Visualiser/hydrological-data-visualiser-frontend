import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { RiverService } from 'src/app/services/river.service';
import { ChoroplethService } from 'src/app/services/choropleth.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  private map : any;

  private initMap(): void {
    this.map = L.map('map', {
      center: [50.9030, 19.0550],
      zoom: 3
    });
  
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  constructor(private riverService: RiverService, private choroplethService: ChoroplethService) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.riverService.showKocinkaRiver(this.map);
    this.choroplethService.showExampleChoropleth(this.map);
  }
}
