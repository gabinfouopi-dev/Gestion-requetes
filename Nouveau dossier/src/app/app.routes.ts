import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { Role } from './core/enums/role.enum';

export const routes: Routes = [
  // Racine → login
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // ── Auth (pas de guard) ──────────────────────────────────────────────────
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  // ── Étudiant ──────────────────────────────────────────────────────────────
  {
    path: 'student',
    canActivate: [authGuard, roleGuard([Role.ETUDIANT])],
    loadChildren: () =>
      import('./features/student/student.routes').then(m => m.STUDENT_ROUTES),
  },

  // ── Agent ─────────────────────────────────────────────────────────────────
  {
    path: 'agent',
    canActivate: [authGuard, roleGuard([Role.AGENT])],
    loadChildren: () =>
      import('./features/agent/agent.routes').then(m => m.AGENT_ROUTES),
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard([Role.ADMIN])],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },

  // Fallback
  { path: '**', redirectTo: '/login' },
];
