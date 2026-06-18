import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainLayoutComponent, NavItem } from '../../../shared/layouts/main-layout/main-layout.component';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';
import { StudentState } from '../student.state';
import { RequestService } from '../../../core/services/request.service';
import { CategoryService } from '../../../core/services/domain.services';
import { AttachmentService } from '../../../core/services/inter-attachment.services';
import { Category } from '../../../core/models';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector:   'app-create-request',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatProgressSpinnerModule, MatStepperModule,
    MainLayoutComponent, FileUploadComponent,
  ],
  template: `
    <app-main-layout [navItems]="navItems" pageTitle="Nouvelle Requête">

      <div class="page-header">
        <div class="page-header__breadcrumb">
          <a routerLink="/student/dashboard">Accueil</a>
          <span>/</span>
          <a routerLink="/student/requests">Mes requêtes</a>
          <span>/</span><span>Nouvelle</span>
        </div>
        <h1 class="page-header__title">Nouvelle Requête</h1>
        <p class="page-header__subtitle">
          Remplissez le formulaire ci-dessous pour soumettre votre demande.
        </p>
      </div>

      <div class="create-layout">

        <!-- Formulaire -->
        <mat-card class="form-card">
          <mat-card-content>
            <mat-stepper [linear]="false" #stepper orientation="vertical">

              <!-- Étape 1 : Informations -->
              <mat-step [stepControl]="infoForm" label="Informations de la requête">
                <form [formGroup]="infoForm">

                  <mat-form-field class="full-width">
                    <mat-label>Objet <span class="req">*</span></mat-label>
                    <input matInput formControlName="objet"
                           placeholder="Ex: Demande de relevé de notes"/>
                    @if (infoForm.get('objet')?.hasError('required') && infoForm.get('objet')?.touched) {
                      <mat-error>L'objet est requis</mat-error>
                    }
                    @if (infoForm.get('objet')?.hasError('minlength')) {
                      <mat-error>Minimum 5 caractères</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field class="full-width">
                    <mat-label>Catégorie <span class="req">*</span></mat-label>
                    <mat-select formControlName="categorieId">
                      <mat-option value="">-- Sélectionner --</mat-option>
                      @for (c of categories(); track c.id) {
                        <mat-option [value]="c.id">
                          {{ c.nom }}
                          <span style="color:#94a3b8;font-size:.8rem">
                            — {{ c.service?.nom }}
                          </span>
                        </mat-option>
                      }
                    </mat-select>
                    @if (infoForm.get('categorieId')?.hasError('required') && infoForm.get('categorieId')?.touched) {
                      <mat-error>La catégorie est requise</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field class="full-width">
                    <mat-label>Description <span class="req">*</span></mat-label>
                    <textarea matInput formControlName="description" rows="5"
                              placeholder="Décrivez votre demande en détail…"></textarea>
                    <mat-hint align="end">
                      {{ infoForm.get('description')?.value?.length ?? 0 }} / 500
                    </mat-hint>
                    @if (infoForm.get('description')?.hasError('required') && infoForm.get('description')?.touched) {
                      <mat-error>La description est requise</mat-error>
                    }
                  </mat-form-field>

                  <div class="step-actions">
                    <button mat-raised-button color="primary"
                            matStepperNext type="button"
                            [disabled]="infoForm.invalid">
                      Suivant <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Étape 2 : Pièces jointes -->
              <mat-step label="Pièces jointes (optionnel)">
                <div class="pj-step">
                  <p class="pj-hint-text">
                    Joignez tout document justificatif utile au traitement de votre requête.
                  </p>
                  <app-file-upload
                    acceptLabel="PDF, DOC, JPG, PNG"
                    [maxSizeMb]="5"
                    (filesChange)="onFilesChange($event)"/>
                </div>

                <div class="step-actions">
                  <button mat-stroked-button matStepperPrevious type="button">
                    <mat-icon>arrow_back</mat-icon> Précédent
                  </button>
                  <button mat-raised-button color="primary"
                          matStepperNext type="button">
                    Suivant <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </mat-step>

              <!-- Étape 3 : Confirmation -->
              <mat-step label="Confirmation et envoi">
                <div class="summary-card">
                  <h3>Récapitulatif</h3>
                  <div class="summary-row">
                    <span>Objet</span>
                    <strong>{{ infoForm.get('objet')?.value }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Catégorie</span>
                    <strong>{{ getCategoryName() }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Pièces jointes</span>
                    <strong>{{ selectedFiles().length }} fichier(s)</strong>
                  </div>
                  <div class="summary-row" style="align-items:flex-start">
                    <span>Description</span>
                    <p style="flex:1;font-size:.875rem;line-height:1.6">
                      {{ infoForm.get('description')?.value }}
                    </p>
                  </div>
                </div>

                <div class="step-actions">
                  <button mat-stroked-button matStepperPrevious type="button">
                    <mat-icon>arrow_back</mat-icon> Précédent
                  </button>
                  <button mat-stroked-button (click)="save('brouillon')"
                          [disabled]="submitting()">
                    <mat-icon>save</mat-icon> Brouillon
                  </button>
                  <button mat-raised-button color="primary"
                          (click)="save('soumettre')"
                          [disabled]="submitting() || infoForm.invalid">
                    @if (submitting()) {
                      <mat-progress-spinner diameter="18" mode="indeterminate"/>
                    } @else {
                      <mat-icon>send</mat-icon>
                    }
                    Soumettre
                  </button>
                </div>
              </mat-step>

            </mat-stepper>
          </mat-card-content>
        </mat-card>

        <!-- Aide -->
        <div class="help-panel">
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon>help_outline</mat-icon> Conseils
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <ul class="help-list">
                <li>Rédigez un objet précis et concis.</li>
                <li>Sélectionnez la catégorie correspondant à votre demande.</li>
                <li>Joignez tous les documents justificatifs nécessaires.</li>
                <li>Vous pouvez sauvegarder en brouillon et soumettre plus tard.</li>
              </ul>
            </mat-card-content>
          </mat-card>
        </div>

      </div>

    </app-main-layout>
  `,
  styles: [`
    .create-layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
    .form-card mat-card-content { padding: 8px 0; }
    .full-width { width: 100%; margin-bottom: 4px; }
    .req { color: #c62828; }
    .step-actions { display: flex; gap: 10px; align-items: center;
                    padding: 16px 0 8px; flex-wrap: wrap; }
    .pj-step { padding: 8px 0 16px; }
    .pj-hint-text { font-size: .875rem; color: #64748b; margin-bottom: 14px; }
    .summary-card {
      background: #f8fafc; border-radius: 10px; padding: 20px;
      border: 1px solid #e2e8f0; margin: 8px 0 16px;
    }
    .summary-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 14px; }
    .summary-row {
      display: flex; align-items: center; gap: 16px;
      padding: 9px 0; border-bottom: 1px solid #e2e8f0; font-size: .875rem;
      span { width: 110px; color: #64748b; flex-shrink: 0; }
      strong { color: #1e293b; }
      &:last-child { border-bottom: none; }
    }
    .help-list { padding-left: 18px; display: flex; flex-direction: column; gap: 8px; }
    .help-list li { font-size: .875rem; color: #64748b; line-height: 1.5; }
    @media(max-width:768px) { .create-layout { grid-template-columns: 1fr; } }
  `],
})
export class CreateRequestComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private reqSvc  = inject(RequestService);
  private catSvc  = inject(CategoryService);
  private attSvc  = inject(AttachmentService);
  private snack   = inject(MatSnackBar);
  private router  = inject(Router);
  auth            = inject(AuthService);
  state           = inject(StudentState);

  categories   = signal<Category[]>([]);
  selectedFiles= signal<File[]>([]);
  submitting   = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',    icon: 'dashboard',       route: '/student/dashboard' },
    { label: 'Mes requêtes', icon: 'description',     route: '/student/requests' },
    { label: 'Mes réponses', icon: 'mark_email_read', route: '/student/responses' },
    { label: 'Suivi',        icon: 'timeline',        route: '/student/tracking' },
  ];

  infoForm = this.fb.group({
    objet:       ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    categorieId: [null as number | null, Validators.required],
  });

  ngOnInit() {
    this.catSvc.getAll().subscribe(cats => this.categories.set(cats));
  }

  onFilesChange(files: File[]) {
    this.selectedFiles.set(files);
  }

  getCategoryName(): string {
    const id = this.infoForm.get('categorieId')?.value;
    return this.categories().find(c => c.id === id)?.nom ?? '—';
  }

  save(mode: 'brouillon' | 'soumettre') {
    if (mode === 'soumettre' && this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);

    const dto = {
      objet:       this.infoForm.value.objet!,
      description: this.infoForm.value.description!,
      categorieId: this.infoForm.value.categorieId!,
      utilisateurId: this.auth.currentUser()?.id,
    };

    // this.reqSvc.getMyRequests(this.auth.currentUser()?.id)

    this.reqSvc.create(dto).pipe(
      switchMap(req => {
        // Upload des pièces jointes si présentes
        if (this.selectedFiles().length === 0) return of(req);
        const uploads = this.selectedFiles().map(f =>
          this.attSvc.upload(f, { requeteId: req.id })
        );
        return forkJoin(uploads).pipe(switchMap(() => of(req)));
      }),
      switchMap(req =>
        mode === 'soumettre' ? this.reqSvc.submit(req.id) : of(req)
      )
    ).subscribe({
      next: req => {
        this.state.addRequest(req);
        this.submitting.set(false);
        const msg = mode === 'soumettre' ? 'Requête soumise !' : 'Brouillon sauvegardé.';
        this.snack.open(msg, '', { duration: 3000 });
        this.router.navigate(['/student/requests']);
      },
      error: () => {
        this.submitting.set(false);
        this.snack.open('Une erreur est survenue.', '', { duration: 3000 });
      },
    });
  }
}
