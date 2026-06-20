import { computed, Injectable, signal } from '@angular/core';
import { SmokeAlert } from '../../features/alerts/alert.models';

const MAX = 20;

/**
 * Almacén global de alertas de humo recibidas en vivo. Alimenta la campana de
 * la barra superior (con contador de no leídas) y persiste entre vistas, de
 * modo que las alertas se conservan aunque el operador no esté en la página de
 * alertas.
 */
@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly _alerts = signal<SmokeAlert[]>([]);
  private readonly _unread = signal(0);

  readonly alerts = this._alerts.asReadonly();
  readonly unread = this._unread.asReadonly();
  readonly hasUnread = computed(() => this._unread() > 0);

  /** Registra una alerta entrante (reemplaza la del mismo detector). */
  add(alert: SmokeAlert): void {
    this._alerts.update((list) =>
      [alert, ...list.filter((a) => a.detectorId !== alert.detectorId)].slice(0, MAX),
    );
    this._unread.update((n) => n + 1);
  }

  markAllRead(): void {
    this._unread.set(0);
  }

  clear(): void {
    this._alerts.set([]);
    this._unread.set(0);
  }
}
