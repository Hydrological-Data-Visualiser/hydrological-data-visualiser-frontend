import {Injectable} from '@angular/core';
import * as L from 'leaflet';
import {EmitData} from '../../model/emit-data';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {DataServiceInterface} from '../data.service.interface';
import {DataModelBase} from '../../model/data-model-base';
import {HttpClient} from '@angular/common/http';
import {ColorService} from '../color.service';
import {CustomMarkers} from '../custom-markers';
import {Station} from 'src/app/model/station';
import {ApiConnector} from '../api-connector';
import {HydrologicalData} from '../../model/hydrological-data';

@Injectable({
  providedIn: 'root'
})
export abstract class PolygonsService extends ApiConnector<HydrologicalData> implements DataServiceInterface<HydrologicalData> {
  public map!: L.Map;
  public status = false;
  public url!: string;
  public lastClickedData: [HydrologicalData, L.LatLng] | undefined = undefined;
  public polygonLayer = new L.FeatureGroup();
  public markerLayer = new L.FeatureGroup();
  public info!: DataModelBase;
  public marker: L.Marker | undefined = undefined;
  public opacity = 0.5;
  public stationList: Station[] = [];
  public polygons: Map<Station, L.Polygon> = new Map<Station, L.Polygon>();

  protected constructor(public sidePanelService: SidePanelService, public http: HttpClient, private colorService: ColorService) {
    super(http);
    this.sidePanelService.modelEmitter.subscribe(() => this.opacity = 0.5);
  }

  clear(): void {
    this.polygonLayer.clearLayers();
    this.lastClickedData = undefined;
    if (this.marker) {
      this.markerLayer.removeLayer(this.marker);
    }
    this.polygons.clear();
  }

  emitData(data: EmitData): void {
    this.sidePanelService.emitData(data);
  }

  draw(date: Date): void {
    this.sidePanelService.finishEmitter.emit(true);
    this.clear();
    this.getDataFromDateAsObservableUsingInstant(date, this.url).subscribe(HydrologicalDataArr => {
      HydrologicalDataArr.forEach(hydrologicalData => {
        const polygon = this.stationList.find(a => a.id === hydrologicalData.stationId);
        if (polygon) {
          const latlngs: L.LatLng[] = polygon.points.map(points => new L.LatLng(points[0], points[1]));
          const color = this.colorService.getColor(hydrologicalData.value);
          const lPolygon = new L.Polygon(latlngs, {
            color,
            fillColor: color,
            opacity: this.opacity,
            fillOpacity: this.opacity
          })
            .bindPopup(`${hydrologicalData.value} ${this.info.metricLabel}`)
            .on('click', (event: any) => {
              const coords: L.LatLng = event.latlng;
              this.lastClickedData = [hydrologicalData, coords];
              this.emitData(
                new EmitData(polygon, coords.lat, coords.lng, hydrologicalData.date, hydrologicalData.value, this.info.metricLabel)
              );
              this.addMarkerOnDataClick(coords);
            });
          this.polygonLayer.addLayer(lPolygon);
          this.polygons.set(polygon, lPolygon);
        }
      });
      this.polygonLayer.addTo(this.map);
      this.map.flyToBounds(this.polygonLayer.getBounds(), {duration: 1});
      this.sidePanelService.finishEmitter.emit(false);
    });
  }

  update(date: Date): Promise<void> {
    return this.getDataFromDateAsObservableUsingInstant(date, this.url).toPromise().then(HydrologicalDataArr => {
      HydrologicalDataArr.forEach(hydrologicalData => {
        const station = this.stationList.find(a => a.id === hydrologicalData.stationId);
        if (station) {
          const polygon = this.polygons.get(station);
          if (polygon) {
            const color = this.colorService.getColor(hydrologicalData.value);
            polygon.setStyle({color, fillColor: color, opacity: this.opacity, fillOpacity: this.opacity});
            polygon.bindPopup(`${hydrologicalData.value} ${this.info.metricLabel}`)
              .on('click', (event: any) => {
                const coords = event.latlng;
                this.lastClickedData = [hydrologicalData, coords];
                this.emitData(
                  new EmitData(undefined, coords.lat, coords.lng, hydrologicalData.date, hydrologicalData.value, this.info.metricLabel)
                );
                this.addMarkerOnDataClick(coords);
              });
            if (this.lastClickedData) {
              if (this.lastClickedData[0].stationId === hydrologicalData.stationId) {
                this.emitData(new EmitData(
                  station, this.lastClickedData[1].lat, this.lastClickedData[1].lng,
                  hydrologicalData.date, hydrologicalData.value, this.info.metricLabel)
                );
              }
            }
          }
        }
      });
    });
  }

  // tslint:disable-next-line:ban-types
  setScaleAndColour(begin: string, length: number, callback: Function): void {
    this.getMinValue(begin, length, this.url).subscribe(minValue =>
      this.getMaxValue(begin, length, this.url).subscribe(maxValue => {
        this.colorService.setColorMap(minValue, maxValue, this.info.minColour, this.info.maxColour, this.info.metricLabel);
        callback();
      })
    );
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }

  addMarkerOnDataClick(coords: L.LatLng): void {
    this.markerLayer.addTo(this.map);
    if (this.marker) {
      this.markerLayer.removeLayer(this.marker);
      this.marker = undefined;
    }
    const marker: L.Marker = L.marker(coords, {icon: CustomMarkers.blackIcon})
      .on('click', () => {
        this.markerLayer.removeLayer(marker);
        this.marker = undefined;
        this.sidePanelService.emitData(new EmitData(undefined, undefined, undefined, undefined, undefined, undefined));
        this.lastClickedData = undefined;
      });
    this.markerLayer.addLayer(marker);
    this.marker = marker;
  }

  changeOpacity(newOpacity: number): void {
    this.polygonLayer.setStyle({fillOpacity: newOpacity, opacity: newOpacity});
    this.opacity = newOpacity;
  }

  updateColor(date: Date): void {
    this.colorService.updateColorMap(this.info.minColour, this.info.maxColour, this.info.metricLabel);
    this.draw(date);
  }

  getStations(): void {
    this.getStationsObservable(this.url).subscribe(data => {
      this.stationList = data;
    });
  }
}
