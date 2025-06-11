import { Component, OnInit } from '@angular/core';
import { BookingsService } from './service/bookings.service';

@Component({
  selector: 'app-bookings',
  imports: [],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class BookingsComponent implements OnInit{

  constructor(
    private service: BookingsService
  ){}

  ngOnInit(): void {
    this.service.getBookingsList().subscribe({
      next: (res) =>{
        console.log(res);
      }
    })
  }

}
