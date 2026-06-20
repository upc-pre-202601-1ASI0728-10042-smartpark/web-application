import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { OccupancyService } from '../occupancy/occupancy.service';
import { congestionLabel, ZoneOccupancy } from '../occupancy/occupancy.models';
import { Icon } from '../../shared/ui/icon';
import { Skeleton } from '../../shared/ui/skeleton';
import { EmptyState } from '../../shared/ui/empty-state';

/** Listado de zonas del lote con acceso al detalle de espacios. */
@Component({
  selector: 'sp-zones-list-page',
  imports: [RouterLink, Icon, Skeleton, EmptyState],
  templateUrl: './zones-list-page.html',
  styleUrl: './zones-list-page.scss',
})
export class ZonesListPage implements OnInit {
  private readonly occupancy = inject(OccupancyService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly zones = signal<ZoneOccupancy[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly skeletons = [0, 1, 2, 3, 4, 5];
  protected readonly label = congestionLabel;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.occupancy
      .getZones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (zones) => {
          this.zones.set(zones);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
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
