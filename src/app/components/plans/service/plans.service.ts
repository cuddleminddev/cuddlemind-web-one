import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan } from '../models/plan';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private baseUrl = `${environment.apiUrl}/plans`;

  constructor(
    private http: HttpClient
  ) { }

  createPlan(itm: any) {
    return this.http.post(`${this.baseUrl}`, itm)
  }

  getPlansList(): Observable<any> {
    return this.http.get(this.baseUrl)
  }

  updatePlan(id: string, plan: any) {
    return this.http.patch(`${this.baseUrl}/${id}`, plan)
  }

  deletePlan(id: string, plan: Plan) {
    return this.http.patch(`${this.baseUrl}/${id}/deactivate`, plan)
  }
}
