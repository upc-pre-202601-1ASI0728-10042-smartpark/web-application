import { Component, input } from '@angular/core';
import { congestionLabel, ZoneOccupancy } from '../../occupancy.models';

/** Lista de zonas con su barra de ocupación y nivel de congestión. */
@Component({
  selector: 'sp-zone-overview',
  templateUrl: './zone-overview.html',
  styleUrl: './zone-overview.scss',
})
export class ZoneOverview {
  readonly zones = input.required<ZoneOccupancy[]>();

  protected readonly label = congestionLabel;

  protected percent(zone: ZoneOccupancy): number {
    return Math.round(zone.occupancyRate * 100);
  }

  protected fillClass(level: ZoneOccupancy['congestionLevel']): string {
    switch (level) {
      case 'Full':
        return 'sp-meter__fill--danger';
      case 'High':
        return 'sp-meter__fill--warning';
      default:
        return 'sp-meter__fill--success';
    }
  }
}
