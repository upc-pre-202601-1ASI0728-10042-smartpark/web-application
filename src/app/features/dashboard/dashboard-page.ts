import { Component, inject, OnInit, signal } from '@angular/core';
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

  ngOnInit(): void {
    this.occupancy.getSummary().subscribe((s) => this.summary.set(s));
    this.occupancy.getZones().subscribe((z) => this.zones.set(z));
  }
}
