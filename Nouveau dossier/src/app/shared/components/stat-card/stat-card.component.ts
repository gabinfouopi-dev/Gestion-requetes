import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface StatCardData {
  label:  string;
  value:  number | string;
  icon:   string;
  color?: 'primary' | 'accent' | 'warn' | 'success' | 'info';
  trend?: { value: number; direction: 'up' | 'down' };
}

@Component({
  selector:   'app-stat-card',
  standalone: true,
  imports:    [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="stat-card stat-card--{{ data.color ?? 'primary' }}">
      <mat-card-content>
        <div class="stat-card__body">
          <div class="stat-card__icon-wrapper">
            <mat-icon>{{ data.icon }}</mat-icon>
          </div>
          <div class="stat-card__info">
            <span class="stat-card__value">{{ data.value }}</span>
            <span class="stat-card__label">{{ data.label }}</span>
            @if (data.trend) {
              <span class="stat-card__trend stat-card__trend--{{ data.trend.direction }}">
                <mat-icon>{{ data.trend.direction === 'up' ? 'trending_up' : 'trending_down' }}</mat-icon>
                {{ data.trend.value }}%
              </span>
            }
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stat-card { cursor: default; transition: transform .2s, box-shadow .2s; }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.1); }
    .stat-card__body { display: flex; align-items: center; gap: 16px; padding: 8px 0; }
    .stat-card__icon-wrapper {
      width: 52px; height: 52px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 1.5rem;
    }
    .stat-card--primary  .stat-card__icon-wrapper { background: #e3f2fd; color: #1565c0; }
    .stat-card--accent   .stat-card__icon-wrapper { background: #e8f5e9; color: #2e7d32; }
    .stat-card--warn     .stat-card__icon-wrapper { background: #fff8e1; color: #f57f17; }
    .stat-card--success  .stat-card__icon-wrapper { background: #e8f5e9; color: #2e7d32; }
    .stat-card--info     .stat-card__icon-wrapper { background: #e1f5fe; color: #0277bd; }
    .stat-card__info { display: flex; flex-direction: column; }
    .stat-card__value { font-size: 2rem; font-weight: 700; line-height: 1; color: #1e293b; }
    .stat-card__label { font-size: .82rem; color: #64748b; margin-top: 4px; }
    .stat-card__trend { display: flex; align-items: center; gap: 2px; font-size: .75rem; margin-top: 4px; }
    .stat-card__trend--up   { color: #2e7d32; }
    .stat-card__trend--down { color: #c62828; }
    .stat-card__trend mat-icon { font-size: 14px; width: 14px; height: 14px; }
  `],
})
export class StatCardComponent {
  @Input({ required: true }) data!: StatCardData;
}
