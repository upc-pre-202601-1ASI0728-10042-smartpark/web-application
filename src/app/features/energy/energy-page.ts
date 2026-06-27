import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { catchError, map, merge, of, Subject, switchMap, timer } from 'rxjs';
import { EnergyService } from './energy.service';
import {
  EnergyRecommendation,
  lightingActionBadge,
  lightingActionLabel,
} from './energy.models';
import { Icon } from '../../shared/ui/icon';
import { Skeleton } from '../../shared/ui/skeleton';
import { EmptyState } from '../../shared/ui/empty-state';

const REFRESH_MS = 30_000;

type Outcome =
  | { kind: 'ok'; recommendations: EnergyRecommendation[] }
  | { kind: 'degraded' }
  | { kind: 'error' };

/**
 * Panel de Eficiencia Energética: lista las zonas/niveles con baja ocupación y
 * su recomendación de atenuación de iluminación, con el ahorro estimado
 * agregado. Se auto-refresca y degrada con elegancia igual que la consola.
 */
@Component({
  selector: 'sp-energy-page',
  imports: [Icon, Skeleton, EmptyState, DatePipe, DecimalPipe],
  templateUrl: './energy-page.html',
  styleUrl: './energy-page.scss',
})
export class EnergyPage implements OnInit {
  private readonly energy = inject(EnergyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refresh$ = new Subject<void>();

  protected readonly recommendations = signal<EnergyRecommendation[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly degraded = signal(false);
  protected readonly lastUpdated = signal<Date | null>(null);

  protected readonly actionLabel = lightingActionLabel;
  protected readonly actionBadge = lightingActionBadge;
  protected readonly skeletons = [0, 1, 2, 3];

  /** Zonas donde hay una oportunidad real de ahorro (no "Mantener"). */
  protected readonly actionable = computed(() =>
    this.recommendations().filter((r) => r.action !== 'Maintain'),
  );

  /** Ahorro total estimado por hora (kWh) si se aplican las recomendaciones. */
  protected readonly totalSavings = computed(() =>
    this.recommendations().reduce((sum, r) => sum + r.estimatedSavingsKwh, 0),
  );

  ngOnInit(): void {
    merge(timer(0, REFRESH_MS), this.refresh$)
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          return this.energy.getRecommendations().pipe(
            map((recommendations): Outcome => ({ kind: 'ok', recommendations })),
            catchError((e: HttpErrorResponse) =>
              of<Outcome>({ kind: e.status === 503 ? 'degraded' : 'error' }),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((outcome) => {
        this.loading.set(false);
        this.lastUpdated.set(new Date());
        if (outcome.kind === 'ok') {
          this.recommendations.set(outcome.recommendations);
          this.degraded.set(false);
          this.error.set(false);
        } else if (outcome.kind === 'degraded') {
          this.degraded.set(true);
          this.error.set(false);
        } else {
          this.error.set(true);
        }
      });
  }

  refresh(): void {
    this.refresh$.next();
  }

  protected percent(rate: number): number {
    return Math.round(rate * 100);
  }

  protected fillClass(rate: number): string {
    if (rate >= 0.85) return 'sp-meter__fill--danger';
    if (rate >= 0.5) return 'sp-meter__fill--warning';
    return 'sp-meter__fill--success';
  }
}
