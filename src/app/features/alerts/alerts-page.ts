import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertService } from './alert.service';
import { RealtimeAlertsService } from './realtime-alerts.service';
import { SmokeAlert } from './alert.models';
import { AlertPanel } from './components/alert-panel/alert-panel';
import { NotificationStore } from '../../core/notifications/notification-store';
import { Icon } from '../../shared/ui/icon';
import { Skeleton } from '../../shared/ui/skeleton';
import { EmptyState } from '../../shared/ui/empty-state';

/**
 * Página de monitoreo de alertas de humo. Combina las alertas activas de la API
 * con las recibidas en vivo (almacén global alimentado por SignalR a nivel de
 * app) y se resincroniza tras una reconexión.
 */
@Component({
  selector: 'sp-alerts-page',
  imports: [AlertPanel, Icon, Skeleton, EmptyState],
  templateUrl: './alerts-page.html',
  styleUrl: './alerts-page.scss',
})
export class AlertsPage implements OnInit {
  private readonly alertService = inject(AlertService);
  private readonly realtime = inject(RealtimeAlertsService);
  private readonly store = inject(NotificationStore);
  private readonly destroyRef = inject(DestroyRef);

  private readonly restAlerts = signal<SmokeAlert[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly connected = this.realtime.connected;

  /** Vista combinada: alertas en vivo (store) primero, luego las de la API. */
  protected readonly alerts = computed<SmokeAlert[]>(() => {
    const live = this.store.alerts();
    const seen = new Set(live.map((a) => a.detectorId));
    return [...live, ...this.restAlerts().filter((a) => !seen.has(a.detectorId))];
  });

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

  reconnect(): void {
    void this.realtime.reconnect();
  }
}
