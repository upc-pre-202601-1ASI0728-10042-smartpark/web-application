import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OccupancyService } from '../occupancy/occupancy.service';
import { ZoneOccupancy } from '../occupancy/occupancy.models';

/** Listado de zonas del lote con acceso al detalle de espacios. */
@Component({
  selector: 'sp-zones-list-page',
  imports: [RouterLink],
  templateUrl: './zones-list-page.html',
  styleUrl: './zones-list-page.scss',
})
export class ZonesListPage implements OnInit {
  private readonly occupancy = inject(OccupancyService);

  protected readonly zones = signal<ZoneOccupancy[]>([]);
  protected readonly loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.occupancy.getZones().subscribe({
      next: (zones) => {
        this.zones.set(zones);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected percent(zone: ZoneOccupancy): number {
    return Math.round(zone.occupancyRate * 100);
  }

  protected badgeClass(level: ZoneOccupancy['congestionLevel']): string {
    switch (level) {
      case 'Full':
        return 'sp-badge--danger';
      case 'High':
        return 'sp-badge--warning';
      default:
        return 'sp-badge--success';
    }
  }
}
