import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { StatusBadgeComponent, EmptyStateComponent } from '../../../shared/components/ui.components';
import { DateFormatPipe, TruncatePipe } from '../../../shared/pipes';
import { AuthService } from '../../../core/services/auth.service';
import { AttachmentService, InterServiceRequestService, ISResponseService } from '../../../core/services/inter-attachment.services';
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
  selector:   'app-inter-service-response-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatDividerModule, MatProgressSpinnerModule, MatDialogModule,
    MainLayoutComponent, StatusBadgeComponent, EmptyStateComponent,
    DateFormatPipe, TruncatePipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Réponses Inter-Services">

      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/agent/dashboard">Dashboard</a>
          <span>/</span><span>Réponses inter-services</span>
        </div>
        <div class="page-header__top">
          <div>
            <h1 class="page-header__title">Réponses Inter-Services</h1>
            <p class="page-header__subtitle">
              Réponses reçues aux demandes que votre service a émises.
            </p>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
        <div class="stat-mini">
          <span class="v">{{ repondues().length }}</span>
          <span>Réponses reçues</span>
        </div>
        <div class="stat-mini ok">
          <span class="v">{{ acceptees() }}</span>
          <span>Acceptées</span>
        </div>
        <div class="stat-mini err">
          <span class="v">{{ rejetees() }}</span>
          <span>Rejetées</span>
        </div>
      </div>

      <!-- Tableau -->
      <div class="section-card">
        <div class="section-card__header">
          <span class="section-card__title">
            <mat-icon>reply_all</mat-icon> Réponses reçues
          </span>
        </div>

        @if (loading()) {
          <div class="spinner-center">
            <mat-progress-spinner mode="indeterminate" diameter="40"/>
          </div>
        } @else if (repondues().length === 0) {
          <app-empty-state icon="reply_all" title="Aucune réponse reçue"
                           subtitle="Les réponses à vos demandes inter-services apparaîtront ici."/>
        } @else {
          <div class="table-wrapper">
            <table mat-table [dataSource]="repondues()">

              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID Demande</th>
                <td mat-cell *matCellDef="let r">
                  <code class="ris-id">{{ r.id }}</code>
                </td>
              </ng-container>

              <ng-container matColumnDef="objet">
                <th mat-header-cell *matHeaderCellDef>Objet demandé</th>
                <td mat-cell *matCellDef="let r">{{ r.objet | truncate:40 }}</td>
              </ng-container>

              <ng-container matColumnDef="recepteur">
                <th mat-header-cell *matHeaderCellDef>Service répondant</th>
                <td mat-cell *matCellDef="let r">
                  <span class="svc-chip">{{ r.recepteurNom ?? '—' }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="dateReponse">
                <th mat-header-cell *matHeaderCellDef>Date réponse</th>
                <td mat-cell *matCellDef="let r">{{ r.reponse?.dateCreation | dateFormat:'short' }}</td>
              </ng-container>

              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Décision</th>
                <td mat-cell *matCellDef="let r"><app-status-badge [status]="r.statut"/></td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let r">
                  <button mat-stroked-button (click)="voirDetail(r)">
                    <mat-icon>visibility</mat-icon> Détail
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns;" class="table-row"></tr>
            </table>
          </div>
        }
      </div>

      <!-- Panel détail inline -->
      @if (selected()) {
        <div class="detail-panel">
          <div class="detail-panel__header">
            <h3>Détail de la réponse — <code>{{ selected()!.id }}</code></h3>
            <button mat-icon-button (click)="selected.set(null)"><mat-icon>close</mat-icon></button>
          </div>

          <div class="info-rows">
            <div class="info-row">
              <span>Objet de la demande</span>
              <strong>{{ selected()!.objet }}</strong>
            </div>
            <div class="info-row">
              <span>Infos demandées</span>
              <span>{{ selected()!.infosDemandees }}</span>
            </div>
            <div class="info-row">
              <span>Service répondant</span>
              <span class="svc-chip">{{ selected()!.recepteurNom }}</span>
            </div>
            <div class="info-row">
              <span>Date de réponse</span>
              <span>{{ selected()!.reponse?.dateCreation | dateFormat }}</span>
            </div>
            <div class="info-row">
              <span>Décision</span>
              <app-status-badge [status]="selected()!.statut"/>
            </div>
          </div>

          <mat-divider style="margin:16px 0"/>

          <h4 style="font-size:.9rem;font-weight:700;margin-bottom:10px">Contenu de la réponse</h4>
          <div class="contenu-box">
            {{ selected()!.reponse?.contenu }}
          </div>

          <mat-divider style="margin:16px 0"/>

          @if (selected()!.reponse?.pieceJointes?.length) {
              <mat-divider style="margin:14px 0"/>
              <h3 class="sub-title">Pièces jointes de la reponse</h3>
              <div class="pj-list">
                @for (pj of selected()!.reponse?.pieceJointes!; track pj.id) {
                  <div class="pj-item">
                    <mat-icon>attach_file</mat-icon>
                    <span style="flex:1;font-size:.875rem">{{ pj.nomFichier }}</span>
                    
                    <button mat-stroked-button
                        (click)="preview(pj.id)"
                        matTooltip="Visualiser">
                      <mat-icon>visibility</mat-icon>Ouvrir
                    </button>
                    <button mat-stroked-button (click)="download(pj.id, pj.nomFichier)">
                      <mat-icon>download</mat-icon>Telecharger
                    </button>
                  </div>
                }
              </div>
          }
          
          <mat-divider style="margin:16px 0"/>

          @if (selected()!.requeteId) {
            <div class="linked-req">
              <mat-icon>link</mat-icon>
              Requête étudiante liée :
              <a [routerLink]="['/agent/requests', selected()!.requeteId, 'respond']">
                {{ selected()!.requeteId }}
              </a>
            </div>
          }
        </div>
      }

    </app-main-layout>
  `,
  styles: [`
    .stat-mini { background:#fff; border-radius:12px; border:1px solid #e2e8f0; padding:16px;
                 text-align:center; box-shadow:0 2px 8px rgba(26,60,110,.06);
                 .v { display:block; font-size:1.8rem; font-weight:700; color:#1e293b; }
                 span:last-child { font-size:.8rem; color:#64748b; }
    }
    .stat-mini.ok  .v { color:#2e7d32; }
    .stat-mini.err .v { color:#c62828; }
    .table-wrapper { overflow-x:auto; }
    .ris-id { font-size:.78rem; color:#1a3c6e; background:#ebf2fa; padding:2px 8px; border-radius:4px; }
    .svc-chip { background:#ebf2fa; color:#1a3c6e; padding:3px 10px;
                border-radius:6px; font-size:.78rem; font-weight:600; }
    .table-row:hover { background:#fafbff; cursor:pointer; }
    .spinner-center { display:flex; justify-content:center; padding:40px; }

    .pj-list { display:flex; flex-direction:column; gap:6px; }
    .pj-item { display:flex; align-items:center; gap:8px; padding:8px 12px;
               background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; }
    .detail-panel {
      margin-top:24px; background:#fff; border-radius:14px; border:1px solid #e2e8f0;
      padding:24px; box-shadow:0 4px 16px rgba(26,60,110,.08);
    }
    .detail-panel__header { display:flex; align-items:center; justify-content:space-between;
                             margin-bottom:16px;
                             h3 { font-size:1rem; font-weight:700; } }
    .info-rows { display:flex; flex-direction:column; }
    .info-row { display:flex; align-items:center; gap:16px; padding:9px 0;
                border-bottom:1px solid #e2e8f0; font-size:.875rem;
                span:first-child { width:160px; color:#64748b; font-weight:500; flex-shrink:0; }
                &:last-child { border-bottom:none; } }
    .contenu-box { background:#f8fafc; border-radius:10px; padding:16px;
                   border:1px solid #e2e8f0; font-size:.875rem; line-height:1.8; }
    .linked-req { display:flex; align-items:center; gap:6px; margin-top:14px;
                  font-size:.85rem; color:#64748b;
                  mat-icon { font-size:1rem; width:1rem; height:1rem; }
                  a { color:#1a3c6e; font-weight:600; } }
  `],
})
export class InterServiceResponseListComponent implements OnInit {
  private risSvc = inject(InterServiceRequestService);
  private respSvc = inject(ISResponseService);
  private attSvc  = inject(AttachmentService);
  auth           = inject(AuthService);
  navItems       = AGENT_NAV;

  allEmis  = signal<InterServiceRequest[]>([]);
  loading  = signal(true);
  selected = signal<InterServiceRequest | null>(null);
  columns  = ['id', 'objet', 'recepteur', 'dateReponse', 'statut', 'actions'];

  ngOnInit() {
    const svcId = this.auth.currentUser()?.service?.id;
    if (!svcId) { this.loading.set(false); return; }
    this.risSvc.getByEmetteur(svcId).subscribe({
      next: ris => { 
        this.allEmis.set(ris);
        for(let r of ris){
          this.respSvc.getByRequest(r.id).subscribe({
            next: re => {
              this.attSvc.getByIsRep(re.id).subscribe({
                next: pj => {
                  re.pieceJointes = pj;
                  console.log("pj :", pj);
                }
              })
              r.reponse = re;
            }
          })
        }
        this.allEmis.set(ris);
        this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  download(id: number, name: string) {
    this.attSvc.download(id).subscribe(b => this.attSvc.triggerDownload(b, name));
  }

  preview(id: number) {
    this.attSvc.getPreviewUrl(id).subscribe(b =>{
      const url = URL.createObjectURL(b);
      window.open(url, '_blank');
    })
    
  }

  repondues()  { return this.allEmis().filter(r => !!r.reponse); }
  acceptees()  { return this.repondues().filter(r => r.statut === RequestStatus.TRAITE).length; }
  rejetees()   { return this.repondues().filter(r => r.statut === RequestStatus.REJETE).length; }

  voirDetail(r: InterServiceRequest) {
    this.selected.set(this.selected()?.id === r.id ? null : r);
  }
}
