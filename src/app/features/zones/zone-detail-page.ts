import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OccupancyService } from '../occupancy/occupancy.service';
import { ParkingSpace } from '../occupancy/occupancy.models';

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

  protected readonly occupiedCount = computed(
    () => this.spaces().filter((s) => s.occupancyState === 'Occupied').length,
  );

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
