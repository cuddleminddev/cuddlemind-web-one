import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private baseUrl = `${environment.apiUrl}/bookings`

  constructor(
    private http: HttpClient
  ) { }

  getBookingsList(){
    return this.http.get(`${this.baseUrl}`)
  }
}
