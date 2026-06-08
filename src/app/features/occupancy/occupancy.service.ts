import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OccupancySummary, ParkingSpace, ZoneOccupancy } from './occupancy.models';

/**
 * Acceso a los endpoints de ocupación (Parking Operations Monitoring).
 * Un 503 en el resumen indica modo degradado (Azure Digital Twins no disponible)
 * y se propaga al componente para mostrar el último estado conocido.
 */
@Injectable({ providedIn: 'root' })
export class OccupancyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/occupancy`;

  getSummary(lotId = 'LOT-JOCKEY'): Observable<OccupancySummary> {
    const params = new HttpParams().set('lotId', lotId);
    return this.http.get<OccupancySummary>(`${this.baseUrl}/summary`, { params });
  }

  getZones(level?: number): Observable<ZoneOccupancy[]> {
    let params = new HttpParams();
    if (level != null) {
      params = params.set('level', level);
    }
    return this.http.get<ZoneOccupancy[]>(`${this.baseUrl}/zones`, { params });
  }

  getSpacesByZone(zoneId: string): Observable<ParkingSpace[]> {
    return this.http.get<ParkingSpace[]>(`${this.baseUrl}/zones/${zoneId}/spaces`);
  }
}
