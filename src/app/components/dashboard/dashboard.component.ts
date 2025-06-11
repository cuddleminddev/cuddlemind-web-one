import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('doughnutCanvas') private doughnutCanvas!: ElementRef;

  doughNutChart!: Chart;

  ngAfterViewInit(): void {
    this.doughNutChart = this.createDoughnutChart(
      this.doughnutCanvas.nativeElement,
      ['Users', 'Chats', 'Bookings'],
      [30, 40, 30],
      ['#FF6384', '#36A2EB', '#FFCE56']
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

}
