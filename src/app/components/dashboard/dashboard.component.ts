import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService } from './service/dashboard.service';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import { NgbCalendar, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NgbDatepickerModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  @ViewChild('doughnutCanvas') private doughnutCanvas!: ElementRef;
  @ViewChild('lineCanvas') private barCanvas!: ElementRef;

  doughNutChart!: Chart;
  lineChart!: Chart;
  datas!: any;
  loading: boolean = true;
  pieChartLoading: boolean = true;
  lineChartLoading: boolean = true;
  pieChartNoData = false;
  lineChartNoData = false;

  startDate!: NgbDateStruct;
  endDate!: NgbDateStruct;

  constructor(
    private service: DashboardService,
    private alertService: AlertService,
    private calendar: NgbCalendar
  ) { }

  ngOnInit(): void {
    const today = this.calendar.getToday();
    const lastMonth = this.calendar.getPrev(today, 'm', 1);
    this.startDate = lastMonth;
    this.endDate = today;

    this.onDateChange();
  }

  // ngAfterViewInit(): void {
  //   this.loadPieChart();
  //   this.loadLineChart();
  // }

  onDateChange() {
    this.loadDashboardStats();
    this.loadPieChart();
    this.loadLineChart();
  }

  private formatDate(date: NgbDateStruct): string {
    const { year, month, day } = date;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  private getDateRange() {
    return {
      startDate: this.formatDate(this.startDate),
      endDate: this.formatDate(this.endDate)
    };
  }

  private loadDashboardStats() {
    this.loading = true;
    const { startDate, endDate } = this.getDateRange();

    this.service.getClient({ startDate, endDate }).subscribe({
      next: (res: any) => {
        this.datas = res.data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        this.alertService.showAlert({
          message: 'Something went wrong. Please try again.',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    });
  }

  private loadPieChart() {
    this.pieChartLoading = true;
    const { startDate, endDate } = this.getDateRange();

    this.service.getPieChart({ startDate, endDate }).subscribe({
      next: (res: any) => {
        const { labels, values } = res.data;
        const total = values.reduce((a: number, b: number) => a + b, 0);
        this.pieChartNoData = total === 0;

        if (!this.pieChartNoData && this.doughnutCanvas) {
          const colors = ['#FF6384', '#36A2EB', '#FFCE56'];
          this.doughNutChart = this.createDoughnutChart(
            this.doughnutCanvas.nativeElement,
            labels,
            values,
            colors
          );
        }

        this.pieChartLoading = false;
      },
      error: () => {
        this.pieChartLoading = false;
        this.pieChartNoData = true;
        this.alertService.showAlert({
          message: 'Failed to load pie chart data.',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    });
  }

  private loadLineChart() {
    this.lineChartLoading = true;
    const { startDate, endDate } = this.getDateRange();

    this.service.getLineChart({ startDate, endDate }).subscribe({
      next: (res: any) => {
        const { labels, datasets } = res.data;
        const total = datasets.reduce((sum: number, ds: any) => sum + ds.data.reduce((a: number, b: number) => a + b, 0), 0);
        this.lineChartNoData = total === 0;

        if (!this.lineChartNoData && this.barCanvas) {
          const processedDatasets = datasets.map((dataset: any, index: number) => ({
            label: dataset.label,
            data: dataset.data,
            backgroundColor: this.getLineColor(index),
            borderColor: this.getLineColor(index),
            fill: false,
            tension: 0.3
          }));

          this.lineChart = this.createLineChart(
            this.barCanvas.nativeElement,
            labels,
            processedDatasets
          );
        }

        this.lineChartLoading = false;
      },
      error: () => {
        this.lineChartLoading = false;
        this.lineChartNoData = true;
        this.alertService.showAlert({
          message: 'Failed to load line chart data.',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    });
  }


  private createDoughnutChart(ctx: HTMLCanvasElement, labels: string[], data: number[], colors: string[]): Chart<'doughnut'> {
    if (this.doughNutChart) {
      this.doughNutChart.destroy();
    }

    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors
          }
        ]
      },
      options: {
        responsive: true,
        cutout: '60%',
        plugins: {
          legend: { display: true }
        }
      }
    });
  }

  private createLineChart(ctx: HTMLCanvasElement, labels: string[], datasets: any[]): Chart<'line'> {
    if (this.lineChart) {
      this.lineChart.destroy();
    }

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        }
      }
    });
  }

  private getLineColor(index: number): string {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    return colors[index % colors.length];
  }

}
