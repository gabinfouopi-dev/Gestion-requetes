import { Component, inject, OnInit, AfterViewInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { StatusBadgeComponent } from '../../../shared/components/ui.components';
import { DateFormatPipe, TruncatePipe } from '../../../shared/pipes';
import { StudentState } from '../student.state';
import { Request } from '../../../core/models';
import { RequestStatus } from '../../../core/enums/request-status.enum';
import { toSignal } from '@angular/core/rxjs-interop';

interface TrackingStep {
  key:     RequestStatus | 'CREATED';
  label:   string;
  icon:    string;
  done:    boolean;
  active:  boolean;
  date?:   string;
}

@Component({
  selector:   'app-request-tracking',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatProgressBarModule, MatDividerModule,
    MainLayoutComponent, StatusBadgeComponent, DateFormatPipe, TruncatePipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Suivi des Requêtes">

      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/student/dashboard">Accueil</a>
          <span>/</span><span>Suivi</span>
        </div>
        <div class="page-header__top">
          <div>
            <h1 class="page-header__title">Suivi des Requêtes</h1>
            <p class="page-header__subtitle">Visualisez l'avancement de chacune de vos requêtes.</p>
          </div>
          <mat-form-field style="min-width:260px">
            <mat-label>Sélectionner une requête</mat-label>
            <mat-select [formControl]="selectCtrl">
              <mat-option value="">-- Sélectionner --</mat-option>
              @for (r of submittedRequests(); track r.id) {
                <mat-option [value]=" r.id">
                  {{ r.id }} — {{ r.objet | truncate:40 }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      @if (!selected()) {
        <!-- État vide -->
        <mat-card>
          <mat-card-content style="padding:60px;text-align:center">
            <mat-icon style="font-size:3.5rem;width:3.5rem;height:3.5rem;color:#94a3b8">
              timeline
            </mat-icon>
            <p style="margin-top:16px;color:#64748b;font-size:.95rem">
              Sélectionnez une requête pour visualiser son suivi
            </p>
          </mat-card-content>
        </mat-card>
      } @else {

        <!-- En-tête requête sélectionnée -->
        <mat-card class="req-header-card">
          <mat-card-content>
            <div class="req-header">
              <div>
                <div class="req-header__top">
                  <code class="req-id">{{ selected()!.id }}</code>
                  <app-status-badge [status]="selected()!.statut"/>
                </div>
                <h3>{{ selected()!.objet }}</h3>
                <p>{{ selected()!.categorie?.nom }} — {{ selected()!.categorie?.service?.nom }}</p>
              </div>
              <div class="req-header__dates">
                <div>
                  <span>Créée le</span>
                  <strong>{{ selected()!.dateCreation | dateFormat:'short' }}</strong>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Timeline horizontale -->
        <mat-card class="timeline-card">
          <mat-card-header>
            <mat-card-title style="display:flex;align-items:center;justify-content:space-between">
              <span>Progression</span>
              <span style="font-size:.9rem;font-weight:700;color:#1a3c6e">
                {{ progressPct() }}%
              </span>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- Barre de progression -->
            <mat-progress-bar mode="determinate" [value]="progressPct()"
                              style="margin-bottom:28px;border-radius:999px"/>

            <!-- Étapes -->
            <div class="timeline-steps">
              @for (step of steps(); track step.key; let i = $index) {
                <div class="timeline-step"
                     [class.timeline-step--done]="step.done"
                     [class.timeline-step--active]="step.active">
                  <div class="timeline-step__circle">
                    <mat-icon>{{ step.done ? 'check' : step.icon }}</mat-icon>
                  </div>
                  <div class="timeline-step__label">{{ step.label }}</div>
                  @if (step.date) {
                    <div class="timeline-step__date">{{ step.date | dateFormat:'short' }}</div>
                  }
                </div>
                @if (i < steps().length - 1) {
                  <div class="timeline-connector"
                       [class.timeline-connector--done]="step.done"></div>
                }
              }
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Détails et réponse -->
        <div class="detail-grid">
          <mat-card>
            <mat-card-header>
              <mat-card-title><mat-icon>info_outline</mat-icon> Informations</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row"><span>Statut</span><app-status-badge [status]="selected()!.statut"/></div>
              <div class="info-row"><span>Date soumission</span>{{ selected()!.dateSoumission | dateFormat }}</div>
              <mat-divider style="margin:8px 0"/>
              <p style="font-size:.875rem;line-height:1.7;color:#1e293b">
                {{ selected()!.description }}
              </p>
            </mat-card-content>
          </mat-card>

          @if (selected()!.reponse) {
            <mat-card class="reponse-card">
              <mat-card-header>
                <mat-card-title style="color:#2e7d32">
                  <mat-icon>mark_email_read</mat-icon> Réponse reçue
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p class="rep-titre">{{ selected()!.reponse!.titre }}</p>
                <p class="rep-meta">
                  {{ selected()!.reponse!.auteur?.prenom }} {{ selected()!.reponse!.auteur?.nom }}
                  — {{ selected()!.reponse!.dateCreation | dateFormat }}
                </p>
                <mat-divider style="margin:10px 0"/>
                <p style="font-size:.875rem;line-height:1.8">
                  {{ selected()!.reponse!.contenu }}
                </p>
              </mat-card-content>
            </mat-card>
          }
        </div>

      }
    </app-main-layout>
  `,
  styles: [`
    .req-header-card { margin-bottom: 20px; }
    .req-header { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; }
    .req-header__top { display:flex; align-items:center; gap:10px; margin-bottom:6px; }
    .req-header h3 { font-size:1.05rem; font-weight:600; margin-bottom:4px; }
    .req-header p  { font-size:.82rem; color:#64748b; }
    .req-header__dates { text-align:right; font-size:.82rem; color:#64748b;
                         display:flex; flex-direction:column; gap:2px;
                         strong { font-size:.875rem; color:#1e293b; } }
    .req-id { font-size:.82rem; color:#1a3c6e; background:#ebf2fa; padding:2px 8px; border-radius:4px; }

    .timeline-card { margin-bottom: 20px; }
    .timeline-steps { display:flex; align-items:flex-start; padding:0 10px; }
    .timeline-step { display:flex; flex-direction:column; align-items:center; gap:8px; flex:1; }
    .timeline-step__circle {
      width:44px; height:44px; border-radius:50%;
      border:3px solid #e2e8f0; background:#fff;
      display:flex; align-items:center; justify-content:center;
      transition:all .3s;
      mat-icon { font-size:1.1rem; width:1.1rem; height:1.1rem; color:#94a3b8; }
    }
    .timeline-step--done .timeline-step__circle {
      background:#2e7d32; border-color:#2e7d32;
      mat-icon { color:#fff; }
    }
    .timeline-step--active .timeline-step__circle {
      background:#1a3c6e; border-color:#1a3c6e;
      box-shadow:0 0 0 5px rgba(26,60,110,.15);
      mat-icon { color:#fff; }
    }
    .timeline-step__label { font-size:.78rem; font-weight:600; text-align:center; color:#64748b; max-width:80px; line-height:1.3; }
    .timeline-step--done .timeline-step__label, .timeline-step--active .timeline-step__label { color:#1e293b; }
    .timeline-step__date { font-size:.7rem; color:#94a3b8; text-align:center; }
    .timeline-connector {
      flex:1; height:3px; background:#e2e8f0; margin-top:21px; border-radius:999px; transition:background .3s;
    }
    .timeline-connector--done { background:linear-gradient(90deg,#2e7d32,#1a3c6e); }

    .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .info-row { display:flex; align-items:center; gap:12px; padding:8px 0;
                border-bottom:1px solid #e2e8f0; font-size:.875rem;
                span { width:130px; color:#64748b; flex-shrink:0; } }
    .reponse-card { background:#e8f5e9 !important; }
    .rep-titre { font-weight:700; font-size:1rem; margin-bottom:4px; }
    .rep-meta  { font-size:.78rem; color:#64748b; }
    @media(max-width:768px) { .detail-grid { grid-template-columns:1fr; }
      .timeline-steps { flex-direction:column; gap:12px; } .timeline-connector { display:none; } }
  `],
})
export class RequestTrackingComponent implements OnInit, AfterViewInit {
  state     = inject(StudentState);
  selectCtrl= new FormControl('');
  navItems  = STUDENT_NAV;

  submittedRequests = computed(() =>
    this.state.requests().filter(r => r.statut !== RequestStatus.BROUILLON)
  );

  selectedId = toSignal(
    this.selectCtrl.valueChanges,
    { initialValue: null }
  );
  selected = computed(() =>
    this.submittedRequests().find(r => r.id === Number(this.selectedId())) ?? null
  );

  ngOnInit() {
    this.state.loadRequests();
  }

  ngAfterViewInit() {
    // Pré-sélectionner la première requête soumise dès que les données arrivent
    const first = this.submittedRequests()[0];
    if (first && !this.selectCtrl.value) this.selectCtrl.setValue(String(first.id));
  }

  steps = computed((): TrackingStep[] => {
    const r = this.selected();
    if (!r) return [];
    const s = r.statut;
    const doneStatuses = [RequestStatus.EN_ATTENTE, RequestStatus.EN_COURS, RequestStatus.TRAITE, RequestStatus.REJETE];
    return [
      { key: 'CREATED',              label: 'Créée',        icon: 'add_circle_outline', done: true, active: false, date: r.dateCreation },
      { key: RequestStatus.EN_ATTENTE,label: 'Soumise',     icon: 'send',               done: doneStatuses.includes(s), active: s === RequestStatus.EN_ATTENTE, date: r.dateSoumission },
      { key: RequestStatus.EN_COURS,  label: 'En traitement',icon: 'autorenew',         done: [RequestStatus.EN_COURS, RequestStatus.TRAITE].includes(s), active: s === RequestStatus.EN_COURS },
      { key: RequestStatus.TRAITE,    label: 'Traitée',     icon: 'check_circle',       done: s === RequestStatus.TRAITE || s === RequestStatus.REJETE, active: s === RequestStatus.TRAITE, date: r.reponse?.dateCreation },
    ];
  });

  progressPct = computed(() => {
    const doneCount = this.steps().filter(s => s.done).length;
    return Math.round((doneCount / (this.steps().length || 1)) * 100);
  });
}

const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard',    icon: 'dashboard',       route: '/student/dashboard' },
  { label: 'Mes requêtes', icon: 'description',     route: '/student/requests' },
  { label: 'Mes réponses', icon: 'mark_email_read', route: '/student/responses' },
  { label: 'Suivi',        icon: 'timeline',        route: '/student/tracking' },
];
