import { Injectable, inject, signal, computed } from '@angular/core';
import { RequestService } from '../../core/services/request.service';
import { InterServiceRequestService } from '../../core/services/inter-attachment.services';
import { AuthService } from '../../core/services/auth.service';
import { UserService, ServiceService, CategoryService } from '../../core/services/domain.services';
import { Request, InterServiceRequest, User, ServiceModel, Category } from '../../core/models';
import { RequestStatus } from '../../core/enums/request-status.enum';

// ─── AgentState ───────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AgentState {
  private reqSvc  = inject(RequestService);
  private risSvc  = inject(InterServiceRequestService);
  private auth    = inject(AuthService);

  requests         = signal<Request[]>([]);
  interServiceReqs = signal<InterServiceRequest[]>([]);
  loading          = signal(false);
  error            = signal<string | null>(null);

  totalRequests    = computed(() => this.requests().length);
  pendingCount     = computed(() => this.requests()
    .filter(r => r.statut === RequestStatus.EN_ATTENTE).length);
  inProgressCount  = computed(() => this.requests()
    .filter(r => r.statut === RequestStatus.EN_COURS).length);
  resolvedCount    = computed(() => this.requests()
    .filter(r => r.statut === RequestStatus.TRAITE).length);
  risCount         = computed(() => this.interServiceReqs().length);
  risPendingCount  = computed(() => this.interServiceReqs()
    .filter(r => r.statut === RequestStatus.EN_ATTENTE).length);

  loadRequests() {
    const serviceId = this.auth.currentUser()?.service?.id;
    if (!serviceId) return;
    this.loading.set(true);
    this.reqSvc.getByService(serviceId).subscribe({
      next:  reqs => { 
        this.requests.set(reqs); 
        this.loading.set(false); 
      },
      error: err  => { this.error.set(err.message); this.loading.set(false); },
    });
  }

  loadInterServiceRequests() {
    const serviceId = this.auth.currentUser()?.service?.id;
    if (!serviceId) return;
    this.risSvc.getByEmetteur(serviceId).subscribe({
      next: ris => this.interServiceReqs.set(ris),
      error: err => this.error.set(err.message),
    });
  }

  updateRequest(r: Request) {
    this.requests.update(list => list.map(x => x.id === r.id ? r : x));
  }

  updateISRequest(isr: InterServiceRequest) {
    this.interServiceReqs.update(list => list.map(x => x.id === isr.id ? isr : x));
  }
}

// ─── AdminState ───────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AdminState {
  private userSvc = inject(UserService);
  private svcSvc  = inject(ServiceService);
  private catSvc  = inject(CategoryService);

  users      = signal<User[]>([]);
  services   = signal<ServiceModel[]>([]);
  categories = signal<Category[]>([]);
  loading    = signal(false);
  error      = signal<string | null>(null);

  totalUsers    = computed(() => this.users().length);
  totalStudents = computed(() => this.users().filter(u => u.role === 'ETUDIANT' as any).length);
  totalAgents   = computed(() => this.users().filter(u => u.role === 'AGENT' as any).length);

  loadAll() {
    this.loading.set(true);
    this.userSvc.getAll().subscribe({ next: u => this.users.set(u), error: e => this.error.set(e.message) });
    this.svcSvc.getAll().subscribe({ next: s => this.services.set(s), error: e => this.error.set(e.message) });
    this.catSvc.getAll().subscribe({
      next: c => { this.categories.set(c); this.loading.set(false); },
      error: e => { this.error.set(e.message); this.loading.set(false); }
    });
  }

  addUser(u: User)    { this.users.update(list => [u, ...list]); }
  updateUser(u: User) { this.users.update(list => list.map(x => x.id === u.id ? u : x)); }
  removeUser(id: number) { this.users.update(list => list.filter(x => x.id !== id)); }

  addService(s: ServiceModel)    { this.services.update(list => [...list, s]); }
  updateService(s: ServiceModel) { this.services.update(list => list.map(x => x.id === s.id ? s : x)); }
  removeService(id: number)      { this.services.update(list => list.filter(x => x.id !== id)); }

  addCategory(c: Category)    { this.categories.update(list => [...list, c]); }
  updateCategory(c: Category) { this.categories.update(list => list.map(x => x.id === c.id ? c : x)); }
  removeCategory(id: number)  { this.categories.update(list => list.filter(x => x.id !== id)); }
}
