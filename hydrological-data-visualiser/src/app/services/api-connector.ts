import {DataModelBase} from '../model/data-model-base';
import {Station} from '../model/station';
import {Observable} from 'rxjs';
import {ApiConnectorInterface} from './api-connector-interface';
import * as moment from 'moment';
import {HttpClient} from '@angular/common/http';

export abstract class ApiConnector<Type> implements ApiConnectorInterface<Type> {

  protected constructor(public http: HttpClient) {
  }

  getDataBetweenAndStationAsObservable(dateFrom: Date, dateTo: Date, station: Station, url: string): Observable<Type> {
    const dateFromStr = moment(dateFrom).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    const dateToStr = moment(dateTo).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    return this.http.get<Type>(`${url}/data?dateFrom=${dateFromStr}&dateTo=${dateToStr}&stationId=${station.id}`);
  }

  getDataFromDateAsObservableUsingDate(date: Date, url: string): Observable<Type[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.http.get<Type[]>(`${url}/data?date=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date, url: string): Observable<Type[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    return this.http.get<Type[]>(`${url}/data?dateInstant=${formattedDate}`);
  }

  getDayTimePointsAsObservable(date: Date, url: string): Observable<Date[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.http.get<Date[]>(`${url}/dayTimePoints?date=${formattedDate}`);
  }

  getInfoObservable(url: string): Observable<DataModelBase> {
    return this.http.get<DataModelBase>(`${url}/info`);
  }

  getLengthBetweenObservable(startDate: Date, endDate: Date, url: string): Observable<number> {
    const formattedStartDate = (moment(startDate)).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    const formattedEndDate = (moment(endDate)).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    return this.http.get<number>(`${url}/length?instantFrom=${formattedStartDate}&&instantTo=${formattedEndDate}`);
  }

  getMaxValue(begin: string, length: number, url: string): Observable<number> {
    return this.http.get<number>(`${url}/max?instantFrom=${begin}&length=${length}`);
  }

  getMinValue(begin: string, length: number, url: string): Observable<number> {
    return this.http.get<number>(`${url}/min?instantFrom=${begin}&length=${length}`);
  }

  getStationsObservable(url: string): Observable<Station[]> {
    return this.http.get<Station[]>(`${url}/stations`);
  }

  getTimePointAfterAsObservable(date: Date, steps: number, url: string): Observable<Date> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    return this.http.get<Date>(`${url}/timePointsAfter?instantFrom=${formattedDate}&step=${steps.toString()}`);
  }
}
