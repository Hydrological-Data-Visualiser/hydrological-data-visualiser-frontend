import {Pipe, PipeTransform} from '@angular/core';
import {DataModelBase} from '../model/data-model-base';

@Pipe({
  name: 'sortPipe'
})
export class SortPipePipe implements PipeTransform {

  transform(array: Array<DataModelBase>): Array<DataModelBase> {
    array.sort((a: DataModelBase, b: DataModelBase) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }


}
