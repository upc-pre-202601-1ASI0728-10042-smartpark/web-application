/** Estado de un incidente de seguridad. */
export type IncidentStatus = 'Alert' | 'Confirmed' | 'Resolved';

/** Alerta de humo activa (GET /alerts/smoke). */
export interface SmokeAlert {
  detectorId: string;
  zoneId: string;
  levelNumber: number;
  smokeDetected: boolean;
  smokeLevel: number;
  status: IncidentStatus;
  lastReading: string;
}

/**
 * Evento de humo en tiempo real recibido por SignalR (evento "smokeAlert").
 * Coincide con el payload de ingesta del simulador IoT.
 */
export interface SmokeAlertEvent {
  detectorId: string;
  zoneId: string;
  levelNumber: number;
  smokeLevel: number;
  detectedAt: string;
  affectedOccupiedSpaces: string[];
}

/** Convierte un evento en vivo en una alerta mostrable en el panel. */
export function toSmokeAlert(event: SmokeAlertEvent): SmokeAlert {
  return {
    detectorId: event.detectorId,
    zoneId: event.zoneId,
    levelNumber: event.levelNumber,
    smokeDetected: true,
    smokeLevel: event.smokeLevel,
    status: 'Alert',
    lastReading: event.detectedAt,
  };
}
