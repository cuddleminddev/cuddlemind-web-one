import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ReportsService } from './reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {

  contacts: any[] = [];
  searchText = '';
  selectedDate: string = '';
  selectedMessage: any;
  loading = false;

  constructor(
    private modalService: NgbModal,
    private reportsService: ReportsService
  ) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts() {
    this.loading = true;

    this.reportsService.getContactReports().subscribe({
      next: (res: any) => {
        console.log("API RESPONSE:", res);
        this.contacts = res?.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error("API ERROR:", err);
        this.loading = false;
      }
    });
  }

  openViewModal(content: any, item: any) {
  this.selectedMessage = item;

  // 🔥 Add this part
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement) {
    activeElement.blur();
  }

  this.modalService.open(content, {
    centered: true,
    size: 'lg'
  });
}

  deleteContact(item: any) {
    if (!item.id) return;

    this.reportsService.deleteContact(item.id).subscribe(() => {
      this.contacts = this.contacts.filter(c => c.id !== item.id);
    });
  }

  get filteredContacts() {
    return this.contacts.filter(item => {

      const matchesSearch =
        item.firstName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item.email?.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesDate =
        !this.selectedDate ||
        item.createdAt?.includes(this.selectedDate);

      return matchesSearch && matchesDate;
    });
  }
}