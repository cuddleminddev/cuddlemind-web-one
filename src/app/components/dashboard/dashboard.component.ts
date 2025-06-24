import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService } from './service/dashboard.service';
import { AlertService } from '../../shared/components/alert/service/alert.service';

Chart.register(...registerables);


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('doughnutCanvas') private doughnutCanvas!: ElementRef;
  @ViewChild('lineCanvas') private barCanvas!: ElementRef;

  doughNutChart!: Chart;
  lineChart!: Chart;
  datas!: any;
  loading: boolean = true;
  pieChartLoading: boolean = true;
  lineChartLoading: boolean = true;

  constructor(
    private service: DashboardService,
    private alertService: AlertService
  ) { }
  
  ngOnInit(): void {
    this.loadDashboardStats();
  }

  ngAfterViewInit(): void {
    this.loadPieChart();
    this.loadLineChart();
  }

  private loadDashboardStats() {
    this.loading = true;
    this.service.getClient().subscribe({
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
        const colors = ['#FF6384', '#36A2EB', '#FFCE56'];

        if (this.doughnutCanvas) {
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

        const processedDatasets = datasets.map((dataset: any, index: number) => ({
          label: dataset.label,
          data: dataset.data,
          backgroundColor: this.getLineColor(index),
          borderColor: this.getLineColor(index),
          fill: false,
          tension: 0.3
        }));

        if (this.barCanvas) {
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
        this.alertService.showAlert({
          message: 'Failed to load line chart data.',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    });
  }

  private getDateRange() {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    return {
      startDate: lastMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  }

  private createDoughnutChart(ctx: HTMLCanvasElement, labels: string[], data: number[], colors: string[]): Chart<'doughnut'> {
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
