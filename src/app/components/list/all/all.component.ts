import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ListService } from '../service/list.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../../shared/components/alert/service/alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-all',
  imports: [CommonModule, FormsModule, PaginationModule, ReactiveFormsModule],
  templateUrl: './all.component.html',
  styleUrl: './all.component.css'
})
export class AllComponent implements OnInit, OnDestroy {

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
  currentApiPage: number = 1;
  fetchedPages = new Set<number>();

  constructor(
    private service: ListService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.onInit.emit();
    this.loadAllUsers()
    this.loadRoles()

    this.userForm.get('role')?.valueChanges.subscribe((roleValue) => {
      const passwordControl = this.userForm.get('password');

      if (roleValue === 'client') {
        passwordControl?.clearValidators();
        passwordControl?.setValidators([]);
      } else if (!this.editingUserId) {
        // Add validators only if we're creating a new user
        passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
      }

      passwordControl?.updateValueAndValidity();
    });
  }

  ngOnDestroy() {
    this.onDestroy.emit();
  }

  loadAllUsers(bool?: boolean) {
    this.loading = true;
    this.service.getAllUsers(this.currentApiPage, 100, 'role').subscribe({
      next: (res) => {
        const newUsers = res.data.users || [];
        if (bool === true) {
          this.allUsers = []
        }
        this.allUsers = [...(this.allUsers || []), ...newUsers];
        this.fetchedPages.add(this.currentApiPage);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.alertService.showAlert({
          message: 'Failed to fetch users. Please try again.',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    })
  }

  loadRoles() {
    this.service.getRoles().subscribe({
      next: (res: any) => {
        this.allroles = res.data || []
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  onPageChanged(page: number) {
    this.currentPage = page;

    const maxLoadedPage = this.currentApiPage * 100 / this.itemsPerPage;
    if (page > maxLoadedPage) {
      this.currentApiPage += 1;
      this.loadAllUsers();
    }
  }

  openModal(content: any, user?: any) {
    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    if (user) {
      this.editingUserId = user.id;
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
        role: user.role.name,
      });
      this.userForm.get('password')?.disable();
    } else {
      this.editingUserId = null;
      this.userForm.reset();
      this.userForm.get('password')?.enable();
    }

    this.modalService.open(content);
  }

  shouldShowPasswordField(): boolean {
    const role = this.userForm.get('role')?.value;
    return role !== 'client' && !this.editingUserId;
  }

  onSave(modal: any): void {
    if (this.userForm.valid) {
      const formUser = this.userForm.getRawValue();
      const userData: any = {
        name: formUser.name,
        email: formUser.email,
        role: formUser.role,
      };

      if (!this.editingUserId && formUser.password) {
        userData.password = formUser.password;
      }

      if (userData.role === 'client') {
        userData.password = '';
      }

      if (this.editingUserId) {
        this.service.updateUser(this.editingUserId, userData).subscribe({
          next: (res) => {
            this.alertService.showAlert({
              message: 'User updated successfully',
              type: 'success',
              autoDismiss: true,
              duration: 4000
            });
            this.loadAllUsers(true);
            this.userForm.reset();
            modal.close('Save click');
            this.editingUserId = null;
          },
          error: () => {
            this.alertService.showAlert({
              message: 'Failed to update user. Please try again.',
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
              message: 'User Created',
              type: 'success',
              autoDismiss: true,
              duration: 4000
            });
            this.loadAllUsers(true);
            this.userForm.reset();
            modal.close('Save click');
          },
          error: () => {
            this.alertService.showAlert({
              message: 'Failed to create user. Please try again.',
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
            this.loadAllUsers(true);
            Swal.fire({
              title: "Deleted!",
              text: "User has been deleted.",
              icon: "success"
            });
          },
          error: (err) => {
            this.alertService.showAlert({
              message: 'Failed to delete user. Please try again.',
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
