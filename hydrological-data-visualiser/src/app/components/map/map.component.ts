import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import * as L from 'leaflet';
import {LatLngExpression} from 'leaflet';
import {RiverService} from 'src/app/services/river.service';
import {ResizedEvent} from 'angular-resize-event';
import 'leaflet/dist/images/marker-shadow.png';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  private map: any;
  lat: number;
  long: number;
  clicked = false;
  markers: Array<L.Marker<any>> = [];
  @Output() longEmitter = new EventEmitter<number>();
  @Output() latEmitter = new EventEmitter<number>();
  @Output() clickedEmitter = new EventEmitter<boolean>();

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

  private onClick(): void {
    this.map.on('click', (e: any) => {
      const coord = e.latlng;
      this.lat = coord.lat;
      this.long = coord.lng;
      console.log('You clicked the map at latitude: ' + this.lat + ' and longitude: ' + this.long);
      this.longEmitter.emit(this.long);
      this.latEmitter.emit(this.lat);
      this.clickedEmitter.emit(true);
      this.addMarker(coord);
      // @Output() latitude = new EventEmitter<string>();
    });
  }

  constructor(private riverService: RiverService) {
    this.lat = 0;
    this.long = 0;
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.onClick();
    this.riverService.showKocinkaRiver(this.map);
  }

  onResized(event: ResizedEvent): void {
    this.map.invalidateSize();
  }

  addMarker(latlng: LatLngExpression): void {
    this.markers.forEach((s) => this.map.removeLayer(s));
    this.markers = [];
    const newMarker = L.marker(latlng).addTo(this.map);
    // .bindPopup('Ionic 4 <br> Leaflet.')
    // .openPopup();
    this.markers.push(newMarker);
    console.log(this.markers);
  }
}
