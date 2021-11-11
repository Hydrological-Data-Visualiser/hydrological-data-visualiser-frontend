import {Component, OnInit} from '@angular/core';
import {DataModelBase} from '../../model/data-model-base';
import {DataProviderService} from '../../services/data-provider.service';

@Component({
  selector: 'app-data-model',
  templateUrl: './data-model.component.html',
  styleUrls: ['./data-model.component.css']
})
export class DataModelComponent implements OnInit {
  selectedModel!: DataModelBase;

  constructor(private dataProvider: DataProviderService) {
  }

  ngOnInit(): void {
  }

  getModels(): DataModelBase[] {
    return this.dataProvider.dataModels;
  }

  changeModelStatus(name: string): void {
    this.dataProvider.selectedModel = name;
    // @ts-ignore - close modal
    document.getElementById('dismissButton').click();
    // TODO: scroll to data

    this.dataProvider.getAllServices().forEach(service => service.clear());
  }
}
