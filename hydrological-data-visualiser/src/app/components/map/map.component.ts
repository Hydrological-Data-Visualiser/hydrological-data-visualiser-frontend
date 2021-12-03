import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import * as L from 'leaflet';
import {ResizedEvent} from 'angular-resize-event';
import 'leaflet/dist/images/marker-shadow.png';
import {DataProviderService} from '../../services/data-provider.service';

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
  // @Output() latLngEventEmitter = new EventEmitter<L.LatLng>();
  // @Output() clickedEmitter = new EventEmitter<boolean>();

  constructor(private dataProvider: DataProviderService) {
    this.lat = 0;
    this.long = 0;
  }

  ngAfterViewInit(): void {
    this.initMap();
    // this.onClick();

    this.dataProvider.getAllServices().forEach(service => service.map = this.map);
  }

  onResized(event: ResizedEvent): void {
    this.map.invalidateSize();
  }

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

  // private onClick(): void {
  //   this.map.on('click', (e: any) => {
  //     const coord = e.latlng;
  //     this.lat = coord.lat;
  //     this.long = coord.lng;
  //     this.latLngEventEmitter.emit(new L.LatLng(this.lat, this.long));
  //     this.clickedEmitter.emit(true);
  //     this.addMarker(coord);
  //   });
  // }

  // addMarker(latlng: LatLngExpression): void {
  //   if (this.marker) {
  //     this.map.removeLayer(this.marker);
  //   }
  //   this.marker = L.marker(latlng, {icon: this.redIcon}).addTo(this.map).on('click', a => {
  //     this.map.removeLayer(this.marker);
  //     this.marker = undefined;
  //     this.latLngEventEmitter.emit(undefined);
  //     this.clickedEmitter.emit(false);
  //   });
  // }
}
