import {DataModelBase} from '../model/data-model-base';
import {Observable} from 'rxjs';
import {Station} from '../model/station';
import * as L from 'leaflet';
import {EmitData} from '../model/emit-data';

export interface DataServiceInterface<Type> {
  readonly url: string;
  info: DataModelBase;
  map: L.Map;

  draw(date: Date): void;

  getDataFromDateAsObservableUsingDate(date: Date): Observable<Type[]>;

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<Type[]>;

  getInfo(): void;

  getInfoObservable(): Observable<DataModelBase>;

  // only in points services
  getStationsObservable?(): Observable<Station[]>;

  getStations?(): void;

  clear(): void;

  emitData(data: EmitData): void;

  getMaxValue(begin: string, length: number): Observable<number>;

  getMinValue(begin: string, length: number): Observable<number>;
}
