import { Component, DestroyRef, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { SimulatorService } from './simulator.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Icon } from '../../shared/ui/icon';

interface ZoneOption {
  id: string;
  label: string;
  level: number;
  code: string;
}

interface LogEntry {
  time: Date;
  kind: 'smoke' | 'occupancy';
  text: string;
  ok: boolean;
}

/** Zonas canónicas (coherentes con layout.json y el modelo 3D). */
const ZONES: ZoneOption[] = [
  { id: 'ZONE-L1-A', label: 'Nivel 1 · Zona A', level: 1, code: 'A' },
  { id: 'ZONE-L1-B', label: 'Nivel 1 · Zona B', level: 1, code: 'B' },
  { id: 'ZONE-L2-A', label: 'Nivel 2 · Zona A', level: 2, code: 'A' },
  { id: 'ZONE-L2-B', label: 'Nivel 2 · Zona B', level: 2, code: 'B' },
];

/**
 * Panel del simulador IoT: emite alertas de humo Y simula movimiento de
 * vehículos (ocupación), demostrando el flujo completo en vivo (SignalR,
 * dashboard y gemelo 3D) durante las entrevistas de validación.
 */
@Component({
  selector: 'sp-simulator-page',
  imports: [ReactiveFormsModule, Icon, DatePipe],
  templateUrl: './simulator-page.html',
  styleUrl: './simulator-page.scss',
})
export class SimulatorPage implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly simulator = inject(SimulatorService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly zones = ZONES;
  protected readonly sending = signal(false);
  protected readonly smokeAuto = signal(false);
  protected readonly occAuto = signal(false);
  protected readonly log = signal<LogEntry[]>([]);
  private smokeTimer?: ReturnType<typeof setInterval>;
  private occTimer?: ReturnType<typeof setInterval>;

  protected readonly form = this.fb.nonNullable.group({
    zoneId: ['ZONE-L1-A', Validators.required],
    smokeLevel: [420, [Validators.required, Validators.min(0)]],
  });

  // ---- Humo ----
  fireSmoke(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const zone = ZONES.find((z) => z.id === v.zoneId) ?? ZONES[0];
    this.sendSmoke(zone, v.smokeLevel);
  }

  toggleSmokeAuto(): void {
    if (this.smokeAuto()) {
      this.smokeAuto.set(false);
      if (this.smokeTimer) clearInterval(this.smokeTimer);
      return;
    }
    this.smokeAuto.set(true);
    this.smokeTimer = setInterval(() => this.fireRandomSmoke(), 7000);
    this.fireRandomSmoke();
  }

  private fireRandomSmoke(): void {
    const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
    this.sendSmoke(zone, 250 + Math.floor(Math.random() * 350));
  }

  private sendSmoke(zone: ZoneOption, ppm: number): void {
    this.simulator
      .triggerSmoke({
        detectorId: `SMOKE-L${zone.level}-${zone.code}`,
        zoneId: zone.id,
        levelNumber: zone.level,
        smokeLevel: ppm,
        detectedAt: new Date().toISOString(),
        affectedOccupiedSpaces: [],
      })
      .subscribe({
        next: () => this.pushLog('smoke', `Humo en ${zone.label} · ${ppm} ppm`, true),
        error: (e: HttpErrorResponse) => {
          this.pushLog('smoke', `Humo en ${zone.label} (error ${e.status})`, false);
          this.toast.show('Simulador', `No se pudo emitir la alerta (HTTP ${e.status}).`, 'danger');
        },
      });
  }

  // ---- Ocupación ----
  simulateOccupancy(): void {
    this.sending.set(true);
    this.simulator.simulateOccupancy().subscribe({
      next: () => {
        this.sending.set(false);
        this.pushLog('occupancy', 'Movimiento de vehículos (entradas/salidas)', true);
      },
      error: (e: HttpErrorResponse) => {
        this.sending.set(false);
        this.pushLog('occupancy', `Ocupación (error ${e.status})`, false);
        this.toast.show('Simulador', `No se pudo simular la ocupación (HTTP ${e.status}).`, 'danger');
      },
    });
  }

  toggleOccAuto(): void {
    if (this.occAuto()) {
      this.occAuto.set(false);
      if (this.occTimer) clearInterval(this.occTimer);
      return;
    }
    this.occAuto.set(true);
    this.occTimer = setInterval(() => this.simulateOccupancy(), 4000);
    this.simulateOccupancy();
  }

  private pushLog(kind: LogEntry['kind'], text: string, ok: boolean): void {
    this.log.update((list) => [{ time: new Date(), kind, text, ok }, ...list].slice(0, 30));
  }

  ngOnDestroy(): void {
    if (this.smokeTimer) clearInterval(this.smokeTimer);
    if (this.occTimer) clearInterval(this.occTimer);
  }
}
