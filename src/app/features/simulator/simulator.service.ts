import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Payload de ingesta de humo (coincide con SmokeAlertIngestDto del backend). */
export interface SmokeIngestPayload {
  detectorId: string;
  zoneId: string;
  levelNumber: number;
  smokeLevel: number;
  detectedAt: string;
  affectedOccupiedSpaces: string[];
}

/**
 * Acciona el simulador IoT desde la UI: emite eventos de humo hacia el endpoint
 * de ingesta del backend (el mismo que usa el simulador Node.js). Pensado para
 * demostrar el flujo en vivo durante las entrevistas de validación.
 */
@Injectable({ providedIn: 'root' })
export class SimulatorService {
  private readonly http = inject(HttpClient);
  private readonly ingestUrl = `${environment.apiBaseUrl}/alerts/smoke`;

  triggerSmoke(payload: SmokeIngestPayload): Observable<unknown> {
    return this.http.post(this.ingestUrl, payload);
  }
}
