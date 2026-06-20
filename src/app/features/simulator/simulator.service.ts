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
 * Acciona el simulador IoT desde la UI para demostrar el flujo en vivo durante
 * las entrevistas de validación: emite alertas de humo (ingesta) y simula
 * entradas/salidas de vehículos (ocupación).
 */
@Injectable({ providedIn: 'root' })
export class SimulatorService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiBaseUrl;

  /** Emite un evento de humo hacia el endpoint de ingesta (anónimo). */
  triggerSmoke(payload: SmokeIngestPayload): Observable<unknown> {
    return this.http.post(`${this.api}/alerts/smoke`, payload);
  }

  /** Simula movimiento de vehículos (cambia la ocupación; requiere sesión Operator). */
  simulateOccupancy(): Observable<unknown> {
    return this.http.post(`${this.api}/occupancy/simulate`, {});
  }
}
