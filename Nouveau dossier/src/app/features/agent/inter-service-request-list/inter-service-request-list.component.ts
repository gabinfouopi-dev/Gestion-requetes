// ═══ inter-service-request-list.component.ts ════════════════════════════════
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { switchMap, of, forkJoin } from 'rxjs';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { StatusBadgeComponent, EmptyStateComponent } from '../../../shared/components/ui.components';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';
import { DateFormatPipe, TruncatePipe } from '../../../shared/pipes';
import { AgentState } from '../agent.state';
import { AuthService } from '../../../core/services/auth.service';
import { InterServiceRequestService, AttachmentService } from '../../../core/services/inter-attachment.services';
import { ServiceService } from '../../../core/services/domain.services';
import { RequestService } from '../../../core/services/request.service';
import { InterServiceRequest, ServiceModel, Request } from '../../../core/models';
import { RequestStatus } from '../../../core/enums/request-status.enum';

const AGENT_NAV: NavItem[] = [
  { label: 'Dashboard',        icon: 'dashboard',      route: '/agent/dashboard' },
  { label: 'Requêtes service', icon: 'inbox',          route: '/agent/requests' },
  { label: 'Inter-services',   icon: 'compare_arrows', route: '/agent/inter-services' },
  { label: 'Réponses IS',      icon: 'reply_all',      route: '/agent/inter-service-responses' },
  { label: 'Suivi',            icon: 'timeline',       route: '/agent/tracking' },
];

