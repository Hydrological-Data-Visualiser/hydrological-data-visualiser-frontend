import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DataModelBase} from '../model/data-model-base';
import {Observable} from 'rxjs';
import {RiverPoint} from '../model/river-point';
import * as moment from 'moment';
import {RiverService} from './river.service';

@Injectable({
  providedIn: 'root'
})
export class KocinkaTemperatureService extends RiverService {
  public url = 'https://imgw-mock.herokuapp.com/kocinkaTemperature';
  public info!: DataModelBase;

  constructor(private http: HttpClient) {
    super();
    this.getInfo();
  }

  clear(): void {
    // this.group.clearLayers();
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }

  draw(date: Date): void {
    this.drawRiver(this.getDataFromDateAsObservableUsingInstant(date));
  }

  getDataFromDateAsObservableUsingDate(date: Date): Observable<RiverPoint[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.http.get<RiverPoint[]>(`${this.url}/data?date=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<RiverPoint[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<RiverPoint[]>(`${this.url}/data?dateInstant=${formattedDate}`);
  }
}
