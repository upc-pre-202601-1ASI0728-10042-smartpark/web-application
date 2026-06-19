import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertService } from './alert.service';
import { RealtimeAlertsService } from './realtime-alerts.service';
import { SmokeAlert, SmokeAlertEvent } from './alert.models';
import { AlertPanel } from './components/alert-panel/alert-panel';
import { ToastService } from '../../shared/toast/toast.service';

/** Página de monitoreo de alertas de humo, con actualización en tiempo real. */
@Component({
  selector: 'sp-alerts-page',
  imports: [AlertPanel],
  templateUrl: './alerts-page.html',
  styleUrl: './alerts-page.scss',
})
export class AlertsPage implements OnInit, OnDestroy {
  private readonly alertService = inject(AlertService);
  private readonly realtime = inject(RealtimeAlertsService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly alerts = signal<SmokeAlert[]>([]);
  protected readonly loading = signal(false);
  protected readonly connected = this.realtime.connected;

  ngOnInit(): void {
    this.loading.set(true);
    this.alertService.getActive().subscribe({
      next: (alerts) => {
        this.alerts.set(alerts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    void this.realtime.start();
    this.realtime.alert$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.onLiveAlert(event));
  }

  ngOnDestroy(): void {
    void this.realtime.stop();
  }

  private onLiveAlert(event: SmokeAlertEvent): void {
    const incoming: SmokeAlert = {
      detectorId: event.detectorId,
      zoneId: event.zoneId,
      levelNumber: event.levelNumber,
      smokeDetected: true,
      smokeLevel: event.smokeLevel,
      status: 'Alert',
      lastReading: event.detectedAt,
    };
    // Reemplaza la alerta del mismo detector o la inserta al inicio.
    this.alerts.update((list) => [
      incoming,
      ...list.filter((a) => a.detectorId !== incoming.detectorId),
    ]);
    this.toast.show(
      '🔥 Alerta de humo',
      `Zona ${event.zoneId} · ${Math.round(event.smokeLevel)} ppm`,
      'danger',
    );
  }
}
