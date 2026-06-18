import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
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
import { StudentState } from '../student.state';
import { RequestService } from '../../../core/services/request.service';
import { Request } from '../../../core/models';
import { RequestStatus } from '../../../core/enums/request-status.enum';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector:   'app-request-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatMenuModule, MatProgressSpinnerModule, MatTooltipModule,
    MainLayoutComponent, StatusBadgeComponent,
    EmptyStateComponent, DateFormatPipe, TruncatePipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Mes Requêtes">

      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/student/dashboard">Accueil</a>
          <span>/</span><span>Mes requêtes</span>
        </div>
        <div class="page-header__top">
          <div>
            <h1 class="page-header__title">Mes Requêtes</h1>
            <p class="page-header__subtitle">Gérez toutes vos demandes administratives.</p>
          </div>
          <button mat-raised-button color="primary" routerLink="/student/requests/new">
            <mat-icon>add</mat-icon> Nouvelle requête
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-bar">
        <mat-form-field class="search-field">
          <mat-label>Rechercher</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [formControl]="searchCtrl" placeholder="Objet, ID…"/>
        </mat-form-field>

        <mat-form-field class="filter-select">
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
            <mat-icon>list</mat-icon>
            Liste des requêtes
            <span class="count-badge">{{ filtered().length }}</span>
          </span>
        </div>

        @if (state.loading()) {
          <div class="spinner-center">
            <mat-progress-spinner mode="indeterminate" diameter="40"/>
          </div>
        } @else if (filtered().length === 0) {
          <app-empty-state icon="inbox" title="Aucune requête trouvée"
                           subtitle="Modifiez vos filtres ou créez une nouvelle requête."/>
        } @else {
          <div class="table-wrapper">
            <table mat-table [dataSource]="filtered()">

              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let r">
                  <code class="req-id">{{ r.id }}</code>
                </td>
              </ng-container>

              <ng-container matColumnDef="objet">
                <th mat-header-cell *matHeaderCellDef>Objet</th>
                <td mat-cell *matCellDef="let r">
                  <div class="objet-cell">
                    <span class="fw-500">{{ r.objet | truncate:45 }}</span>
                    @if (r.pieceJointes?.length) {
                      <span class="pj-hint">
                        <mat-icon>attach_file</mat-icon>{{ r.pieceJointes.length }}
                      </span>
                    }
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="categorie">
                <th mat-header-cell *matHeaderCellDef>Catégorie</th>
                <td mat-cell *matCellDef="let r">{{ r.categorie?.nom ?? '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Créée le</th>
                <td mat-cell *matCellDef="let r">{{ r.dateCreation | dateFormat:'short' }}</td>
              </ng-container>

              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let r">
                  <app-status-badge [status]="r.statut"/>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let r">
                  <div class="actions-cell">
                    <!-- Consulter (toujours) -->
                    <button mat-icon-button color="primary"
                            [routerLink]="['/student/requests', r.id]"
                            matTooltip="Consulter">
                      <mat-icon>visibility</mat-icon>
                    </button>

                    <!-- Modifier (brouillon uniquement) -->
                    @if (isDraft(r)) {
                      <button mat-icon-button
                              [routerLink]="['/student/requests', r.id]"
                              [queryParams]="{edit: true}"
                              matTooltip="Modifier">
                        <mat-icon>edit</mat-icon>
                      </button>

                      <!-- Soumettre -->
                      <button mat-icon-button color="accent"
                              (click)="soumettre(r)"
                              matTooltip="Soumettre">
                        <mat-icon>send</mat-icon>
                      </button>

                      <!-- Supprimer -->
                      <button mat-icon-button color="warn"
                              (click)="supprimer(r)"
                              matTooltip="Supprimer">
                        <mat-icon>delete</mat-icon>
                      </button>
                    }
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
    .filters-bar {
      display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;
    }
    .search-field { flex: 1; min-width: 220px; }
    .filter-select { width: 180px; }
    .table-wrapper { overflow-x: auto; }
    .count-badge {
      display: inline-flex; align-items: center; justify-content: center;
      background: #ebf2fa; color: #1a3c6e; font-size: .75rem; font-weight: 700;
      padding: 2px 8px; border-radius: 999px; margin-left: 6px;
    }
    .req-id { font-size: .78rem; color: #1a3c6e; background: #ebf2fa;
              padding: 2px 8px; border-radius: 4px; }
    .objet-cell { display: flex; align-items: center; gap: 8px; }
    .pj-hint { display: flex; align-items: center; gap: 2px; font-size: .75rem;
               color: #94a3b8; mat-icon { font-size: .9rem; width: .9rem; height: .9rem; } }
    .fw-500 { font-weight: 500; }
    .actions-cell { display: flex; align-items: center; gap: 2px; }
    .spinner-center { display: flex; justify-content: center; padding: 40px; }
    .table-row:hover { background: #fafbff; cursor: pointer; }
  `],
})
export class RequestListComponent implements OnInit {
  private reqSvc = inject(RequestService);
  private dialog = inject(MatDialog);
  private snack  = inject(MatSnackBar);
  state          = inject(StudentState);
  auth            = inject(AuthService);

  searchCtrl = new FormControl('');
  statusCtrl = new FormControl('');
  columns    = ['id', 'objet', 'categorie', 'date', 'statut', 'actions'];

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',    icon: 'dashboard',       route: '/student/dashboard' },
    { label: 'Mes requêtes', icon: 'description',     route: '/student/requests' },
    { label: 'Mes réponses', icon: 'mark_email_read', route: '/student/responses' },
    { label: 'Suivi',        icon: 'timeline',        route: '/student/tracking' },
  ];

  readonly statusOptions = [
    { value: RequestStatus.BROUILLON,  label: 'Brouillon' },
    { value: RequestStatus.EN_ATTENTE, label: 'En attente' },
    { value: RequestStatus.EN_COURS,   label: 'En cours' },
    { value: RequestStatus.TRAITE,     label: 'Traité' },
    { value: RequestStatus.REJETE,     label: 'Rejeté' },
  ];

  ngOnInit() {
    this.state.loadRequests();
    this.searchCtrl.valueChanges.pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(() => {});
    this.statusCtrl.valueChanges.subscribe(() => {});
  }

  filtered(): Request[] {
    const q   = (this.searchCtrl.value ?? '').toLowerCase();
    const st  = this.statusCtrl.value ?? '';
    return this.state.requests().filter(r => {
      const matchQ  = !q  || r.objet.toLowerCase().includes(q) || r.id;
      const matchSt = !st || r.statut === st;
      return matchQ && matchSt;
    });
  }

  isDraft(r: Request): boolean {
    return r.statut === RequestStatus.BROUILLON;
  }

  soumettre(r: Request) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Soumettre la requête', message: `Soumettre "${r.objet}" ? Cette action est irréversible.`, confirm: 'Soumettre' }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.reqSvc.submit(r.id).subscribe({
        next: updated => {
          this.state.updateRequest(updated);
          this.snack.open('Requête soumise avec succès !', '', { duration: 3000 });
        },
        error: () => this.snack.open('Erreur lors de la soumission.', '', { duration: 3000 }),
      });
    });
  }

  supprimer(r: Request) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Supprimer', message: `Supprimer la requête "${r.objet}" ?`, confirm: 'Supprimer', danger: true }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.reqSvc.delete(r.id).subscribe({
        next: () => {
          this.state.removeRequest(r.id);
          this.snack.open('Requête supprimée.', '', { duration: 3000 });
        },
        error: () => this.snack.open('Erreur lors de la suppression.', '', { duration: 3000 }),
      });
    });
  }
}
