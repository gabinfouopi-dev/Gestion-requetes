import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { API_ENDPOINTS, JWT_KEY, USER_KEY } from '../constants/api.constants';
import { LoginRequest, LoginResponse, User } from '../models';
import { Role } from '../enums/role.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  // ── Signals ─────────────────────────────────────────────────────────────
  private _currentUser = signal<User | null>(this.loadUser());
  private _token       = signal<string | null>(this.loadToken());

  readonly currentUser    = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token() && !!this._currentUser());
  readonly userRole        = computed(() => this._currentUser()?.role ?? null);
  readonly isStudent       = computed(() => this.userRole() === Role.ETUDIANT);
  readonly isAgent         = computed(() => this.userRole() === Role.AGENT);
  readonly isAdmin         = computed(() => this.userRole() === Role.ADMIN);
  readonly userFullName    = computed(() => {
    const u = this._currentUser();
    return u ? `${u.prenom} ${u.nom}` : '';
  });
  readonly userInitials    = computed(() => {
    const u = this._currentUser();
    return u ? `${u.prenom[0]}${u.nom[0]}`.toUpperCase() : '';
  });

  // ── Méthodes ─────────────────────────────────────────────────────────────
  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials).pipe(
      tap(res => {
        console.log(res);
        this.saveToken(res.token);
        this.saveUser(res.user);
        this._token.set(res.token);
        this._currentUser.set(res.user);
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    localStorage.removeItem(JWT_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  hasRole(role: Role): boolean {
    return this._currentUser()?.role === role;
  }

  getRedirectRoute(): string {
    const role = this.userRole();
    if (role === Role.ETUDIANT) return '/student/dashboard';
    if (role === Role.AGENT)    return '/agent/dashboard';
    if (role === Role.ADMIN)    return '/admin/dashboard';
    return '/login';
  }

  refreshUser() {
    return this.http.get<User>(API_ENDPOINTS.AUTH.ME).pipe(
      tap(user => {
        this.saveUser(user);
        this._currentUser.set(user);
      })
    );
  }

  // ── Persistence localStorage ─────────────────────────────────────────────
  private saveToken(token: string): void {
    localStorage.setItem(JWT_KEY, token);
  }

  private saveUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private loadToken(): string | null {
    return localStorage.getItem(JWT_KEY);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }
}
