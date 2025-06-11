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

  getBookingsList() {
    return this.http.get(`${this.baseUrl}`)
  }

  deleteBooking(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`)
  }

  getFilteredBookingList(itm: any) {
    const patID = itm.patiantID;
    const docID = itm.doctorID;

    return this.http.get(`${this.baseUrl}?patientId=${patID}&doctorId=${docID}`)
  }
}
