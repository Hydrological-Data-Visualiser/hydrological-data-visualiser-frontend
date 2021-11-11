import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class KocinkaTemperatureService{
  public url = 'https://imgw-mock.herokuapp.com/kocinkaTemperature';

  constructor(private http: HttpClient) {
  }

}
