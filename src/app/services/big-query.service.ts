import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { GlobalConstants } from '../utils/constants/global.constants';

@Injectable({
  providedIn: 'root'
})
export class BigQueryService {

  constructor(
    private http: HttpClient
  ) { }

  runQuery(gameNumber: any, dayNight: any, duration: any, status: any, year: any, conditiaonal: any, pag: any, sizePag: any): Observable<any> {

    const URL = GlobalConstants.URL_ENDPOINT + GlobalConstants.URL_BIGQUERY;

    let params = '';

    if (gameNumber) {
      if (params.length > 0) {
        params = params.concat('&gameNumber=').concat(gameNumber);
      } else {
        params = params.concat('?gameNumber=').concat(gameNumber);
      }
    }

    if (dayNight) {
      if (params.length > 0) {
        params = params.concat('&dayNight=').concat(dayNight);
      } else {
        params = params.concat('?dayNight=').concat(dayNight);
      }
    }

    if (duration) {
      if (params.length > 0) {
        params = params.concat('&duration=').concat(duration);
      } else {
        params = params.concat('?duration=').concat(duration);
      }
    }

    if (status) {
      if (params.length > 0) {
        params = params.concat('&status=').concat(status);
      } else {
        params = params.concat('?status=').concat(status);
      }
    }

    if (year) {
      if (params.length > 0) {
        params = params.concat('&year=').concat(year);
      } else {
        params = params.concat('?year=').concat(year);
      }
    }

    if (conditiaonal) {
      if (params.length > 0) {
        params = params.concat('&conditiaonal=').concat(conditiaonal);
      } else {
        params = params.concat('?conditiaonal=').concat(conditiaonal);
      }
    }

    if (params.length > 0) {
      params = params.concat('&pag=').concat(pag);
      params = params.concat('&sizePag=').concat(sizePag);
    } else {
      params = params.concat('?pag=').concat(pag);
      params = params.concat('&sizePag=').concat(sizePag);
    }

    return this.http.get<any>(URL + params);
  }
}
