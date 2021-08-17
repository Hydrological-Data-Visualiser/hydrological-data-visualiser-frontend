import {Component, OnInit} from '@angular/core';
import {FormInputData} from '../../model/form-input-data';

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

  constructor() {
  }

  onSubmit(): void {
    console.log(this.model, this.value);
  }

  ngOnInit(): void {
  }

}
