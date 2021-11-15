import {EventEmitter, Injectable, Output} from '@angular/core';

@Injectable()
export class SidePanelService {

  @Output() modelEmitter: EventEmitter<string> = new EventEmitter();

  changeModel(name: string): void {
    this.modelEmitter.emit(name);
  }
}
