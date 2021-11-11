import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DataModelBase} from '../model/data-model-base';

@Injectable({
  providedIn: 'root'
})
export class KocinkaTemperatureService {
  public url = 'https://imgw-mock.herokuapp.com/kocinkaTemperature';
  public info!: DataModelBase;

  constructor(private http: HttpClient) {
  }

  clear(): void {
    // this.group.clearLayers();
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }
}
