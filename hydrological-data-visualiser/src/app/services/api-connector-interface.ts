import {Observable} from 'rxjs';
import {DataModelBase} from '../model/data-model-base';
import {Station} from '../model/station';

export interface ApiConnectorInterface<Type> {

  getDataFromDateAsObservableUsingDate(date: Date, url: string): Observable<Type[]>;

  getDataFromDateAsObservableUsingInstant(date: Date, url: string): Observable<Type[]>;

  getTimePointAfterAsObservable(date: Date, steps: number, url: string): Observable<Date>;

  getDayTimePointsAsObservable(date: Date, url: string): Observable<Date[]>;

  getInfoObservable(url: string): Observable<DataModelBase>;

  getStationsObservable(url: string): Observable<Station[]>;

  getMinValue(begin: string, length: number, url: string): Observable<number>;

  getMaxValue(begin: string, length: number, url: string): Observable<number>;

  getLengthBetweenObservable(startDate: Date, endDate: Date, url: string): Observable<number>;

  getDataBetweenAndStationAsObservable(dateFrom: Date, dateTo: Date, station: Station, url: string): Observable<Type>;

}
