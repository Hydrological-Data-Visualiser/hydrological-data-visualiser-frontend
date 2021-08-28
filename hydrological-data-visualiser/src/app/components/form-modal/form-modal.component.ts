import {Component, OnInit} from '@angular/core';
import {FormInputData} from '../../model/form-input-data';
import {StationsService} from '../../services/stations.service';

@Component({
  selector: 'app-form-modal',
  templateUrl: './form-modal.component.html',
  styleUrls: ['./form-modal.component.css']
})
export class FormModalComponent implements OnInit {
  public minDate: Date = new Date('05/07/2017');
  public maxDate: Date = new Date('08/27/2017');
  public value: Date = new Date();
  model = new FormInputData(50, 19);

  constructor(private stationService: StationsService) {
  }

  onSubmit(): void {
    console.log(this.value);
    const date = this.value;
    const year = date.getFullYear().toString();
    const month = this.dateComponentToString(date.getMonth());
    const day = this.dateComponentToString(date.getDay());
    this.stationService.putMarkers(year, month, day);
  }

  dateComponentToString(month: number): string {
    month = month + 1;
    if (month < 10) {
      return '0' + month.toString();
    } else {
      return month.toString();
    }
  }

  ngOnInit(): void {
  }

  onValueChange(args: any): void {
    this.value = args.value;
  }
}
