import { inject, Injectable, signal } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { SmokeAlertEvent } from './alert.models';

/**
 * Cliente SignalR que se conecta al hub de alertas del backend y emite los
 * eventos "smokeAlert" en tiempo real. Maneja reconexión automática y, tras
 * recuperar la conexión, avisa para resincronizar el estado con la API.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeAlertsService {
  private readonly auth = inject(AuthService);
  private connection?: HubConnection;

  private readonly _alert$ = new Subject<SmokeAlertEvent>();
  /** Stream de alertas de humo recibidas en vivo. */
  readonly alert$ = this._alert$.asObservable();

  private readonly _reconnected$ = new Subject<void>();
  /** Se emite al recuperar la conexión: el consumidor debe refrescar su estado. */
  readonly reconnected$ = this._reconnected$.asObservable();

  /** Estado de la conexión, para reflejarlo en la UI. */
  readonly connected = signal(false);

  async start(): Promise<void> {
    if (!this.auth.token) return; // sin sesión no se intenta conectar
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      return;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(environment.alertsHubUrl, {
        accessTokenFactory: () => this.auth.token ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.on('smokeAlert', (event: SmokeAlertEvent) => this._alert$.next(event));
    this.connection.onreconnecting(() => this.connected.set(false));
    this.connection.onreconnected(() => {
      this.connected.set(true);
      this._reconnected$.next();
    });
    this.connection.onclose(() => this.connected.set(false));

    try {
      await this.connection.start();
      this.connected.set(true);
    } catch {
      this.connected.set(false);
    }
  }

  /** Reintento manual de conexión. */
  async reconnect(): Promise<void> {
    await this.stop();
    await this.start();
  }

  async stop(): Promise<void> {
    try {
      await this.connection?.stop();
    } catch {
      /* noop */
    }
    this.connected.set(false);
  }
}
