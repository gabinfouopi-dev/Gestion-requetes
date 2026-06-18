// ═══ service-request-list.component.ts ═══════════════════════════════════════
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { StatusBadgeComponent, EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components/ui.components';
import { DateFormatPipe, TruncatePipe } from '../../../shared/pipes';
import { AgentState } from '../agent.state';
import { AuthService } from '../../../core/services/auth.service';
import { RequestService } from '../../../core/services/request.service';
import { Request } from '../../../core/models';
import { RequestStatus } from '../../../core/enums/request-status.enum';

const AGENT_NAV: NavItem[] = [
  { label: 'Dashboard',        icon: 'dashboard',      route: '/agent/dashboard' },
  { label: 'Requêtes service', icon: 'inbox',          route: '/agent/requests' },
  { label: 'Inter-services',   icon: 'compare_arrows', route: '/agent/inter-services' },
  { label: 'Réponses IS',      icon: 'reply_all',      route: '/agent/inter-service-responses' },
  { label: 'Suivi',            icon: 'timeline',       route: '/agent/tracking' },
];

@Component({
  selector:   'app-service-request-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatMenuModule, MatProgressSpinnerModule, MatTooltipModule,
    MainLayoutComponent, StatusBadgeComponent, EmptyStateComponent,
    DateFormatPipe, TruncatePipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Requêtes du Service">

      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/agent/dashboard">Dashboard</a>
          <span>/</span><span>Requêtes</span>
        </div>
        <div class="page-header__top">
          <div>
            <h1 class="page-header__title">Requêtes du Service</h1>
            <p class="page-header__subtitle">
              Service : <strong>{{ auth.currentUser()?.service?.nom ?? '—' }}</strong>
            </p>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-bar">
        <mat-form-field class="search-field">
          <mat-label>Rechercher</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [formControl]="searchCtrl" placeholder="Objet, ID, étudiant…"/>
        </mat-form-field>
        <mat-form-field style="width:180px">
          <mat-label>Statut</mat-label>
          <mat-select [formControl]="statusCtrl">
            <mat-option value="">Tous</mat-option>
            @for (s of statusOptions; track s.value) {
              <mat-option [value]="s.value">{{ s.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Tableau -->
      <div class="section-card">
        <div class="section-card__header">
          <span class="section-card__title">
            <mat-icon>list</mat-icon> Liste des requêtes
            <span class="count-badge">{{ filtered().length }}</span>
          </span>
        </div>

        @if (state.loading()) {
          <div class="spinner-center">
            <mat-progress-spinner mode="indeterminate" diameter="40"/>
          </div>
        } @else if (filtered().length === 0) {
          <app-empty-state icon="inbox" title="Aucune requête" subtitle="Aucune requête ne correspond à vos critères."/>
        } @else {
          <div class="table-wrapper">
            <table mat-table [dataSource]="filtered()">

              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let r"><code class="req-id">{{ r.id }}</code></td>
              </ng-container>

              <ng-container matColumnDef="objet">
                <th mat-header-cell *matHeaderCellDef>Objet</th>
                <td mat-cell *matCellDef="let r">
                  <div class="objet-cell">
                    <span class="fw-500">{{ r.objet | truncate:40 }}</span>
                    @if (r.reponse) {
                      <span class="replied-hint">
                        <mat-icon>check_circle</mat-icon> Répondu
                      </span>
                    }
                  </div>
                </td>
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

              <ng-container matColumnDef="categorie">
                <th mat-header-cell *matHeaderCellDef>Catégorie</th>
                <td mat-cell *matCellDef="let r">{{ r.categorie?.nom ?? '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Soumise le</th>
                <td mat-cell *matCellDef="let r">{{ r.dateSoumission | dateFormat:'short' }}</td>
              </ng-container>

              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let r"><app-status-badge [status]="r.statut"/></td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let r">
                  <div class="actions-cell">
                    <!-- Consulter -->
                    <button mat-icon-button color="primary"
                            [routerLink]="['/agent/requests', r.id, 'respond']"
                            matTooltip="Consulter / Répondre">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <!-- Répondre (si pas encore répondu) -->
                    @if (!r.reponse) {
                      <button mat-icon-button color="accent"
                              [routerLink]="['/agent/requests', r.id, 'respond']"
                              matTooltip="Répondre">
                        <mat-icon>reply</mat-icon>
                      </button>
                    }
                    <!-- Menu statut -->
                    <button mat-icon-button [matMenuTriggerFor]="statusMenu"
                            matTooltip="Changer le statut">
                      <mat-icon>swap_horiz</mat-icon>
                    </button>
                    <mat-menu #statusMenu="matMenu">
                      @for (s of statusOptions; track s.value) {
                        <button mat-menu-item (click)="changerStatut(r, s.value)">
                          {{ s.label }}
                        </button>
                      }
                    </mat-menu>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns;" class="table-row"></tr>
            </table>
          </div>
        }
      </div>
    </app-main-layout>
  `,
  styles: [`
    .filters-bar { display:flex; gap:16px; flex-wrap:wrap; margin-bottom:20px; }
    .search-field { flex:1; min-width:200px; }
    .table-wrapper { overflow-x:auto; }
    .req-id { font-size:.78rem; color:#1a3c6e; background:#ebf2fa; padding:2px 8px; border-radius:4px; }
    .objet-cell { display:flex; align-items:center; gap:8px; }
    .fw-500 { font-weight:500; }
    .replied-hint { display:flex; align-items:center; gap:3px; font-size:.73rem; color:#2e7d32;
                    mat-icon { font-size:.85rem; width:.85rem; height:.85rem; } }
    .user-mini { display:flex; align-items:center; gap:8px; }
    .user-mini__avatar {
      width:28px; height:28px; border-radius:50%; background:#1a3c6e; color:#fff;
      display:flex; align-items:center; justify-content:center; font-size:.72rem;
      font-weight:700; flex-shrink:0;
    }
    .user-mini__name { font-size:.82rem; font-weight:500; }
    .user-mini__sub  { font-size:.73rem; color:#94a3b8; }
    .actions-cell { display:flex; align-items:center; gap:2px; }
    .count-badge { background:#ebf2fa; color:#1a3c6e; font-size:.75rem; font-weight:700;
                   padding:2px 8px; border-radius:999px; margin-left:6px; }
    .spinner-center { display:flex; justify-content:center; padding:40px; }
    .table-row:hover { background:#fafbff; }
  `],
})
export class ServiceRequestListComponent implements OnInit {
  auth    = inject(AuthService);
  state   = inject(AgentState);
  private reqSvc = inject(RequestService);
  private snack  = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  navItems   = AGENT_NAV;
  searchCtrl = new FormControl('');
  statusCtrl = new FormControl('');
  columns    = ['id', 'objet', 'etudiant', 'categorie', 'date', 'statut', 'actions'];

  readonly statusOptions = [
    { value: RequestStatus.EN_ATTENTE, label: 'En attente' },
    { value: RequestStatus.EN_COURS,   label: 'En cours' },
    { value: RequestStatus.TRAITE,     label: 'Traité' },
    { value: RequestStatus.REJETE,     label: 'Rejeté' },
  ];

  ngOnInit() { this.state.loadRequests(); }

  filtered(): Request[] {
    const q  = (this.searchCtrl.value ?? '').toLowerCase();
    const st = this.statusCtrl.value ?? '';
    return this.state.requests().filter(r => {
      const nom = `${r.utilisateur?.prenom ?? ''} ${r.utilisateur?.nom ?? ''}`.toLowerCase();
      const matchQ  = !q  || r.objet.toLowerCase().includes(q) || String(r.id).toLowerCase().includes(q) || nom.includes(q);
      const matchSt = !st || r.statut === st;
      return matchQ && matchSt;
    });
  }

  initials(prenom?: string, nom?: string): string {
    return `${(prenom?.[0] ?? '')}${(nom?.[0] ?? '')}`.toUpperCase();
  }

  changerStatut(r: Request, statut: RequestStatus) {
    this.reqSvc.changeStatus(r.id, { statut }).subscribe({
      next: updated => {
        this.state.updateRequest(updated);
        this.snack.open(`Statut mis à jour : ${statut}`, '', { duration: 3000 });
      },
      error: () => this.snack.open('Erreur lors de la mise à jour.', '', { duration: 3000 }),
    });
  }
}
