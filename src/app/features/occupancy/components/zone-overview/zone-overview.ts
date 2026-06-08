import { Component, input } from '@angular/core';
import { ZoneOccupancy } from '../../occupancy.models';

/** Lista de zonas con su barra de ocupación y nivel de congestión. */
@Component({
  selector: 'sp-zone-overview',
  templateUrl: './zone-overview.html',
  styleUrl: './zone-overview.scss',
})
export class ZoneOverview {
  readonly zones = input.required<ZoneOccupancy[]>();

  protected percent(zone: ZoneOccupancy): number {
    return Math.round(zone.occupancyRate * 100);
  }

  protected toneClass(level: ZoneOccupancy['congestionLevel']): string {
    switch (level) {
      case 'Full':
        return 'bar--danger';
      case 'High':
        return 'bar--warning';
      default:
        return 'bar--success';
    }
  }
}
