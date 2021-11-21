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

  update(date: Date): Promise<void>;

  getDataFromDateAsObservableUsingDate(date: Date): Observable<Type[]>;

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<Type[]>;

  getTimePointAfterAsObservable(date: Date, steps: number): Observable<Date>;

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
