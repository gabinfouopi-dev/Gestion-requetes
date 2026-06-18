import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, of } from 'rxjs';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { StatusBadgeComponent } from '../../../shared/components/ui.components';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';
import { DateFormatPipe } from '../../../shared/pipes';
import { AgentState } from '../agent.state';
import { RequestService } from '../../../core/services/request.service';
import { ResponseService } from '../../../core/services/domain.services';
import { AttachmentService } from '../../../core/services/inter-attachment.services';
import { AuthService } from '../../../core/services/auth.service';
import { Request } from '../../../core/models';
import { RequestStatus } from '../../../core/enums/request-status.enum';
import { forkJoin } from 'rxjs';

const AGENT_NAV: NavItem[] = [
  { label: 'Dashboard',        icon: 'dashboard',      route: '/agent/dashboard' },
  { label: 'Requêtes service', icon: 'inbox',          route: '/agent/requests' },
  { label: 'Inter-services',   icon: 'compare_arrows', route: '/agent/inter-services' },
  { label: 'Réponses IS',      icon: 'reply_all',      route: '/agent/inter-service-responses' },
  { label: 'Suivi',            icon: 'timeline',       route: '/agent/tracking' },
];

@Component({
  selector:   'app-request-response-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDividerModule, MatProgressSpinnerModule,
    MainLayoutComponent, StatusBadgeComponent,
    FileUploadComponent, DateFormatPipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Traiter la Requête">

      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/agent/requests">Requêtes</a>
          <span>/</span><span>Traiter</span>
        </div>
        <div class="page-header__top">
          <h1 class="page-header__title">Traiter la Requête</h1>
          <button mat-stroked-button routerLink="/agent/requests">
            <mat-icon>arrow_back</mat-icon> Retour
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="spinner-center">
          <mat-progress-spinner mode="indeterminate" diameter="40"/>
        </div>
      } @else if (request()) {

        <div class="two-col">

          <!-- Colonne gauche : détail requête -->
          <div>
            <mat-card class="req-card">
              <mat-card-header>
                <mat-card-title class="req-header">
                  <code class="req-id">{{ request()!.id }}</code>
                  <app-status-badge [status]="request()!.statut"/>
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-rows">
                  <div class="info-row"><span>Objet</span><strong>{{ request()!.objet }}</strong></div>
                  <div class="info-row"><span>Étudiant</span>
                    <span>{{ request()!.utilisateur?.prenom }} {{ request()!.utilisateur?.nom }}
                      
                    </span>
                  </div>
                  <div class="info-row"><span>Catégorie</span><span>{{ request()!.categorie?.nom }}</span></div>
                  <div class="info-row"><span>Soumise le</span><span>{{ request()!.dateSoumission | dateFormat }}</span></div>
                  <div class="info-row info-row--block">
                    <span>Description</span>
                    <p>{{ request()!.description }}</p>
                  </div>
                </div>

                @if (request()!.pieceJointes?.length) {
                  <mat-divider style="margin:14px 0"/>
                  <h3 class="sub-title">Pièces jointes de l'étudiant</h3>
                  <div class="pj-list">
                    @for (pj of request()!.pieceJointes!; track pj.id) {
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

                <!-- Changer statut -->
                <mat-divider style="margin:16px 0"/>
                <h3 class="sub-title">Changer le statut</h3>
                <div class="status-change-row">
                  <mat-form-field style="flex:1">
                    <mat-label>Nouveau statut</mat-label>
                    <mat-select [formControl]="statusCtrl">
                      @for (s of statusOptions; track s.value) {
                        <mat-option [value]="s.value">{{ s.label }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <button mat-raised-button (click)="saveStatus()"
                          [disabled]="savingStatus()">
                    @if (savingStatus()) {
                      <mat-progress-spinner diameter="18" mode="indeterminate"/>
                    } @else {
                      <mat-icon>swap_horiz</mat-icon>
                    }
                    Appliquer
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Colonne droite : formulaire de réponse -->
          <div>
            @if (request()!.reponse) {
              <mat-card class="already-replied">
                <mat-card-header>
                  <mat-card-title style="color:#2e7d32">
                    <mat-icon>check_circle</mat-icon> Déjà répondu
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p class="replied-titre">{{ request()!.reponse!.titre }}</p>
                  <p class="replied-date">{{ request()!.reponse!.dateCreation | dateFormat }}</p>
                  <mat-divider style="margin:10px 0"/>
                  <p style="font-size:.875rem;line-height:1.8">{{ request()!.reponse!.contenu }}</p>
                </mat-card-content>
              </mat-card>
            } @else {
              <mat-card>
                <mat-card-header>
                  <mat-card-title><mat-icon>reply</mat-icon> Rédiger une réponse</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="reponseForm" novalidate>

                    <mat-form-field class="full-width">
                      <mat-label>Titre de la réponse <span style="color:#c62828">*</span></mat-label>
                      <input matInput formControlName="titre"
                             placeholder="Ex: Relevé de notes disponible"/>
                      @if (reponseForm.get('titre')?.hasError('required') && reponseForm.get('titre')?.touched) {
                        <mat-error>Le titre est requis</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field class="full-width">
                      <mat-label>Contenu <span style="color:#c62828">*</span></mat-label>
                      <textarea matInput formControlName="contenu" rows="6"
                                placeholder="Rédigez votre réponse détaillée…"></textarea>
                      @if (reponseForm.get('contenu')?.hasError('required') && reponseForm.get('contenu')?.touched) {
                        <mat-error>Le contenu est requis</mat-error>
                      }
                    </mat-form-field>

                    <p class="pj-label">Pièces jointes (optionnel)</p>
                    <app-file-upload (filesChange)="onFilesChange($event)"/>

                    <div class="form-actions">
                      <button mat-raised-button color="primary"
                              type="button" (click)="envoyerReponse()"
                              [disabled]="submitting()">
                        @if (submitting()) {
                          <mat-progress-spinner diameter="18" mode="indeterminate"/>
                        } @else {
                          <mat-icon>send</mat-icon>
                        }
                        Envoyer la réponse
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }
          </div>

        </div>
      }
    </app-main-layout>
  `,
  styles: [`
    .spinner-center { display:flex; justify-content:center; padding:40px; }
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start; }
    .req-header { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .req-id { font-size:.82rem; color:#1a3c6e; background:#ebf2fa; padding:2px 8px; border-radius:4px; }
    .info-rows { display:flex; flex-direction:column; }
    .info-row { display:flex; align-items:center; gap:12px; padding:9px 0;
                border-bottom:1px solid #e2e8f0; font-size:.875rem;
                span:first-child { width:110px; color:#64748b; font-weight:500; flex-shrink:0; } }
    .info-row:last-child { border-bottom:none; }
    .info-row--block { flex-direction:column; align-items:flex-start; gap:4px;
                       span:first-child { width:auto; } }
    .sub-title { font-size:.9rem; font-weight:700; margin-bottom:10px; }
    .pj-list { display:flex; flex-direction:column; gap:6px; }
    .pj-item { display:flex; align-items:center; gap:8px; padding:8px 12px;
               background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; }
    .status-change-row { display:flex; align-items:center; gap:12px; }
    .full-width { width:100%; }
    .pj-label { font-size:.85rem; font-weight:500; margin-bottom:8px; color:#1e293b; }
    .form-actions { margin-top:16px; }
    .already-replied { background:#e8f5e9 !important; }
    .replied-titre { font-weight:700; font-size:1rem; margin-bottom:4px; }
    .replied-date  { font-size:.78rem; color:#64748b; }
    @media(max-width:900px) { .two-col { grid-template-columns:1fr; } }
  `],
})
export class RequestResponseFormComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private fb      = inject(FormBuilder);
  private reqSvc  = inject(RequestService);
  private respSvc = inject(ResponseService);
  private attSvc  = inject(AttachmentService);
  private snack   = inject(MatSnackBar);
  private auth    = inject(AuthService);
  state           = inject(AgentState);

  request      = signal<Request | null>(null);
  loading      = signal(true);
  submitting   = signal(false);
  savingStatus = signal(false);
  selectedFiles= signal<File[]>([]);
  navItems     = AGENT_NAV;

  reponseForm = this.fb.group({
    titre:   ['', Validators.required],
    contenu: ['', Validators.required],
  });

  statusCtrl = new FormControl<RequestStatus>(RequestStatus.EN_COURS, { nonNullable: true });

  readonly statusOptions = [
    { value: RequestStatus.EN_ATTENTE, label: 'En attente' },
    { value: RequestStatus.EN_COURS,   label: 'En cours' },
    { value: RequestStatus.TRAITE,     label: 'Traité' },
    { value: RequestStatus.REJETE,     label: 'Rejeté' },
  ];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.reqSvc.getById(id).subscribe({
      next: r => {
        this.request.set(r);
        this.respSvc.getByRequest(r.id).subscribe({
          next: re => {
            r.reponse = re;
            this.request.set(r);
            console.log("reponse1", this.request()?.reponse?.contenu);
          }
        });
        
        this.attSvc.getByReq(r.id).subscribe({
          next: pj => {
            r.pieceJointes = pj;
            this.request.set(r);
          }
        })
        this.statusCtrl.setValue(r.statut as any);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFilesChange(files: File[]) { this.selectedFiles.set(files); }

  download(id: number, name: string) {
    this.attSvc.download(id).subscribe(b => this.attSvc.triggerDownload(b, name));
  }

  preview(id: number) {
    this.attSvc.getPreviewUrl(id).subscribe(b =>{
      const url = URL.createObjectURL(b);
      window.open(url, '_blank');
    })
  }
  
  saveStatus() {
    const r = this.request();
    if (!r) return;
    this.savingStatus.set(true);
    this.reqSvc.changeStatus(r.id, { statut: this.statusCtrl.value as RequestStatus }).subscribe({
      next: updated => {
        this.state.updateRequest(updated);
        this.request.set(updated);
        this.savingStatus.set(false);
        this.snack.open('Statut mis à jour !', '', { duration: 3000 });
      },
      error: () => { this.savingStatus.set(false); this.snack.open('Erreur.', '', { duration: 3000 }); },
    });
  }

  envoyerReponse() {
    if (this.reponseForm.invalid) { this.reponseForm.markAllAsTouched(); return; }
    const r = this.request();
    if (!r) return;
    this.submitting.set(true);
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    const dto = {
      titre:     this.reponseForm.value.titre!,
      contenu:   this.reponseForm.value.contenu!,
      requeteId: r.id,
      auteurId: userId,
    };

    this.respSvc.create(dto).pipe(
      switchMap(rep => {
        if (this.selectedFiles().length === 0) return of(rep);
        const uploads = this.selectedFiles().map(f =>
          this.attSvc.upload(f, { reponseId: rep.id })
        );
        return forkJoin(uploads).pipe(switchMap(() => of(rep)));
      }),
      switchMap(() => this.reqSvc.changeStatus(r.id, { statut: RequestStatus.TRAITE }))
    ).subscribe({
      next: updated => {
        this.state.updateRequest(updated);
        this.submitting.set(false);
        this.snack.open('Réponse envoyée avec succès !', '', { duration: 3000 });
        this.router.navigate(['/agent/requests']);
      },
      error: () => {
        this.submitting.set(false);
        this.snack.open('Erreur lors de l\'envoi.', '', { duration: 3000 });
      },
    });
  }
}
