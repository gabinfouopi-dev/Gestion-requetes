import { Component, Input, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RequestStatus, REQUEST_STATUS_LABELS } from '../../core/enums/request-status.enum';

// ─── StatusBadgeComponent ─────────────────────────────────────────────────
@Component({
  selector:   'app-status-badge',
  standalone: true,
  imports:    [CommonModule, MatChipsModule],
  template: `
    <span class="status-badge status-badge--{{ statusClass }}">
      {{ label }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 999px;
      font-size: .75rem; font-weight: 600; white-space: nowrap;
    }
    .status-badge--brouillon  { background: #f1f5f9; color: #475569; }
    .status-badge--en_attente { background: #fff8e1; color: #f57f17; }
    .status-badge--en_cours   { background: #e1f5fe; color: #0277bd; }
    .status-badge--traite     { background: #e8f5e9; color: #2e7d32; }
    .status-badge--rejete     { background: #ffebee; color: #c62828; }
  `],
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: RequestStatus;
  get label() { return REQUEST_STATUS_LABELS[this.status] ?? this.status; }
  get statusClass() { return this.status?.toLowerCase(); }
}

// ─── EmptyStateComponent ──────────────────────────────────────────────────
@Component({
  selector:   'app-empty-state',
  standalone: true,
  imports:    [MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-state__icon">{{ icon }}</mat-icon>
      <p class="empty-state__title">{{ title }}</p>
      <p class="empty-state__sub">{{ subtitle }}</p>
      @if (actionLabel) {
        <button mat-raised-button color="primary" (click)="onAction()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 60px 24px; text-align: center;
    }
    .empty-state__icon { font-size: 3rem; width: 3rem; height: 3rem; color: #94a3b8; margin-bottom: 16px; }
    .empty-state__title { font-size: 1.05rem; font-weight: 600; color: #1e293b; margin: 0 0 6px; }
    .empty-state__sub   { font-size: .875rem; color: #64748b; margin: 0 0 20px; }
  `],
})
export class EmptyStateComponent {
  @Input() icon        = 'inbox';
  @Input() title       = 'Aucune donnée';
  @Input() subtitle    = '';
  @Input() actionLabel = '';
  @Input() onAction    = () => {};
}

// ─── ConfirmDialogComponent ───────────────────────────────────────────────
export interface ConfirmDialogData {
  title:   string;
  message: string;
  confirm?: string;
  cancel?:  string;
  danger?:  boolean;
}

@Component({
  selector:   'app-confirm-dialog',
  standalone: true,
  imports:    [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      @if (data.danger) { <mat-icon color="warn">warning</mat-icon> }
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">
        {{ data.cancel ?? 'Annuler' }}
      </button>
      <button mat-raised-button
              [color]="data.danger ? 'warn' : 'primary'"
              [mat-dialog-close]="true">
        {{ data.confirm ?? 'Confirmer' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
