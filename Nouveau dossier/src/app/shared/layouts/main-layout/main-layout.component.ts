import { Component, Input, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/enums/role.enum';

export interface NavItem {
  label:  string;
  icon:   string;
  route:  string;
  badge?: number;
  roles?: Role[];
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────
@Component({
  selector:   'app-navbar',
  standalone: true,
  imports:    [CommonModule, MatToolbarModule, MatButtonModule,
               MatIconModule, MatMenuModule, MatDividerModule],
  template: `
    <mat-toolbar class="navbar" color="primary">
      <button mat-icon-button (click)="toggleSidebar.emit()" class="navbar__menu-btn">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="navbar__title">{{ pageTitle }}</span>
      <span class="navbar__spacer"></span>

      <!-- Bouton profil -->
      <button mat-button [matMenuTriggerFor]="userMenu" class="navbar__user-btn">
        <div class="navbar__avatar">{{ auth.userInitials() }}</div>
        <div class="navbar__user-info">
          <span class="navbar__user-name">{{ auth.userFullName() }}</span>
          <span class="navbar__user-role">{{ roleLabel }}</span>
        </div>
        <mat-icon>expand_more</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu">
        <div class="user-menu-header" mat-menu-item disabled>
          <strong>{{ auth.userFullName() }}</strong>
          <br/><small>{{ auth.currentUser()?.email }}</small>
        </div>
        <mat-divider/>
        <button mat-menu-item (click)="auth.logout()">
          <mat-icon>logout</mat-icon>
          Déconnexion
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .navbar { position: fixed; top: 0; left: 260px; right: 0; z-index: 100;
              box-shadow: 0 2px 8px rgba(0,0,0,.08); transition: left .3s; }
    .navbar__menu-btn { display: none; }
    .navbar__title { font-size: 1.05rem; font-weight: 600; }
    .navbar__spacer { flex: 1; }
    .navbar__user-btn { display: flex; align-items: center; gap: 8px; padding: 4px 8px; }
    .navbar__avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(255,255,255,.2); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: .85rem; font-weight: 700; flex-shrink: 0;
    }
    .navbar__user-info { display: flex; flex-direction: column; text-align: left; }
    .navbar__user-name { font-size: .85rem; font-weight: 600; line-height: 1.2; }
    .navbar__user-role { font-size: .72rem; opacity: .75; }
    .user-menu-header { line-height: 1.4; padding: 12px 16px; cursor: default; }
    @media(max-width:992px) {
      .navbar { left: 0; }
      .navbar__menu-btn { display: flex; }
    }
  `],
  outputs: ['toggleSidebar'],
})
export class NavbarComponent {
  @Input() pageTitle = 'UniRequêtes';
  toggleSidebar = new (class extends EventEmitter<void> {})(false);
  auth = inject(AuthService);

  get roleLabel(): string {
    const labels: Record<Role, string> = {
      [Role.ETUDIANT]: 'Étudiant',
      [Role.AGENT]:    'Agent administratif',
      [Role.ADMIN]:    'Administrateur',
    };
    return this.auth.userRole() ? labels[this.auth.userRole()!] : '';
  }
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────
@Component({
  selector:   'app-sidebar',
  standalone: true,
  imports:    [CommonModule, RouterLink, RouterLinkActive,
               MatListModule, MatIconModule, MatButtonModule, MatDividerModule, MatBadgeModule],
  template: `
    <aside class="sidebar" [class.sidebar--open]="isOpen()">
      <!-- Brand -->
      <div class="sidebar__brand">
        <div class="sidebar__logo"><mat-icon>school</mat-icon></div>
        <div>
          <div class="sidebar__brand-name">UniRequêtes</div>
          <div class="sidebar__brand-sub">Institut Universitaire</div>
        </div>
      </div>

      <!-- User info -->
      <div class="sidebar__user">
        <div class="sidebar__avatar">{{ auth.userInitials() }}</div>
        <div class="sidebar__user-info">
          <div class="sidebar__user-name">{{ auth.userFullName() }}</div>
          <div class="sidebar__user-role">{{ auth.currentUser()?.email }}</div>
        </div>
      </div>

      <mat-divider/>

      <!-- Navigation -->
      <nav class="sidebar__nav">
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route" routerLinkActive="sidebar__item--active"
             class="sidebar__item">
            <mat-icon [matBadge]="item.badge" [matBadgeHidden]="!item.badge"
                      matBadgeColor="warn" matBadgeSize="small">{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- Footer -->
      <div class="sidebar__footer">
        <mat-divider/>
        <button class="sidebar__item sidebar__item--logout" (click)="auth.logout()">
          <mat-icon>logout</mat-icon>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Overlay mobile -->
    @if (isOpen()) {
      <div class="sidebar__overlay" (click)="isOpen.set(false)"></div>
    }
  `,
  styles: [`
    .sidebar {
      position: fixed; top: 0; left: 0; bottom: 0; width: 260px;
      background: #0f2440; color: #fff; display: flex; flex-direction: column;
      z-index: 200; overflow: hidden; transition: transform .3s;
    }
    .sidebar__brand {
      padding: 20px 20px 14px; display: flex; align-items: center; gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,.07);
    }
    .sidebar__logo {
      width: 40px; height: 40px; background: #2e6da4; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sidebar__brand-name { font-weight: 700; font-size: .95rem; }
    .sidebar__brand-sub  { font-size: .72rem; color: rgba(255,255,255,.5); }
    .sidebar__user {
      padding: 14px 20px; display: flex; align-items: center; gap: 10px;
      border-bottom: 1px solid rgba(255,255,255,.07);
    }
    .sidebar__avatar {
      width: 36px; height: 36px; border-radius: 50%; background: #2e6da4;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: .85rem; flex-shrink: 0;
    }
    .sidebar__user-name  { font-size: .875rem; font-weight: 600; }
    .sidebar__user-role  { font-size: .72rem; color: rgba(255,255,255,.5); }
    .sidebar__nav { flex: 1; overflow-y: auto; padding: 12px 10px; }
    .sidebar__item {
      display: flex; align-items: center; gap: 12px; padding: 10px 14px;
      border-radius: 8px; color: rgba(255,255,255,.7); font-size: .875rem;
      font-weight: 500; text-decoration: none; cursor: pointer;
      transition: background .15s, color .15s; border: none; width: 100%;
      background: none; text-align: left; margin-bottom: 2px;
    }
    .sidebar__item:hover { background: rgba(255,255,255,.08); color: #fff; }
    .sidebar__item--active { background: #2e6da4 !important; color: #fff !important;
                             box-shadow: 0 4px 12px rgba(46,109,164,.4); }
    .sidebar__footer { padding: 10px 10px 14px; }
    .sidebar__item--logout { color: #f87171 !important; }
    .sidebar__item--logout:hover { background: rgba(239,68,68,.12) !important; }
    .sidebar__overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 199;
    }
    @media(max-width:992px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar--open { transform: translateX(0); }
    }
  `],
})
export class SidebarComponent {
  @Input({ required: true }) navItems: NavItem[] = [];
  auth   = inject(AuthService);
  isOpen = signal(false);
}

// ─── MAIN LAYOUT ──────────────────────────────────────────────────────────
import { EventEmitter } from '@angular/core';

@Component({
  selector:   'app-main-layout',
  standalone: true,
  imports:    [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <app-sidebar [navItems]="navItems" #sidebar/>
    <app-navbar [pageTitle]="pageTitle" (toggleSidebar)="toggleSidebar()"/>
    <main class="main-content">
      <div class="page-body">
        <ng-content/>
      </div>
    </main>
  `,
  styles: [`
    .main-content { margin-left: 260px; padding-top: 64px; min-height: 100vh;
                    transition: margin-left .3s; }
    .page-body { padding: 28px 32px; }
    @media(max-width:992px) { .main-content { margin-left: 0; } .page-body { padding: 20px 16px; } }
  `],
})
export class MainLayoutComponent {
  @Input({ required: true }) navItems:  NavItem[] = [];
  @Input() pageTitle = 'UniRequêtes';
  @ViewChild('sidebar') sidebarRef!: SidebarComponent;

  toggleSidebar(): void { this.sidebarRef.isOpen.update(v => !v); }
}
