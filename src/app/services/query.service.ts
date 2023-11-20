import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs';
import { GlobalConstants } from '../utils/constants/global.constants';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  constructor(
    private http: HttpClient
  ) { }

  getAllQuery() {

  }

  filter(name: any, createby: any, pag: any, sizePag: any): Observable<any> {

    const URL = GlobalConstants.URL_ENDPOINT + GlobalConstants.URL_QUERY_FILTER;

    let params = '';

    if (name) {
      if (params.length > 0) {
        params = params.concat('&name=').concat(name);
      } else {
        params = params.concat('?name=').concat(name);
      }
    }

    if (createby) {
      if (params.length > 0) {
        params = params.concat('&createby=').concat(createby);
      } else {
        params = params.concat('?createby=').concat(createby);
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

  saveQuery(query: any):Observable<any>{

    const URL =  GlobalConstants.URL_ENDPOINT + GlobalConstants.URL_QUERY;

    return this.http.post<any>(URL, query);
  }

  updateQuery(query: any):Observable<any>{

    const URL =  GlobalConstants.URL_ENDPOINT + GlobalConstants.URL_QUERY;

    return this.http.put<any>(URL, query);
  }

  deleteQuery(query: any): Observable<any> {
    const URL =  GlobalConstants.URL_ENDPOINT + GlobalConstants.URL_QUERY;
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: query,
    };

    return this.http.delete<any>(URL, options);
  }
}
