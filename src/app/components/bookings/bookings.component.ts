import { Component, OnInit } from '@angular/core';
import { BookingsService } from './service/bookings.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import Swal from 'sweetalert2';
import { ListService } from '../list/service/list.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-bookings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    FormsModule,
    PaginationModule,
    NgbDatepickerModule
  ],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class BookingsComponent implements OnInit {

  bookings: any[] = [];
  filterText!: string;
  loading: boolean = true;

  currentPage = 1;
  itemsPerPage = 10;

  doctorList!: any;
  patientList!: any;
  selectedDoctorId: string = '';
  selectedPatientId: string = '';
  selectedStartDate: any = '';
  selectedEndDate: any = '';

  constructor(
    private service: BookingsService,
    private alertService: AlertService,
    private userService: ListService
  ) { }

  ngOnInit(): void {
    this.loadBookingsList()
    this.loadFilteringList()
  }

  loadBookingsList() {
    this.loading = true;
    this.service.getBookingsList().subscribe({
      next: (res: any) => {
        this.bookings = res.data || []
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.alertService.showAlert({
          message: 'Failed to fetch bookings. Please try again.',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    })
  }

  deleteBooking(itm: any) {
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
        this.service.deleteBooking(itm.id).subscribe({
          next: (res) => {
            this.loadBookingsList();
            Swal.fire({
              title: "Deleted!",
              text: "The booking has been deleted.",
              icon: "success"
            });
          },
          error: (err) => {
            this.alertService.showAlert({
              message: 'Failed to delete booking. Please try again.',
              type: 'error',
              autoDismiss: true,
              duration: 4000
            });
          }
        })
      }
    });
  }

  loadFilteringList() {
    forkJoin({
      doctors: this.userService.getUserTypes(1, 100, 'doctor'),
      clients: this.userService.getUserTypes(1, 100, 'client')
    }).subscribe({
      next: ({ doctors, clients }) => {
        this.doctorList = doctors.data.users;
        this.patientList = clients.data.users;
      },
      error: (err) => {
        console.error('Failed to fetch filter lists');
      }
    });
  }

  filterBookings() {
    this.loading = true;

    const formatToISOString = (dateObj: any): string | null => {
      if (!dateObj?.year || !dateObj?.month || !dateObj?.day) return null;
      const date = new Date(Date.UTC(dateObj.year, dateObj.month - 1, dateObj.day));
      return date.toISOString();
    };

    let itm = {
      patiantID: this.selectedPatientId,
      doctorID: this.selectedDoctorId,
      startDate: formatToISOString(this.selectedStartDate),
      endDate: formatToISOString(this.selectedEndDate)
    }

    this.service.getFilteredBookingList(itm).subscribe({
      next: (res: any) => {
        this.bookings = res.data || [];
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.alertService.showAlert({
          message: 'Failed to fetch filtered bookings. Please try again.',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    });
  }

  clearFilters() {
    this.selectedDoctorId = '';
    this.selectedPatientId = '';
    this.selectedStartDate = '';
    this.selectedEndDate = '';

    this.loadBookingsList();
  }

  get paginatedBookings(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredBookings.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get filteredBookings(): any[] {
    return this.filterText
      ? this.bookings.filter(itm =>
        itm.name.toLowerCase().includes(this.filterText.toLowerCase())
      )
      : this.bookings;
  }

}
