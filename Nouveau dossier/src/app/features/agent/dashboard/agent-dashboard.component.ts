// ═══ agent-dashboard.component.ts ════════════════════════════════════════════
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
import { EmptyStateComponent } from '../../../shared/components/ui.components';
import { DateFormatPipe, TruncatePipe } from '../../../shared/pipes';
import { AgentState } from '../agent.state';
import { AuthService } from '../../../core/services/auth.service';

const AGENT_NAV: NavItem[] = [
  { label: 'Dashboard',         icon: 'dashboard',           route: '/agent/dashboard' },
  { label: 'Requêtes service',  icon: 'inbox',               route: '/agent/requests' },
  { label: 'Inter-services',    icon: 'compare_arrows',      route: '/agent/inter-services' },
  { label: 'Réponses IS',       icon: 'reply_all',           route: '/agent/inter-service-responses' },
  { label: 'Suivi',             icon: 'timeline',            route: '/agent/tracking' },
];

@Component({
  selector:   'app-agent-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatProgressSpinnerModule,
    MainLayoutComponent, StatCardComponent,
    StatusBadgeComponent, EmptyStateComponent,
    DateFormatPipe, TruncatePipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Dashboard Agent">
      <div class="page-header">
        <div class="page-header__breadcrumb">
          <mat-icon style="font-size:14px;width:14px;height:14px">home</mat-icon>
          <span>/</span><span>Dashboard</span>
        </div>
        <div class="page-header__top">
          <div>
            <h1 class="page-header__title">Bonjour, {{ auth.currentUser()?.prenom }} 👋</h1>
            <p class="page-header__subtitle">
              Service : <strong>{{ auth.currentUser()?.service?.nom ?? '—' }}</strong>
            </p>
          </div>
          <button mat-raised-button color="primary" routerLink="/agent/requests">
            <mat-icon>inbox</mat-icon> Voir les requêtes
          </button>
        </div>
      </div>

      @if (state.loading()) {
        <div style="display:flex;justify-content:center;padding:40px">
          <mat-progress-spinner mode="indeterminate" diameter="40"/>
        </div>
      } @else {
        <div class="stats-grid">
          @for (card of statCards(); track card.label) {
            <app-stat-card [data]="card"/>
          }
        </div>

        <div class="dashboard-grid">
          <!-- Requêtes en attente -->
          <div class="section-card card-full">
            <div class="section-card__header">
              <span class="section-card__title">
                <mat-icon>hourglass_empty</mat-icon> Requêtes en attente
              </span>
              <button mat-stroked-button routerLink="/agent/requests">Voir tout</button>
            </div>
            @if (pendingRequests().length === 0) {
              <app-empty-state icon="check_circle" title="Aucune requête en attente"
                               subtitle="Toutes les requêtes ont été traitées."/>
            } @else {
              <div class="table-wrapper">
                <table mat-table [dataSource]="pendingRequests()">
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef>ID</th>
                    <td mat-cell *matCellDef="let r"><code class="req-id">{{ r.id }}</code></td>
                  </ng-container>
                  <ng-container matColumnDef="objet">
                    <th mat-header-cell *matHeaderCellDef>Objet</th>
                    <td mat-cell *matCellDef="let r">{{ r.objet | truncate:45 }}</td>
                  </ng-container>
                  <ng-container matColumnDef="etudiant">
                    <th mat-header-cell *matHeaderCellDef>Étudiant</th>
                    <td mat-cell *matCellDef="let r">
                      <div class="user-mini">
                        <div class="user-mini__avatar">
                          {{ initials(r.utilisateur?.prenom, r.utilisateur?.nom) }}
                        </div>
                        <div>
                          <div class="user-mini__name">
                            {{ r.utilisateur?.prenom }} {{ r.utilisateur?.nom }}
                          </div>
                        
                        </div>
                      </div>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let r">{{ r.dateSoumission | dateFormat:'short' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="statut">
                    <th mat-header-cell *matHeaderCellDef>Statut</th>
                    <td mat-cell *matCellDef="let r"><app-status-badge [status]="r.statut"/></td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let r">
                      <button mat-raised-button color="primary"
                              [routerLink]="['/agent/requests', r.id, 'respond']">
                        <mat-icon>reply</mat-icon> Traiter
                      </button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="columns"></tr>
                  <tr mat-row *matRowDef="let row; columns: columns;"></tr>
                </table>
              </div>
            }
          </div>

          <!-- Résumé inter-services -->
          <div class="section-card">
            <div class="section-card__header">
              <span class="section-card__title">
                <mat-icon>compare_arrows</mat-icon> Inter-services
              </span>
              <button mat-stroked-button routerLink="/agent/inter-services">Voir tout</button>
            </div>
            <div class="section-card__body">
              <div class="ris-summary">
                <div class="ris-stat">
                  <span class="ris-stat__val">{{ state.risCount() }}</span>
                  <span>Total</span>
                </div>
                <div class="ris-stat warn">
                  <span class="ris-stat__val">{{ state.risPendingCount() }}</span>
                  <span>En attente</span>
                </div>
              </div>
              @if (state.risPendingCount() > 0) {
                <div class="ris-alert">
                  <mat-icon>warning</mat-icon>
                  {{ state.risPendingCount() }} demande(s) inter-service en attente de réponse.
                </div>
              }
            </div>
          </div>
        </div>
      }
    </app-main-layout>
  `,
  styles: [`
    .table-wrapper { overflow-x:auto; }
    .req-id { font-size:.78rem; color:#1a3c6e; background:#ebf2fa;
              padding:2px 8px; border-radius:4px; }
    .dashboard-grid { display:grid; grid-template-columns:2fr 1fr; gap:20px; }
    .card-full { grid-column:1/-1; }
    .ris-summary { display:flex; gap:20px; margin-bottom:14px; }
    .ris-stat { flex:1; text-align:center; background:#f8fafc; border-radius:10px;
                padding:14px; border:1px solid #e2e8f0;
                .ris-stat__val { display:block; font-size:1.8rem; font-weight:700; }
                span:last-child { font-size:.8rem; color:#64748b; }
    }
    
    .user-mini { display:flex; align-items:center; gap:8px; }
    .user-mini__avatar {
      width:28px; height:28px; border-radius:50%; background:#1a3c6e; color:#fff;
      display:flex; align-items:center; justify-content:center; font-size:.72rem;
      font-weight:700; flex-shrink:0;
    }
    .user-mini__name { font-size:.82rem; font-weight:500; }
    .user-mini__sub  { font-size:.73rem; color:#94a3b8; }

    .ris-stat.warn .ris-stat__val { color:#f57f17; }
    .ris-alert { display:flex; align-items:center; gap:8px; padding:10px 14px;
                 background:#fff8e1; border-radius:8px; font-size:.82rem; color:#f57f17;
                 mat-icon { font-size:1rem; width:1rem; height:1rem; } }
    @media(max-width:768px) { .dashboard-grid { grid-template-columns:1fr; } }
  `],
})
export class AgentDashboardComponent implements OnInit {
  auth     = inject(AuthService);
  state    = inject(AgentState);
  navItems = AGENT_NAV;
  columns  = ['id', 'objet', 'etudiant', 'date', 'statut', 'actions'];

  ngOnInit() {
    this.state.loadRequests();
    this.state.loadInterServiceRequests();
  }

  pendingRequests() {
    return this.state.requests()
        .slice(0, 5);
      // .filter(r => r.statut === 'SOUMISE' as any)
      
  }

  initials(prenom?: string, nom?: string): string {
    return `${(prenom?.[0] ?? '')}${(nom?.[0] ?? '')}`.toUpperCase();
  }

  statCards(): StatCardData[] {
    return [
      { label: 'Requêtes du service', value: this.state.totalRequests(),   icon: 'inbox',           color: 'primary' },
      { label: 'En attente',          value: this.state.pendingCount(),     icon: 'hourglass_empty', color: 'warn' },
      { label: 'En cours',            value: this.state.inProgressCount(),  icon: 'autorenew',       color: 'info' },
      { label: 'Traitées',            value: this.state.resolvedCount(),    icon: 'check_circle',    color: 'accent' },
      { label: 'Inter-services',      value: this.state.risCount(),         icon: 'compare_arrows',  color: 'success' },
    ];
  }
}
