import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OccupancyService } from '../occupancy/occupancy.service';
import { OccupancyState, ParkingSpace } from '../occupancy/occupancy.models';

type SpaceFilter = 'All' | OccupancyState;

/** Detalle de una zona: grilla de espacios con su estado de ocupación. */
@Component({
  selector: 'sp-zone-detail-page',
  imports: [RouterLink],
  templateUrl: './zone-detail-page.html',
  styleUrl: './zone-detail-page.scss',
})
export class ZoneDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly occupancy = inject(OccupancyService);

  protected readonly zoneId = signal('');
  protected readonly spaces = signal<ParkingSpace[]>([]);
  protected readonly loading = signal(false);
  protected readonly filter = signal<SpaceFilter>('All');

  protected readonly filters: SpaceFilter[] = ['All', 'Free', 'Occupied', 'Reserved'];

  protected readonly occupiedCount = computed(
    () => this.spaces().filter((s) => s.occupancyState === 'Occupied').length,
  );

  protected readonly visibleSpaces = computed(() => {
    const f = this.filter();
    return f === 'All' ? this.spaces() : this.spaces().filter((s) => s.occupancyState === f);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('zoneId') ?? '';
    this.zoneId.set(id);
    this.loading.set(true);
    this.occupancy.getSpacesByZone(id).subscribe({
      next: (spaces) => {
        this.spaces.set(spaces);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
