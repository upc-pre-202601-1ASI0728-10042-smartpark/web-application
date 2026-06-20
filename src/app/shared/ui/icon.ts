import { Component, input } from '@angular/core';

export type IconName =
  | 'menu'
  | 'refresh'
  | 'logout'
  | 'bell'
  | 'close'
  | 'dashboard'
  | 'flame'
  | 'parking'
  | 'warning'
  | 'check'
  | 'wifi'
  | 'wifi-off'
  | 'chevron-right'
  | 'arrow-left'
  | 'inbox'
  | 'cube';

/**
 * Iconos SVG de línea (estilo Lucide), consistentes entre navegadores y
 * accesibles. Decorativos por defecto (aria-hidden); pasar `label` para
 * exponer un nombre accesible.
 */
@Component({
  selector: 'sp-icon',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
      [attr.aria-hidden]="label() ? null : 'true'"
    >
      @switch (name()) {
        @case ('menu') { <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /> }
        @case ('refresh') { <path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /> }
        @case ('logout') { <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /> }
        @case ('bell') { <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /> }
        @case ('close') { <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /> }
        @case ('dashboard') { <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /> }
        @case ('flame') { <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /> }
        @case ('parking') { <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 17V7h4a3 3 0 0 1 0 6H9" /> }
        @case ('warning') { <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /> }
        @case ('check') { <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /> }
        @case ('wifi') { <path d="M5 12.55a11 11 0 0 1 14 0" /><path d="M8.5 16.11a6 6 0 0 1 7 0" /><line x1="12" y1="20" x2="12.01" y2="20" /> }
        @case ('wifi-off') { <line x1="2" y1="2" x2="22" y2="22" /><path d="M8.5 16.11a6 6 0 0 1 7 0" /><path d="M5 12.55a11 11 0 0 1 5-2.41" /><path d="M19 12.55a11 11 0 0 0-4-2.2" /><line x1="12" y1="20" x2="12.01" y2="20" /> }
        @case ('chevron-right') { <polyline points="9 18 15 12 9 6" /> }
        @case ('arrow-left') { <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /> }
        @case ('inbox') { <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /> }
        @case ('cube') { <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /> }
      }
    </svg>
  `,
  styles: [':host { display: inline-flex; line-height: 0; }'],
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  readonly label = input<string>('');
}
