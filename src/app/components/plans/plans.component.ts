import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Plan } from './models/plan';
import { PlanService } from './service/plans.service';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import { FilterPipe } from '../../shared/pipes/filter.pipe';

@Component({
  selector: 'app-plans',
  imports: [CommonModule, ReactiveFormsModule, NgbTooltipModule, FormsModule, FilterPipe],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css'
})
export class PlansComponent implements OnInit {
  plans: Plan[] = [];
  filterText!: string;
  loading: boolean = true;

  constructor(
    private service: PlanService,
    private alertService: AlertService
  ) { }

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

}
