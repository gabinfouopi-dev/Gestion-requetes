// ═══ profile-select.component.ts ════════════════════════════════════════════
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector:   'app-profile-select',
  standalone: true,
  imports:    [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="profile-select-page">
      <div class="profile-select__header">
        <mat-icon class="profile-select__logo">school</mat-icon>
        <h1>Portail de Gestion des Requêtes</h1>
        <p>Sélectionnez votre profil pour accéder à votre espace.</p>
      </div>

      <div class="profile-cards">
        @for (profile of profiles; track profile.role) {
          <mat-card class="profile-card profile-card--{{ profile.role }}"
                    [routerLink]="['/login/connexion']" [queryParams]="{ role: profile.role }">
            <mat-card-content>
              <mat-icon>{{ profile.icon }}</mat-icon>
              <h2>{{ profile.label }}</h2>
              <p>{{ profile.description }}</p>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .profile-select-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f2440 0%, #1a3c6e 50%, #2e6da4 100%);
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 40px 20px;
    }
    .profile-select__header { text-align: center; color: #fff; margin-bottom: 48px; }
    .profile-select__logo   { font-size: 3.5rem; width: 3.5rem; height: 3.5rem; margin-bottom: 16px; }
    .profile-select__header h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 10px; }
    .profile-select__header p  { color: rgba(255,255,255,.65); font-size: 1rem; }
    .profile-cards { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
    .profile-card {
      width: 230px; cursor: pointer; text-align: center;
      background: rgba(255,255,255,.09) !important;
      border: 1.5px solid rgba(255,255,255,.15) !important;
      color: #fff !important; transition: transform .25s, box-shadow .25s;
      backdrop-filter: blur(8px);
    }
    .profile-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,.25) !important; }
    .profile-card mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; margin-bottom: 14px; }
    .profile-card h2 { font-size: 1.05rem; font-weight: 700; margin-bottom: 8px; color: #fff; }
    .profile-card p  { font-size: .82rem; color: rgba(255,255,255,.6); line-height: 1.5; }
    .profile-card--etudiant mat-icon { color: #6ee7b7; }
    .profile-card--agent    mat-icon { color: #93c5fd; }
    .profile-card--admin    mat-icon { color: #fca5a5; }
  `],
})
export class ProfileSelectComponent {
  readonly profiles = [
    {
      role: 'etudiant', label: 'Étudiant', icon: 'school',
      description: 'Soumettez vos requêtes et suivez leur traitement.',
    },
    {
      role: 'agent', label: 'Agent administratif', icon: 'badge',
      description: 'Traitez les requêtes et gérez les échanges inter-services.',
    },
    {
      role: 'admin', label: 'Administrateur', icon: 'admin_panel_settings',
      description: 'Gérez les utilisateurs, services et catégories.',
    },
  ];
}
