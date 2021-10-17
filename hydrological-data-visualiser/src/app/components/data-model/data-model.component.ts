import {Component, OnInit} from '@angular/core';
import {FormInputData} from '../../model/form-input-data';
import {StationsService} from '../../services/stations.service';
import * as moment from 'moment';

@Component({
  selector: 'app-data-model',
  templateUrl: './data-model.component.html',
  styleUrls: ['./data-model.component.css']
})
export class DataModelComponent implements OnInit {

  constructor(private stationService: StationsService) {
  }

  onSubmit(): void {
    console.log(this.value);
    const date = this.value;
    const formattedDate = (moment(date)).format('YYYY-MM-DD');
    this.stationService.putMarkers(formattedDate);
  }

  ngOnInit(): void {
  }

  onValueChange(args: any): void {
    this.value = args.value;
  }
}
