import { Component, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { incidentStatusLabel, SmokeAlert } from '../../alert.models';
import { Icon } from '../../../../shared/ui/icon';

/** Lista presentacional de alertas de humo activas (región en vivo accesible). */
@Component({
  selector: 'sp-alert-panel',
  imports: [DatePipe, DecimalPipe, Icon],
  templateUrl: './alert-panel.html',
  styleUrl: './alert-panel.scss',
})
export class AlertPanel {
  readonly alerts = input.required<SmokeAlert[]>();

  protected readonly statusLabel = incidentStatusLabel;

  protected statusClass(status: SmokeAlert['status']): string {
    switch (status) {
      case 'Confirmed':
        return 'sp-badge--danger';
      case 'Resolved':
        return 'sp-badge--success';
      default:
        return 'sp-badge--warning';
    }
  }
}
