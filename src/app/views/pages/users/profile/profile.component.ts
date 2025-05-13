import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { BreadcrumbComponent } from '../../../layout/breadcrumb/breadcrumb.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    NgbDropdownModule
  ],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  private API_URL = environment.API_URL;
  private IMAGE_URL = environment.IMAGE_URL;
  
  currentRecord: any = {};

  loadingIndicator = true;
  isEditMode = false;
  image: string | ArrayBuffer | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  rows: { id: number; [key: string]: any }[] = [];
  temp: { id: number; [key: string]: any }[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {}
  
  ngOnInit(): void {
    // Handle id-based route
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchUsers(+id);
      }
    });
  }

  fetchUsers(id: number) {
    this.http.get<[]>(`${this.API_URL}/user/${id}`).subscribe(user => {
      this.currentRecord = {
        ...this.currentRecord,
        ...user
      };
  
      // if (user.images && user.images.image_name) {
      //   this.imagePreview = `${this.IMAGE_URL}/uploads/users/${user.images.image_name}`;
      // }
  
      this.isEditMode = true;
    });
  }

}
