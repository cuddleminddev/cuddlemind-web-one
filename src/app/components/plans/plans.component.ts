import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Plan } from './models/plan';
import { PlanService } from './service/plans.service';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-plans',
  imports: [CommonModule, ReactiveFormsModule, NgbTooltipModule, FormsModule, FilterPipe, PaginationModule],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css'
})
export class PlansComponent implements OnInit {
  plans: Plan[] = [];
  filterText!: string;
  loading: boolean = true;

  planForm: FormGroup;
  editingPlanId: string | null = null;

  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private service: PlanService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private fb: FormBuilder,
  ) {
    this.planForm = this.fb.group({
      planName: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', [Validators.required, this.positiveIntegerValidator]],
      validity: ['', [Validators.required, this.positiveIntegerValidator]],
      bookings: ['', [Validators.required, this.positiveIntegerValidator]],
      // description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadPlanList()
  }

  loadPlanList() {
    this.loading = true;
    this.service.getPlansList().subscribe({
      next: (res) => {
        this.plans = res.data || []
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.alertService.showAlert({
          message: 'Failed to fetch plans. Please try again.',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    })
  }


  openModal(content: any, plan?: Plan) {
    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    if (plan) {
      this.editingPlanId = plan.id;
      this.planForm.patchValue({
        planName: plan.name,
        amount: plan.amount,
        validity: plan.timePeriod,
        bookings: plan.bookingFrequency,
      });
    } else {
      this.editingPlanId = null;
      this.planForm.reset();
    }

    this.modalService.open(content);
  }

  onSave(modal: any) {
    if (this.planForm.valid) {
      const formPlan = this.planForm.value;
      const planData = {
        name: formPlan.planName,
        bookingFrequency: +formPlan.bookings,
        timePeriod: +formPlan.validity,
        amount: +formPlan.amount
      };

      if (this.editingPlanId) {
        this.service.updatePlan(this.editingPlanId, planData).subscribe({
          next: (res) => {
            this.alertService.showAlert({
              message: 'Plan updated successfully',
              type: 'success',
              autoDismiss: true,
              duration: 4000
            });
            this.loadPlanList();
            this.planForm.reset();
            modal.close('Save click');
            this.editingPlanId = null;
          },
          error: () => {
            this.alertService.showAlert({
              message: 'Failed to update plan. Please try again.',
              type: 'error',
              autoDismiss: true,
              duration: 4000
            });
          }
        });
      } else {
        this.service.createPlan(planData).subscribe({
          next: () => {
            this.alertService.showAlert({
              message: 'Plan Created',
              type: 'success',
              autoDismiss: true,
              duration: 4000
            });
            this.loadPlanList();
            this.planForm.reset();
            modal.close('Save click');
          },
          error: () => {
            this.alertService.showAlert({
              message: 'Failed to create plan. Please try again.',
              type: 'error',
              autoDismiss: true,
              duration: 4000
            });
          }
        });
      }
    } else {
      this.planForm.markAllAsTouched();
    }
  }

  deletePlan(id: string, plan: Plan) {
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
        this.service.deletePlan(id, plan).subscribe({
          next: (res) => {
            this.loadPlanList();
            Swal.fire({
              title: "Deleted!",
              text: "Your plan has been deleted.",
              icon: "success"
            });
          },
          error: (err) => {
            this.alertService.showAlert({
              message: 'Failed to delete plan. Please try again.',
              type: 'error',
              autoDismiss: true,
              duration: 4000
            });
          }
        })
      }
    });
  }

  get paginatedPlans(): Plan[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPlans.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get filteredPlans(): Plan[] {
    return this.filterText
      ? this.plans.filter(plan =>
        plan.name.toLowerCase().includes(this.filterText.toLowerCase())
      )
      : this.plans;
  }

  positiveIntegerValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    if (val === null || val === '' || val === undefined) {
      return null;
    }

    const numberVal = +val;
    if (isNaN(numberVal) || numberVal <= 0 || !Number.isInteger(numberVal)) {
      return { positiveInteger: true };
    }

    return null;
  }

  close() {
    this.planForm.reset()
    this.editingPlanId = null;
    this.modalService.dismissAll()
  }

}
