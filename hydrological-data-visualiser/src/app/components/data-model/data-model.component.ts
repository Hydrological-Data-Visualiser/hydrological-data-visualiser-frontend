import {Component, OnInit} from '@angular/core';
import {DataModelBase} from '../../model/data-model-base';
import {DataProviderService} from '../../services/data-provider.service';
import {SidePanelService} from '../side-panel/side-panel-service';

@Component({
  selector: 'app-data-model',
  templateUrl: './data-model.component.html',
  styleUrls: ['./data-model.component.css']
})
export class DataModelComponent implements OnInit {
  selectedModel!: DataModelBase;

  constructor(private dataProvider: DataProviderService, private sidePanelService: SidePanelService) {
  }

  ngOnInit(): void {
  }

  getModels(): DataModelBase[] {
    return this.dataProvider.dataModels;
  }

  changeModelStatus(name: string): void {
    this.dataProvider.selectedModel = name;
    this.sidePanelService.changeModel(name);
    // @ts-ignore - close modal
    document.getElementById('dismissButton').click();
    this.dataProvider.getAllServices().forEach(service => service.clear());
  }
}
