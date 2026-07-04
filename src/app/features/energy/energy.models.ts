/**
 * Modelos del Panel de Eficiencia Energética (Sprint 2).
 * Consumen GET /api/v1/energy/recommendations, que devuelve por zona/nivel una
 * recomendación de atenuación de iluminación basada en la ocupación actual.
 */

/** Acción de iluminación recomendada por el backend para una zona. */
export type LightingAction = 'Dim' | 'Off' | 'Maintain';

/** Recomendación de eficiencia energética para una zona (nivel). */
export interface EnergyRecommendation {
  zoneId: string;
  code: string;
  levelNumber: number;
  occupiedSpaces: number;
  totalSpaces: number;
  occupancyRate: number;
  /** Nivel de iluminación actual (0-100 %). */
  currentLightingLevel: number;
  /** Nivel de iluminación recomendado (0-100 %). */
  recommendedLightingLevel: number;
  /** Ahorro estimado por hora si se aplica la recomendación (kWh). */
  estimatedSavingsKwh: number;
  action: LightingAction;
}

/** Etiqueta en español para la acción de iluminación. */
export function lightingActionLabel(action: LightingAction): string {
  return { Dim: 'Atenuar', Off: 'Apagar', Maintain: 'Mantener' }[action] ?? action;
}

/** Clase de badge para la acción de iluminación. */
export function lightingActionBadge(action: LightingAction): string {
  switch (action) {
    case 'Off':
      return 'sp-badge--danger';
    case 'Dim':
      return 'sp-badge--warning';
    default:
      return 'sp-badge--success';
  }
}
