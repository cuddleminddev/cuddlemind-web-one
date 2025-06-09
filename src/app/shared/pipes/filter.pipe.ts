import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], searchText: string, ...fields: string[]): any[] {
    console.log(items, searchText, fields);
    
    if (!items) return [];
    if (!searchText) return items;

    const lowerSearch = searchText.toLowerCase();

    return items.filter(item =>
      fields.some(field =>
        item[field]?.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }

}
