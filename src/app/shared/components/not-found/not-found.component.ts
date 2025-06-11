import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/interceptor/auth.service';

@Component({
  selector: 'app-not-found',
  imports: [CommonModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  goBackToAllowedPage(): void {
    const user = this.authService.getUser();

    if (!user || !user.role) {
      this.router.navigate(['/login']);
      return;
    }

    switch (user.role) {
      case 'admin':
        this.router.navigate(['/dashboard']);
        break;
      case 'staff':
      case 'client':
      case 'doctor':
        this.router.navigate(['/chat']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
