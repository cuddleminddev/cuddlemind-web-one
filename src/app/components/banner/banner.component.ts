import { Component, OnInit } from '@angular/core';
import { BannerService } from './service/banner.service';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-banner',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent implements OnInit {

  loading: boolean = false;
  allBanners!: any[];
  bannerForm!: FormGroup;

  selectedFile!: File | null;
  imagePreview: string | null = null;

  constructor(
    private service: BannerService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loadBannerList();
    this.initForm();
  }

  initForm() {
    this.bannerForm = this.fb.group({
      title: ['', Validators.required],
    });
  }

  loadBannerList() {
    this.service.getBannerList().subscribe({
      next: (res: any) => {
        this.allBanners = res.data
      },
      error: (err) => {
        this.alertService.showAlert({
          message: err.error.message,
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    })
  }

  openModal(content: any) {
    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    this.bannerForm.reset();
    this.modalService.open(content, { centered: true });
  }

  onSubmit(modal: any) {

  if (!this.bannerForm.valid || !this.selectedFile) {
    this.bannerForm.markAllAsTouched();
    return;
  }

  const formData = new FormData();
  formData.append('title', this.bannerForm.get('title')?.value);
  formData.append('image', this.selectedFile);

  this.service.addBanner(formData).subscribe({
    next: () => {
      this.loadBannerList();
      this.alertService.showAlert({
        message: 'Banner added successfully!',
        type: 'success',
        autoDismiss: true,
        duration: 3000
      });
      this.modalService.dismissAll();
      this.imagePreview = null;
      this.selectedFile = null;
    }
  });
}

  deleteBanner(banner: any) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteBanner(banner.id).subscribe({
          next: (res) => {
            this.loadBannerList();
            Swal.fire({
              title: "Deleted!",
              text: "Your banner has been deleted.",
              icon: "success"
            });
          },
          error: (err) => {
            this.alertService.showAlert({
              message: err.error.message,
              type: 'error',
              autoDismiss: true,
              duration: 4000
            });
          }
        })
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

}
