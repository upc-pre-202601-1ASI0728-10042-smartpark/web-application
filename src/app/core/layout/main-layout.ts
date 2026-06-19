import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastContainer } from '../../shared/toast/toast-container';
import { AuthService } from '../auth/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

/**
 * Shell principal del panel del operador: barra superior + navegación lateral.
 * Envuelve a las páginas autenticadas mediante <router-outlet>.
 */
@Component({
  selector: 'sp-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly collapsed = signal(false);
  protected readonly user = this.auth.user;

  protected readonly nav: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Zonas', path: '/zones', icon: '🅿️' },
    { label: 'Alertas de humo', path: '/alerts', icon: '🔥' },
  ];

  toggle(): void {
    this.collapsed.update((c) => !c);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
