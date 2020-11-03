import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Dummy} from "../models/dummy";

@Injectable({
  providedIn: 'root'
})
export class ExampleService {
  private baseUrl = '/example';

  constructor(private http: HttpClient) { }


  public getServerDate(id: number): Observable<Dummy> {
    const url = this.baseUrl;
    return this.http.get<Dummy>(url);
  }
}
