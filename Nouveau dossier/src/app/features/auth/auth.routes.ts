// ═══ auth.routes.ts ══════════════════════════════════════════════════════════
import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./profile-select/profile-select.component')
        .then(m => m.ProfileSelectComponent),
  },

  {
    path: 'connexion',
    loadComponent: () =>
      import('./login/login.component')
        .then(m => m.LoginComponent),
  },
];
