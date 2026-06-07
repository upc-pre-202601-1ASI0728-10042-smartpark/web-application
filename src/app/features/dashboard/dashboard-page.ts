import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { OccupancyService } from '../occupancy/occupancy.service';
import { OccupancySummary, ZoneOccupancy } from '../occupancy/occupancy.models';
import { SummaryCards } from '../occupancy/components/summary-cards/summary-cards';
import { OccupancyGauge } from '../occupancy/components/occupancy-gauge/occupancy-gauge';
import { ZoneOverview } from '../occupancy/components/zone-overview/zone-overview';

/**
 * Página principal del operador: muestra el resumen de ocupación del lote,
 * el indicador global y el desglose por zonas, consumiendo la API.
 */
@Component({
  selector: 'sp-dashboard-page',
  imports: [SummaryCards, OccupancyGauge, ZoneOverview],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private readonly occupancy = inject(OccupancyService);

  protected readonly summary = signal<OccupancySummary | null>(null);
  protected readonly zones = signal<ZoneOccupancy[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      summary: this.occupancy.getSummary(),
      zones: this.occupancy.getZones(),
    }).subscribe({
      next: ({ summary, zones }) => {
        this.summary.set(summary);
        this.zones.set(zones);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set('No se pudo cargar la ocupación. Reintenta en unos segundos.');
      },
    });
  }
}
