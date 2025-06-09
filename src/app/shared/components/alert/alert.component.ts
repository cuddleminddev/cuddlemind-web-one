import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Alert, AlertService } from './service/alert.service';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent implements OnInit{
  alert: Alert | null = null;

  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
    this.alertService.alert$.subscribe(alert => {
      this.alert = alert;

      if (alert.autoDismiss) {
        setTimeout(() => this.close(), alert.duration || 3000);
      }
    });
  }

  close(): void {
    this.alert = null;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      default:
        return '';
    }
  }
}
