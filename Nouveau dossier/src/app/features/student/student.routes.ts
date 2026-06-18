// ═══ student.routes.ts ═══════════════════════════════════════════════════════
import { Routes } from '@angular/router';

export const STUDENT_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/student-dashboard.component')
        .then(m => m.StudentDashboardComponent),
  },
  {
    path: 'requests',
    loadComponent: () =>
      import('./request-list/request-list.component')
        .then(m => m.RequestListComponent),
  },
  {
    path: 'requests/new',
    loadComponent: () =>
      import('./create-request/create-request.component')
        .then(m => m.CreateRequestComponent),
  },
  {
    path: 'requests/:id',
    loadComponent: () =>
      import('./request-detail/request-detail.component')
        .then(m => m.RequestDetailComponent),
  },
  {
    path: 'responses',
    loadComponent: () =>
      import('./response-list/response-list.component')
        .then(m => m.ResponseListComponent),
  },
  {
    path: 'responses/:id',
    loadComponent: () =>
      import('./response-detail/response-detail.component')
        .then(m => m.ResponseDetailComponent),
  },
  {
    path: 'tracking',
    loadComponent: () =>
      import('./request-tracking/request-tracking.component')
        .then(m => m.RequestTrackingComponent),
  },
];
