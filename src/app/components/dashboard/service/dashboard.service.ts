import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private BaseUrl = `${environment.apiUrl}/analytics/admin`
  private ChartUrl = `${environment.apiUrl}/analytics/charts`

  constructor(
    private http: HttpClient
  ) { }

  getClient(dates: { startDate: string; endDate: string }) {
    const params = this.buildQueryParams(dates);
    return this.http.get(this.BaseUrl, { params });
  }

  getPieChart(dates: { startDate: string; endDate: string }) {
    const params = this.buildQueryParams(dates);
    return this.http.get(`${this.ChartUrl}/pie`, { params });
  }

  getLineChart(dates: { startDate: string; endDate: string }) {
    const params = this.buildQueryParams(dates);
    return this.http.get(`${this.ChartUrl}/line`, { params });
  }

  private buildQueryParams(dates: { startDate: string; endDate: string }) {
    return new HttpParams()
      .set('startDate', dates.startDate)
      .set('endDate', dates.endDate);
  }
}
