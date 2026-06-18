import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { StatCardComponent, StatCardData } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/ui.components';
import { EmptyStateComponent } from '../../../shared/components/ui.components';
import { DateFormatPipe, TruncatePipe } from '../../../shared/pipes';
import { StudentState } from '../student.state';
import { AuthService } from '../../../core/services/auth.service';
import { Request } from '../../../core/models';

@Component({
  selector:   'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatChipsModule, MatProgressSpinnerModule,
    MainLayoutComponent, StatCardComponent,
    StatusBadgeComponent, EmptyStateComponent,
    DateFormatPipe, TruncatePipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Tableau de bord">

      <!-- En-tête -->
      <div class="page-header">
        <div class="page-header__breadcrumb">
          <mat-icon style="font-size:14px;width:14px;height:14px">home</mat-icon>
          <span>/</span><span>Dashboard</span>
        </div>
        <div class="page-header__top">
          <div>
            <h1 class="page-header__title">
              Bonjour, {{ auth.currentUser()?.prenom }} 👋
            </h1>
            <p class="page-header__subtitle">
              Aperçu de vos requêtes et de leur état actuel.
            </p>
          </div>
          <button mat-raised-button color="primary" routerLink="/student/requests/new">
            <mat-icon>add</mat-icon> Nouvelle requête
          </button>
        </div>
      </div>

      <!-- Indicateur de chargement -->
      @if (state.loading()) {
        <div style="display:flex;justify-content:center;padding:40px">
          <mat-progress-spinner mode="indeterminate" diameter="40"/>
        </div>
      } @else {

        <!-- Cartes statistiques -->
        <div class="stats-grid">
          @for (card of statCards(); track card.label) {
            <app-stat-card [data]="card"/>
          }
        </div>

        <!-- Requêtes récentes -->
        <div class="section-card">
          <div class="section-card__header">
            <span class="section-card__title">
              <mat-icon>history</mat-icon>
              Requêtes récentes
            </span>
            <button mat-stroked-button routerLink="/student/requests">
              Voir tout
            </button>
          </div>

          @if (recentRequests().length === 0) {
            <app-empty-state
              icon="inbox"
              title="Aucune requête"
              subtitle="Vous n'avez pas encore soumis de requête."
              actionLabel="Créer une requête"
              [onAction]="goToCreate"/>
          } @else {
            <div class="table-wrapper">
              <table mat-table [dataSource]="recentRequests()" class="recent-table">

                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef>ID</th>
                  <td mat-cell *matCellDef="let r">
                    <code class="req-id">{{ r.id }}</code>
                  </td>
                </ng-container>

                <ng-container matColumnDef="objet">
                  <th mat-header-cell *matHeaderCellDef>Objet</th>
                  <td mat-cell *matCellDef="let r">{{ r.objet | truncate:45 }}</td>
                </ng-container>

                <ng-container matColumnDef="categorie">
                  <th mat-header-cell *matHeaderCellDef>Catégorie</th>
                  <td mat-cell *matCellDef="let r">{{ r.categorie?.nom ?? '—' }}</td>
                </ng-container>

                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let r">{{ r.dateCreation | dateFormat:'short' }}</td>
                </ng-container>

                <ng-container matColumnDef="statut">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let r">
                    <app-status-badge [status]="r.statut"/>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let r">
                    <button mat-icon-button color="primary"
                            [routerLink]="['/student/requests', r.id]"
                            title="Consulter">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          }
        </div>

      }
    </app-main-layout>
  `,
  styles: [`
    .table-wrapper { overflow-x: auto; }
    .recent-table { width: 100%; }
    .req-id { font-size: .78rem; color: #1a3c6e; background: #ebf2fa;
              padding: 2px 8px; border-radius: 4px; }
  `],
})
export class StudentDashboardComponent implements OnInit {
  auth  = inject(AuthService);
  state = inject(StudentState);

  displayedColumns = ['id', 'objet', 'categorie', 'date', 'statut', 'actions'];

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',       icon: 'dashboard',         route: '/student/dashboard' },
    { label: 'Mes requêtes',    icon: 'description',       route: '/student/requests' },
    { label: 'Mes réponses',    icon: 'mark_email_read',   route: '/student/responses' },
    { label: 'Suivi',           icon: 'timeline',          route: '/student/tracking' },
  ];

  ngOnInit() {
    this.state.loadRequests();
    this.state.loadResponses();
  }

  recentRequests() {
    return this.state.requests().slice(0, 5);
  }

  statCards(): StatCardData[] {
    return [
      { label: 'Total requêtes',  value: this.state.totalRequests(),   icon: 'description',    color: 'primary' },
      { label: 'En attente',      value: this.state.pendingCount(),     icon: 'hourglass_empty', color: 'warn' },
      { label: 'En cours',        value: this.state.inProgressCount(),  icon: 'autorenew',       color: 'info' },
      { label: 'Traitées',        value: this.state.resolvedCount(),    icon: 'check_circle',    color: 'accent' },
      { label: 'Réponses reçues', value: this.state.responsesCount(),   icon: 'mail',            color: 'success' },
    ];
  }

  goToCreate = () => window.location.assign('/student/requests/new');
}
