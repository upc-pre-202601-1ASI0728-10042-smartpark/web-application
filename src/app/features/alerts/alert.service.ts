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
}
