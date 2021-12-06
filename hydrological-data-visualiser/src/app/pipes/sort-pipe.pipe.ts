import {Pipe, PipeTransform} from '@angular/core';
import {DataModelBase} from '../model/data-model-base';

@Pipe({
  name: 'sortPipe'
})
export class SortPipePipe implements PipeTransform {

  transform(array: Array<DataModelBase>): Array<DataModelBase> {
    array.sort((a: DataModelBase, b: DataModelBase) => {
      const c = a.name.toLowerCase();
      const d = b.name.toLowerCase();
      if (c < d) {
        return -1;
      } else if (c > d) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }


}
