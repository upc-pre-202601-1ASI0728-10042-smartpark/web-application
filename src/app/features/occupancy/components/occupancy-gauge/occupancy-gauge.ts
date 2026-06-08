import { Component, computed, input } from '@angular/core';

/** Anillo de progreso (SVG) que representa la tasa de ocupación 0..1. */
@Component({
  selector: 'sp-occupancy-gauge',
  templateUrl: './occupancy-gauge.html',
  styleUrl: './occupancy-gauge.scss',
})
export class OccupancyGauge {
  /** Tasa de ocupación entre 0 y 1. */
  readonly rate = input.required<number>();

  private readonly radius = 52;
  protected readonly circumference = 2 * Math.PI * this.radius;

  protected readonly percent = computed(() =>
    Math.max(0, Math.min(100, Math.round(this.rate() * 100))),
  );

  protected readonly dashOffset = computed(
    () => this.circumference * (1 - this.percent() / 100),
  );

  protected readonly color = computed(() => {
    const p = this.percent();
    if (p >= 85) return 'var(--sp-danger)';
    if (p >= 60) return 'var(--sp-warning)';
    return 'var(--sp-success)';
  });
}
