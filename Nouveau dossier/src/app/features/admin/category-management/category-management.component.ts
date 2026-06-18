import { Component, inject, OnInit, signal, computed } from '@angular/core';
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
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime } from 'rxjs';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components/ui.components';
import { TruncatePipe } from '../../../shared/pipes';
import { AdminState } from '../admin.state';
import { CategoryService } from '../../../core/services/domain.services';
import { Category, CategoryDto } from '../../../core/models';

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',    icon: 'dashboard', route: '/admin/dashboard' },
  { label: 'Utilisateurs', icon: 'people',    route: '/admin/users' },
  { label: 'Services',     icon: 'business',  route: '/admin/services' },
  { label: 'Catégories',   icon: 'label',     route: '/admin/categories' },
];

@Component({
  selector:   'app-category-management',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule,
    MatProgressSpinnerModule, MatTooltipModule, MatChipsModule,
    MainLayoutComponent, EmptyStateComponent, TruncatePipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Gestion des Catégories">

      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/admin/dashboard">Dashboard</a><span>/</span><span>Catégories</span>
        </div>
        <div class="page-header__top">
          <div>
            <h1 class="page-header__title">Catégories</h1>
            <p class="page-header__subtitle">Chaque catégorie est rattachée à un service avec une priorité.</p>
          </div>
          <button mat-raised-button color="primary" (click)="ouvrirAjouter()">
            <mat-icon>add</mat-icon> Nouvelle catégorie
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px">
        <div class="stat-mini"><span class="v">{{ state.categories().length }}</span><span>Total</span></div>
        <div class="stat-mini err"><span class="v">{{ countPrio('haute') + countPrio('urgente') }}</span><span>Haute / Urgente</span></div>
        <div class="stat-mini mid"><span class="v">{{ countPrio('normale') }}</span><span>Normale</span></div>
        <div class="stat-mini ok"><span class="v">{{ countPrio('basse') }}</span><span>Basse</span></div>
      </div>

      <!-- Filtres -->
      <div class="filters-bar">
        <mat-form-field class="search-field">
          <mat-label>Rechercher</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [formControl]="searchCtrl" placeholder="Nom de catégorie…"/>
        </mat-form-field>
        <mat-form-field style="width:180px">
          <mat-label>Service</mat-label>
          <mat-select [formControl]="svcFilterCtrl">
            <mat-option value="">Tous les services</mat-option>
            @for (s of state.services(); track s.id) {
              <mat-option [value]="s.id">{{ s.nom }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field style="width:160px">
          <mat-label>Priorité</mat-label>
          <mat-select [formControl]="prioFilterCtrl">
            <mat-option value="">Toutes</mat-option>
            @for (p of priorites; track p.value) {
              <mat-option [value]="p.value">{{ p.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Tableau -->
      <div class="section-card">
        <div class="section-card__header">
          <span class="section-card__title">
            <mat-icon>label</mat-icon> Liste des catégories
            <span class="count-badge">{{ filtered().length }}</span>
          </span>
        </div>

        @if (state.loading()) {
          <div class="spinner-center"><mat-progress-spinner mode="indeterminate" diameter="40"/></div>
        } @else if (filtered().length === 0) {
          <app-empty-state icon="label" title="Aucune catégorie trouvée"/>
        } @else {
          <div class="table-wrapper">
            <table mat-table [dataSource]="filtered()">

              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let c">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="cat-icon"><mat-icon>label</mat-icon></div>
                    <span class="fw-500">{{ c.nom }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="service">
                <th mat-header-cell *matHeaderCellDef>Service</th>
                <td mat-cell *matCellDef="let c">
                  <span class="svc-chip">{{ c.serviceNom ?? '—' }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="priorite">
                <th mat-header-cell *matHeaderCellDef>Priorité</th>
                <td mat-cell *matCellDef="let c">
                  <span class="prio-badge prio-badge--{{ c.priorite }}">{{ c.priorite }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let c" style="font-size:.82rem;color:#64748b;max-width:200px">
                  {{ c.description | truncate:55 }}
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let c">
                  <div class="actions-cell">
                    <button mat-icon-button color="primary" (click)="ouvrirModifier(c)" matTooltip="Modifier">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="supprimer(c)" matTooltip="Supprimer">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns;" class="table-row"></tr>
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
              <h2>{{ editingCat() ? 'Modifier' : 'Nouvelle' }} catégorie</h2>
              <button mat-icon-button (click)="showForm.set(false)"><mat-icon>close</mat-icon></button>
            </div>
            <div class="form-drawer__body">
              <form [formGroup]="catForm" novalidate>

                <mat-form-field class="full-width">
                  <mat-label>Nom *</mat-label>
                  <input matInput formControlName="nom" placeholder="Ex: Relevé de notes"/>
                  @if (catForm.get('nom')?.hasError('required') && catForm.get('nom')?.touched) {
                    <mat-error>Requis</mat-error>
                  }
                </mat-form-field>

                <mat-form-field class="full-width">
                  <mat-label>Service *</mat-label>
                  <mat-select formControlName="serviceId">
                    <mat-option value="">-- Sélectionner --</mat-option>
                    @for (s of state.services(); track s.id) {
                      <mat-option [value]="s.id">{{ s.nom }}</mat-option>
                    }
                  </mat-select>
                  @if (catForm.get('serviceId')?.hasError('required') && catForm.get('serviceId')?.touched) {
                    <mat-error>Requis</mat-error>
                  }
                </mat-form-field>

                <mat-form-field class="full-width">
                  <mat-label>Priorité *</mat-label>
                  <mat-select formControlName="priorite">
                    @for (p of priorites; track p.value) {
                      <mat-option [value]="p.value">{{ p.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="3"
                            placeholder="Courte description de la catégorie…"></textarea>
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
    .filters-bar { display:flex; gap:16px; flex-wrap:wrap; margin-bottom:20px; }
    .search-field { flex:1; min-width:200px; }
    .stat-mini { background:#fff; border-radius:12px; border:1px solid #e2e8f0; padding:16px;
                 text-align:center; box-shadow:0 2px 8px rgba(26,60,110,.06);
                 .v { display:block; font-size:1.8rem; font-weight:700; color:#1e293b; }
                 span:last-child { font-size:.8rem; color:#64748b; }
    }
    .stat-mini.err .v { color:#c62828; }
    .stat-mini.mid .v { color:#f57f17; }
    .stat-mini.ok  .v { color:#2e7d32; }
    .table-wrapper { overflow-x:auto; }
    .count-badge { background:#ebf2fa; color:#1a3c6e; font-size:.75rem; font-weight:700;
                   padding:2px 8px; border-radius:999px; margin-left:6px; }
    .cat-icon { width:32px; height:32px; border-radius:8px; background:#ebf2fa; color:#1a3c6e;
                display:flex; align-items:center; justify-content:center; flex-shrink:0;
                mat-icon { font-size:.9rem; width:.9rem; height:.9rem; } }
    .fw-500 { font-weight:500; }
    .svc-chip { background:#ebf2fa; color:#1a3c6e; padding:3px 10px;
                border-radius:6px; font-size:.78rem; font-weight:600; }
    .prio-badge { padding:3px 10px; border-radius:999px; font-size:.75rem; font-weight:600; }
    .prio-badge--urgente { background:#ffebee; color:#c62828; }
    .prio-badge--haute   { background:#fff3e0; color:#e65100; }
    .prio-badge--normale { background:#e1f5fe; color:#0277bd; }
    .prio-badge--basse   { background:#f1f5f9; color:#475569; }
    .actions-cell { display:flex; gap:2px; }
    .spinner-center { display:flex; justify-content:center; padding:40px; }
    .table-row:hover { background:#fafbff; }
    .full-width { width:100%; }
    .form-drawer { position:fixed; inset:0; z-index:500; display:flex; }
    .form-drawer__backdrop { position:absolute; inset:0; background:rgba(0,0,0,.4); }
    .form-drawer__panel {
      position:absolute; right:0; top:0; bottom:0; width:440px; background:#fff;
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
export class CategoryManagementComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private catSvc = inject(CategoryService);
  private snack  = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  state          = inject(AdminState);

  navItems   = ADMIN_NAV;
  columns    = ['nom', 'service', 'priorite', 'description', 'actions'];
  showForm   = signal(false);
  editingCat = signal<Category | null>(null);
  saving     = signal(false);

  searchCtrl    = new FormControl('');
  svcFilterCtrl = new FormControl('');
  prioFilterCtrl= new FormControl('');

  readonly priorites = [
    { value: 'basse',   label: 'Basse' },
    { value: 'normale', label: 'Normale' },
    { value: 'haute',   label: 'Haute' },
    { value: 'urgente', label: 'Urgente' },
  ];

  catForm = this.fb.group({
    nom:         ['', Validators.required],
    serviceId:   [null as number | null, Validators.required],
    priorite:    ['normale', Validators.required],
    description: [''],
  });

  ngOnInit() { this.state.loadAll(); }

  countPrio(p: string) { return this.state.categories().filter(c => c.priorite === p).length; }

  filtered(): Category[] {
    const q   = (this.searchCtrl.value ?? '').toLowerCase();
    const svc = this.svcFilterCtrl.value ?? '';
    const pri = this.prioFilterCtrl.value ?? '';
    return this.state.categories().filter(c => {
      const matchQ   = !q   || c.nom.toLowerCase().includes(q);
      const matchSvc = !svc || String(c.serviceId) === svc;
      const matchPri = !pri || c.priorite === pri;
      return matchQ && matchSvc && matchPri;
    });
  }

  ouvrirAjouter() {
    this.editingCat.set(null);
    this.catForm.reset({ priorite: 'normale' });
    this.showForm.set(true);
  }

  ouvrirModifier(c: Category) {
    this.editingCat.set(c);
    this.catForm.patchValue({ ...c });
    this.showForm.set(true);
  }

  sauvegarder() {
    if (this.catForm.invalid) { this.catForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const dto: CategoryDto = {
      nom:         this.catForm.value.nom!,
      serviceId:   this.catForm.value.serviceId!,
      priorite:    this.catForm.value.priorite!,
      description: this.catForm.value.description ?? '',
    };
    const obs = this.editingCat()
      ? this.catSvc.update(this.editingCat()!.id, dto)
      : this.catSvc.create(dto);
    obs.subscribe({
      next: c => {
        this.editingCat() ? this.state.updateCategory(c) : this.state.addCategory(c);
        this.saving.set(false); this.showForm.set(false);
        this.snack.open(this.editingCat() ? 'Catégorie mise à jour.' : 'Catégorie créée.', '', { duration: 3000 });
      },
      error: () => { this.saving.set(false); this.snack.open('Erreur.', '', { duration: 3000 }); },
    });
  }

  supprimer(c: Category) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title:'Supprimer la catégorie', message:`Supprimer "${c.nom}" ?`, danger:true, confirm:'Supprimer' }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.catSvc.delete(c.id).subscribe({
        next: () => { this.state.removeCategory(c.id); this.snack.open('Supprimée.', '', { duration: 3000 }); },
        error: () => this.snack.open('Erreur.', '', { duration: 3000 }),
      });
    });
  }
}
