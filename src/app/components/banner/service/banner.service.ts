import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private BaseUrl = `${environment.apiUrl}/banners`

  constructor(
    private http: HttpClient
  ) { }

  getBannerList() {
    return this.http.get(`${this.BaseUrl}`)
  }

  addBanner(data: FormData) {
    return this.http.post(`${this.BaseUrl}`, data);
  }

  deleteBanner(id: string) {
    return this.http.delete(`${this.BaseUrl}/${id}`)
  }
}
