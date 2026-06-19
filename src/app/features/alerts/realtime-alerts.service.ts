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
 * eventos "smokeAlert" en tiempo real hacia el panel del operador.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeAlertsService {
  private readonly auth = inject(AuthService);
  private connection?: HubConnection;

  private readonly _alert$ = new Subject<SmokeAlertEvent>();
  /** Stream de alertas de humo recibidas en vivo. */
  readonly alert$ = this._alert$.asObservable();

  /** Estado de la conexión, para reflejarlo en la UI. */
  readonly connected = signal(false);

  async start(): Promise<void> {
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
    this.connection.onreconnected(() => this.connected.set(true));
    this.connection.onclose(() => this.connected.set(false));

    try {
      await this.connection.start();
      this.connected.set(true);
    } catch {
      this.connected.set(false);
    }
  }

  async stop(): Promise<void> {
    await this.connection?.stop();
    this.connected.set(false);
  }
}
