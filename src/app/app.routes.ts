import { Routes } from '@angular/router';
import { MainLayout } from './core/layout/main-layout';
import { authGuard, roleGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    canActivateChild: [roleGuard],
    data: { roles: ['Operator'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'zones',
        loadComponent: () =>
          import('./features/zones/zones-list-page').then((m) => m.ZonesListPage),
      },
      {
        path: 'zones/:zoneId',
        loadComponent: () =>
          import('./features/zones/zone-detail-page').then((m) => m.ZoneDetailPage),
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('./features/alerts/alerts-page').then((m) => m.AlertsPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
