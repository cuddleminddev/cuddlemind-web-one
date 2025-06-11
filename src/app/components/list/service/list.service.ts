import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private baseUrl: string = `${environment.apiUrl}/users`

  constructor(
    private http: HttpClient
  ) { }

  getAllUsers(page: number, limit: number, role: string): Observable<any> {
    return this.http.get(`${this.baseUrl}?page=${page}&limit=${limit}&role`)
  }

  getUserTypes(page: number, limit: number, role: string): Observable<any> {
    return this.http.get(`${this.baseUrl}?page=${page}&limit=${limit}&role=${role}`)
  }

  getRoles() {
    return this.http.get(`${this.baseUrl}/roles`)
  }

  createUser(itm: any) {
    return this.http.post(`${this.baseUrl}`, itm)
  }

  updateUser(id: string, user: any) {
    return this.http.patch(`${this.baseUrl}/${id}`, user)
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`)
  }

  getCurretnUser() {
    return this.http.get(`${this.baseUrl}/profile`)
  }

  updateCurrentUser(itm: any) {
    return this.http.patch(`${this.baseUrl}/profile`, itm)
  }

}
