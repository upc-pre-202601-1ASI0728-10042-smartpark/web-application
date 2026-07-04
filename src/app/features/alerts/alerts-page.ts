import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertService } from './alert.service';
import { RealtimeAlertsService } from './realtime-alerts.service';
import { IncidentStatus, SmokeAlert } from './alert.models';
import { AlertPanel } from './components/alert-panel/alert-panel';
import { SmokeAlertCard } from './components/smoke-alert-card/smoke-alert-card';
import { NotificationStore } from '../../core/notifications/notification-store';
import { ToastService } from '../../shared/toast/toast.service';
import { Icon } from '../../shared/ui/icon';
import { Skeleton } from '../../shared/ui/skeleton';
import { EmptyState } from '../../shared/ui/empty-state';

/**
 * Página de monitoreo de alertas de humo. Combina las alertas activas de la API
 * con las recibidas en vivo (almacén global alimentado por SignalR a nivel de
 * app) y se resincroniza tras una reconexión. Destaca el incidente activo más
 * reciente en una tarjeta en vivo con acciones de confirmar/resolver.
 */
@Component({
  selector: 'sp-alerts-page',
  imports: [AlertPanel, SmokeAlertCard, Icon, Skeleton, EmptyState],
  templateUrl: './alerts-page.html',
  styleUrl: './alerts-page.scss',
})
export class AlertsPage implements OnInit {
  private readonly alertService = inject(AlertService);
  private readonly realtime = inject(RealtimeAlertsService);
  private readonly store = inject(NotificationStore);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly restAlerts = signal<SmokeAlert[]>([]);
  /** Estado local optimista por detector (confirmar/resolver). */
  private readonly statusOverride = signal<Record<string, IncidentStatus>>({});

  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly busy = signal<string | null>(null);
  protected readonly connected = this.realtime.connected;

  /** Vista combinada: alertas en vivo (store) primero, luego las de la API. */
  protected readonly alerts = computed<SmokeAlert[]>(() => {
    const live = this.store.alerts();
    const seen = new Set(live.map((a) => a.detectorId));
    const merged = [...live, ...this.restAlerts().filter((a) => !seen.has(a.detectorId))];
    const overrides = this.statusOverride();
    return merged.map((a) =>
      overrides[a.detectorId] ? { ...a, status: overrides[a.detectorId] } : a,
    );
  });

  /** Incidente activo más reciente para la tarjeta en vivo. */
  protected readonly liveAlert = computed<SmokeAlert | null>(
    () => this.alerts().find((a) => a.smokeDetected && a.status !== 'Resolved') ?? null,
  );

  ngOnInit(): void {
    this.load();
    // Tras reconectar, el estado pudo cambiar: re-sincronizar con la API.
    this.realtime.reconnected$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.alertService
      .getActive()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (alerts) => {
          this.restAlerts.set(alerts);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  acknowledge(alert: SmokeAlert): void {
    this.applyStatus(alert, 'Confirmed', () => this.alertService.acknowledge(alert.detectorId), {
      ok: 'Incidente confirmado.',
      degraded: 'Confirmado localmente. No se pudo sincronizar con el servidor.',
    });
  }

  resolve(alert: SmokeAlert): void {
    this.applyStatus(alert, 'Resolved', () => this.alertService.resolve(alert.detectorId), {
      ok: 'Incidente resuelto.',
      degraded: 'Resuelto localmente. No se pudo sincronizar con el servidor.',
    });
  }

  reconnect(): void {
    void this.realtime.reconnect();
  }

  /** Actualiza el estado de forma optimista y degrada si la API falla. */
  private applyStatus(
    alert: SmokeAlert,
    status: IncidentStatus,
    call: () => ReturnType<AlertService['acknowledge']>,
    messages: { ok: string; degraded: string },
  ): void {
    this.busy.set(alert.detectorId);
    this.statusOverride.update((map) => ({ ...map, [alert.detectorId]: status }));
    call()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busy.set(null);
          this.toast.show('Incidente actualizado', messages.ok, 'success');
        },
        error: () => {
          this.busy.set(null);
          this.toast.show('Modo degradado', messages.degraded, 'warning');
        },
      });
  }
}
