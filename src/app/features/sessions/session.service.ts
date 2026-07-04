import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionSummary } from './session.models';

/**
 * Acceso a los endpoints de sesiones / flujo vehicular (Sprint 2). Un 503
 * indica modo degradado y se propaga al componente para mostrar un estado
 * degradado con el último resumen conocido.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/sessions`;

  getSummary(lotId = 'LOT-JOCKEY'): Observable<SessionSummary> {
    const params = new HttpParams().set('lotId', lotId);
    return this.http.get<SessionSummary>(`${this.baseUrl}/summary`, { params });
  }
}
