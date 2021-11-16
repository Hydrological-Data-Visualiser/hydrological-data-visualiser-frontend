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

  draw(date: Date): void {
    this.drawRiver(this.getDataFromDateAsObservableUsingDate(date));
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
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
