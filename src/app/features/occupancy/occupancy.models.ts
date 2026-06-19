/** Nivel de congestión derivado por el backend a partir de la tasa de ocupación. */
export type CongestionLevel = 'Low' | 'Medium' | 'High' | 'Full';

/** Estado de ocupación de un espacio individual. */
export type OccupancyState = 'Free' | 'Occupied' | 'Reserved' | 'Unknown';

/** Resumen global de ocupación de un lote (GET /occupancy/summary). */
export interface OccupancySummary {
  lotId: string;
  totalSpaces: number;
  occupiedSpaces: number;
  occupancyRate: number;
  asOf: string;
}

/** Ocupación agregada por zona (GET /occupancy/zones). */
export interface ZoneOccupancy {
  zoneId: string;
  code: string;
  levelNumber: number;
  totalSpaces: number;
  occupiedSpaces: number;
  occupancyRate: number;
  congestionLevel: CongestionLevel;
}

/** Espacio de estacionamiento (GET /occupancy/zones/{id}/spaces). */
export interface ParkingSpace {
  spaceId: string;
  code: string;
  zoneId: string;
  levelNumber: number;
  occupancyState: OccupancyState;
  spaceType: string;
  lastUpdated: string;
}

/** Etiqueta en español para el nivel de congestión. */
export function congestionLabel(level: CongestionLevel): string {
  return { Low: 'Baja', Medium: 'Media', High: 'Alta', Full: 'Llena' }[level] ?? level;
}

/** Etiqueta en español para el estado de un espacio. */
export function occupancyStateLabel(state: OccupancyState): string {
  return { Free: 'Libre', Occupied: 'Ocupado', Reserved: 'Reservado', Unknown: 'Sin dato' }[state] ?? state;
}
