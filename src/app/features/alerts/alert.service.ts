import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SmokeAlert } from './alert.models';

/** Acceso REST a las alertas de humo activas (Safety & Incident). */
@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/alerts/smoke`;

  getActive(): Observable<SmokeAlert[]> {
    return this.http.get<SmokeAlert[]>(this.baseUrl);
  }

  /** Confirma (acknowledge) un incidente de humo: pasa a estado "Confirmada". */
  acknowledge(detectorId: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${detectorId}/acknowledge`, {});
  }

  /** Resuelve un incidente de humo: pasa a estado "Resuelta". */
  resolve(detectorId: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${detectorId}/resolve`, {});
  }
}
