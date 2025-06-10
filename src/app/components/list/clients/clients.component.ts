import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AlertService } from '../../../shared/components/alert/service/alert.service';
import { ListService } from '../service/list.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clients',
  imports: [CommonModule, FormsModule, PaginationModule, ReactiveFormsModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent {
  @Output() onInit = new EventEmitter<void>();
  @Output() onDestroy = new EventEmitter<void>();

  userForm!: FormGroup;
  allUsers!: any;
  filterText!: string;
  loading: boolean = true;
  allroles!: any

  editingUserId: string | null = null;

  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private service: ListService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: [{ value: 'client', disabled: true }, Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.onInit.emit();
    this.loadclients()
  }

  ngOnDestroy(): void {
    this.onDestroy.emit();
  }

  loadclients() {
    this.loading = true;
    this.service.getUserTypes(1, 100, 'client').subscribe({
      next: (res) => {
        this.allUsers = res.data.users
        this.loading = false;
      },
      error: (err) => {
        this.alertService.showAlert({
          message: 'Failed to fetch client. Please try again.',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    })
  }

  openModal(content: any, user?: any) {
    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    if (user) {
      this.editingUserId = user.id;
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
      });
      this.userForm.get('password')?.disable();
      this.userForm.get('role')?.setValue('client');

    } else {
      this.editingUserId = null;
      this.userForm.reset();
      this.userForm.get('password')?.enable();
      this.userForm.get('role')?.setValue('client');

    }

    this.modalService.open(content);
  }

  onSave(modal: any): void {
    if (this.userForm.valid) {
      const formUser = this.userForm.getRawValue();;
      const userData: any = {
        name: formUser.name,
        email: formUser.email,
        role: formUser.role,
      };

      if (!this.editingUserId) {
        userData.password = formUser.password;
      }

      if (this.editingUserId) {
        this.service.updateUser(this.editingUserId, userData).subscribe({
          next: (res) => {
            this.alertService.showAlert({
              message: 'Client updated successfully',
              type: 'success',
              autoDismiss: true,
              duration: 4000
            });
            this.loadclients();
            this.userForm.reset();
            modal.close('Save click');
            this.editingUserId = null;
          },
          error: () => {
            this.alertService.showAlert({
              message: 'Failed to update client. Please try again.',
              type: 'error',
              autoDismiss: true,
              duration: 4000
            });
          }
        });
      } else {
        this.service.createUser(userData).subscribe({
          next: () => {
            this.alertService.showAlert({
              message: 'Client Created',
              type: 'success',
              autoDismiss: true,
              duration: 4000
            });
            this.loadclients();
            this.userForm.reset();
            modal.close('Save click');
          },
          error: () => {
            this.alertService.showAlert({
              message: 'Failed to create client. Please try again.',
              type: 'error',
              autoDismiss: true,
              duration: 4000
            });
          }
        });
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  deleteUser(id: string) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteUser(id).subscribe({
          next: (res) => {
            this.loadclients();
            Swal.fire({
              title: "Deleted!",
              text: "Client has been deleted.",
              icon: "success"
            });
          },
          error: (err) => {
            this.alertService.showAlert({
              message: 'Failed to delete Client. Please try again.',
              type: 'error',
              autoDismiss: true,
              duration: 4000
            });
          }
        })
      }
    });
  }

  get paginatedUsers(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get filteredUsers(): any[] {
    return this.filterText
      ? this.allUsers.filter((user: any) =>
        user.name.toLowerCase().includes(this.filterText.toLowerCase())
      )
      : this.allUsers;
  }

  close() {
    this.userForm.reset()
    this.editingUserId = null;
    this.modalService.dismissAll()
  }

}
