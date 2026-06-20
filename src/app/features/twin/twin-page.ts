import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { forkJoin, switchMap } from 'rxjs';
import '@google/model-viewer';
import { OccupancyService } from '../occupancy/occupancy.service';
import { ParkingSpace } from '../occupancy/occupancy.models';
import { Icon } from '../../shared/ui/icon';

/** Colores de ocupación (coherentes con el design system). */
const COLORS: Record<string, [number, number, number, number]> = {
  Occupied: [0.78, 0.23, 0.34, 1], // coral/rojo
  Reserved: [0.96, 0.76, 0.16, 1], // ámbar
  Free: [0.18, 0.62, 0.3, 1], // verde
};

/**
 * Visor 3D del gemelo digital. Renderiza el modelo GLB del estacionamiento
 * (generado en iot-simulator) y colorea cada plaza según su ocupación real
 * obtenida de la API — verde libre, rojo ocupada, ámbar reservada.
 */
@Component({
  selector: 'sp-twin-page',
  imports: [Icon],
  templateUrl: './twin-page.html',
  styleUrl: './twin-page.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TwinPage {
  private readonly occupancy = inject(OccupancyService);
  private readonly viewer = viewChild<ElementRef>('viewer');

  protected readonly loaded = signal(false);
  protected readonly colored = signal(0);

  onLoad(): void {
    this.loaded.set(true);
    this.refresh();
  }

  /** Trae la ocupación de todas las zonas y recolorea las plazas en el 3D. */
  refresh(): void {
    this.occupancy
      .getZones()
      .pipe(switchMap((zones) => forkJoin(zones.map((z) => this.occupancy.getSpacesByZone(z.zoneId)))))
      .subscribe((perZone) => this.colorize(perZone.flat()));
  }

  private colorize(spaces: ParkingSpace[]): void {
    const el = this.viewer()?.nativeElement as { model?: { materials: { name: string; pbrMetallicRoughness?: { setBaseColorFactor: (c: number[]) => void } }[] } };
    const model = el?.model;
    if (!model) return;

    const stateById = new Map(spaces.map((s) => [s.spaceId, s.occupancyState]));
    let n = 0;
    for (const mat of model.materials) {
      const state = stateById.get(mat.name);
      const color = state ? COLORS[state] : undefined;
      if (color && mat.pbrMetallicRoughness) {
        mat.pbrMetallicRoughness.setBaseColorFactor(color);
        n++;
      }
    }
    this.colored.set(n);
  }
}
