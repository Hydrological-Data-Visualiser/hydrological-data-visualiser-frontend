import {Component, OnInit} from '@angular/core';
import * as moment from 'moment';
import {FormInputData} from '../../model/form-input-data';
import {DataProviderService} from '../../services/data-provider.service';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.css']
})
export class SidePanelComponent implements OnInit {
  // details attributes
  status = true;
  clicked = false;
  long: number | undefined;
  lat: number | undefined;
  name: string | undefined;
  // form attributes
  public minDate: Date = new Date('05/07/2017');
  public maxDate: Date = new Date('08/27/2017');
  public value: Date = new Date();
  model = new FormInputData(50, 19);

  constructor(private dataProvider: DataProviderService) {
  }

  ngOnInit(): void {
    this.dataProvider.getStationsService().clickedMarker$.subscribe(a => {
      this.lat = a?.latitude;
      this.long = a?.longitude;
      this.name = a?.name;
      if (a?.latitude && a.name && a.longitude) {
        this.clicked = true;
      }
    });
  }

  setLong(newItem: number): void {
    if (newItem) {
      this.long = Number(newItem.toFixed(6));
    }
  }

  setLat(newItem: number): void {
    if (newItem) {
      this.lat = Number(newItem.toFixed(6));
    }
  }

  setClicked(newItem: boolean): void {
    this.clicked = newItem;
    this.name = undefined;
  }

  clickEvent(): void {
    this.status = !this.status;
  }
//  form methods below
  onSubmit(): void {
    console.log(this.value);
    const date = this.value;
    const formattedDate = (moment(date)).format('YYYY-MM-DD');
    this.dataProvider.getStationsService().putMarkers(formattedDate, this.dataProvider.getPrecipitationService());
  }

  onValueChange(args: any): void {
    this.value = args.value;
  }
}
