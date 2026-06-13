import { Component, inject, OnInit, signal } from '@angular/core';
import { AlertService } from './alert.service';
import { SmokeAlert } from './alert.models';
import { AlertPanel } from './components/alert-panel/alert-panel';

/** Página de monitoreo de alertas de humo del operador. */
@Component({
  selector: 'sp-alerts-page',
  imports: [AlertPanel],
  templateUrl: './alerts-page.html',
  styleUrl: './alerts-page.scss',
})
export class AlertsPage implements OnInit {
  private readonly alertService = inject(AlertService);

  protected readonly alerts = signal<SmokeAlert[]>([]);
  protected readonly loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.alertService.getActive().subscribe({
      next: (alerts) => {
        this.alerts.set(alerts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
