import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ColumnMode, NgxDatatableModule } from '@siemens/ngx-datatable';
import { NgbDateStruct, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { BreadcrumbComponent } from '../../../layout/breadcrumb/breadcrumb.component';
import { environment } from '../../../../environments/environment';
import { NgSelectComponent as MyNgSelectComponent } from '@ng-select/ng-select';

interface User {
  company_id: number | null;
  company_name: string | null;
  id?: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number: string;
  gender: string | null;
  purchase_date?: NgbDateStruct | string | null;
  advance_fee: string | null;
  services_fee: string | null;
  subscribe_start?: NgbDateStruct | string | null;
  subscribe_end?: NgbDateStruct | string | null;
  refer_by: string | null;
  date_of_birth?: NgbDateStruct | string | null;
  city_id: number | null;
  status: string | null;
  address: string;
  image?: File | string | null;
  image_url?: string;
  images?: {
    image_name: string;
  };
}

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    RouterLink,
    NgxDatatableModule,
    CommonModule,
    FormsModule,
    NgbDatepickerModule,
    MyNgSelectComponent,
  ],
  templateUrl: './setup.component.html'
})
export class UsersSetupComponent {
  private API_URL = environment.API_URL;
  private IMAGE_URL = environment.IMAGE_URL;
  private NG_URL = environment.NG_URL;

  currentRecord: User = {
    company_id: null,
    company_name: null,
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    purchase_date: '',
    advance_fee: '',
    services_fee: '',
    subscribe_start: '',
    subscribe_end: '',
    refer_by: '',
    phone_number: '',
    gender: 'Male',
    date_of_birth: '',
    city_id: null,
    status: 'Inactive',
    address: '',
    image: ''
  };
  // currentRecord = {
  //   company_id: null,
  //   first_name: '',
  //   last_name: '',
  //   username: '',
  //   email: '',
  //   subscribe_start: '',
  //   subscribe_end: '',
  //   refer_by: '',
  //   phone_number: '',
  //   gender: 'Male',
  //   date_of_birth: '',
  //   city_id: null,
  //   status: 'Inactive',
  //   address: '',
  //   ng_url: this.NG_URL
  // };
  
  isEditMode = false;
  isLoading = false;
  globalError: string = '';
  globalErrorMessage: string = '';
  errorMessage: any;
  selected: any[] = [];
  formErrors: any = {};
  companies: any[] = [];
  cities: any[] = [];
  gender: { id: string; name: string }[] = [];
  status: { id: string; name: string }[] = [];
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  ColumnMode = ColumnMode;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchCompanies();
    this.fetchCities();

    this.gender = [
      { id: 'Male', name: 'Male' },
      { id: 'Female', name: 'Female' },
      { id: 'Other', name: 'Other' },
    ];

    this.status = [
      { id: 'Active', name: 'Active' },
      { id: 'Inactive', name: 'Inactive' },
      { id: 'Disabled', name: 'Disabled' },
      { id: 'Deleted', name: 'Deleted' },
    ];

    // Handle id-based route
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchUsers(+id);
      }
    });
  }

  clearError(field: string): void {
    if (this.formErrors[field]) {
      delete this.formErrors[field];
    }
  }

  fetchUsers(id: number) {
    this.http.get<User>(`${this.API_URL}/user/${id}`).subscribe(user => {
      this.currentRecord = {
        ...this.currentRecord,
        ...user,
        
        date_of_birth: this.parseDateFromBackend(
          typeof user.date_of_birth === 'string' ? user.date_of_birth : undefined
        ),
        
        subscribe_start: this.parseDateFromBackend(
          typeof user.subscribe_start === 'string' ? user.subscribe_start : undefined
        ),
        
        subscribe_end: this.parseDateFromBackend(
          typeof user.subscribe_end === 'string' ? user.subscribe_end : undefined
        ),
      };
  
      if (user.images && user.images.image_name) {
        this.imagePreview = `${this.IMAGE_URL}/uploads/users/${user.images.image_name}`;
      }
  
      this.isEditMode = true;
    });
  }

  fetchCompanies(): void {
    this.http.get<any[]>(`${this.API_URL}/active/companies`).subscribe({
      next: (response) => {
        // Map each asset type to add a custom label
        this.companies = response.map((companies) => ({
          ...companies
        }));
      },
      error: (error) => console.error('Failed to fetch employees:', error)
    });
  }

  fetchCities(): void {
    this.http.get<any>(`${this.API_URL}/active/cities`).subscribe({
      next: (response) => {
        this.cities = response;
      },
      error: (error) => console.error('Failed to fetch cities:', error)
    });
  }

  // Convert from backend string to NgbDateStruct
  private parseDateFromBackend(dateString: string | undefined): NgbDateStruct | null {
    if (!dateString) return null;
    
    // If already in NgbDateStruct format, return it
    if (typeof dateString === 'object' && 'year' in dateString) {
      return dateString;
    }
    
    // Parse string date
    const parts = dateString.split('-');
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
      day: parseInt(parts[2], 10)
    };
  }

  formatDate(date: NgbDateStruct | string | null | undefined): string {
    if (typeof date === 'string') return date;
    if (!date) return '';
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  }

  
  // Add your onSubmit method
  onSubmit(event: Event): void {
    event.preventDefault();
    this.isLoading = true;  

    const format_Dob = this.formatDate(this.currentRecord.date_of_birth);
    const subscribe_start = this.formatDate(this.currentRecord.subscribe_start);
    const subscribe_end = this.formatDate(this.currentRecord.subscribe_end);

    const currentRecord = {
      company_id: this.currentRecord.company_id,
      first_name: this.currentRecord.first_name,
      last_name: this.currentRecord.last_name,
      username: this.currentRecord.username,
      email: this.currentRecord.email,
      phone_number: this.currentRecord.phone_number,
      subscribe_start: subscribe_start || null,
      subscribe_end: subscribe_end || null,
      refer_by: this.currentRecord.refer_by,
      gender: this.currentRecord.gender,
      date_of_birth: format_Dob || null,
      city_id: this.currentRecord.city_id,
      status: this.currentRecord.status,
      address: this.currentRecord.address,
      ng_url: this.NG_URL,
    };
  
    this.http.post(`${this.API_URL}/users/register`, currentRecord).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.isLoading = false;
        this.formErrors = error.error.errors || {};
  
        // Show global error
        this.globalErrorMessage = 'Please fill all required fields correctly.';
  
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  updateRecord(event: Event): void {
    event.preventDefault();
    this.isLoading = true;
  
    const formData = new FormData();
    const entries = Object.entries(this.currentRecord) as [keyof User, any][];
  
    for (const [key, value] of entries) {
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'purchase_date' || key === 'subscribe_start' || key === 'subscribe_end' || key === 'date_of_birth') {
          formData.append(key, this.formatDate(value));
        } else {
          formData.append(key, value);
        }
      }
    }
  
    if (this.selectedFile) {
      formData.append('user_image', this.selectedFile);
    }
  
    // Proceed with the API request to update user data
    this.http.post(`${this.API_URL}/users/update/${this.currentRecord.id}?_method=PUT`, formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.isLoading = false;
        // Check if the error is related to a duplicate value like email, etc.
        if (error?.error?.errors) {
          this.formErrors = error.error.errors;
        }
      }
    });
  }
}
