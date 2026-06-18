import {
  Component, Output, EventEmitter, Input,
  HostListener, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FileSizePipe } from '../../pipes';

export interface UploadedFile {
  file:     File;
  preview?: string;
  progress: number;
  error?:   string;
}

@Component({
  selector:   'app-file-upload',
  standalone: true,
  imports:    [CommonModule, MatIconModule, MatButtonModule, MatProgressBarModule, FileSizePipe],
  template: `
    <div class="file-upload" [class.file-upload--drag]="isDragging()"
         (dragover)="onDragOver($event)" (dragleave)="onDragLeave()"
         (drop)="onDrop($event)" (click)="fileInput.click()">
      <mat-icon>cloud_upload</mat-icon>
      <p>Glissez vos fichiers ici ou <strong>parcourir</strong></p>
      <p class="file-upload__hint">{{ acceptLabel }} — max {{ maxSizeMb }} Mo</p>
      <input #fileInput type="file" [multiple]="multiple" [accept]="accept"
             (change)="onFileChange($event)" hidden/>
    </div>

    @if (files().length > 0) {
      <div class="file-list">
        @for (f of files(); track f.file.name) {
          <div class="file-item">
            <mat-icon class="file-item__icon">{{ getIcon(f.file.name) }}</mat-icon>
            <div class="file-item__info">
              <span class="file-item__name">{{ f.file.name }}</span>
              <span class="file-item__size">{{ f.file.size | fileSize }}</span>
              @if (f.progress > 0 && f.progress < 100) {
                <mat-progress-bar mode="determinate" [value]="f.progress"/>
              }
              @if (f.error) {
                <span class="file-item__error">{{ f.error }}</span>
              }
            </div>
            <button mat-icon-button (click)="remove(f); $event.stopPropagation()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .file-upload {
      border: 2px dashed #cbd5e1; border-radius: 10px; padding: 28px;
      text-align: center; cursor: pointer; transition: border-color .2s, background .2s;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
    }
    .file-upload:hover, .file-upload--drag {
      border-color: #1a3c6e; background: #ebf2fa;
    }
    .file-upload mat-icon { font-size: 2.2rem; width: 2.2rem; height: 2.2rem; color: #94a3b8; }
    .file-upload p { font-size: .875rem; color: #64748b; margin: 0; }
    .file-upload strong { color: #1a3c6e; }
    .file-upload__hint { font-size: .75rem !important; color: #94a3b8 !important; }
    .file-list { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
    .file-item {
      display: flex; align-items: center; gap: 10px; padding: 10px 14px;
      background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;
    }
    .file-item__icon { color: #64748b; flex-shrink: 0; }
    .file-item__info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .file-item__name { font-size: .875rem; font-weight: 500; }
    .file-item__size { font-size: .75rem; color: #94a3b8; }
    .file-item__error { font-size: .75rem; color: #c62828; }
  `],
})
export class FileUploadComponent {
  @Input() multiple    = true;
  @Input() accept      = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
  @Input() acceptLabel = 'PDF, DOC, JPG';
  @Input() maxSizeMb   = 5;

  @Output() filesChange = new EventEmitter<File[]>();

  files     = signal<UploadedFile[]>([]);
  isDragging= signal(false);

  @HostListener('dragover', ['$event'])
  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging.set(true); }

  onDragLeave() { this.isDragging.set(false); }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    const dt = e.dataTransfer?.files;
    if (dt) this.addFiles(Array.from(dt));
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) this.addFiles(Array.from(input.files));
    input.value = '';
  }

  addFiles(newFiles: File[]) {
    const maxBytes = this.maxSizeMb * 1024 * 1024;
    const valid = newFiles.map(f => ({
      file: f,
      progress: 0,
      error: f.size > maxBytes ? `Fichier trop lourd (max ${this.maxSizeMb} Mo)` : undefined,
    }));
    this.files.update(cur => [...cur, ...valid]);
    this.emit();
  }

  remove(target: UploadedFile) {
    this.files.update(cur => cur.filter(f => f !== target));
    this.emit();
  }

  private emit() {
    this.filesChange.emit(this.files().filter(f => !f.error).map(f => f.file));
  }

  getIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['doc','docx'].includes(ext ?? '')) return 'description';
    if (['jpg','jpeg','png','gif'].includes(ext ?? '')) return 'image';
    return 'attach_file';
  }
}
