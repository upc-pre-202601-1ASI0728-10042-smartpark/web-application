import { Component, computed, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, merge, of, Subject, switchMap, timer } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OccupancyService } from '../occupancy/occupancy.service';
import { congestionLabel, OccupancySummary, ZoneOccupancy } from '../occupancy/occupancy.models';
import { TwinViewer } from '../twin/twin-viewer';
import { Icon } from '../../shared/ui/icon';
import { Skeleton } from '../../shared/ui/skeleton';
import { EmptyState } from '../../shared/ui/empty-state';

const REFRESH_MS = 20_000;

type SummaryOutcome =
  | { kind: 'ok'; summary: OccupancySummary }
  | { kind: 'degraded' }
  | { kind: 'error' };

/**
 * Console principal del operador: el gemelo digital 3D como elemento central
 * (con la ocupación coloreada en vivo) y un panel lateral de métricas de
 * ocupación por zona. Se auto-refresca y degrada con elegancia.
 */
@Component({
  selector: 'sp-dashboard-page',
  imports: [TwinViewer, Icon, Skeleton, EmptyState, DatePipe, RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private readonly occupancy = inject(OccupancyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refresh$ = new Subject<void>();
  private readonly viewer = viewChild(TwinViewer);

  protected readonly summary = signal<OccupancySummary | null>(null);
  protected readonly zones = signal<ZoneOccupancy[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly degraded = signal(false);
  protected readonly lastUpdated = signal<Date | null>(null);
  protected readonly label = congestionLabel;

  protected readonly free = computed(() => {
    const s = this.summary();
    return s ? s.totalSpaces - s.occupiedSpaces : 0;
  });
  protected readonly percent = computed(() =>
    Math.round((this.summary()?.occupancyRate ?? 0) * 100),
  );

  ngOnInit(): void {
    merge(timer(0, REFRESH_MS), this.refresh$)
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          return forkJoin({
            summary: this.occupancy.getSummary().pipe(
              map((s): SummaryOutcome => ({ kind: 'ok', summary: s })),
              catchError((e: HttpErrorResponse) =>
                of<SummaryOutcome>({ kind: e.status === 503 ? 'degraded' : 'error' }),
              ),
            ),
            zones: this.occupancy.getZones().pipe(catchError(() => of(null))),
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ summary, zones }) => {
        this.loading.set(false);
        this.lastUpdated.set(new Date());
        if (summary.kind === 'ok') {
          this.summary.set(summary.summary);
          this.degraded.set(false);
          this.error.set(null);
        } else if (summary.kind === 'degraded') {
          this.degraded.set(true);
          this.error.set(null);
        } else {
          this.error.set('No se pudo cargar la ocupación. Reintenta en unos segundos.');
        }
        if (zones) this.zones.set(zones);
      });
  }

  refresh(): void {
    this.refresh$.next();
    this.viewer()?.refresh();
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
