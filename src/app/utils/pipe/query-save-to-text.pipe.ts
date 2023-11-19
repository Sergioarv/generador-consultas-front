import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'querySaveToText'
})
export class QuerySaveToTextPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): string {

    const jsonString = JSON.stringify(value);
    const resultArray = jsonString.split(',');

    console.log(resultArray);

    return jsonString;
  }

}
