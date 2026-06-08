import { Component, inject, OnInit, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { OccupancyService } from '../occupancy/occupancy.service';
import { OccupancySummary, ZoneOccupancy } from '../occupancy/occupancy.models';
import { SummaryCards } from '../occupancy/components/summary-cards/summary-cards';
import { OccupancyGauge } from '../occupancy/components/occupancy-gauge/occupancy-gauge';
import { ZoneOverview } from '../occupancy/components/zone-overview/zone-overview';

/**
 * Página principal del operador: muestra el resumen de ocupación del lote,
 * el indicador global y el desglose por zonas, consumiendo la API.
 * Ante un 503 (Azure Digital Twins no disponible) entra en modo degradado.
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
  protected readonly degraded = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.degraded.set(false);

    forkJoin({
      summary: this.occupancy.getSummary().pipe(
        catchError((err: HttpErrorResponse) => {
          // 503: el gemelo digital no responde; mantenemos el último estado conocido.
          if (err.status === 503) {
            this.degraded.set(true);
            return of(this.summary());
          }
          throw err;
        }),
      ),
      zones: this.occupancy.getZones().pipe(catchError(() => of(this.zones()))),
    }).subscribe({
      next: ({ summary, zones }) => {
        if (summary) this.summary.set(summary);
        this.zones.set(zones);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar la ocupación. Reintenta en unos segundos.');
      },
    });
  }
}
