import { Component, DestroyRef, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { SimulatorService } from './simulator.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Icon } from '../../shared/ui/icon';

interface LogEntry {
  time: Date;
  zone: string;
  detector: string;
  ppm: number;
  ok: boolean;
}

const ZONES = ['Z-A', 'Z-B', 'Z-C', 'Z-D'];

/**
 * Panel para accionar el simulador IoT desde la UI. Emite eventos de humo hacia
 * el backend (ingesta) para demostrar el flujo en tiempo real (alerta → SignalR
 * → toast/campana) durante las entrevistas de validación.
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
  protected readonly auto = signal(false);
  protected readonly log = signal<LogEntry[]>([]);
  private autoTimer?: ReturnType<typeof setInterval>;
  private seq = 1;

  protected readonly form = this.fb.nonNullable.group({
    zoneId: ['Z-A', Validators.required],
    detectorId: ['SD-L1-01', Validators.required],
    levelNumber: [1, [Validators.required, Validators.min(1)]],
    smokeLevel: [420, [Validators.required, Validators.min(0)]],
  });

  fire(): void {
    if (this.form.invalid || this.sending()) return;
    const v = this.form.getRawValue();
    this.send(v.zoneId, v.detectorId, v.levelNumber, v.smokeLevel, []);
  }

  toggleAuto(): void {
    if (this.auto()) {
      this.stopAuto();
      return;
    }
    this.auto.set(true);
    // Emite una alerta aleatoria cada 6 s, imitando el bucle del simulador.
    this.autoTimer = setInterval(() => this.fireRandom(), 6000);
    this.fireRandom();
  }

  private fireRandom(): void {
    const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
    const level = 1 + Math.floor(Math.random() * 2);
    const detector = `SD-L${level}-0${1 + Math.floor(Math.random() * 6)}`;
    const ppm = 250 + Math.floor(Math.random() * 350);
    this.send(zone, detector, level, ppm, []);
  }

  private send(zone: string, detector: string, level: number, ppm: number, spaces: string[]): void {
    this.sending.set(true);
    this.simulator
      .triggerSmoke({
        detectorId: detector,
        zoneId: zone,
        levelNumber: level,
        smokeLevel: ppm,
        detectedAt: new Date().toISOString(),
        affectedOccupiedSpaces: spaces,
      })
      .subscribe({
        next: () => {
          this.sending.set(false);
          this.pushLog(zone, detector, ppm, true);
        },
        error: (err: HttpErrorResponse) => {
          this.sending.set(false);
          this.pushLog(zone, detector, ppm, false);
          this.toast.show('Simulador', `No se pudo emitir la alerta (HTTP ${err.status}).`, 'danger');
        },
      });
  }

  private pushLog(zone: string, detector: string, ppm: number, ok: boolean): void {
    this.log.update((list) => [{ time: new Date(), zone, detector, ppm, ok }, ...list].slice(0, 30));
  }

  private stopAuto(): void {
    this.auto.set(false);
    if (this.autoTimer) clearInterval(this.autoTimer);
    this.autoTimer = undefined;
  }

  ngOnDestroy(): void {
    this.stopAuto();
  }
}
