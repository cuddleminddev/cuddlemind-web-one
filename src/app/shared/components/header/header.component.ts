import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/interceptor/auth.service';
import { HeaderService } from './service/header.service';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../alert/service/alert.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, NgbPopoverModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  currentRoute: string = '';
  currentLabel: string = '';
  user!: any;
  role!: any;
  editForm!: FormGroup;
  currentUserID!: string;

  private routeLabels: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/list': 'Users',
    '/bookings': 'Bookings',
    '/plans': 'Cuddle Plans',
    '/chat': 'Chat'
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private service: HeaderService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private alertService: AlertService
  ) {
    this.currentRoute = this.router.url;

    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setCurrentLabel(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    this.user = userString ? JSON.parse(userString) : null;
    this.role = this.user.role;

    this.editForm = this.fb.group({
      name: [this.user?.name || ''],
      email: [this.user?.email || ''],
      phone: [this.user?.phone || '']
    });
  }

  setCurrentLabel(url: string) {
    const matchedPath = Object.keys(this.routeLabels).find(path => url.startsWith(path));
    this.currentLabel = matchedPath ? this.routeLabels[matchedPath] : '';
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout() {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        this.navigateTo('/login')
      }
    });
  }

  openEditModal(popover: any, content: any) {
    popover.close();

    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    this.service.getCurrentUserProfile().subscribe((res: any) => {
      const data = res.data;
      this.currentUserID = res.data.id;
      this.editForm.patchValue({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || ''
      });

      this.modalService.open(content, { centered: true });
    });
  }

  saveProfile() {
    if (this.editForm.valid) {
      const updated = {
        ...this.editForm.value,
        // id: this.currentUserID
      };
      this.service.saveCurrentUserProfile(updated).subscribe({
        next: (res: any) => {
          this.alertService.showAlert({
            message: res.message,
            type: 'success',
            autoDismiss: true,
            duration: 4000
          });
          this.user = res.data;
        },
        error: (err) => {
          this.alertService.showAlert({
            message: err.error.message,
            type: 'success',
            autoDismiss: true,
            duration: 4000
          });
        }
      })
    }
  }
}
