/**
 * Modelos de sesiones de estacionamiento / flujo vehicular (Sprint 2).
 * Consumen los endpoints de sesiones que añade el backend en Sprint 2.
 */

/** Resumen de flujo vehicular de un lote (GET /sessions/summary). */
export interface SessionSummary {
  lotId: string;
  /** Sesiones (vehículos) actualmente dentro del lote. */
  activeSessions: number;
  /** Entradas registradas en la última hora. */
  entriesLastHour: number;
  /** Salidas registradas en la última hora. */
  exitsLastHour: number;
  /** Duración media de estadía en minutos. */
  averageDurationMinutes: number;
  asOf: string;
}
