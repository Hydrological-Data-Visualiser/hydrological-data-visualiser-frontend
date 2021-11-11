import {Injectable} from '@angular/core';
import {RiverPoint} from '../model/river-point';
import {HttpClient} from '@angular/common/http';
import {DataModelBase} from '../model/data-model-base';
import {RiverService} from './river.service';
import {Observable} from 'rxjs';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class KocinkaRandomService extends RiverService {
  public url = 'https://imgw-mock.herokuapp.com/kocinka';
  public status = false;
  public info!: DataModelBase;

  constructor(private http: HttpClient) {
    super();
    this.getInfo();
  }

  showKocinkaRiver(date: Date): void {
    this.drawRiver(this.getDataFromDateAsObservableUsingDate(date));
  }

  getInfo(): void  {
    this.http.get<DataModelBase>(`${this.url}/info`).toPromise().then(info => this.info = info);
  }

  getDataRecordsArrayFromGetRequest(): RiverPoint[] {
    let riv: RiverPoint[] = [];
    this.http.get<RiverPoint[]>(`${this.url}/data`).subscribe((res: RiverPoint[]) => riv = res);
    return riv;
  }

  getDataFromDateAsObservableUsingDate(date: Date): Observable<RiverPoint[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.http.get<RiverPoint[]>(`${this.url}/data?date=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<RiverPoint[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<RiverPoint[]>(`${this.url}/data?date=${formattedDate}`);
  }
}
