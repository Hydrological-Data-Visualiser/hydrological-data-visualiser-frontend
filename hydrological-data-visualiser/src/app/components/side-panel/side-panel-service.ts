import {EventEmitter, Injectable, Output} from '@angular/core';
import {EmitData} from '../../model/emit-data';

@Injectable()
export class SidePanelService {

  @Output() modelEmitter: EventEmitter<string> = new EventEmitter();
  @Output() dataEmitter: EventEmitter<EmitData> = new EventEmitter();

  changeModel(name: string): void {
    this.modelEmitter.emit(name);
  }

  emitData(data: EmitData): void {
    this.dataEmitter.emit(data);
  }
}
