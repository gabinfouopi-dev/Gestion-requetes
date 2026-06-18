// ═══ response-list.component.ts ═════════════════════════════════════════════
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { EmptyStateComponent } from '../../../shared/components/ui.components';
import { DateFormatPipe, TruncatePipe } from '../../../shared/pipes';
import { StudentState } from '../student.state';
import { AttachmentService } from '../../../core/services/inter-attachment.services';
import { Response, Attachment } from '../../../core/models';

const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard',    icon: 'dashboard',       route: '/student/dashboard' },
  { label: 'Mes requêtes', icon: 'description',     route: '/student/requests' },
  { label: 'Mes réponses', icon: 'mark_email_read', route: '/student/responses' },
  { label: 'Suivi',        icon: 'timeline',        route: '/student/tracking' },
];

@Component({
  selector:   'app-response-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatChipsModule, MatProgressSpinnerModule,
    MainLayoutComponent, EmptyStateComponent, DateFormatPipe, TruncatePipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Mes Réponses">
      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/student/dashboard">Accueil</a><span>/</span><span>Mes réponses</span>
        </div>
        <h1 class="page-header__title">Mes Réponses</h1>
        <p class="page-header__subtitle">Réponses de l'administration à vos requêtes.</p>
      </div>

      <!-- Stats rapides -->
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
        <div class="stat-mini"><span class="stat-mini__val">{{ state.responses().length }}</span><span>Réponses reçues</span></div>
        <div class="stat-mini"><span class="stat-mini__val">{{ withPJ() }}</span><span>Avec pièces jointes</span></div>
        <div class="stat-mini warn"><span class="stat-mini__val">{{ state.pendingCount() }}</span><span>Requêtes sans réponse</span></div>
      </div>

      <div class="section-card">
        <div class="section-card__header">
          <span class="section-card__title"><mat-icon>inbox</mat-icon>Réponses reçues</span>
        </div>

        @if (state.responses().length === 0) {
          <app-empty-state icon="mark_email_read" title="Aucune réponse"
                           subtitle="Vos réponses apparaîtront ici une fois vos requêtes traitées."/>
        } @else {
          <div class="table-wrapper">
            <table mat-table [dataSource]="state.responses()">

              <ng-container matColumnDef="titre">
                <th mat-header-cell *matHeaderCellDef>Titre</th>
                <td mat-cell *matCellDef="let r"><span class="fw-600">{{ r.titre }}</span></td>
              </ng-container>

              <ng-container matColumnDef="requete">
                <th mat-header-cell *matHeaderCellDef>Requête concernée</th>
                <td mat-cell *matCellDef="let r">
                  <code class="req-id">{{ r.requeteId }}</code>
                </td>
              </ng-container>

              <ng-container matColumnDef="auteur">
                <th mat-header-cell *matHeaderCellDef>Répondu par</th>
                <td mat-cell *matCellDef="let r">
                  {{ r.auteur?.prenom}} {{ r.auteur?.nom}}
                </td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let r">{{ r.dateCreation | dateFormat:'short' }}</td>
              </ng-container>

              <ng-container matColumnDef="pj">
                <th mat-header-cell *matHeaderCellDef>PJ</th>
                <td mat-cell *matCellDef="let r">
                  @if (r.pieceJointes?.length) {
                    <span class="pj-badge">
                      <mat-icon>attach_file</mat-icon>{{ r.pieceJointes.length }}
                    </span>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let r">
                  <button mat-raised-button color="primary" [routerLink]="['/student/responses', r.id]">
                    <mat-icon>visibility</mat-icon> Consulter
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns;"></tr>
            </table>
          </div>
        }
      </div>
    </app-main-layout>
  `,
  styles: [`
    .stat-mini { background:#fff; border-radius:12px; border:1px solid #e2e8f0;
                 padding:18px; text-align:center; box-shadow:0 2px 8px rgba(26,60,110,.06);
                 display:flex; flex-direction:column; gap:4px;
                 span:last-child { font-size:.82rem; color:#64748b; }
    }
    .stat-mini__val { font-size:2rem; font-weight:700; color:#1e293b; }
    .stat-mini.warn .stat-mini__val { color:#f57f17; }
    .table-wrapper { overflow-x:auto; }
    .req-id { font-size:.78rem; color:#1a3c6e; background:#ebf2fa; padding:2px 8px; border-radius:4px; }
    .fw-600 { font-weight:600; }
    .pj-badge { display:inline-flex; align-items:center; gap:3px; font-size:.8rem;
                color:#1a3c6e; background:#ebf2fa; padding:2px 8px; border-radius:999px;
                mat-icon { font-size:.9rem; width:.9rem; height:.9rem; } }
  `],
})
export class ResponseListComponent implements OnInit {
  state    = inject(StudentState);
  navItems = STUDENT_NAV;
  columns  = ['titre', 'requete', 'auteur', 'date', 'pj', 'actions'];

  ngOnInit() {
    this.state.loadResponses();
    this.state.loadRequests();
  }

  withPJ(): number {
    return this.state.responses().filter(r => r.pieceJointes?.length).length;
  }
}

// ═══ response-detail.component.ts ════════════════════════════════════════════
import { ActivatedRoute } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { ResponseService } from '../../../core/services/domain.services';

@Component({
  selector:   'app-response-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatProgressSpinnerModule,
    MainLayoutComponent, DateFormatPipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Détail de la réponse">
      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/student/responses">Mes réponses</a>
          <span>/</span><span>Détail</span>
        </div>
        <div class="page-header__top">
          <h1 class="page-header__title">Détail de la réponse</h1>
          <button mat-stroked-button routerLink="/student/responses">
            <mat-icon>arrow_back</mat-icon> Retour
          </button>
        </div>
      </div>

      @if (loading()) {
        <div style="display:flex;justify-content:center;padding:40px">
          <mat-progress-spinner mode="indeterminate" diameter="40"/>
        </div>
      } @else if (response()) {
        <mat-card style="max-width:800px">
          <mat-card-header>
            <mat-card-title style="display:flex;align-items:center;gap:10px">
              <mat-icon color="accent">mark_email_read</mat-icon>
              {{ response()!.titre }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-rows">
              <div class="info-row">
                <span>Requête</span>
                <code style="font-size:.84rem;color:#1a3c6e">{{ response()!.requeteId }}</code>
              </div>
              <div class="info-row">
                <span>Répondu par</span>
                <span>{{ response()!.auteurNom }}</span>
              </div>
              <div class="info-row">
                <span>Date</span>
                <span>{{ response()!.dateCreation | dateFormat }}</span>
              </div>
            </div>
            <mat-divider style="margin:16px 0"/>
            <div class="contenu-box">
              <p>{{ response()!.contenu }}</p>
            </div>
            @if (response()!.pieceJointes?.length) {
              <mat-divider style="margin:16px 0"/>
              <h3 style="font-size:.95rem;font-weight:700;margin-bottom:12px">Pièces jointes</h3>
              <div class="pj-list">
                @for (pj of response()!.pieceJointes!; track pj.id) {
                  <div class="pj-item">
                    <mat-icon>attach_file</mat-icon>
                    <span style="flex:1;font-size:.875rem">{{ pj.nomFichier }}</span>
                    <button mat-stroked-button
                          (click)="preview(pj.id)"
                          matTooltip="Visualiser">
                        <mat-icon>visibility</mat-icon> Ouvrir
                    </button>
                    <button mat-stroked-button (click)="download(pj)">
                      <mat-icon>download</mat-icon> Télécharger
                    </button>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      }
    </app-main-layout>
  `,
  styles: [`
    .info-rows { display:flex; flex-direction:column; }
    .info-row { display:flex; align-items:center; gap:16px; padding:10px 0;
                border-bottom:1px solid #e2e8f0; font-size:.875rem;
                span:first-child { width:130px; color:#64748b; font-weight:500; flex-shrink:0; } }
    .contenu-box { background:#f8fafc; border-radius:10px; padding:18px;
                   border:1px solid #e2e8f0; font-size:.875rem; line-height:1.8; }
    .pj-list { display:flex; flex-direction:column; gap:6px; }
    .pj-item { display:flex; align-items:center; gap:10px; padding:10px 14px;
               background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; }
  `],
})
export class ResponseDetailComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private respSvc = inject(ResponseService);
  private attSvc  = inject(AttachmentService);

  response = signal<Response | null>(null);
  loading  = signal(true);
  navItems = STUDENT_NAV;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.respSvc.getById(id).subscribe({
      next: r => { 
        this.response.set(r);
        this.attSvc.getByRep(r.id).subscribe({
          next: pj => {
            r.pieceJointes = pj;
            this.response.set(r);
          }
        })
        this.loading.set(false); 
      },
      error: () => this.loading.set(false),
    });
  }

  download(pj: Attachment) {
    this.attSvc.download(pj.id).subscribe(blob => this.attSvc.triggerDownload(blob, pj.nomFichier));
  }

  preview(id: number) {
    this.attSvc.getPreviewUrl(id).subscribe(b =>{
      const url = URL.createObjectURL(b);
      window.open(url, '_blank');
    })
  }

}
