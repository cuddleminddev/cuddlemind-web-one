import { Injectable } from '@angular/core';
import { environment } from '../../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private BaseUrl = `${environment.apiUrl}/users`

  constructor(private http: HttpClient) { }

  getCurrentUserProfile(){
    return this.http.get(`${this.BaseUrl}/profile`)
  }

  saveCurrentUserProfile(itm:any){
    return this.http.patch(`${this.BaseUrl}/profile`, itm)
  }
}
