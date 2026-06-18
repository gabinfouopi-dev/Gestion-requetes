import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  InterServiceRequest,
  InterServiceRequestCreateDto,
  InterServiceRequestReponseDto,
  Attachment,
  ISResponseCreateDto,
  ISResponse,
  RequestStatusDto
} from '../models';

// ─── InterServiceRequestService ───────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class InterServiceRequestService {
  private http = inject(HttpClient);

  getByEmetteur(serviceId: number): Observable<InterServiceRequest[]> {
    return this.http.get<InterServiceRequest[]>(
      API_ENDPOINTS.INTER_SERVICE_REQUESTS.BY_EMETTEUR(serviceId)
    );
  }

  getByRecepteur(serviceId: number): Observable<InterServiceRequest[]> {
    return this.http.get<InterServiceRequest[]>(
      API_ENDPOINTS.INTER_SERVICE_REQUESTS.BY_RECEPTEUR(serviceId)
    );
  }

  getAll(): Observable<InterServiceRequest[]> {
    return this.http.get<InterServiceRequest[]>(
      API_ENDPOINTS.INTER_SERVICE_REQUESTS.BASE
    );
  }

  getById(id: number): Observable<InterServiceRequest> {
    return this.http.get<InterServiceRequest>(
      API_ENDPOINTS.INTER_SERVICE_REQUESTS.BY_ID(id)
    );
  }

  create(dto: InterServiceRequestCreateDto): Observable<InterServiceRequest> {
    return this.http.post<InterServiceRequest>(
      API_ENDPOINTS.INTER_SERVICE_REQUESTS.BASE, dto
    );
  }

  changeStatus(id: number, dto: RequestStatusDto): Observable<InterServiceRequest> {
      return this.http.patch<InterServiceRequest>(API_ENDPOINTS.INTER_SERVICE_REQUESTS.STATUT(id), dto);
    }
}

// ─── ISResponseService ────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ISResponseService {
  private http = inject(HttpClient);

  getByRequest(requestId: number): Observable<ISResponse> {
    return this.http.get<ISResponse>(API_ENDPOINTS.INTER_SERVICE_REPONSES.BY_REQUEST(requestId));
  }

  getById(id: number): Observable<ISResponse> {
    return this.http.get<ISResponse>(API_ENDPOINTS.INTER_SERVICE_REPONSES.BY_ID(id));
  }

  create(dto: ISResponseCreateDto): Observable<ISResponse> {
    return this.http.post<ISResponse>(API_ENDPOINTS.INTER_SERVICE_REPONSES.BASE, dto);
  }

  getMyResponses(svcid: number): Observable<ISResponse[]> {
    return this.http.get<ISResponse[]>(API_ENDPOINTS.INTER_SERVICE_REPONSES.MY(svcid));
  }
}

// ─── AttachmentService ────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private http = inject(HttpClient);

  /**
   * Upload avec suivi de progression.
   * @param file Fichier à envoyer
   * @param context Objet associé { requeteId?, reponseId?, risId? }
   */
  upload(
    file: File,
    context: { requeteId?: number; reponseId?: number; risId?: number; reponseInterServiceId?: number }
  ): Observable<HttpEvent<Attachment>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    if (context.requeteId)  formData.append('requeteId', String(context.requeteId));
    if (context.reponseId)  formData.append('reponseId', String(context.reponseId));
    if (context.risId)      formData.append('risId', String(context.risId));
    if (context.reponseInterServiceId)  formData.append('reponseInterServiceId', String(context.reponseInterServiceId));

    const req = new HttpRequest('POST', API_ENDPOINTS.ATTACHMENTS.UPLOAD, formData, {
      reportProgress: true,
    });
    return this.http.request<Attachment>(req);
  }

  getByReq(id : number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(API_ENDPOINTS.ATTACHMENTS.By_REQUEST(id));
  }

  getByRep(id : number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(API_ENDPOINTS.ATTACHMENTS.By_REPONSE(id));
  }

  getByIsReq(id : number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(API_ENDPOINTS.ATTACHMENTS.By_ISREQUEST(id));
  }

  getByIsRep(id : number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(API_ENDPOINTS.ATTACHMENTS.By_ISREPONSE(id));
  }

  /** Téléchargement d'un fichier */
  download(id: number): Observable<Blob> {
    return this.http.get(API_ENDPOINTS.ATTACHMENTS.DOWNLOAD(id), {
      responseType: 'blob',
    });
  }

  /** URL de preview (pour images/PDF) */
  getPreviewUrl(id: number): Observable<Blob> {
    return this.http.get(API_ENDPOINTS.ATTACHMENTS.PREVIEW(id), {
      responseType: 'blob',
    });
  }

  /** Supprimer une pièce jointe */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.ATTACHMENTS.DELETE(id));
  }

  /** Déclenche le téléchargement dans le navigateur */
  triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href    = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
