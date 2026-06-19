import { Component, input } from '@angular/core';
import { Icon, IconName } from './icon';

/**
 * Estado vacío / informativo consistente: icono + título + mensaje y, de forma
 * opcional, contenido proyectado para una acción.
 */
@Component({
  selector: 'sp-empty-state',
  imports: [Icon],
  template: `
    <div class="empty" [class]="'empty--' + tone()">
      <div class="empty__icon"><sp-icon [name]="icon()" [size]="28" /></div>
      <p class="empty__title">{{ title() }}</p>
      @if (message()) {
        <p class="empty__message">{{ message() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: [`
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--sp-2);
      padding: var(--sp-6) var(--sp-4);
      color: var(--sp-text-muted);
    }
    .empty__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px; height: 56px;
      border-radius: var(--sp-radius-pill);
      background: var(--sp-bg);
      color: var(--sp-text-muted);
      margin-bottom: var(--sp-1);
    }
    .empty--success .empty__icon { background: var(--sp-success-bg); color: var(--sp-success); }
    .empty--danger .empty__icon { background: var(--sp-danger-bg); color: var(--sp-danger); }
    .empty__title { margin: 0; font-weight: 600; color: var(--sp-text); }
    .empty__message { margin: 0; font-size: 0.88rem; }
  `],
})
export class EmptyState {
  readonly icon = input<IconName>('inbox');
  readonly title = input.required<string>();
  readonly message = input('');
  readonly tone = input<'neutral' | 'success' | 'danger'>('neutral');
}
