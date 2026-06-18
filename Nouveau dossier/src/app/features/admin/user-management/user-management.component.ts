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
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components/ui.components';
import { TruncatePipe } from '../../../shared/pipes';
import { AdminState } from '../admin.state';
import { UserService, ServiceService } from '../../../core/services/domain.services';
import { User, ServiceModel, UserCreateDto, UserUpdateDto } from '../../../core/models';
import { Role } from '../../../core/enums/role.enum';

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',    icon: 'dashboard', route: '/admin/dashboard' },
  { label: 'Utilisateurs', icon: 'people',    route: '/admin/users' },
  { label: 'Services',     icon: 'business',  route: '/admin/services' },
  { label: 'Catégories',   icon: 'label',     route: '/admin/categories' },
];

@Component({
  selector:   'app-user-management',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule,
    MatProgressSpinnerModule, MatTooltipModule, MatChipsModule,
    MainLayoutComponent, EmptyStateComponent, TruncatePipe,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Gestion des Utilisateurs">

      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/admin/dashboard">Dashboard</a>
          <span>/</span><span>Utilisateurs</span>
        </div>
        <div class="page-header__top">
          <div>
            <h1 class="page-header__title">Utilisateurs</h1>
            <p class="page-header__subtitle">Gérez les comptes et les affectations de service.</p>
          </div>
          <button mat-raised-button color="primary" (click)="ouvrirAjouter()">
            <mat-icon>person_add</mat-icon> Ajouter
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-bar">
        <mat-form-field class="search-field">
          <mat-label>Rechercher</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [formControl]="searchCtrl" placeholder="Nom, email…"/>
        </mat-form-field>
        <mat-form-field style="width:160px">
          <mat-label>Rôle</mat-label>
          <mat-select [formControl]="roleFilterCtrl">
            <mat-option value="">Tous</mat-option>
            <mat-option [value]="Role.ETUDIANT">Étudiant</mat-option>
            <mat-option [value]="Role.AGENT">Agent</mat-option>
            <mat-option [value]="Role.ADMIN">Admin</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Tableau -->
      <div class="section-card">
        <div class="section-card__header">
          <span class="section-card__title">
            <mat-icon>people</mat-icon> Liste des utilisateurs
            <span class="count-badge">{{ filtered().length }}</span>
          </span>
        </div>

        @if (state.loading()) {
          <div class="spinner-center"><mat-progress-spinner mode="indeterminate" diameter="40"/></div>
        } @else if (filtered().length === 0) {
          <app-empty-state icon="people" title="Aucun utilisateur trouvé"/>
        } @else {
          <div class="table-wrapper">
            <table mat-table [dataSource]="filtered()">

              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
                <td mat-cell *matCellDef="let u">
                  <div class="user-mini">
                    <div class="user-mini__av">{{ initials(u.prenom, u.nom) }}</div>
                    <div>
                      <div class="fw-500">{{ u.prenom }} {{ u.nom }}</div>
                      <div class="sub-text">{{ u.email }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="tel">
                <th mat-header-cell *matHeaderCellDef>Téléphone</th>
                <td mat-cell *matCellDef="let u" style="font-size:.82rem">{{ u.tel || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Rôle</th>
                <td mat-cell *matCellDef="let u">
                  <span class="role-badge role-badge--{{ u.role.toLowerCase() }}">
                    {{ roleLabel(u.role) }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="service">
                <th mat-header-cell *matHeaderCellDef>Service</th>
                <td mat-cell *matCellDef="let u">
                    <span class="svc-chip">{{ u.serviceNom ?? '—'}}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let u">
                  <div class="actions-cell">
                    <button mat-icon-button color="primary"
                            (click)="ouvrirModifier(u)" matTooltip="Modifier">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button
                            (click)="ouvrirAffecter(u)" matTooltip="Affecter service"
                            style="color:#1a3c6e">
                      <mat-icon>business</mat-icon>
                    </button>
                    <button mat-icon-button color="warn"
                            (click)="supprimer(u)" matTooltip="Supprimer">
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

      <!-- ══ DRAWER : Ajouter / Modifier ══ -->
      @if (showForm()) {
        <div class="form-drawer">
          <div class="form-drawer__backdrop" (click)="showForm.set(false)"></div>
          <div class="form-drawer__panel">
            <div class="form-drawer__header">
              <h2>{{ editingUser() ? 'Modifier' : 'Ajouter' }} un utilisateur</h2>
              <button mat-icon-button (click)="showForm.set(false)">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="form-drawer__body">
              <form [formGroup]="userForm" novalidate>

                <div class="form-row">
                  <mat-form-field>
                    <mat-label>Prénom *</mat-label>
                    <input matInput formControlName="prenom"/>
                    @if (f['prenom'].hasError('required') && f['prenom'].touched) {
                      <mat-error>Requis</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field>
                    <mat-label>Nom *</mat-label>
                    <input matInput formControlName="nom"/>
                    @if (f['nom'].hasError('required') && f['nom'].touched) {
                      <mat-error>Requis</mat-error>
                    }
                  </mat-form-field>
                </div>

                <mat-form-field class="full-width">
                  <mat-label>Email *</mat-label>
                  <input matInput type="email" formControlName="email"/>
                  @if (f['email'].hasError('required') && f['email'].touched) {
                    <mat-error>Requis</mat-error>
                  }
                  @if (f['email'].hasError('email') && f['email'].touched) {
                    <mat-error>Format invalide</mat-error>
                  }
                </mat-form-field>

                <mat-form-field class="full-width">
                  <mat-label>Téléphone</mat-label>
                  <input matInput formControlName="tel" placeholder="+237 6XX XXX XXX"/>
                </mat-form-field>

                <div class="form-row">
                  <mat-form-field>
                    <mat-label>Rôle *</mat-label>
                    <mat-select formControlName="role">
                      <mat-option [value]="Role.ETUDIANT">Étudiant</mat-option>
                      <mat-option [value]="Role.AGENT">Agent</mat-option>
                      <mat-option [value]="Role.ADMIN">Administrateur</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field>
                    <mat-label>Service</mat-label>
                    <mat-select formControlName="serviceId">
                      <mat-option [value]="null">— Aucun —</mat-option>
                      @for (s of state.services(); track s.id) {
                        <mat-option [value]="s.id">{{ s.nom }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>

                @if (!editingUser()) {
                  <mat-form-field class="full-width">
                    <mat-label>Mot de passe *</mat-label>
                    <input matInput [type]="showPwd() ? 'text' : 'password'"
                           formControlName="motDePasse"/>
                    <button mat-icon-button matSuffix type="button"
                            (click)="togglePwd()">
                      <mat-icon>{{ showPwd() ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    @if (f['motDePasse'].hasError('required') && f['motDePasse'].touched) {
                      <mat-error>Requis</mat-error>
                    }
                    @if (f['motDePasse'].hasError('minlength')) {
                      <mat-error>Minimum 6 caractères</mat-error>
                    }
                  </mat-form-field>
                }

              </form>
            </div>
            <div class="form-drawer__footer">
              <button mat-stroked-button (click)="showForm.set(false)">Annuler</button>
              <button mat-raised-button color="primary"
                      (click)="sauvegarder()" [disabled]="saving()">
                @if (saving()) { <mat-progress-spinner diameter="18" mode="indeterminate"/> }
                @else { <mat-icon>save</mat-icon> }
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ══ DRAWER : Affecter service ══ -->
      @if (showAffecter()) {
        <div class="form-drawer">
          <div class="form-drawer__backdrop" (click)="showAffecter.set(false)"></div>
          <div class="form-drawer__panel form-drawer__panel--sm">
            <div class="form-drawer__header">
              <h2>Affecter à un service</h2>
              <button mat-icon-button (click)="showAffecter.set(false)">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="form-drawer__body">
              <p style="font-size:.875rem;color:#64748b;margin-bottom:16px">
                Affecter <strong>{{ affecterUser()?.prenom }} {{ affecterUser()?.nom }}</strong>
              </p>
              <mat-form-field class="full-width">
                <mat-label>Service</mat-label>
                <mat-select [formControl]="affecterSvcCtrl">
                  <mat-option [value]="null">— Aucun —</mat-option>
                  @for (s of state.services(); track s.id) {
                    <mat-option [value]="s.id">{{ s.nom }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="form-drawer__footer">
              <button mat-stroked-button (click)="showAffecter.set(false)">Annuler</button>
              <button mat-raised-button color="primary" (click)="confirmerAffectation()">
                <mat-icon>check</mat-icon> Affecter
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
    .table-wrapper { overflow-x:auto; }
    .count-badge { background:#ebf2fa; color:#1a3c6e; font-size:.75rem; font-weight:700;
                   padding:2px 8px; border-radius:999px; margin-left:6px; }
    .user-mini { display:flex; align-items:center; gap:10px; }
    .user-mini__av {
      width:34px; height:34px; border-radius:50%; background:#1a3c6e; color:#fff;
      display:flex; align-items:center; justify-content:center;
      font-size:.82rem; font-weight:700; flex-shrink:0;
    }
    .fw-500   { font-weight:500; font-size:.875rem; }
    .sub-text { font-size:.75rem; color:#94a3b8; }
    .role-badge { display:inline-block; padding:3px 10px; border-radius:999px;
                  font-size:.75rem; font-weight:600; }
    .role-badge--etudiant { background:#e8f5e9; color:#2e7d32; }
    .role-badge--agent    { background:#e1f5fe; color:#0277bd; }
    .role-badge--admin    { background:#ffebee; color:#c62828; }
    .svc-chip { background:#ebf2fa; color:#1a3c6e; padding:3px 10px;
                border-radius:6px; font-size:.78rem; font-weight:600; }
    .actions-cell { display:flex; align-items:center; gap:2px; }
    .spinner-center { display:flex; justify-content:center; padding:40px; }
    .table-row:hover { background:#fafbff; }

    /* Drawer */
    .form-drawer { position:fixed; inset:0; z-index:500; display:flex; }
    .form-drawer__backdrop { position:absolute; inset:0; background:rgba(0,0,0,.4); }
    .form-drawer__panel {
      position:absolute; right:0; top:0; bottom:0; width:460px; background:#fff;
      display:flex; flex-direction:column; box-shadow:-8px 0 32px rgba(0,0,0,.12);
      animation:slideIn .25s ease;
    }
    .form-drawer__panel--sm { width:360px; }
    @keyframes slideIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
    .form-drawer__header {
      padding:20px 24px; border-bottom:1px solid #e2e8f0;
      display:flex; align-items:center; justify-content:space-between;
      h2 { font-size:1.1rem; font-weight:700; }
    }
    .form-drawer__body { flex:1; overflow-y:auto; padding:24px; }
    .form-drawer__footer {
      padding:16px 24px; border-top:1px solid #e2e8f0;
      display:flex; justify-content:flex-end; gap:10px;
    }
    .full-width { width:100%; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    @media(max-width:520px) {
      .form-drawer__panel { width:100%; }
      .form-row { grid-template-columns:1fr; }
    }
  `],
})
export class UserManagementComponent implements OnInit {
  private fb       = inject(FormBuilder);
  private userSvc  = inject(UserService);
  private snack    = inject(MatSnackBar);
  private dialog   = inject(MatDialog);
  state            = inject(AdminState);

  readonly Role = Role;
  navItems  = ADMIN_NAV;
  columns   = ['user', 'tel', 'role', 'service', 'actions'];

  searchCtrl    = new FormControl('');
  roleFilterCtrl= new FormControl('');
  showForm      = signal(false);
  showAffecter  = signal(false);
  editingUser   = signal<User | null>(null);
  affecterUser  = signal<User | null>(null);
  saving        = signal(false);
  showPwd       = signal(false);
  affecterSvcCtrl = new FormControl<number | null>(null);

  userForm = this.fb.group({
    prenom:     ['', Validators.required],
    nom:        ['', Validators.required],
    email:      ['', [Validators.required, Validators.email]],
    tel:        [''],
    role:       [Role.ETUDIANT, Validators.required],
    serviceId:  [null as number | null],
    motDePasse: ['', [Validators.minLength(6)]],
  });

  get f() { return this.userForm.controls; }

  ngOnInit() {
    this.state.loadAll();
    this.searchCtrl.valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe(() => {});
  }

  filtered(): User[] {
    const q  = (this.searchCtrl.value ?? '').toLowerCase();
    const r  = this.roleFilterCtrl.value ?? '';
    return this.state.users().filter(u => {
      const matchQ = !q || `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(q);
      const matchR = !r || u.role === r;
      return matchQ && matchR;
    });
  }

  initials(p?: string, n?: string) { return `${p?.[0]??''}${n?.[0]??''}`.toUpperCase(); }
  roleLabel(r: Role): string {
    const m: Record<Role, string> = { [Role.ETUDIANT]:'Étudiant', [Role.AGENT]:'Agent', [Role.ADMIN]:'Admin' };
    return m[r] ?? r;
  }

  ouvrirAjouter() {
    this.editingUser.set(null);
    this.userForm.reset({ role: Role.ETUDIANT });
    this.f['motDePasse'].addValidators(Validators.required);
    this.f['motDePasse'].updateValueAndValidity();
    this.showForm.set(true);
  }

  ouvrirModifier(u: User) {
    this.editingUser.set(u);
    this.userForm.patchValue({ ...u, motDePasse: '', serviceId: u.serviceId ?? null });
    this.f['motDePasse'].clearValidators();
    this.f['motDePasse'].updateValueAndValidity();
    this.showForm.set(true);
  }

  sauvegarder() {
    if (this.userForm.invalid) { this.userForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const v = this.userForm.value;

    if (this.editingUser()) {
      const dto: UserUpdateDto = { prenom: v.prenom!, nom: v.nom!, email: v.email!,
                                   tel: v.tel!, role: v.role!, serviceId: v.serviceId ?? undefined };
      this.userSvc.update(this.editingUser()!.id, dto).subscribe({
        next: u => {
          this.state.updateUser(u); this.saving.set(false);
          this.showForm.set(false);
          this.snack.open('Utilisateur mis à jour.', '', { duration: 3000 });
        },
        error: () => { this.saving.set(false); this.snack.open('Erreur.', '', { duration: 3000 }); },
      });
    } else {
      const dto: UserCreateDto = { prenom: v.prenom!, nom: v.nom!, email: v.email!,
                                   tel: v.tel!, role: v.role!, motDePasse: v.motDePasse!,
                                   serviceId: v.serviceId ?? undefined };
      this.userSvc.create(dto).subscribe({
        next: u => {
          this.state.addUser(u); this.saving.set(false);
          this.showForm.set(false);
          this.snack.open('Utilisateur créé.', '', { duration: 3000 });
        },
        error: () => { this.saving.set(false); this.snack.open('Erreur.', '', { duration: 3000 }); },
      });
    }
  }

  supprimer(u: User) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Supprimer l\'utilisateur',
              message: `Supprimer ${u.prenom} ${u.nom} ?`, danger: true, confirm: 'Supprimer' }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.userSvc.delete(u.id).subscribe({
        next: () => { this.state.removeUser(u.id); this.snack.open('Supprimé.', '', { duration: 3000 }); },
        error: () => this.snack.open('Erreur.', '', { duration: 3000 }),
      });
    });
  }

  ouvrirAffecter(u: User) {
    this.affecterUser.set(u);
    this.affecterSvcCtrl.setValue(u.serviceId ?? null);
    this.showAffecter.set(true);
  }

  confirmerAffectation() {
    const u   = this.affecterUser();
    if (!u) return;
    const svc = this.affecterSvcCtrl.value;
    this.userSvc.affecterService(u.id, svc).subscribe({
      next: updated => {
        this.state.updateUser(updated);
        this.showAffecter.set(false);
        this.snack.open('Affectation mise à jour.', '', { duration: 3000 });
      },
      error: () => this.snack.open('Erreur.', '', { duration: 3000 }),
    });
  }

  togglePwd(): void { this.showPwd.update(v => !v); }
}
