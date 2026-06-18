// ═══ request-detail.component.ts ════════════════════════════════════════════
import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { StatusBadgeComponent } from '../../../shared/components/ui.components';
import { DateFormatPipe } from '../../../shared/pipes';
import { RequestService } from '../../../core/services/request.service';
import { AttachmentService } from '../../../core/services/inter-attachment.services';
import { Request, Attachment } from '../../../core/models';

const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard',    icon: 'dashboard',       route: '/student/dashboard' },
  { label: 'Mes requêtes', icon: 'description',     route: '/student/requests' },
  { label: 'Mes réponses', icon: 'mark_email_read', route: '/student/responses' },
  { label: 'Suivi',        icon: 'timeline',        route: '/student/tracking' },
];

@Component({
  selector:   'app-request-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatProgressSpinnerModule,
    MainLayoutComponent, StatusBadgeComponent, DateFormatPipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Détail de la requête">
      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/student/requests">Mes requêtes</a>
          <span>/</span><span>Détail</span>
        </div>
        <div class="page-header__top">
          <h1 class="page-header__title">Détail de la requête</h1>
          <button mat-stroked-button routerLink="/student/requests">
            <mat-icon>arrow_back</mat-icon> Retour
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="spinner-center"><mat-progress-spinner mode="indeterminate" diameter="40"/></div>
      } @else if (request()) {
        <div class="detail-layout">
          <mat-card>
            <mat-card-header>
              <mat-card-title class="detail-header">
                <code class="req-id">{{ request()!.id }}</code>
                <app-status-badge [status]="request()!.statut"/>
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-rows">
                <div class="info-row"><span>Objet</span><strong>{{ request()!.objet }}</strong></div>
                <div class="info-row"><span>Catégorie</span><span>{{ request()!.categorie?.nom ?? '—' }}</span></div>
                <div class="info-row"><span>Service</span><span>{{ request()!.categorie?.service?.nom ?? '—' }}</span></div>
                <div class="info-row"><span>Date de création</span><span>{{ request()!.dateCreation | dateFormat }}</span></div>
                <div class="info-row"><span>Date de soumission</span><span>{{ request()!.dateSoumission | dateFormat }}</span></div>
                <div class="info-row info-row--block">
                  <span>Description</span>
                  <p>{{ request()!.description }}</p>
                </div>
              </div>

              <mat-divider style="margin:16px 0"/>
              <h3 class="section-h3">Pièces jointes</h3>
              @if (request()!.pieceJointes?.length) {
                <div class="pj-list">
                  @for (pj of request()!.pieceJointes!; track pj.id) {
                    <div class="pj-item">
                      <mat-icon>{{ fileIcon(pj.nomFichier) }}</mat-icon>
                      <span class="pj-name">{{ pj.nomFichier }}</span>
                      <button mat-stroked-button
                          (click)="preview(pj.id)"
                          matTooltip="Visualiser">
                        <mat-icon>visibility</mat-icon>Ouvrir
                      </button>
                      <button mat-stroked-button (click)="download(pj)" title="Télécharger">
                        <mat-icon>download</mat-icon>Telecharger
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="no-pj">Aucune pièce jointe.</p>
              }

              @if (request()!.reponse) {
                <mat-divider style="margin:16px 0"/>
                <div class="reponse-block">
                  <h3 class="section-h3">
                    <mat-icon color="accent">mark_email_read</mat-icon>
                    Réponse reçue
                  </h3>
                  <p class="reponse-titre">{{ request()!.reponse!.titre }}</p>
                  <p class="reponse-meta">
                    Par {{ request()!.reponse!.auteur?.prenom }} {{ request()!.reponse!.auteur?.nom }}
                    — {{ request()!.reponse!.dateCreation | dateFormat }}
                  </p>
                  <div class="reponse-contenu">{{ request()!.reponse!.contenu }}</div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      }
    </app-main-layout>
  `,
  styles: [`
    .spinner-center { display:flex; justify-content:center; padding:40px; }
    .detail-layout { max-width: 800px; }
    .detail-header { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .req-id { font-size:.85rem; color:#1a3c6e; background:#ebf2fa; padding:3px 10px; border-radius:4px; }
    .info-rows { display:flex; flex-direction:column; }
    .info-row { display:flex; align-items:center; gap:16px; padding:10px 0;
                border-bottom:1px solid #e2e8f0; font-size:.875rem;
                span:first-child { width:150px; color:#64748b; flex-shrink:0; font-weight:500; } }
    .info-row:last-child { border-bottom:none; }
    .info-row--block { flex-direction:column; align-items:flex-start; gap:6px;
                       span:first-child { width:auto; } p { line-height:1.7; } }
    .section-h3 { font-size:.95rem; font-weight:700; margin-bottom:12px;
                  display:flex; align-items:center; gap:6px; }
    .pj-list { display:flex; flex-direction:column; gap:6px; }
    .pj-item { display:flex; align-items:center; gap:10px; padding:10px 14px;
               background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;
               mat-icon { color:#64748b; } }
    .pj-name { flex:1; font-size:.875rem; }
    .no-pj { font-size:.85rem; color:#94a3b8; }
    .reponse-block { background:#e8f5e9; border-radius:10px; padding:16px; border:1px solid #c8e6c9; }
    .reponse-titre { font-weight:700; font-size:1rem; margin-bottom:4px; }
    .reponse-meta { font-size:.78rem; color:#64748b; margin-bottom:12px; }
    .reponse-contenu { font-size:.875rem; line-height:1.8; }
  `],
})
export class RequestDetailComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private reqSvc = inject(RequestService);
  private attSvc = inject(AttachmentService);

  request = signal<Request | null>(null);
  loading = signal(true);
  navItems = STUDENT_NAV;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.reqSvc.getById(id).subscribe({
      next: r => { 
        this.request.set(r);
        this.attSvc.getByReq(r.id).subscribe({
          next: pj => {
            r.pieceJointes = pj;
            this.request.set(r);
          }
        })
        this.loading.set(false); 
      },
      error: () => this.loading.set(false),
    });
  }

  fileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['doc','docx'].includes(ext ?? '')) return 'description';
    if (['jpg','jpeg','png'].includes(ext ?? '')) return 'image';
    return 'attach_file';
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
