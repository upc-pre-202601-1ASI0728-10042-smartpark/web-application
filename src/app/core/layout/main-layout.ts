import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastContainer } from '../../shared/toast/toast-container';

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
  protected readonly collapsed = signal(false);

  protected readonly nav: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Zonas', path: '/zones', icon: '🅿️' },
    { label: 'Alertas de humo', path: '/alerts', icon: '🔥' },
  ];

  toggle(): void {
    this.collapsed.update((c) => !c);
  }
}
