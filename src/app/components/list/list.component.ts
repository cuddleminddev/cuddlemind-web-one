import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ListService } from './service/list.service';
import { AllComponent } from "./all/all.component";
import { AdminsComponent } from "./admins/admins.component";
import { DoctorsComponent } from "./doctors/doctors.component";
import { StaffsComponent } from "./staffs/staffs.component";
import { ClientsComponent } from "./clients/clients.component";

@Component({
  selector: 'app-list',
  imports: [CommonModule, TabsModule, AllComponent, AdminsComponent, DoctorsComponent, StaffsComponent, ClientsComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent implements OnInit {

  allUsers!: any;

  constructor(
    private service: ListService
  ) { }

  ngOnInit(): void {
    // this.loadAllUsers()
    // this.loadRoles()
  }

  // loadAllUsers() {
  //   this.service.getAllUsers(1, 5, 'role').subscribe({
  //     next: (res) => {
  //       console.log(res);
  //     },
  //     error: (err) => {
  //       console.log(err);
  //     }
  //   })
  // }

  // loadRoles() {
  //   this.service.getRoles().subscribe({
  //     next: (res) => {
  //       console.log(res);
  //     },
  //     error: (err) => {
  //       console.log(err);
  //     }
  //   })
  // }

}
