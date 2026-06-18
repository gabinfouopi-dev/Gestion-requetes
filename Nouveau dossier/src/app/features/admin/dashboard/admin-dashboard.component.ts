// ═══ admin-dashboard.component.ts ════════════════════════════════════════════
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { StatCardComponent, StatCardData } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/ui.components';
import { DateFormatPipe, TruncatePipe } from '../../../shared/pipes';
import { AdminState } from '../admin.state';
import { AuthService } from '../../../core/services/auth.service';

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',   icon: 'dashboard',  route: '/admin/dashboard' },
  { label: 'Utilisateurs',icon: 'people',     route: '/admin/users' },
  { label: 'Services',    icon: 'business',   route: '/admin/services' },
  { label: 'Catégories',  icon: 'label',      route: '/admin/categories' },
];

@Component({
  selector:   'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatProgressSpinnerModule,
    MainLayoutComponent, StatCardComponent, StatusBadgeComponent,
    DateFormatPipe, TruncatePipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Administration">
      <div class="page-header">
        <div class="page-header__breadcrumb">
          <mat-icon style="font-size:14px;width:14px;height:14px">home</mat-icon>
          <span>/</span><span>Dashboard</span>
        </div>
        <div class="page-header__top">
          <div>
            <h1 class="page-header__title">Vue d'ensemble</h1>
            <p class="page-header__subtitle">Administration — Institut Universitaire</p>
          </div>
          <button mat-raised-button color="primary" routerLink="/admin/users">
            <mat-icon>person_add</mat-icon> Ajouter un utilisateur
          </button>
        </div>
      </div>

      @if (state.loading()) {
        <div style="display:flex;justify-content:center;padding:40px">
          <mat-progress-spinner mode="indeterminate" diameter="40"/>
        </div>
      } @else {
        <div class="stats-grid">
          @for (c of statCards(); track c.label) { <app-stat-card [data]="c"/> }
        </div>

        <div class="admin-grid">
          <!-- Utilisateurs récents -->
          <div class="section-card span2">
            <div class="section-card__header">
              <span class="section-card__title"><mat-icon>people</mat-icon>Utilisateurs récents</span>
              <button mat-stroked-button routerLink="/admin/users">Gérer</button>
            </div>
            <div class="table-wrapper">
              <table mat-table [dataSource]="state.users().slice(0,6)">
                <ng-container matColumnDef="user">
                  <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
                  <td mat-cell *matCellDef="let u">
                    <div class="user-mini">
                      <div class="user-mini__av">{{ initials(u.prenom, u.nom) }}</div>
                      <div>
                        <div class="fw-500">{{ u.prenom }} {{ u.nom }}</div>
                        <div class="sub-text">{{ u.email }}</div>
                      </div>
                    </div>
                  </td>
                </ng-container>
                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef>Rôle</th>
                  <td mat-cell *matCellDef="let u">
                    <span class="role-badge role-badge--{{ u.role.toLowerCase() }}">{{ roleLabel(u.role) }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="service">
                  <th mat-header-cell *matHeaderCellDef>Service</th>
                  <td mat-cell *matCellDef="let u">{{ u.serviceNom ?? '—' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['user','role','service']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['user','role','service'];"></tr>
              </table>
            </div>
          </div>

          <!-- Services -->
          <div class="section-card">
            <div class="section-card__header">
              <span class="section-card__title"><mat-icon>business</mat-icon>Services</span>
              <button mat-stroked-button routerLink="/admin/services">Gérer</button>
            </div>
            <div class="section-card__body">
              @for (s of state.services(); track s.id) {
                <div class="list-item">
                  <div class="list-item__icon"><mat-icon>business</mat-icon></div>
                  <div>
                    <div class="fw-500">{{ s.nom }}</div>
                    <div class="sub-text">{{ s.description | truncate:50 }}</div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Catégories -->
          <div class="section-card">
            <div class="section-card__header">
              <span class="section-card__title"><mat-icon>label</mat-icon>Catégories</span>
              <button mat-stroked-button routerLink="/admin/categories">Gérer</button>
            </div>
            <div class="section-card__body">
              @for (c of state.categories().slice(0,6); track c.id) {
                <div class="list-item">
                  <div class="list-item__icon" style="background:#e8f5e9;color:#2e7d32">
                    <mat-icon>label</mat-icon>
                  </div>
                  <div>
                    <div class="fw-500">{{ c.nom }}</div>
                    <div class="sub-text">{{ c.service?.nom }}</div>
                  </div>
                  <span class="prio-badge prio-badge--{{ c.priorite }}">{{ c.priorite }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </app-main-layout>
  `,
  styles: [`
    .admin-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .span2 { grid-column:1/-1; }
    .table-wrapper { overflow-x:auto; }
    .user-mini { display:flex; align-items:center; gap:10px; }
    .user-mini__av {
      width:34px; height:34px; border-radius:50%; background:#1a3c6e; color:#fff;
      display:flex; align-items:center; justify-content:center; font-size:.82rem;
      font-weight:700; flex-shrink:0;
    }
    .fw-500 { font-weight:500; font-size:.875rem; }
    .sub-text { font-size:.75rem; color:#94a3b8; }
    .role-badge { display:inline-block; padding:3px 10px; border-radius:999px;
                  font-size:.75rem; font-weight:600; }
    .role-badge--etudiant { background:#e8f5e9; color:#2e7d32; }
    .role-badge--agent    { background:#e1f5fe; color:#0277bd; }
    .role-badge--admin    { background:#ffebee; color:#c62828; }
    .list-item { display:flex; align-items:center; gap:10px; padding:10px 0;
                 border-bottom:1px solid #e2e8f0;
                 &:last-child { border-bottom:none; } }
    .list-item__icon {
      width:34px; height:34px; border-radius:8px; background:#ebf2fa; color:#1a3c6e;
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
      mat-icon { font-size:1rem; width:1rem; height:1rem; }
    }
    .prio-badge { padding:2px 8px; border-radius:999px; font-size:.72rem; font-weight:600;
                  background:#fff8e1; color:#f57f17; margin-left:auto; flex-shrink:0; }
    @media(max-width:768px) { .admin-grid { grid-template-columns:1fr; } }
  `],
})
export class AdminDashboardComponent implements OnInit {
  auth     = inject(AuthService);
  state    = inject(AdminState);
  navItems = ADMIN_NAV;

  ngOnInit() { this.state.loadAll(); }

  statCards(): StatCardData[] {
    return [
      { label:'Utilisateurs', value:this.state.users().length,      icon:'people',    color:'primary' },
      { label:'Étudiants',    value:this.state.totalStudents(),      icon:'school',    color:'accent' },
      { label:'Agents',       value:this.state.totalAgents(),        icon:'badge',     color:'info' },
      { label:'Services',     value:this.state.services().length,    icon:'business',  color:'warn' },
      { label:'Catégories',   value:this.state.categories().length,  icon:'label',     color:'success' },
    ];
  }

  initials(p?: string, n?: string) { return `${p?.[0]??''}${n?.[0]??''}`.toUpperCase(); }
  roleLabel(r: string) { const m:any={ETUDIANT:'Étudiant',AGENT:'Agent',ADMIN:'Admin'}; return m[r]??r; }
}
