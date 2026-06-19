import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, merge, of, Subject, switchMap, timer } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OccupancyService } from '../occupancy/occupancy.service';
import { OccupancySummary, ZoneOccupancy } from '../occupancy/occupancy.models';
import { SummaryCards } from '../occupancy/components/summary-cards/summary-cards';
import { OccupancyGauge } from '../occupancy/components/occupancy-gauge/occupancy-gauge';
import { ZoneOverview } from '../occupancy/components/zone-overview/zone-overview';
import { Icon } from '../../shared/ui/icon';
import { Skeleton } from '../../shared/ui/skeleton';
import { EmptyState } from '../../shared/ui/empty-state';

const REFRESH_MS = 20_000;

type SummaryOutcome =
  | { kind: 'ok'; summary: OccupancySummary }
  | { kind: 'degraded' }
  | { kind: 'error' };

/**
 * Página principal del operador: resumen de ocupación del lote, indicador
 * global y desglose por zonas. Se refresca automáticamente y degrada con
 * elegancia cuando el gemelo digital no responde (503).
 */
@Component({
  selector: 'sp-dashboard-page',
  imports: [SummaryCards, OccupancyGauge, ZoneOverview, Icon, Skeleton, EmptyState, DatePipe],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private readonly occupancy = inject(OccupancyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refresh$ = new Subject<void>();

  protected readonly summary = signal<OccupancySummary | null>(null);
  protected readonly zones = signal<ZoneOccupancy[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly degraded = signal(false);
  protected readonly lastUpdated = signal<Date | null>(null);

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
  }
}
