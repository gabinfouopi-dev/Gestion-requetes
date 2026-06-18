import { Pipe, PipeTransform } from '@angular/core';

// ─── DateFormatPipe ────────────────────────────────────────────────────────
@Pipe({ name: 'dateFormat', standalone: true })
export class DateFormatPipe implements PipeTransform {
  transform(value: string | null | undefined, format: 'short' | 'long' = 'long'): string {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    if (format === 'short') {
      return d.toLocaleDateString('fr-FR');
    }
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}

// ─── TruncatePipe ─────────────────────────────────────────────────────────
@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, max = 60): string {
    if (!value) return '';
    return value.length > max ? value.slice(0, max) + '…' : value;
  }
}

// ─── FileSizePipe ─────────────────────────────────────────────────────────
@Pipe({ name: 'fileSize', standalone: true })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    if (!bytes) return '—';
    if (bytes < 1024)        return `${bytes} o`;
    if (bytes < 1048576)     return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1048576).toFixed(1)} Mo`;
  }
}
