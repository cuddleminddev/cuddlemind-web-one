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

    this.loadChartDatas()
  }

  ngAfterViewInit(): void {
    // this.doughNutChart = this.createDoughnutChart(
    //   this.doughnutCanvas.nativeElement,
    //   ['Users', 'Chats', 'Bookings'],
    //   [30, 40, 30],
    //   ['#FF6384', '#36A2EB', '#FFCE56']
    // );

    this.lineChart = this.createLineChart(
      this.barCanvas.nativeElement,
      ['January', 'February', 'March', 'April', 'May'],
      [120, 90, 140, 110, 150],
      ['#FF9F40', '#FF6384', '#36A2EB', '#4BC0C0', '#FFCE56']
    );
  }

  loadChartDatas() {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    const payload = {
      startDate: lastMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };

    this.service.getPieChart(payload).subscribe({
      next: (res: any) => {
        const chartData = res.data;
        const labels = chartData.labels;
        const values = chartData.values;
        const colors = ['#FF6384', '#36A2EB', '#FFCE56'];

        if (this.doughnutCanvas) {
          this.doughNutChart = this.createDoughnutChart(
            this.doughnutCanvas.nativeElement,
            labels,
            values,
            colors
          );
        }
      },
      error: () => {
        this.alertService.showAlert({
          message: 'Failed to load pie chart data.',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    });

    this.service.getLineChart(payload).subscribe({
      next: (res) => {
        console.log(res);
      }
    })
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

  private createLineChart(ctx: HTMLCanvasElement, labels: string[], data: number[], colors: string[]): Chart<'line'> {
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Bookings',
            data,
            backgroundColor: colors,
            tension: 0.2
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
