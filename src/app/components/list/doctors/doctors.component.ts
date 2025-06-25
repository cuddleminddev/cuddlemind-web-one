import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormArray } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../../shared/components/alert/service/alert.service';
import { ListService } from '../service/list.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-doctors',
  imports: [CommonModule, FormsModule, PaginationModule, ReactiveFormsModule],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class DoctorsComponent implements OnInit, OnDestroy {
  @Output() onInit = new EventEmitter<void>();
  @Output() onDestroy = new EventEmitter<void>();

  userForm!: FormGroup;
  scheduleForm!: FormGroup;

  allUsers!: any;
  filterText!: string;
  loading: boolean = true;
  allroles!: any

  editingUserId: string | null = null;
  selectedDoctorId: string | null = null;

  currentPage = 1;
  itemsPerPage = 10;
  currentApiPage: number = 1;
  fetchedPages = new Set<number>();

  timeOptions: string[] = [];

  weekDays = [
    { day: 'Sunday', id: 0 },
    { day: 'Monday', id: 1 },
    { day: 'Tuesday', id: 2 },
    { day: 'Wednesday', id: 3 },
    { day: 'Thursday', id: 4 },
    { day: 'Friday', id: 5 },
    { day: 'Saturday', id: 6 }
  ];

  // timezones: string[] = Intl?.supportedValuesOf?.('timeZone')
  timezones: string[] = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Dubai',
  'Australia/Sydney',
  'Africa/Johannesburg'
];

  scheduleLoading: boolean = false;

  constructor(
    private service: ListService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: [{ value: 'doctor', disabled: true }, Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.onInit.emit();

    this.loadDoctors();
    this.generateTimeOptions();
    this.initializeScheduleForm();
  }

  ngOnDestroy(): void {
    this.onDestroy.emit();
  }

  loadDoctors(bool?: boolean) {
    this.loading = true;
    this.service.getUserTypes(1, 100, 'doctor').subscribe({
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
          message: err.error.message,
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    })
  }

  onPageChanged(page: number) {
    this.currentPage = page;

    const maxLoadedPage = this.currentApiPage * 100 / this.itemsPerPage;
    if (page > maxLoadedPage) {
      this.currentApiPage += 1;
      this.loadDoctors();
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
      });
      this.userForm.get('password')?.disable();
      this.userForm.get('role')?.setValue('doctor');

    } else {
      this.editingUserId = null;
      this.userForm.reset();
      this.userForm.get('password')?.enable();
      this.userForm.get('role')?.setValue('doctor');

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
              message: 'Doctor updated successfully',
              type: 'success',
              autoDismiss: true,
              duration: 4000
            });
            this.loadDoctors(true);
            this.userForm.reset();
            modal.close('Save click');
            this.editingUserId = null;
          },
          error: (err) => {
            this.alertService.showAlert({
              message: err.error.message,
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
              message: 'Doctor Created',
              type: 'success',
              autoDismiss: true,
              duration: 4000
            });
            this.loadDoctors(true);
            this.userForm.reset();
            modal.close('Save click');
          },
          error: (err) => {
            this.alertService.showAlert({
              message: err.error.message,
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
            this.loadDoctors(true);
            Swal.fire({
              title: "Deleted!",
              text: "Doctor has been deleted.",
              icon: "success"
            });
          },
          error: (err) => {
            this.alertService.showAlert({
              message: err.error.message,
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

  openScheduleModal(content: any, user?: any) {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur();

    this.initializeScheduleForm();
    this.selectedDoctorId = user.id;

    this.getWeeklySchedule(user.id)

    this.modalService.open(content, { scrollable: true });
  }

  initializeScheduleForm(time?: any) {
    const days = this.weekDays.map(day => this.fb.group({
      dayOfWeek: day.id,
      timeRanges: this.fb.array([])
    }));

    this.scheduleForm = this.fb.group({
      timezone: [time, Validators.required],
      weeklySchedule: this.fb.array(days)
    });
  }

  get weeklySchedule(): FormArray {
    return this.scheduleForm.get('weeklySchedule') as FormArray;
  }

  getTimeRanges(dayIndex: number): FormArray {
    return this.weeklySchedule.at(dayIndex).get('timeRanges') as FormArray;
  }

  addTimeRange(dayIndex: number) {
    const timeRangeGroup = this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    }, { validators: this.validateTimeRange });

    this.getTimeRanges(dayIndex).push(timeRangeGroup);
  }

  removeTimeRange(dayIndex: number, rangeIndex: number) {
    this.getTimeRanges(dayIndex).removeAt(rangeIndex);
  }

  validateTimeRange(group: FormGroup) {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;

    if (!start && !end) return null;

    if (!start || !end) return { incompleteRange: true };

    if (start >= end) return { invalidRange: true };

    return null;
  }


  saveSchedule(modal: any) {
    this.scheduleForm.markAllAsTouched();
    if (!this.scheduleForm.valid || !this.selectedDoctorId) return;

    const payload = {
      doctorId: this.selectedDoctorId,
      timezone: this.scheduleForm.getRawValue().timezone,
      weeklySchedule: this.scheduleForm.getRawValue().weeklySchedule
    };

    this.service.setDoctorWeeklySchedule(payload).subscribe({
      next: (res) => {
        this.alertService.showAlert({
          message: 'Schedule successfully set.',
          type: 'success',
          autoDismiss: true,
          duration: 4000
        });
      },
      error: (err) => {
        this.alertService.showAlert({
          message: err.error.message,
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    })
    modal.close();
  }

  generateTimeOptions() {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const hh = hour.toString().padStart(2, '0');
        const mm = min.toString().padStart(2, '0');
        times.push(`${hh}:${mm}`);
      }
    }
    this.timeOptions = times;
  }

  close() {
    this.userForm.reset();
    this.scheduleForm?.reset();
    this.editingUserId = null;
    this.modalService.dismissAll();
  }

  getWeeklySchedule(id: string) {
     this.scheduleLoading = true;

    this.service.getDoctorWeeklySchedule(id).subscribe({
      next: (res: any) => {
        const schedule = res.weeklySchedule || [];
        const time = res.timezone || ''

        // Reset form before applying data
        this.initializeScheduleForm(time);

        schedule.forEach((dayData: any) => {
          const dayIndex = this.weekDays.findIndex(d => d.id === dayData.dayOfWeek);
          if (dayIndex !== -1) {
            const timeRangesArray = this.getTimeRanges(dayIndex);
            dayData.timeRanges.forEach((range: any) => {
              const timeRangeGroup = this.fb.group({
                startTime: [range.startTime, Validators.required],
                endTime: [range.endTime, Validators.required]
              }, { validators: this.validateTimeRange });

              timeRangesArray.push(timeRangeGroup);
            });
          }
        });
        this.scheduleLoading = false;
      },
      error: (err) => {
        this.scheduleLoading = false;
        this.alertService.showAlert({
          message: err.error.message,
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    });
  }

}
