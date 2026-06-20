import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { OccupancyService } from '../occupancy/occupancy.service';
import { occupancyStateLabel, OccupancyState, ParkingSpace } from '../occupancy/occupancy.models';
import { Icon } from '../../shared/ui/icon';
import { Skeleton } from '../../shared/ui/skeleton';
import { EmptyState } from '../../shared/ui/empty-state';

type SpaceFilter = 'All' | OccupancyState;

/** Detalle de una zona: grilla de espacios con su estado de ocupación. */
@Component({
  selector: 'sp-zone-detail-page',
  imports: [RouterLink, Icon, Skeleton, EmptyState],
  templateUrl: './zone-detail-page.html',
  styleUrl: './zone-detail-page.scss',
})
export class ZoneDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly occupancy = inject(OccupancyService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly zoneId = signal('');
  protected readonly spaces = signal<ParkingSpace[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly filter = signal<SpaceFilter>('All');
  protected readonly skeletons = Array.from({ length: 12 }, (_, i) => i);
  protected readonly stateLabel = occupancyStateLabel;

  protected readonly filters: { value: SpaceFilter; label: string }[] = [
    { value: 'All', label: 'Todos' },
    { value: 'Free', label: 'Libres' },
    { value: 'Occupied', label: 'Ocupados' },
    { value: 'Reserved', label: 'Reservados' },
  ];

  protected readonly occupiedCount = computed(
    () => this.spaces().filter((s) => s.occupancyState === 'Occupied').length,
  );

  protected readonly visibleSpaces = computed(() => {
    const f = this.filter();
    return f === 'All' ? this.spaces() : this.spaces().filter((s) => s.occupancyState === f);
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.zoneId.set(params.get('zoneId') ?? '');
          this.loading.set(true);
          this.error.set(false);
          this.filter.set('All');
          return this.occupancy.getSpacesByZone(this.zoneId()).pipe(
            catchError(() => {
              this.error.set(true);
              return of<ParkingSpace[]>([]);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((spaces) => {
        this.spaces.set(spaces);
        this.loading.set(false);
      });
  }

  protected setFilter(filter: SpaceFilter): void {
    this.filter.set(filter);
  }

  protected stateClass(state: ParkingSpace['occupancyState']): string {
    switch (state) {
      case 'Occupied':
        return 'space--occupied';
      case 'Reserved':
        return 'space--reserved';
      case 'Free':
        return 'space--free';
      default:
        return 'space--unknown';
    }
  }
}
