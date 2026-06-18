import { Routes } from '@angular/router';

export const AGENT_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/agent-dashboard.component')
        .then(m => m.AgentDashboardComponent),
  },
  {
    path: 'requests',
    loadComponent: () =>
      import('./service-request-list/service-request-list.component')
        .then(m => m.ServiceRequestListComponent),
  },
  {
    path: 'requests/:id/respond',
    loadComponent: () =>
      import('./request-response-form/request-response-form.component')
        .then(m => m.RequestResponseFormComponent),
  },
  {
    path: 'inter-services',
    loadComponent: () =>
      import('./inter-service-request-list/inter-service-request-list.component')
        .then(m => m.InterServiceRequestListComponent),
  },
  {
    path: 'inter-request/:id/respond',
    loadComponent: () =>
      import('./request-is-reponse-form/request-is-reponse-form.component')
        .then(m => m.RequestIsReponseFormComponent),
  },
  {
    path: 'inter-services/new',
    loadComponent: () =>
      import('./create-inter-service-request/create-inter-service-request.component')
        .then(m => m.CreateInterServiceRequestComponent),
  },
  {
    path: 'inter-service-responses',
    loadComponent: () =>
      import('./inter-service-response-list/inter-service-response-list.component')
        .then(m => m.InterServiceResponseListComponent),
  },
  {
    path: 'tracking',
    loadComponent: () =>
      import('./tracking/agent-tracking.component')
        .then(m => m.AgentTrackingComponent),
  },
];
