import {Injectable} from '@angular/core';
import * as L from 'leaflet';
import {EmitData} from '../../model/emit-data';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {HttpClient} from '@angular/common/http';
import {DataServiceInterface} from '../data.service.interface';
import {DataModelBase} from '../../model/data-model-base';
import {ColorService} from '../color.service';
import {CustomMarkers} from '../custom-markers';
import {Station} from '../../model/station';
import {ApiConnector} from '../api-connector';
import {HydrologicalData} from '../../model/hydrological-data';

@Injectable({
  providedIn: 'root'
})
export abstract class RiverService extends ApiConnector<HydrologicalData> implements DataServiceInterface<HydrologicalData> {
  public map!: L.Map;
  public info!: DataModelBase;
  public url!: string;
  public lastClickedData: [HydrologicalData, L.LatLng] | undefined = undefined;

  public status = false;
  public marker: L.Marker | undefined = undefined;
  public markerLayer = new L.FeatureGroup();
  public opacity = 0.5;
  public stationList: Station[] = [];
  public polyLines: Map<Station, L.Polyline> = new Map<Station, L.Polyline>();
  private riverLayer = new L.FeatureGroup();

  protected constructor(public sidePanelService: SidePanelService, public http: HttpClient, private colorService: ColorService) {
    super(http);
    this.sidePanelService.modelEmitter.subscribe(() => this.opacity = 0.5);
  }

  emitData(data: EmitData): void {
    this.sidePanelService.emitData(data);
  }

  clear(): void {
    this.riverLayer.clearLayers();
    this.lastClickedData = undefined;
    if (this.marker) {
      this.markerLayer.removeLayer(this.marker);
    }
    this.polyLines.clear();
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }

  draw(date: Date): void {
    this.sidePanelService.finishEmitter.emit(true);
    this.clear();
    this.getDataFromDateAsObservableUsingInstant(date, this.url).subscribe(HydrologicalDataArr => {
      HydrologicalDataArr.forEach(hydrologicalData => {
        const polyline = this.stationList.find(a => a.id === hydrologicalData.stationId);
        if (polyline) {
          const river =
            [new L.LatLng(polyline.points[0][0], polyline.points[0][1]), new L.LatLng(polyline.points[1][0], polyline.points[1][1])];
          const color = this.colorService.getColor(hydrologicalData.value);
          const lPolyline = new L.Polyline(river, {
            color,
            fillColor: color,
            opacity: this.opacity,
            fillOpacity: this.opacity
          })
            .bindPopup(`${hydrologicalData.value} ${this.info.metricLabel}`)
            .on('click', (event: any) => {
              const coords = event.latlng;
              this.addMarkerOnDataClick(coords);
              this.emitData(
                new EmitData(polyline, coords.lat, coords.lng, hydrologicalData.date, hydrologicalData.value, this.info.metricLabel)
              );
              this.lastClickedData = [hydrologicalData, coords];
            });
          this.riverLayer.addLayer(lPolyline);
          this.polyLines.set(polyline, lPolyline);
        }
      });
      this.riverLayer.addTo(this.map);
      this.map.flyToBounds(this.riverLayer.getBounds(), {duration: 1});
      this.sidePanelService.finishEmitter.emit(false);
    });
  }

  update(date: Date): Promise<void> {
    return this.getDataFromDateAsObservableUsingInstant(date, this.url).toPromise().then(HydrologicalDataArr => {
      HydrologicalDataArr.forEach(hydrologicalData => {
        const station = this.stationList.find(a => a.id === hydrologicalData.stationId);
        if (station) {
          const polyline = this.polyLines.get(station);
          if (polyline) {
            const color = this.colorService.getColor(hydrologicalData.value);
            polyline.setStyle({color, fillColor: color, opacity: this.opacity, fillOpacity: this.opacity});
            polyline.bindPopup(`${hydrologicalData.value} ${this.info.metricLabel}`)
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

  changeOpacity(newOpacity: number): void {
    this.riverLayer.setStyle({fillOpacity: newOpacity, opacity: newOpacity});
    this.opacity = newOpacity;
  }

  updateColor(date: Date): void {
    this.colorService.updateColorMap(this.info.minColour, this.info.maxColour, this.info.metricLabel);
    this.draw(date);
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

  getStations(): void {
    this.getStationsObservable(this.url).subscribe(data => {
      this.stationList = data;
    });
  }
}
