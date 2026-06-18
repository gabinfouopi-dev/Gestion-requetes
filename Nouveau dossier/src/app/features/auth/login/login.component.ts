import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/enums/role.enum';

@Component({
  selector:   'app-login',
  standalone: true,
  imports:    [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-page">

      <!-- Panneau gauche -->
      <div class="login-left">
        <div class="login-left__content">
          <mat-icon class="login-left__logo">school</mat-icon>
          <h1>Gestion des Requêtes Universitaires</h1>
          <p>Une plateforme centralisée pour simplifier toutes vos démarches administratives.</p>

          <div class="login-features">
            @for (f of features; track f.icon) {
              <div class="login-feature">
                <div class="login-feature__icon"><mat-icon>{{ f.icon }}</mat-icon></div>
                <p>{{ f.text }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Panneau droit -->
      <div class="login-right">
        <div class="login-form-container">

          <a class="login-back" routerLink="/login/profile">
            <mat-icon>arrow_back</mat-icon> Changer de profil
          </a>

          <!-- Badge rôle -->
          <div class="role-badge role-badge--{{ currentRole }}">
            <mat-icon>{{ roleIcon }}</mat-icon>
            {{ roleLabel }}
          </div>

          <h2>Bon retour 👋</h2>
          <p class="login-subtitle">Connectez-vous à votre espace.</p>

          <!-- Formulaire -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

            <mat-form-field class="full-width">
              <mat-label>Adresse email</mat-label>
              <input matInput type="email" formControlName="email"
                     placeholder="prenom.nom@univ.cm" autocomplete="email"/>
              <mat-icon matSuffix>email</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>L'email est requis</mat-error>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Format d'email invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput [type]="showPassword() ? 'text' : 'password'"
                     formControlName="motDePasse" autocomplete="current-password"/>
              <button mat-icon-button matSuffix type="button"
                      (click)="togglePassword()">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('motDePasse')?.hasError('required') && form.get('motDePasse')?.touched) {
                <mat-error>Le mot de passe est requis</mat-error>
              }
            </mat-form-field>

            @if (loginError()) {
              <div class="login-error">
                <mat-icon>error_outline</mat-icon>
                {{ loginError() }}
              </div>
            }

            <button mat-raised-button color="primary" type="submit"
                    class="full-width login-btn" [disabled]="loading()">
              @if (loading()) {
                <mat-progress-spinner diameter="20" mode="indeterminate"/>
              } @else {
                <mat-icon>login</mat-icon>
                Se connecter
              }
            </button>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
    .login-left {
      background: linear-gradient(160deg, #0f2440, #1a3c6e 60%, #2e6da4);
      display: flex; align-items: center; justify-content: center; padding: 60px 50px;
    }
    .login-left__content { color: #fff; max-width: 380px; }
    .login-left__logo { font-size: 3rem; width: 3rem; height: 3rem; margin-bottom: 20px; }
    .login-left h1 { font-size: 1.6rem; font-weight: 700; margin-bottom: 12px; line-height: 1.3; }
    .login-left p  { color: rgba(255,255,255,.65); line-height: 1.7; font-size: .9rem; }
    .login-features { margin-top: 32px; display: flex; flex-direction: column; gap: 14px; }
    .login-feature  { display: flex; align-items: flex-start; gap: 12px; }
    .login-feature__icon {
      width: 32px; height: 32px; background: rgba(255,255,255,.1); border-radius: 8px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: #93c5fd; font-size: 1rem; width: 1rem; height: 1rem; }
    }
    .login-feature p { font-size: .85rem; color: rgba(255,255,255,.7); line-height: 1.5; margin: 0; }
    .login-right { display: flex; align-items: center; justify-content: center;
                   padding: 60px; background: #fff; }
    .login-form-container { width: 100%; max-width: 400px; }
    .login-back { display: inline-flex; align-items: center; gap: 6px; font-size: .85rem;
                  color: #64748b; text-decoration: none; margin-bottom: 28px;
                  mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
                  &:hover { color: #1a3c6e; } }
    .role-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 14px; border-radius: 999px; font-size: .82rem;
      font-weight: 600; margin-bottom: 20px;
      mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    }
    .role-badge--etudiant { background: #e8f5e9; color: #2e7d32; }
    .role-badge--agent    { background: #e1f5fe; color: #0277bd; }
    .role-badge--admin    { background: #ffebee; color: #c62828; }
    h2 { font-size: 1.6rem; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
    .login-subtitle { font-size: .875rem; color: #64748b; margin-bottom: 28px; }
    .full-width { width: 100%; }
    mat-form-field { margin-bottom: 6px; }
    .login-error {
      display: flex; align-items: center; gap: 8px; padding: 12px 14px;
      background: #ffebee; color: #c62828; border-radius: 8px;
      font-size: .875rem; margin-bottom: 16px;
      mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    }
    .login-btn { height: 48px; font-size: 1rem; margin-top: 8px;
                 display: flex; align-items: center; justify-content: center; gap: 8px; }
    @media(max-width:768px) { .login-page { grid-template-columns: 1fr; }
      .login-left { display: none; } .login-right { padding: 40px 24px; } }
  `],
})
export class LoginComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private snack  = inject(MatSnackBar);

  form = this.fb.group({
    email:      ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required],
  });

  loading      = signal(false);
  showPassword = signal(false);
  loginError   = signal<string | null>(null);
  currentRole  = signal<string>('etudiant');

  readonly features = [
    { icon: 'send',          text: 'Soumettez vos demandes en ligne sans vous déplacer.' },
    { icon: 'notifications', text: 'Suivez l\'avancement de chaque requête en temps réel.' },
    { icon: 'security',      text: 'Vos données sont protégées et sécurisées.' },
  ];

  get roleLabel(): string {
    const labels: Record<string, string> = {
      etudiant: 'Connexion Étudiant',
      agent:    'Connexion Agent',
      admin:    'Connexion Administrateur',
    };
    return labels[this.currentRole()] ?? 'Connexion';
  }

  get roleIcon(): string {
    const icons: Record<string, string> = {
      etudiant: 'school',
      agent:    'badge',
      admin:    'admin_panel_settings',
    };
    return icons[this.currentRole()] ?? 'person';
  }

  ngOnInit() {
    const role = this.route.snapshot.queryParams['role'];
    if (role) this.currentRole.set(role);
    // Si déjà connecté, rediriger
    if (this.auth.isAuthenticated()) {
      this.router.navigate([this.auth.getRedirectRoute()]);
    }
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.loginError.set(null);

    const { email, motDePasse } = this.form.value;
    this.auth.login({ email: email!, motDePasse: motDePasse! }).subscribe({
      next: () => {
        console.log('Utilisateur :', this.auth.currentUser());
        console.log('Role :', this.auth.userRole());
        console.log('Route :', this.auth.getRedirectRoute());
        this.snack.open(`Bienvenue, ${this.auth.currentUser()?.prenom} !`, '', { duration: 2000 });
        this.router.navigate([this.auth.getRedirectRoute()]);
      },
      error: err => {
        this.loginError.set(
          err.status === 401
            ? 'Email ou mot de passe incorrect.'
            : 'Email ou mot de passe incorrect.'
        );
        this.loading.set(false);
      },
    });
  }

  togglePassword(): void { this.showPassword.update(v => !v); }
}
