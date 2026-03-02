import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private apiUrl = `${environment.apiUrl}/contact-us`;

  constructor(private http: HttpClient) {}

  getContactReports() {
    return this.http.get(this.apiUrl);
  }

  deleteContact(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}