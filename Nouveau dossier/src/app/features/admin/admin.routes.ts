import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./user-management/user-management.component')
        .then(m => m.UserManagementComponent),
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./service-management/service-management.component')
        .then(m => m.ServiceManagementComponent),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./category-management/category-management.component')
        .then(m => m.CategoryManagementComponent),
  },
];
