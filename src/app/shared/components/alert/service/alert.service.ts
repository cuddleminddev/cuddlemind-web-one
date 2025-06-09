import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Alert {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  dismissible?: boolean;
  autoDismiss?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new Subject<Alert>();
  alert$ = this.alertSubject.asObservable();

  constructor() { }

  showAlert(alert: Alert) {
    this.alertSubject.next(alert);
  }
}
