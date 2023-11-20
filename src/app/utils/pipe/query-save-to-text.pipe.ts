import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'querySaveToText'
})
export class QuerySaveToTextPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): string {

    const modifiedJson = JSON.stringify(value, null, 2)
      .replace(/"idquerysave": \d+,[\s\n]+/g, '') // Elimina toda la línea idquerysave con su valor
      .replace(/"([^"]+)": null,[\s\n]+/g, '')   // Elimina líneas con valores null
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/},/g, '},\n');

    return modifiedJson;
  }

}
