import { Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
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
  imports: [NgClass],
  templateUrl: './summary-cards.html',
  styleUrl: './summary-cards.scss',
})
export class SummaryCards {
  readonly summary = input.required<OccupancySummary>();

  protected readonly cards = computed<Card[]>(() => {
    const s = this.summary();
    const free = s.totalSpaces - s.occupiedSpaces;
    const rate = Math.round(s.occupancyRate * 100);
    const occupiedTone: Card['tone'] = rate >= 85 ? 'danger' : rate >= 60 ? 'warning' : 'primary';
    return [
      { label: 'Espacios totales', value: `${s.totalSpaces}`, hint: 'Capacidad del lote', tone: 'primary' },
      { label: 'Ocupados', value: `${s.occupiedSpaces}`, hint: `${rate}% de ocupación`, tone: occupiedTone },
      { label: 'Disponibles', value: `${free}`, hint: 'Libres ahora', tone: 'success' },
    ];
  });
}
