import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EnergyRecommendation } from './energy.models';

/**
 * Acceso al endpoint de recomendaciones de eficiencia energética
 * (GET /energy/recommendations). Un 503 indica modo degradado (el gemelo
 * digital / servicio de energía no está disponible) y se propaga al componente
 * para mostrar un estado degradado con el último cálculo conocido.
 */
@Injectable({ providedIn: 'root' })
export class EnergyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/energy`;

  getRecommendations(lotId = 'LOT-JOCKEY'): Observable<EnergyRecommendation[]> {
    const params = new HttpParams().set('lotId', lotId);
    return this.http.get<EnergyRecommendation[]>(`${this.baseUrl}/recommendations`, { params });
  }
}
