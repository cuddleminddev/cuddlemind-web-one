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
export class ListComponent {
  activeTab: string = 'all'; 

  messages: string[] = [];

  message(msg: string) {
    this.messages.push(msg);
  }

}
