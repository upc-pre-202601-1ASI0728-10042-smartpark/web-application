import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { forkJoin, switchMap } from 'rxjs';
import '@google/model-viewer';
import { OccupancyService } from '../occupancy/occupancy.service';
import { ParkingSpace } from '../occupancy/occupancy.models';

/** Colores de ocupación (coherentes con el design system). */
const COLORS: Record<string, [number, number, number, number]> = {
  Occupied: [0.78, 0.23, 0.34, 1],
  Reserved: [0.96, 0.76, 0.16, 1],
  Free: [0.18, 0.62, 0.3, 1],
};

/**
 * Visor 3D reutilizable del gemelo digital: renderiza el modelo GLB y colorea
 * cada plaza según su ocupación real (verde libre · rojo ocupada · ámbar
 * reservada). Es el elemento central del console del operador.
 */
@Component({
  selector: 'sp-twin-viewer',
  template: `
    <div class="viewer" [style.height]="height()">
      <model-viewer
        #viewer
        src="models/parking-garage.glb"
        alt="Modelo 3D del estacionamiento con ocupación en vivo"
        camera-controls
        auto-rotate
        auto-rotate-delay="1500"
        rotation-per-second="12deg"
        shadow-intensity="1"
        exposure="1.05"
        camera-orbit="35deg 62deg 115%"
        min-camera-orbit="auto auto 55%"
        interaction-prompt="none"
        (load)="onLoad()"
      >
        <div slot="poster" class="viewer__poster">Cargando gemelo 3D…</div>
      </model-viewer>
      <div class="viewer__legend">
        <span><i class="dot dot--free"></i> Libre</span>
        <span><i class="dot dot--occupied"></i> Ocupada</span>
        <span><i class="dot dot--reserved"></i> Reservada</span>
      </div>
    </div>
  `,
  styles: [`
    .viewer { position: relative; width: 100%; }
    model-viewer {
      display: block; width: 100%; height: 100%;
      background: linear-gradient(180deg, #eef2f5, #dfe6ea);
      border-radius: var(--sp-radius);
    }
    .viewer__poster {
      display: flex; align-items: center; justify-content: center; height: 100%;
      color: var(--sp-text-muted); font-size: 0.9rem;
    }
    .viewer__legend {
      position: absolute; left: var(--sp-3); bottom: var(--sp-3);
      display: flex; gap: var(--sp-3);
      background: rgba(255,255,255,0.92); border: 1px solid var(--sp-border);
      border-radius: var(--sp-radius-pill); padding: 0.35rem 0.8rem;
      font-size: 0.76rem; color: var(--sp-text-muted);
    }
    .viewer__legend span { display: inline-flex; align-items: center; gap: 0.35rem; }
    .dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
    .dot--free { background: #2e9e4d; } .dot--occupied { background: #c73a57; } .dot--reserved { background: #f5c229; }
  `],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TwinViewer {
  private readonly occupancy = inject(OccupancyService);
  private readonly viewer = viewChild<ElementRef>('viewer');

  readonly height = input('100%');
  protected readonly colored = signal(0);

  onLoad(): void {
    this.refresh();
  }

  refresh(): void {
    this.occupancy
      .getZones()
      .pipe(switchMap((zones) => forkJoin(zones.map((z) => this.occupancy.getSpacesByZone(z.zoneId)))))
      .subscribe((perZone) => this.colorize(perZone.flat()));
  }

  private colorize(spaces: ParkingSpace[]): void {
    const el = this.viewer()?.nativeElement as {
      model?: { materials: { name: string; pbrMetallicRoughness?: { setBaseColorFactor: (c: number[]) => void } }[] };
    };
    const model = el?.model;
    if (!model) return;
    const stateById = new Map(spaces.map((s) => [s.spaceId, s.occupancyState]));
    let n = 0;
    for (const mat of model.materials) {
      const color = stateById.has(mat.name) ? COLORS[stateById.get(mat.name)!] : undefined;
      if (color && mat.pbrMetallicRoughness) {
        mat.pbrMetallicRoughness.setBaseColorFactor(color);
        n++;
      }
    }
    this.colored.set(n);
  }
}