@Component({
  selector:   'app-inter-service-request-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatTabsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule,
    MatProgressSpinnerModule, MatDividerModule, MatTooltipModule,
    MainLayoutComponent, StatusBadgeComponent, EmptyStateComponent,
    FileUploadComponent, DateFormatPipe, TruncatePipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Requêtes Inter-Services">

      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/agent/dashboard">Dashboard</a><span>/</span><span>Inter-services</span>
        </div>
        <div class="page-header__top">
          <div>
            <h1 class="page-header__title">Requêtes Inter-Services</h1>
            <p class="page-header__subtitle">Demandes émises et reçues entre services.</p>
          </div>
          <button mat-raised-button color="primary" (click)="showCreate = !showCreate">
            <mat-icon>add</mat-icon> Nouvelle demande
          </button>
        </div>
      </div>

      <!-- Stats rapides -->
      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px">
        <div class="stat-mini"><span class="v">{{ total() }}</span><span>Total</span></div>
        <div class="stat-mini warn"><span class="v">{{ pending() }}</span><span>En attente</span></div>
        <div class="stat-mini ok"><span class="v">{{ accepted() }}</span><span>Acceptées</span></div>
        <div class="stat-mini err"><span class="v">{{ rejected() }}</span><span>Rejetées</span></div>
      </div>

      <!-- Formulaire de création (inline toggle) -->
      @if (showCreate) {
        <mat-card class="create-form-card" style="margin-bottom:24px">
          <mat-card-header>
            <mat-card-title><mat-icon>compare_arrows</mat-icon> Nouvelle demande inter-service</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="createForm" novalidate>
              <div class="form-grid">
                <mat-form-field>
                  <mat-label>Service destinataire *</mat-label>
                  <mat-select formControlName="recepteurId">
                    <mat-option value="">-- Sélectionner --</mat-option>
                    @for (s of otherServices(); track s.id) {
                      <mat-option [value]="s.id">{{ s.nom }}</mat-option>
                    }
                  </mat-select>
                  @if (createForm.get('recepteurId')?.hasError('required') && createForm.get('recepteurId')?.touched) {
                    <mat-error>Requis</mat-error>
                  }
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Requête d'origine</mat-label>
                  <mat-select formControlName="requeteId">
                    <mat-option value="">-- Aucune --</mat-option>
                    @for (r of otherRequetesServices(); track r.id) {
                      <mat-option [value]="r.id">{{ r.id }} — {{ r.objet | truncate:40 }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field class="span2">
                  <mat-label>Objet *</mat-label>
                  <input matInput formControlName="objet" placeholder="Ex: Vérification des crédits"/>
                  @if (createForm.get('objet')?.hasError('required') && createForm.get('objet')?.touched) {
                    <mat-error>Requis</mat-error>
                  }
                </mat-form-field>

                <mat-form-field class="span2">
                  <mat-label>Description *</mat-label>
                  <textarea matInput formControlName="description" rows="3"
                            placeholder="Contexte de la demande…"></textarea>
                </mat-form-field>

                <mat-form-field class="span2">
                  <mat-label>Informations demandées *</mat-label>
                  <textarea matInput formControlName="infosDemandees" rows="3"
                            placeholder="Listez précisément les informations nécessaires…"></textarea>
                  @if (createForm.get('infosDemandees')?.hasError('required') && createForm.get('infosDemandees')?.touched) {
                    <mat-error>Requis</mat-error>
                  }
                </mat-form-field>
              </div>

              <app-file-upload
                    acceptLabel="PDF, DOC, JPG, PNG"
                    [maxSizeMb]="5"
                    (filesChange)="onFilesChange($event)"/>

              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="showCreate = false">Annuler</button>
                <button mat-raised-button color="primary" type="button"
                        (click)="envoyerDemande()" [disabled]="creating()">
                  @if (creating()) { <mat-progress-spinner diameter="18" mode="indeterminate"/> }
                  @else { <mat-icon>send</mat-icon> }
                  Envoyer
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      <!-- Onglets Émises / Reçues -->
      <mat-tab-group>

        <!-- Émises -->
        <mat-tab label="Émises par mon service">
          <div class="tab-content">
            <div class="section-card">
              <div class="section-card__header">
                <span class="section-card__title"><mat-icon>send</mat-icon>Demandes émises</span>
              </div>
              @if (emises().length === 0) {
                <app-empty-state icon="send" title="Aucune demande émise"/>
              } @else {
                <div class="table-wrapper">
                  <table mat-table [dataSource]="emises()">
                    <ng-container matColumnDef="id">
                      <th mat-header-cell *matHeaderCellDef>ID</th>
                      <td mat-cell *matCellDef="let r"><code class="ris-id">{{ r.id }}</code></td>
                    </ng-container>
                    <ng-container matColumnDef="auteur">
                      <th mat-header-cell *matHeaderCellDef>Auteur</th>
                      <td mat-cell *matCellDef="let r">
                        <div class="user-mini">
                          <div class="user-mini__avatar">
                            {{ initials(r.auteurNom) }}
                          </div>
                          <div>
                            <div class="user-mini__name">
                              {{ r.auteurNom }}
                            </div>
                          
                          </div>
                        </div>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="objet">
                      <th mat-header-cell *matHeaderCellDef>Objet</th>
                      <td mat-cell *matCellDef="let r">{{ r.objet | truncate:40 }}</td>
                    </ng-container>
                    <ng-container matColumnDef="recepteur">
                      <th mat-header-cell *matHeaderCellDef>Vers</th>
                      <td mat-cell *matCellDef="let r">
                        <span class="svc-badge">{{ r.recepteurNom ?? '—' }}</span>
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
                    <tr mat-header-row *matHeaderRowDef="emisCols"></tr>
                    <tr mat-row *matRowDef="let row; columns: emisCols;"></tr>
                  </table>
                </div>
              }
            </div>
          </div>
        </mat-tab>

        <!-- Reçues -->
        <mat-tab label="Reçues par mon service">
          <div class="tab-content">
            <div class="section-card">
              <div class="section-card__header">
                <span class="section-card__title"><mat-icon>inbox</mat-icon>Demandes reçues</span>
              </div>
              @if (recues().length === 0) {
                <app-empty-state icon="inbox" title="Aucune demande reçue"/>
              } @else {
                <div class="table-wrapper">
                  <table mat-table [dataSource]="recues()">
                    <ng-container matColumnDef="id">
                      <th mat-header-cell *matHeaderCellDef>ID</th>
                      <td mat-cell *matCellDef="let r"><code class="ris-id">{{ r.id }}</code></td>
                    </ng-container>
                    <ng-container matColumnDef="objet">
                      <th mat-header-cell *matHeaderCellDef>Objet</th>
                      <td mat-cell *matCellDef="let r">{{ r.objet | truncate:35 }}</td>
                    </ng-container>
                    <ng-container matColumnDef="emetteur">
                      <th mat-header-cell *matHeaderCellDef>De</th>
                      <td mat-cell *matCellDef="let r">
                        <span class="svc-badge">{{ r.emetteurNom ?? '—' }}</span>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="infos">
                      <th mat-header-cell *matHeaderCellDef>Infos demandées</th>
                      <td mat-cell *matCellDef="let r" style="max-width:200px;font-size:.8rem">
                        {{ r.infosDemandees | truncate:55 }}
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
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      
                      <td mat-cell *matCellDef="let r">
                        
                        @if (!(r.statut === pendingStatus) ) {
                          <button mat-raised-button color="primary"
                                  [routerLink]="['/agent/inter-request', r.id, 'respond']">>
                            <mat-icon>reply</mat-icon> Répondre
                          </button>
                        }
                        
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="recuesCols"></tr>
                    <tr mat-row *matRowDef="let row; columns: recuesCols;"></tr>
                  </table>
                </div>
              }
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>


    </app-main-layout>
  `,
  styles: [`
    .stat-mini { background:#fff; border-radius:12px; border:1px solid #e2e8f0; padding:16px;
                 text-align:center; box-shadow:0 2px 8px rgba(26,60,110,.06);
                 .v { display:block; font-size:1.8rem; font-weight:700; color:#1e293b; }
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
    .stat-mini.warn .v { color:#f57f17; }
    .stat-mini.ok   .v { color:#2e7d32; }
    .stat-mini.err  .v { color:#c62828; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
    .span2 { grid-column:1/-1; }
    .form-actions { display:flex; gap:10px; margin-top:12px; }
    .tab-content { padding-top:16px; }
    .table-wrapper { overflow-x:auto; }
    .ris-id { font-size:.78rem; color:#1a3c6e; background:#ebf2fa; padding:2px 8px; border-radius:4px; }
    .svc-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px;
                 background:#ebf2fa; color:#1a3c6e; border-radius:6px; font-size:.78rem; font-weight:600; }
    .full-width { width:100%; }
    .infos-asked { background:#f8fafc; border-radius:8px; padding:14px; margin-bottom:14px;
                   border:1px solid #e2e8f0; }
    .infos-label { font-size:.82rem; font-weight:600; color:#64748b; margin-bottom:6px; }
    @media(max-width:600px) { .form-grid { grid-template-columns:1fr; } }
  `],
})
export class InterServiceRequestListComponent implements OnInit {
  private risSvc  = inject(InterServiceRequestService);
  private svcSvc  = inject(ServiceService);
  private reqSvc  = inject(RequestService);
  private attSvc  = inject(AttachmentService);
  private snack   = inject(MatSnackBar);
  private fb      = inject(FormBuilder);
  auth            = inject(AuthService);
  state           = inject(AgentState);

  navItems        = AGENT_NAV;
  allRIS          = signal<InterServiceRequest[]>([]);
  allServices     = signal<ServiceModel[]>([]);
  serviceRequests = signal<Request[]>([]);
  risToReply      = signal<InterServiceRequest | null>(null);
  showCreate      = false;
  creating        = signal(false);
  replyingRIS     = signal(false);
  // createFiles     = signal<File[]>([]);
  selectedFiles= signal<File[]>([]);
  readonly pendingStatus = RequestStatus.TRAITE;

  emisCols  = ['id', 'auteur', 'objet', 'recepteur', 'requete', 'date', 'statut'];
  recuesCols= ['id', 'objet', 'emetteur', 'infos', 'date', 'statut', 'actions'];

  createForm = this.fb.group({
    recepteurId:    [null as number | null, Validators.required],
    requeteId:      [null as number | null],
    objet:          ['', Validators.required],
    description:    ['', Validators.required],
    infosDemandees: ['', Validators.required],
  });

  replyForm = this.fb.group({
    contenuReponse: ['', Validators.required],
    statut:         ['TRAITE'],
  });

  ngOnInit() {
    const svcId = this.auth.currentUser()?.service?.id;
    if (!svcId) return;
    this.svcSvc.getAll().subscribe(s => this.allServices.set(s));
    this.reqSvc.getByService(svcId).subscribe(r => this.serviceRequests.set(r));
    this.loadRIS(svcId);
  }

  initials(nom?: string): string {
    return `${(nom?.[0] ?? '')}`.toUpperCase();
  }

  onFilesChange(files: File[]) {
    this.selectedFiles.set(files);
  }

  loadRIS(svcId: number) {
    forkJoin([
      this.risSvc.getByEmetteur(svcId),
      this.risSvc.getByRecepteur(svcId),
    ]).subscribe(([em, re]) => {
      const combined = [...em, ...re.filter(r => !em.find(e => e.id === r.id))];
      this.allRIS.set(combined);
    });
  }

  otherServices() {
    const svcId = this.auth.currentUser()?.service?.id;
    return this.allServices().filter(s => s.id !== svcId);
  }

  otherRequetesServices() {
    return this.serviceRequests();
  }

  emises() {
    return this.allRIS().filter(r => r.emetteurId === this.auth.currentUser()?.service?.id);
  }

  recues() {
    return this.allRIS().filter(r => r.recepteurId === this.auth.currentUser()?.service?.id);
  }

  total()    { return this.allRIS().length; }
  pending()  { return this.allRIS().filter(r => r.statut === RequestStatus.EN_ATTENTE).length; }
  accepted() { return this.allRIS().filter(r => r.statut === RequestStatus.TRAITE).length; }
  rejected() { return this.allRIS().filter(r => r.statut === RequestStatus.REJETE).length; }

  envoyerDemande() {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.creating.set(true);
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.creating.set(true);
    const serviceId = this.auth.currentUser()?.service?.id;
    if (!serviceId) return;
    const dto = {
      objet:           this.createForm.value.objet!,
      description:     this.createForm.value.description!,
      infosDemandees:  this.createForm.value.infosDemandees!,
      recepteurId:     this.createForm.value.recepteurId!,
      requeteId:       this.createForm.value.requeteId || undefined,
      auteurId:        userId,
      emetteurId:  serviceId,
    };
    this.risSvc.create(dto).pipe(
      switchMap(ris => {
        // Upload des pièces jointes si présentes
        if (this.selectedFiles().length === 0) return of(ris);
        const uploads = this.selectedFiles().map(f =>
          this.attSvc.upload(f, { risId: ris.id })
        );
        return forkJoin(uploads).pipe(switchMap(() => of(ris)));
      })
    ).subscribe({
      next: ris => {
        
        this.allRIS.update(list => [ris, ...list]);
        this.creating.set(false);
        this.showCreate = false;
        this.createForm.reset();
        this.snack.open('Demande inter-service envoyée !', '', { duration: 3000 });
      },
      error: () => {
        this.creating.set(false);
        this.snack.open('Erreur lors de l\'envoi.', '', { duration: 3000 });
      },
    });
  }

}
