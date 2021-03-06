import {Pipe, PipeTransform} from '@angular/core';
import {Station} from '../model/station';

@Pipe({
  name: 'searchFilter'
})
export class SearchFilterPipe implements PipeTransform {

  transform(value: Station[], args: string): any {
    if (!value) {
      return null;
    }
    if (!args) {
      return [];
    }

    args = args.toLowerCase();

    return value.filter((data) => {
      // return (data.name).toLowerCase().includes(args);
      return (data.name).toLowerCase().startsWith(args);
    });
  }
}
