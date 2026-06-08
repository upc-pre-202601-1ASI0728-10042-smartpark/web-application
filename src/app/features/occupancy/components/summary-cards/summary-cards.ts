import { Component, computed, input } from '@angular/core';
import { OccupancySummary } from '../../occupancy.models';

interface Card {
  label: string;
  value: string;
  hint: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
}

/** Tarjetas con los indicadores clave del resumen de ocupación. */
@Component({
  selector: 'sp-summary-cards',
  templateUrl: './summary-cards.html',
  styleUrl: './summary-cards.scss',
})
export class SummaryCards {
  readonly summary = input.required<OccupancySummary>();

  protected readonly cards = computed<Card[]>(() => {
    const s = this.summary();
    const free = s.totalSpaces - s.occupiedSpaces;
    const rate = Math.round(s.occupancyRate * 100);
    return [
      { label: 'Espacios totales', value: `${s.totalSpaces}`, hint: 'Capacidad del lote', tone: 'primary' },
      { label: 'Ocupados', value: `${s.occupiedSpaces}`, hint: `${rate}% de ocupación`, tone: rate >= 85 ? 'danger' : 'warning' },
      { label: 'Disponibles', value: `${free}`, hint: 'Libres ahora', tone: 'success' },
    ];
  });
}
