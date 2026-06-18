import { Injectable, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RequestService } from '../../core/services/request.service';
import { ResponseService } from '../../core/services/domain.services';
import { AuthService } from '../../core/services/auth.service';
import { Request, Response } from '../../core/models';
import { RequestStatus } from '../../core/enums/request-status.enum';


// ─── StudentState ─────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class StudentState {
  private reqSvc  = inject(RequestService);
  private respSvc = inject(ResponseService);
  auth            = inject(AuthService);

  // État brut
  requests  = signal<Request[]>([]);
  responses = signal<Response[]>([]);
  loading   = signal(false);
  error     = signal<string | null>(null);

  // Dérivés automatiques (computed)
  totalRequests  = computed(() => this.requests().length);
  pendingCount   = computed(() => this.requests()
    .filter(r => r.statut === RequestStatus.EN_ATTENTE).length);
  inProgressCount= computed(() => this.requests()
    .filter(r => r.statut === RequestStatus.EN_COURS).length);
  resolvedCount  = computed(() => this.requests()
    .filter(r => r.statut === RequestStatus.TRAITE).length);
  responsesCount = computed(() => this.responses().length);

  loadRequests() {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.loading.set(true);
    this.reqSvc.getMyRequests(userId).subscribe({
      next:  reqs => { this.requests.set(reqs); this.loading.set(false); },
      error: err  => { this.error.set(err.message); this.loading.set(false); },
    });
  }

  loadResponses() {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.respSvc.getMyResponses(userId).subscribe({
      next:  reps => {
        this.responses.set(reps);
        for(let re of reps){
          this.respSvc.getById(re.id).subscribe({
            next: r => {
              re.requeteId = r.requeteId;
            }
          })
        }
        this.responses.set(reps);
      },
      error: err  => this.error.set(err.message),
    });
  }

  addRequest(r: Request)   { this.requests.update(list => [r, ...list]); }
  updateRequest(r: Request){ this.requests.update(list => list.map(x => x.id === r.id ? r : x)); }
  removeRequest(id: number){ this.requests.update(list => list.filter(x => x.id !== id)); }
}
