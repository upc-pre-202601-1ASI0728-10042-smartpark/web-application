import { Component } from '@angular/core';

/**
 * Página principal del operador. En esta fase es un placeholder; las métricas
 * de ocupación en tiempo real se incorporan en el bounded context de ocupación.
 */
@Component({
  selector: 'sp-dashboard-page',
  template: `
    <section class="sp-card">
      <h2>Dashboard</h2>
      <p>Bienvenido al panel del operador de SmartPark.</p>
    </section>
  `,
})
export class DashboardPage {}
