import {DataModelBase} from '../model/data-model-base';
import {Observable} from 'rxjs';
import {Station} from '../model/station';

export interface DataServiceInterface<Type> {
  readonly url: string;
  info: DataModelBase;

  draw(date: Date): void;

  getDataFromDateAsObservableUsingDate(date: Date): Observable<Type[]>;

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<Type[]>;

  getInfo(): void;

  getInfoSubscription(): Observable<DataModelBase>;

  // only in points services
  getStationsObservable?(): Observable<Station[]>;

  getStations?(): Station[];
}
