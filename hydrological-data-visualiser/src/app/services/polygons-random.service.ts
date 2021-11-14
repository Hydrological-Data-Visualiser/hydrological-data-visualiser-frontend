import {Injectable} from '@angular/core';
import {PolygonsService} from './polygons.service';
import {HttpClient} from '@angular/common/http';
import {DataModelBase} from '../model/data-model-base';
import {Observable} from 'rxjs';
import * as moment from 'moment';
import {PolygonModel} from '../model/polygon';

@Injectable({
  providedIn: 'root'
})
export class PolygonsRandomService extends PolygonsService {
  public url = 'https://imgw-mock.herokuapp.com/polygons';
  public info!: DataModelBase;

  constructor(private http: HttpClient) {
    super();
    this.getInfo();
  }

  draw(date: Date): void {
    this.drawPolygons(this.getDataFromDateAsObservableUsingInstant(date));
  }

  getDataFromDateAsObservableUsingDate(date: Date): Observable<PolygonModel[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.http.get<PolygonModel[]>(`${this.url}/data?date=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<PolygonModel[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<PolygonModel[]>(`${this.url}/data?dateInstant=${formattedDate}`);
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }
}
