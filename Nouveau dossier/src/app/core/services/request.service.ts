import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  Request, RequestCreateDto, RequestUpdateDto,
  RequestStatusDto, Page
} from '../models';
import { RequestStatus } from '../enums/request-status.enum';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private http = inject(HttpClient);

  /** Requêtes de l'étudiant connecté */
  getMyRequests(userid: number): Observable<Request[]> {
    return this.http.get<Request[]>(API_ENDPOINTS.REQUESTS.MY(userid));
  }

  /** Requêtes d'un service (agent) */
  getByService(serviceId: number): Observable<Request[]> {
    return this.http.get<Request[]>(API_ENDPOINTS.REQUESTS.BY_SERVICE(serviceId));
  }

  /** Requête par ID */
  getById(id: number): Observable<Request> {
    return this.http.get<Request>(API_ENDPOINTS.REQUESTS.BY_ID(id));
  }

  /** Créer une requête (brouillon) */
  create(dto: RequestCreateDto): Observable<Request> {
    return this.http.post<Request>(API_ENDPOINTS.REQUESTS.BASE, dto);
  }

  /** Modifier une requête (brouillon uniquement) */
  update(id: number, dto: RequestUpdateDto): Observable<Request> {
    return this.http.put<Request>(API_ENDPOINTS.REQUESTS.BY_ID(id), dto);
  }

  /** Supprimer une requête (brouillon uniquement) */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.REQUESTS.BY_ID(id));
  }

  /** Soumettre une requête (brouillon → en_attente) */
  submit(id: number): Observable<Request> {
    return this.http.patch<Request>(API_ENDPOINTS.REQUESTS.SOUMETTRE(id), {});
  }

  /** Changer le statut (agent) */
  changeStatus(id: number, dto: RequestStatusDto): Observable<Request> {
    return this.http.patch<Request>(API_ENDPOINTS.REQUESTS.STATUT(id), dto);
  }

  /** Toutes les requêtes avec pagination (admin) */
  getAll(page = 0, size = 20): Observable<Page<Request>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Request>>(API_ENDPOINTS.REQUESTS.BASE, { params });
  }
}
