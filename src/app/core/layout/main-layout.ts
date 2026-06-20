import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastContainer } from '../../shared/toast/toast-container';
import { ToastService } from '../../shared/toast/toast.service';
import { Icon, IconName } from '../../shared/ui/icon';
import { AuthService } from '../auth/auth.service';
import { NotificationStore } from '../notifications/notification-store';
import { RealtimeAlertsService } from '../../features/alerts/realtime-alerts.service';
import { toSmokeAlert } from '../../features/alerts/alert.models';

interface NavItem {
  label: string;
  path: string;
  icon: IconName;
}

/**
 * Shell principal del panel del operador: barra superior + navegación lateral.
 * Arranca la conexión de alertas en tiempo real a nivel de aplicación, de modo
 * que las notificaciones llegan en cualquier vista.
 */
@Component({
  selector: 'sp-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainer, Icon, DatePipe],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly realtime = inject(RealtimeAlertsService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly store = inject(NotificationStore);
  protected readonly user = this.auth.user;
  protected readonly connected = this.realtime.connected;

  protected readonly collapsed = signal(false);
  protected readonly mobileOpen = signal(false);
  protected readonly bellOpen = signal(false);

  protected readonly nav: NavItem[] = [
    { label: 'Console', path: '/dashboard', icon: 'dashboard' },
    { label: 'Ocupación por nivel', path: '/zones', icon: 'parking' },
    { label: 'Alertas de seguridad', path: '/alerts', icon: 'flame' },
    { label: 'Simulador IoT', path: '/simulator', icon: 'activity' },
  ];

  ngOnInit(): void {
    void this.realtime.start();
    this.realtime.alert$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.store.add(toSmokeAlert(event));
      this.toast.show(
        'Alerta de humo',
        `Zona ${event.zoneId} · ${Math.round(event.smokeLevel)} ppm`,
        'danger',
      );
    });
  }

  ngOnDestroy(): void {
    void this.realtime.stop();
  }

  toggle(): void {
    this.collapsed.update((c) => !c);
  }

  toggleMobile(): void {
    this.mobileOpen.update((o) => !o);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  toggleBell(): void {
    const willOpen = !this.bellOpen();
    this.bellOpen.set(willOpen);
    if (willOpen) this.store.markAllRead();
  }

  closeBell(): void {
    this.bellOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    void this.realtime.stop();
    void this.router.navigateByUrl('/login');
  }
}
