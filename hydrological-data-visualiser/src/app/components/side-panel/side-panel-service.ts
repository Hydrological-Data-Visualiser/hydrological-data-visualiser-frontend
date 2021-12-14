import {EventEmitter, Injectable, Output} from '@angular/core';
import {EmitData} from '../../model/emit-data';

@Injectable()
export class SidePanelService {

  @Output() modelEmitter: EventEmitter<string> = new EventEmitter();
  @Output() dataEmitter: EventEmitter<EmitData> = new EventEmitter();
  @Output() finishEmitter: EventEmitter<boolean> = new EventEmitter();

  changeModel(name: string): void {
    this.modelEmitter.emit(name);
  }

  emitData(data: EmitData): void {
    this.dataEmitter.emit(data);
  }

  finished(finished: boolean): void {
    this.finishEmitter.emit(finished);
  }
}
