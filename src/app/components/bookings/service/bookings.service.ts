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
    const params: string[] = [];

    if (itm.patiantID) {
      params.push(`patientId=${itm.patiantID}`);
    }
    if (itm.doctorID) {
      params.push(`doctorId=${itm.doctorID}`);
    }
    if (itm.startDate) {
      params.push(`fromDate=${itm.startDate}`);
    }
    if (itm.endDate) {
      params.push(`toDate=${itm.endDate}`);
    }

    const queryString = params.length ? `?${params.join('&')}` : '';
    return this.http.get(`${this.baseUrl}${queryString}`);
  }
}
