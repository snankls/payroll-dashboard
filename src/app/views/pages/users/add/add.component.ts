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

@Component({
  selector: 'app-add',
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
  templateUrl: './add.component.html'
})
export class UsersAddComponent {
  private API_URL = environment.API_URL;
  private NG_URL = environment.NG_URL;

  formData = {
    company_id: null,
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    subscribe_start: '',
    subscribe_end: '',
    refer_by: '',
    phone_number: '',
    gender: 'Male',
    date_of_birth: '',
    city_id: null,
    status: 'Inactive',
    address: '',
    ng_url: this.NG_URL
  };
  
  globalError: string = '';
  globalErrorMessage: string = '';
  isLoading = false;
  errorMessage: any;
  selected: any[] = [];
  formErrors: any = {};
  companies: any[] = [];
  cities: any[] = [];
  gender: { id: string; name: string }[] = [];
  status: { id: string; name: string }[] = [];
  
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
  }

  clearError(field: string): void {
    if (this.formErrors[field]) {
      delete this.formErrors[field];
    }
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

  formatDate(date: NgbDateStruct | string | undefined): string {
    if (typeof date === 'string') return date;
    if (!date) return '';
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  }
  
  // Add your onSubmit method
  onSubmit(event: Event): void {
    event.preventDefault();
    this.isLoading = true;  

    const format_Dob = this.formatDate(this.formData.date_of_birth);
    const subscribe_start = this.formatDate(this.formData.subscribe_start);
    const subscribe_end = this.formatDate(this.formData.subscribe_end);

    const formData = {
      company_id: this.formData.company_id,
      first_name: this.formData.first_name,
      last_name: this.formData.last_name,
      username: this.formData.username,
      email: this.formData.email,
      phone_number: this.formData.phone_number,
      subscribe_start: subscribe_start,
      subscribe_end: subscribe_end,
      refer_by: this.formData.refer_by,
      gender: this.formData.gender,
      date_of_birth: format_Dob || null,
      city_id: this.formData.city_id,
      status: this.formData.status,
      address: this.formData.address,
      ng_url: this.NG_URL,
    };
  
    this.http.post(`${this.API_URL}/users`, formData).subscribe({
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

}
