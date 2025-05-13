import { Component, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ColumnMode, DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';
import { BreadcrumbComponent } from '../../layout/breadcrumb/breadcrumb.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    RouterLink,
    NgxDatatableModule,
    CommonModule,
  ],
  templateUrl: './users.component.html'
})
export class UsersComponent {
  private API_URL = environment.API_URL;
  private IMAGE_URL = environment.IMAGE_URL;

  selected: { id: number; [key: string]: any }[] = [];
  rows: { id: number; [key: string]: any }[] = [];
  temp: { id: number; [key: string]: any }[] = [];
  loadingIndicator = true;
  reorderable = true;
  ColumnMode = ColumnMode;

  @ViewChild('table') table: DatatableComponent

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.fetchUsers();
  }

  updateFilter(event: KeyboardEvent) {
    const val = (event.target as HTMLInputElement).value.toLocaleLowerCase();
    
    // filter our data
    const temp = this.temp.filter(function(d: any) {
      return d.full_name.toLocaleLowerCase().indexOf(val) !== -1 || !val;
    })

    // update the rows
    this.rows = temp;

    // whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  selectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selected = checked ? [...this.rows] : [];
  }

  isSelected(row: any): boolean {
    return this.selected.some(selectedRow => selectedRow.id === row.id);
  }

  toggleSelection(row: any): void {
    if (this.isSelected(row)) {
      this.selected = this.selected.filter(selectedRow => selectedRow.id !== row.id);
    } else {
      this.selected.push(row);
    }
  }

  fetchUsers(): void {
    this.loadingIndicator = true;
  
    this.http.get<any[]>(`${this.API_URL}/users`).subscribe({
      next: (response) => {
        console.log(response);
        this.rows = response;
        this.temp = [...response];
        this.loadingIndicator = false;

        // Optionally, you can process image_url if necessary (e.g., fallback for missing images)
        this.rows.forEach((user) => {
          user.user_image = user.user_image
            ? `${this.IMAGE_URL}/uploads/users/${user.user_image}`
            : 'images/placeholder.png';
        });
      },
      error: (error) => {
        this.loadingIndicator = false;
      }
    });
  }

  deleteSelectedRecords(): void {
    if (confirm('Are you sure you want to permanent delete the selected record(s)?')) {
      const ids = this.selected.map(row => row.id);
      const deleteRequests = ids.map(id => this.http.delete(`${this.API_URL}/users/${id}`).toPromise());

      Promise.all(deleteRequests)
        .then(() => {
          this.rows = this.rows.filter(row => !ids.includes(row.id));
          this.temp = this.temp.filter(row => !ids.includes(row.id));
          this.selected = [];
        })
        .catch((error) => {
          console.error('Error deleting selected records:', error);
          alert('An error occurred while deleting records.');
        });
    }
  }

}
