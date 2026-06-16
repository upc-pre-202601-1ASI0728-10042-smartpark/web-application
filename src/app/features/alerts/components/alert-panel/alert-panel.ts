import { Component, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SmokeAlert } from '../../alert.models';

/** Lista presentacional de alertas de humo activas. */
@Component({
  selector: 'sp-alert-panel',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './alert-panel.html',
  styleUrl: './alert-panel.scss',
})
export class AlertPanel {
  readonly alerts = input.required<SmokeAlert[]>();

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
