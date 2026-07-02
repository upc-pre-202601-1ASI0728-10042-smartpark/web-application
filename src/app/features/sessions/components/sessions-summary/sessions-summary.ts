import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { catchError, map, merge, of, Subject, switchMap, timer } from 'rxjs';
import { SessionService } from '../../session.service';
import { SessionSummary } from '../../session.models';
import { Icon } from '../../../../shared/ui/icon';
import { Skeleton } from '../../../../shared/ui/skeleton';
import { EmptyState } from '../../../../shared/ui/empty-state';

const REFRESH_MS = 30_000;

type Outcome =
  | { kind: 'ok'; summary: SessionSummary }
  | { kind: 'degraded' }
  | { kind: 'error' };

/**
 * Widget autónomo de resumen de sesiones / flujo vehicular. Consulta el
 * endpoint de sesiones, se auto-refresca y degrada con elegancia mostrando el
 * último resumen conocido cuando el servicio no responde.
 */
@Component({
  selector: 'sp-sessions-summary',
  imports: [Icon, Skeleton, EmptyState, DatePipe],
  templateUrl: './sessions-summary.html',
  styleUrl: './sessions-summary.scss',
})
export class SessionsSummary implements OnInit {
  private readonly sessions = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refresh$ = new Subject<void>();

  protected readonly summary = signal<SessionSummary | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly degraded = signal(false);

  ngOnInit(): void {
    merge(timer(0, REFRESH_MS), this.refresh$)
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          return this.sessions.getSummary().pipe(
            map((summary): Outcome => ({ kind: 'ok', summary })),
            catchError((e: HttpErrorResponse) =>
              of<Outcome>({ kind: e.status === 503 ? 'degraded' : 'error' }),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((outcome) => {
        this.loading.set(false);
        if (outcome.kind === 'ok') {
          this.summary.set(outcome.summary);
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
}
