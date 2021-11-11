import {Injectable} from '@angular/core';
import {RiverPoint} from '../model/river-point';
import {HttpClient} from '@angular/common/http';
import {DataModelBase} from '../model/data-model-base';
import {RiverService} from './river.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KocinkaRandomService extends RiverService {
  public url = 'https://imgw-mock.herokuapp.com/kocinka';
  public status = false;
  public info: DataModelBase = this.getInfo();

  constructor(private http: HttpClient) {
    super();
  }

  showKocinkaRiver(date: string): void {
    this.drawRiver(this.getDataFromDateAsObservable(date));
  }

  getInfo(): DataModelBase {
    let res!: DataModelBase;
    this.http.get<DataModelBase>(`${this.url}/info`).toPromise().then(info => res = info);
    return res;
  }

  getDataRecordsArrayFromGetRequest(): RiverPoint[] {
    let riv: RiverPoint[] = [];
    this.http.get<RiverPoint[]>(`${this.url}/data`).subscribe((res: RiverPoint[]) => riv = res);
    return riv;
  }

  getDataFromDateAsObservable(date: string): Observable<RiverPoint[]> {
    return this.http.get<RiverPoint[]>(`${this.url}/data?date=${date}`);
  }
}
