import {DataModelBase} from '../model/data-model-base';
import {Station} from '../model/station';
import * as L from 'leaflet';
import {EmitData} from '../model/emit-data';
import {ApiConnectorInterface} from './api-connector-interface';

export interface DataServiceInterface<Type> extends ApiConnectorInterface<Type> {
  readonly url: string;
  info: DataModelBase;
  map: L.Map;
  lastClickedData: [Type, L.LatLng] | undefined;
  marker: L.Marker | undefined;
  stationList: Station[];

  draw(date: Date): void;

  update(date: Date): Promise<void>;

  getInfo(): void;

  // tslint:disable-next-line:ban-types
  setScaleAndColour(begin: string, length: number, callback: Function): void;

  getStations(): void;

  clear(): void;

  emitData(data: EmitData): void;

  changeOpacity(opacity: number): void;

  updateColor(date: Date): void;
}
