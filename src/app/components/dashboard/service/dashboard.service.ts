import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private BaseUrl = `${environment.apiUrl}/analytics/admin`
  private ChartUrl = `${environment.apiUrl}/analytics/charts`

  constructor(
    private http: HttpClient
  ) { }

  getClient() {
    return this.http.get(`${this.BaseUrl}`)
  }

  getPieChart(itm: any) {
    return this.http.get(`${this.ChartUrl}/pie?startDate=${itm.startDate}&endDate=${itm.endDate}`)
  }

  getLineChart(itm: any) {
    return this.http.get(`${this.ChartUrl}/line?startDate=${itm.startDate}&endDate=${itm.endDate}`)
  }
}
