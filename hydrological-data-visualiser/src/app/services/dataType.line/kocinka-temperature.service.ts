import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DataModelBase} from '../../model/data-model-base';
import {Observable} from 'rxjs';
import {RiverPoint} from '../../model/river-point';
import * as moment from 'moment';
import {RiverService} from './river.service';
import {DataServiceInterface} from '../data.service.interface';
import {SidePanelService} from '../../components/side-panel/side-panel-service';

@Injectable({
  providedIn: 'root'
})
export class KocinkaTemperatureService extends RiverService implements DataServiceInterface<RiverPoint>{
  public url = 'https://imgw-mock.herokuapp.com/kocinkaTemperature';
  public info!: DataModelBase;

  constructor(private http: HttpClient, public sidePanelService: SidePanelService) {
    super(sidePanelService);
    this.getInfo();
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }

  getInfoSubscription(): Observable<DataModelBase> {
    return this.http.get<DataModelBase>(`${this.url}/info`);
  }

  draw(date: Date): void {
    this.drawRiver(this.getDataFromDateAsObservableUsingInstant(date), this.info.metricLabel);
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
