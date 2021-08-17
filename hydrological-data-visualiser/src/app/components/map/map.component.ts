import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import * as L from 'leaflet';
import {LatLngExpression} from 'leaflet';
import {RiverService} from 'src/app/services/river.service';
import {ResizedEvent} from 'angular-resize-event';
import 'leaflet/dist/images/marker-shadow.png';
import {StationsService} from '../../services/stations.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  map: any;
  lat: number;
  long: number;
  clicked = false;
  marker: L.Marker<any> | undefined;
  @Output() longEmitter = new EventEmitter<number>();
  @Output() latEmitter = new EventEmitter<number>();
  @Output() clickedEmitter = new EventEmitter<boolean>();

  private initMap(): void {
    this.map = L.map('map', {
      center: [50.9030, 19.0550],
      zoom: 5,
      preferCanvas: true,
      renderer: L.canvas()
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  private onClick(): void {
    this.map.on('click', (e: any) => {
      const coord = e.latlng;
      this.lat = coord.lat;
      this.long = coord.lng;
      this.longEmitter.emit(this.long);
      this.latEmitter.emit(this.lat);
      this.clickedEmitter.emit(true);
      this.addMarker(coord);
      // @Output() latitude = new EventEmitter<string>();
    });
  }

  constructor(private riverService: RiverService,
              private stationService: StationsService) {
    this.lat = 0;
    this.long = 0;
    this.stationService.map = this.map;
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.onClick();
    this.riverService.showKocinkaRiver(this.map);
    this.stationService.map = this.map;
    this.stationService.clickedMarker$.subscribe(a => {
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
    });
  }

  onResized(event: ResizedEvent): void {
    this.map.invalidateSize();
  }

  addMarker(latlng: LatLngExpression): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.marker = L.marker(latlng, {icon: this.stationService.redIcon}).addTo(this.map).on('click', a => {
      this.map.removeLayer(this.marker);
      this.marker = undefined;
      this.longEmitter.emit(undefined);
      this.latEmitter.emit(undefined);
      this.clickedEmitter.emit(false);
    });
    // .bindPopup('Ionic 4 <br> Leaflet.')
    // .openPopup();
  }
}
