import { Component, computed, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { incidentStatusLabel, SmokeAlert } from '../../alert.models';
import { Icon } from '../../../../shared/ui/icon';

/**
 * Tarjeta de alerta de humo en vivo (carry-over Sprint 2). Destaca el incidente
 * geolocalizado más reciente (zona, nivel, ppm, hora) con acciones de
 * confirmar/resolver. Es presentacional: emite eventos y el contenedor decide
 * cómo persistir el cambio, degradando con elegancia si la API no responde.
 */
@Component({
  selector: 'sp-smoke-alert-card',
  imports: [DatePipe, DecimalPipe, Icon],
  templateUrl: './smoke-alert-card.html',
  styleUrl: './smoke-alert-card.scss',
})
export class SmokeAlertCard {
  readonly alert = input.required<SmokeAlert>();
  /** Deshabilita las acciones mientras hay una operación en curso. */
  readonly busy = input(false);

  readonly acknowledge = output<SmokeAlert>();
  readonly resolve = output<SmokeAlert>();

  protected readonly statusLabel = incidentStatusLabel;

  /** Incidente crítico y sin resolver: se muestra con animación de pulso. */
  protected readonly critical = computed(() => {
    const a = this.alert();
    return a.smokeDetected && a.status !== 'Resolved';
  });

  protected readonly resolved = computed(() => this.alert().status === 'Resolved');
  protected readonly acknowledged = computed(() => this.alert().status === 'Confirmed');

  protected onAcknowledge(): void {
    this.acknowledge.emit(this.alert());
  }

  protected onResolve(): void {
    this.resolve.emit(this.alert());
  }
}
