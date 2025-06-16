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
  @ViewChild('barCanvas') private barCanvas!: ElementRef;

  doughNutChart!: Chart;
  barChart!: Chart;
  datas!: any;
  loading: boolean = true;

  constructor(
    private service: DashboardService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
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
        })
      }
    })
  }

  ngAfterViewInit(): void {
    this.doughNutChart = this.createDoughnutChart(
      this.doughnutCanvas.nativeElement,
      ['Users', 'Chats', 'Bookings'],
      [30, 40, 30],
      ['#FF6384', '#36A2EB', '#FFCE56']
    );

    this.barChart = this.createBarChart(
      this.barCanvas.nativeElement,
      ['January', 'February', 'March', 'April'],
      [120, 90, 140, 110],
      ['#FF9F40', '#FF6384', '#36A2EB', '#4BC0C0']
    );
  }

  private createDoughnutChart(ctx: HTMLCanvasElement, labels: string[], data: number[], colors: string[]): Chart<'doughnut'> {
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: '60%',
        plugins: {
          legend: { display: true },
        },
      },
    };
    return new Chart(ctx, config);
  }

  private createBarChart(ctx: HTMLCanvasElement, labels: string[], data: number[], colors: string[]): Chart<'bar'> {
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Bookings',
            data,
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
        },
      },
    };
    return new Chart(ctx, config);
  }

}
