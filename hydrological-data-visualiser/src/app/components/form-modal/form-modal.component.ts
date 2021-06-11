import { Component, OnInit } from '@angular/core';
import { FormInputData } from '../../model/form-input-data';

@Component({
  selector: 'app-form-modal',
  templateUrl: './form-modal.component.html',
  styleUrls: ['./form-modal.component.css']
})
export class FormModalComponent implements OnInit {

  model = new FormInputData(50, 19);

  constructor() { }

  onSubmit() {
    console.log(this.model);
  }

  ngOnInit(): void {
  }

}
