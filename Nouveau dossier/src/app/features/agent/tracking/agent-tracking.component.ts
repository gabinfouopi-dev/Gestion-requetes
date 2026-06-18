// ═══ agent/tracking/agent-tracking.component.ts ══════════════════════════════
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { StatusBadgeComponent } from '../../../shared/components/ui.components';
import { DateFormatPipe, TruncatePipe } from '../../../shared/pipes';
import { AgentState } from '../agent.state';
import { AuthService } from '../../../core/services/auth.service';
import { InterServiceRequestService } from '../../../core/services/inter-attachment.services';
import { InterServiceRequest } from '../../../core/models';
import { RequestStatus } from '../../../core/enums/request-status.enum';

const AGENT_NAV: NavItem[] = [
  { label: 'Dashboard',        icon: 'dashboard',      route: '/agent/dashboard' },
  { label: 'Requêtes service', icon: 'inbox',          route: '/agent/requests' },
  { label: 'Inter-services',   icon: 'compare_arrows', route: '/agent/inter-services' },
  { label: 'Réponses IS',      icon: 'reply_all',      route: '/agent/inter-service-responses' },
  { label: 'Suivi',            icon: 'timeline',       route: '/agent/tracking' },
];

@Component({
  selector:   'app-agent-tracking',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatSelectModule, MatProgressBarModule, MatTableModule, MatDividerModule,
    MainLayoutComponent, StatusBadgeComponent, DateFormatPipe, TruncatePipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Suivi Inter-Services">

      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/agent/dashboard">Dashboard</a><span>/</span><span>Suivi</span>
        </div>
        <div class="page-header__top">
          <div>
            <h1 class="page-header__title">Suivi des Échanges Inter-Services</h1>
            <p class="page-header__subtitle">
              Visualisez l'état des demandes émises et reçues par votre service.
            </p>
          </div>
        </div>
      </div>

      <!-- Résumé global -->
      <div class="summary-cards">
        <div class="sum-card">
          <span class="sum-card__val">{{ allRIS().length }}</span>
          <span>Total échanges</span>
        </div>
        <div class="sum-card sum-card--warn">
          <span class="sum-card__val">{{ pending() }}</span>
          <span>En attente</span>
        </div>
        <div class="sum-card sum-card--ok">
          <span class="sum-card__val">{{ accepted() }}</span>
          <span>Acceptées</span>
        </div>
        <div class="sum-card sum-card--err">
          <span class="sum-card__val">{{ rejected() }}</span>
          <span>Rejetées</span>
        </div>
      </div>

      <!-- Barre de taux de résolution -->
      <mat-card style="margin-bottom:24px">
        <mat-card-header>
          <mat-card-title>Taux de résolution</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div style="display:flex;align-items:center;gap:16px">
            <mat-progress-bar mode="determinate" [value]="resolutionRate()"
                              style="flex:1;border-radius:999px"/>
            <span style="font-size:1.1rem;font-weight:700;color:#1a3c6e;min-width:48px">
              {{ resolutionRate() }}%
            </span>
          </div>
          <p style="font-size:.82rem;color:#64748b;margin-top:8px">
            {{ accepted() }} résolue(s) sur {{ allRIS().length }} échange(s) au total
          </p>
        </mat-card-content>
      </mat-card>

      <!-- Tableau de suivi complet -->
      <div class="section-card">
        <div class="section-card__header">
          <span class="section-card__title">
            <mat-icon>timeline</mat-icon> Tous les échanges
          </span>
          <mat-form-field style="width:160px">
            <mat-label>Filtrer</mat-label>
            <mat-select [formControl]="filterCtrl">
              <mat-option value="all">Tous</mat-option>
              <mat-option value="emis">Émis</mat-option>
              <mat-option value="recus">Reçus</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="table-wrapper">
          <table mat-table [dataSource]="filtered()">

            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let r">
                <code class="ris-id">{{ r.id }}</code>
              </td>
            </ng-container>

            <ng-container matColumnDef="direction">
              <th mat-header-cell *matHeaderCellDef>Direction</th>
              <td mat-cell *matCellDef="let r">
                <span [class]="isEmis(r) ? 'dir-badge dir-badge--emis' : 'dir-badge dir-badge--recu'">
                  <mat-icon>{{ isEmis(r) ? 'north_east' : 'south_west' }}</mat-icon>
                  {{ isEmis(r) ? 'Émis' : 'Reçu' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="objet">
              <th mat-header-cell *matHeaderCellDef>Objet</th>
              <td mat-cell *matCellDef="let r">{{ r.objet | truncate:40 }}</td>
            </ng-container>

            <ng-container matColumnDef="partenaire">
              <th mat-header-cell *matHeaderCellDef>Service partenaire</th>
              <td mat-cell *matCellDef="let r">
                <span class="svc-chip">
                  {{ isEmis(r) ? r.recepteur?.nom : r.emetteur?.nom }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="requete">
              <th mat-header-cell *matHeaderCellDef>Requête liée</th>
              <td mat-cell *matCellDef="let r">
                <code style="font-size:.75rem">{{ r.requeteId ?? '—' }}</code>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let r">{{ r.dateCreation | dateFormat:'short' }}</td>
            </ng-container>

            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let r"><app-status-badge [status]="r.statut"/></td>
            </ng-container>

            <ng-container matColumnDef="reponse">
              <th mat-header-cell *matHeaderCellDef>Réponse</th>
              <td mat-cell *matCellDef="let r">
                @if (r.contenuReponse) {
                  <span class="rep-preview" [title]="r.contenuReponse">
                    {{ r.contenuReponse | truncate:40 }}
                  </span>
                } @else {
                  <span style="color:#94a3b8;font-size:.82rem">—</span>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;" class="table-row"></tr>
          </table>
        </div>
      </div>

    </app-main-layout>
  `,
  styles: [`
    .summary-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
    .sum-card { background:#fff; border-radius:12px; border:1px solid #e2e8f0; padding:18px;
                text-align:center; box-shadow:0 2px 8px rgba(26,60,110,.06);
                .sum-card__val { display:block; font-size:2rem; font-weight:700; color:#1e293b; }
                span:last-child { font-size:.8rem; color:#64748b; }
    }
    .sum-card--warn .sum-card__val { color:#f57f17; }
    .sum-card--ok   .sum-card__val { color:#2e7d32; }
    .sum-card--err  .sum-card__val { color:#c62828; }
    .table-wrapper { overflow-x:auto; }
    .ris-id { font-size:.78rem; color:#1a3c6e; background:#ebf2fa; padding:2px 8px; border-radius:4px; }
    .dir-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px;
                 border-radius:999px; font-size:.78rem; font-weight:600;
                 mat-icon { font-size:.85rem; width:.85rem; height:.85rem; } }
    .dir-badge--emis { background:#e3f2fd; color:#0277bd; }
    .dir-badge--recu { background:#e8f5e9; color:#2e7d32; }
    .svc-chip { background:#ebf2fa; color:#1a3c6e; padding:3px 10px;
                border-radius:6px; font-size:.78rem; font-weight:600; }
    .rep-preview { font-size:.78rem; color:#64748b; font-style:italic; }
    .table-row:hover { background:#fafbff; }
    @media(max-width:768px) { .summary-cards { grid-template-columns:repeat(2,1fr); } }
  `],
})
export class AgentTrackingComponent implements OnInit {
  private risSvc = inject(InterServiceRequestService);
  auth           = inject(AuthService);
  navItems       = AGENT_NAV;

  allRIS    = signal<InterServiceRequest[]>([]);
  filterCtrl= new FormControl('all');
  columns   = ['id', 'direction', 'objet', 'partenaire', 'requete', 'date', 'statut', 'reponse'];

  ngOnInit() {
    const svcId = this.auth.currentUser()?.serviceId;
    if (!svcId) return;
    Promise.all([
      this.risSvc.getByEmetteur(svcId).toPromise(),
      this.risSvc.getByRecepteur(svcId).toPromise(),
    ]).then(([em, re]) => {
      const combined = [...(em ?? []), ...(re ?? []).filter(r => !(em ?? []).find(e => e.id === r.id))];
      this.allRIS.set(combined);
    });
  }

  isEmis(r: InterServiceRequest): boolean {
    return r.emetteurId === this.auth.currentUser()?.serviceId;
  }

  filtered(): InterServiceRequest[] {
    const f = this.filterCtrl.value;
    if (f === 'emis')  return this.allRIS().filter(r => this.isEmis(r));
    if (f === 'recus') return this.allRIS().filter(r => !this.isEmis(r));
    return this.allRIS();
  }

  pending()  { return this.allRIS().filter(r => r.statut === RequestStatus.EN_ATTENTE).length; }
  accepted() { return this.allRIS().filter(r => r.statut === RequestStatus.TRAITE).length; }
  rejected() { return this.allRIS().filter(r => r.statut === RequestStatus.REJETE).length; }
  resolutionRate() {
    const total = this.allRIS().length;
    if (!total) return 0;
    return Math.round((this.accepted() / total) * 100);
  }
}
