import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private BaseUrl = `${environment.apiUrl}/analytics/admin`

  constructor(
    private http: HttpClient
  ) { }

  getClient(){
    return this.http.get(`${this.BaseUrl}`)
  }
}
