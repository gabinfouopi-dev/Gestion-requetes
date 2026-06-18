import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  Response, ResponseCreateDto,
  Category, CategoryDto,
  User, UserCreateDto, UserUpdateDto,
  ServiceModel
} from '../models';

// ─── ResponseService ────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ResponseService {
  private http = inject(HttpClient);

  getByRequest(requestId: number): Observable<Response> {
    return this.http.get<Response>(API_ENDPOINTS.RESPONSES.BY_REQUEST(requestId));
  }

  getById(id: number): Observable<Response> {
    return this.http.get<Response>(API_ENDPOINTS.RESPONSES.BY_ID(id));
  }

  create(dto: ResponseCreateDto): Observable<Response> {
    return this.http.post<Response>(API_ENDPOINTS.RESPONSES.BASE, dto);
  }

  getMyResponses(userid: number): Observable<Response[]> {
    return this.http.get<Response[]>(API_ENDPOINTS.RESPONSES.MY(userid));
  }
}

// ─── CategoryService ─────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(API_ENDPOINTS.CATEGORIES.BASE);
  }

  getByService(serviceId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_ENDPOINTS.CATEGORIES.BASE}/service/${serviceId}`);
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(API_ENDPOINTS.CATEGORIES.BY_ID(id));
  }

  create(dto: CategoryDto): Observable<Category> {
    return this.http.post<Category>(API_ENDPOINTS.CATEGORIES.BASE, dto);
  }

  update(id: number, dto: CategoryDto): Observable<Category> {
    return this.http.put<Category>(API_ENDPOINTS.CATEGORIES.BY_ID(id), dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.CATEGORIES.BY_ID(id));
  }
}

// ─── UserService ─────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(API_ENDPOINTS.USERS.BASE);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
  }

  create(dto: UserCreateDto): Observable<User> {
    return this.http.post<User>(API_ENDPOINTS.USERS.BASE, dto);
  }

  update(id: number, dto: UserUpdateDto): Observable<User> {
    return this.http.put<User>(API_ENDPOINTS.USERS.BY_ID(id), dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.USERS.BY_ID(id));
  }

  affecterService(userId: number, serviceId: number | null): Observable<User> {
    return this.http.patch<User>(API_ENDPOINTS.USERS.AFFECTER(userId), { serviceId });
  }
}

// ─── ServiceService ───────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ServiceService {
  private http = inject(HttpClient);

  getAll(): Observable<ServiceModel[]> {
    return this.http.get<ServiceModel[]>(API_ENDPOINTS.SERVICES.BASE);
  }

  getById(id: number): Observable<ServiceModel> {
    return this.http.get<ServiceModel>(API_ENDPOINTS.SERVICES.BY_ID(id));
  }

  create(dto: Partial<ServiceModel>): Observable<ServiceModel> {
    return this.http.post<ServiceModel>(API_ENDPOINTS.SERVICES.BASE, dto);
  }

  update(id: number, dto: Partial<ServiceModel>): Observable<ServiceModel> {
    return this.http.put<ServiceModel>(API_ENDPOINTS.SERVICES.BY_ID(id), dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.SERVICES.BY_ID(id));
  }
}
