import {DataModelBase} from '../model/data-model-base';
import {Observable} from 'rxjs';
import {Station} from '../model/station';
import * as L from 'leaflet';
import {EmitData} from '../model/emit-data';

export interface DataServiceInterface<Type> {
  readonly url: string;
  info: DataModelBase;
  map: L.Map;
  draw(date: Date, url: string): void;

  getDataFromDateAsObservableUsingDate(date: Date): Observable<Type[]>;

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<Type[]>;

  getInfo(): void;

  getInfoSubscription(): Observable<DataModelBase>;

  // only in points services
  getStationsObservable?(): Observable<Station[]>;

  getStations?(): Station[];

  clear(): void;

  emitData(data: EmitData): void;
}
