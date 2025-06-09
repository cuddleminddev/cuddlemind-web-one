import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/interceptor/auth.service';
import { AlertService } from '../../shared/components/alert/service/alert.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.alertService.showAlert({
        message: 'Please fill in all required fields correctly.',
        type: 'error',
        autoDismiss: true,
        duration: 4000
      });
      return;
    }

    if (this.loginForm.valid) {
      this.loading = true;

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.alertService.showAlert({
            message: 'Login successful!',
            type: 'success',
            autoDismiss: true,
            duration: 4000
          });
          this.loading = false;
          if (response.status) {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.loading = false;
          this.alertService.showAlert({
            message: 'Login failed. Please try again.',
            type: 'error',
            autoDismiss: true,
            duration: 4000
          });
          console.error('Login error:', err);
        }
      });
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
    }
  }
}
