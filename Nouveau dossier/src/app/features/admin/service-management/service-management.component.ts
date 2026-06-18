// ═══ service-management.component.ts ════════════════════════════════════════
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components/ui.components';
import { TruncatePipe } from '../../../shared/pipes';
import { AdminState } from '../admin.state';
import { ServiceService, CategoryService } from '../../../core/services/domain.services';
import { ServiceModel, Category, CategoryDto } from '../../../core/models';

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',    icon: 'dashboard', route: '/admin/dashboard' },
  { label: 'Utilisateurs', icon: 'people',    route: '/admin/users' },
  { label: 'Services',     icon: 'business',  route: '/admin/services' },
  { label: 'Catégories',   icon: 'label',     route: '/admin/categories' },
];

@Component({
  selector:   'app-service-management',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatFormFieldModule, MatInputModule, MatDialogModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MainLayoutComponent, EmptyStateComponent, TruncatePipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Gestion des Services">

      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/admin/dashboard">Dashboard</a><span>/</span><span>Services</span>
        </div>
        <div class="page-header__top">
          <div>
            <h1 class="page-header__title">Services</h1>
            <p class="page-header__subtitle">Gérez les services administratifs de l'université.</p>
          </div>
          <button mat-raised-button color="primary" (click)="ouvrirAjouter()">
            <mat-icon>add</mat-icon> Nouveau service
          </button>
        </div>
      </div>

      <!-- Cartes services -->
      <div class="services-grid">
        @for (s of state.services(); track s.id; let i = $index) {
          <mat-card class="service-card" [style.border-top]="'4px solid ' + colors[i % colors.length]">
            <mat-card-content>
              <div class="service-card__top">
                <div class="service-card__icon" [style.background]="colors[i % colors.length] + '20'"
                     [style.color]="colors[i % colors.length]">
                  <mat-icon>business</mat-icon>
                </div>
                <div class="service-card__actions">
                  <button mat-icon-button (click)="ouvrirModifier(s)" matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="supprimer(s)" matTooltip="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
              <h3 class="service-card__name">{{ s.nom }}</h3>
              <p class="service-card__desc">{{ s.description | truncate:70 }}</p>
              <div class="service-card__stats">
                <div>
                  <span class="stat-v">{{ agentsCount(s.id) }}</span>
                  <span>Agent(s)</span>
                </div>
                <div>
                  <span class="stat-v">{{ catsCount(s.id) }}</span>
                  <span>Catégorie(s)</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Tableau -->
      <div class="section-card" style="margin-top:24px">
        <div class="section-card__header">
          <span class="section-card__title"><mat-icon>list</mat-icon>Liste complète</span>
        </div>
        @if (state.services().length === 0) {
          <app-empty-state icon="business" title="Aucun service"/>
        } @else {
          <div class="table-wrapper">
            <table mat-table [dataSource]="state.services()">
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let s" class="fw-500">{{ s.nom }}</td>
              </ng-container>
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let s" style="font-size:.82rem;color:#64748b">
                  {{ s.description | truncate:60 }}
                </td>
              </ng-container>
              <ng-container matColumnDef="agents">
                <th mat-header-cell *matHeaderCellDef>Agents</th>
                <td mat-cell *matCellDef="let s">
                  <span class="count-chip">{{ agentsCount(s.id) }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="categories">
                <th mat-header-cell *matHeaderCellDef>Catégories</th>
                <td mat-cell *matCellDef="let s">
                  <span class="count-chip">{{ catsCount(s.id) }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let s">
                  <div class="actions-cell">
                    <button mat-icon-button color="primary" (click)="ouvrirModifier(s)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="supprimer(s)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns;"></tr>
            </table>
          </div>
        }
      </div>

      <!-- Drawer formulaire -->
      @if (showForm()) {
        <div class="form-drawer">
          <div class="form-drawer__backdrop" (click)="showForm.set(false)"></div>
          <div class="form-drawer__panel">
            <div class="form-drawer__header">
              <h2>{{ editingSvc() ? 'Modifier' : 'Nouveau' }} service</h2>
              <button mat-icon-button (click)="showForm.set(false)"><mat-icon>close</mat-icon></button>
            </div>
            <div class="form-drawer__body">
              <form [formGroup]="svcForm" novalidate>
                <mat-form-field class="full-width">
                  <mat-label>Nom *</mat-label>
                  <input matInput formControlName="nom" placeholder="Ex: Scolarité"/>
                  @if (svcForm.get('nom')?.hasError('required') && svcForm.get('nom')?.touched) {
                    <mat-error>Requis</mat-error>
                  }
                </mat-form-field>
                <mat-form-field class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="4"
                            placeholder="Décrivez les attributions de ce service…"></textarea>
                </mat-form-field>
              </form>
            </div>
            <div class="form-drawer__footer">
              <button mat-stroked-button (click)="showForm.set(false)">Annuler</button>
              <button mat-raised-button color="primary" (click)="sauvegarder()" [disabled]="saving()">
                @if (saving()) { <mat-progress-spinner diameter="18" mode="indeterminate"/> }
                @else { <mat-icon>save</mat-icon> }
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      }

    </app-main-layout>
  `,
  styles: [`
    .services-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
    .service-card { cursor:default; transition:transform .2s, box-shadow .2s; }
    .service-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.1) !important; }
    .service-card__top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
    .service-card__icon { width:44px; height:44px; border-radius:10px; display:flex;
                          align-items:center; justify-content:center;
                          mat-icon { font-size:1.2rem; width:1.2rem; height:1.2rem; } }
    .service-card__actions { display:flex; gap:2px; }
    .service-card__name { font-size:1rem; font-weight:700; margin-bottom:6px; }
    .service-card__desc { font-size:.82rem; color:#64748b; line-height:1.5; margin-bottom:14px; }
    .service-card__stats { display:grid; grid-template-columns:1fr 1fr; gap:8px; text-align:center;
      div { background:#f8fafc; border-radius:8px; padding:8px; }
      .stat-v { display:block; font-size:1.3rem; font-weight:700; color:#1a3c6e; }
      span:last-child { font-size:.72rem; color:#64748b; }
    }
    .table-wrapper { overflow-x:auto; }
    .fw-500 { font-weight:500; }
    .count-chip { background:#ebf2fa; color:#1a3c6e; padding:2px 10px;
                  border-radius:999px; font-size:.78rem; font-weight:700; }
    .actions-cell { display:flex; gap:2px; }
    .full-width { width:100%; }
    .form-drawer { position:fixed; inset:0; z-index:500; display:flex; }
    .form-drawer__backdrop { position:absolute; inset:0; background:rgba(0,0,0,.4); }
    .form-drawer__panel {
      position:absolute; right:0; top:0; bottom:0; width:420px; background:#fff;
      display:flex; flex-direction:column; box-shadow:-8px 0 32px rgba(0,0,0,.12);
      animation:slideIn .25s ease;
    }
    @keyframes slideIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
    .form-drawer__header { padding:20px 24px; border-bottom:1px solid #e2e8f0;
                           display:flex; align-items:center; justify-content:space-between;
                           h2 { font-size:1.1rem; font-weight:700; } }
    .form-drawer__body { flex:1; overflow-y:auto; padding:24px; }
    .form-drawer__footer { padding:16px 24px; border-top:1px solid #e2e8f0;
                           display:flex; justify-content:flex-end; gap:10px; }
  `],
})
export class ServiceManagementComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svcSvc = inject(ServiceService);
  private snack  = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  state          = inject(AdminState);

  navItems   = ADMIN_NAV;
  columns    = ['nom', 'description', 'agents', 'categories', 'actions'];
  showForm   = signal(false);
  editingSvc = signal<ServiceModel | null>(null);
  saving     = signal(false);

  readonly colors = ['#1A3C6E','#18A058','#0984E3','#F0A500','#D63031','#7C3AED'];

  svcForm = this.fb.group({
    nom:         ['', Validators.required],
    description: [''],
  });

  ngOnInit() { this.state.loadAll(); }

  agentsCount(svcId: number) { return this.state.users().filter(u => u.serviceId === svcId).length; }
  catsCount(svcId: number)   { return this.state.categories().filter(c => c.serviceId === svcId).length; }

  ouvrirAjouter() {
    this.editingSvc.set(null);
    this.svcForm.reset();
    this.showForm.set(true);
  }

  ouvrirModifier(s: ServiceModel) {
    this.editingSvc.set(s);
    this.svcForm.patchValue(s);
    this.showForm.set(true);
  }

  sauvegarder() {
    if (this.svcForm.invalid) { this.svcForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const dto = { nom: this.svcForm.value.nom!, description: this.svcForm.value.description! };
    const obs = this.editingSvc()
      ? this.svcSvc.update(this.editingSvc()!.id, dto)
      : this.svcSvc.create(dto);
    obs.subscribe({
      next: s => {
        this.editingSvc() ? this.state.updateService(s) : this.state.addService(s);
        this.saving.set(false); this.showForm.set(false);
        this.snack.open(this.editingSvc() ? 'Service mis à jour.' : 'Service créé.', '', { duration: 3000 });
      },
      error: () => { this.saving.set(false); this.snack.open('Erreur.', '', { duration: 3000 }); },
    });
  }

  supprimer(s: ServiceModel) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title:'Supprimer le service', message:`Supprimer "${s.nom}" et toutes ses catégories ?`,
              danger:true, confirm:'Supprimer' }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.svcSvc.delete(s.id).subscribe({
        next: () => { this.state.removeService(s.id); this.snack.open('Supprimé.', '', { duration: 3000 }); },
        error: () => this.snack.open('Erreur.', '', { duration: 3000 }),
      });
    });
  }
}
