import { Component, inject } from '@angular/core';
import { Toast, ToastService, ToastTone } from './toast.service';
import { Icon, IconName } from '../ui/icon';

/** Contenedor flotante que renderiza los toasts activos (con aria-live). */
@Component({
  selector: 'sp-toast-container',
  imports: [Icon],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);

  protected icon(tone: ToastTone): IconName {
    switch (tone) {
      case 'danger':
        return 'flame';
      case 'warning':
        return 'warning';
      case 'success':
        return 'check';
      default:
        return 'bell';
    }
  }

  protected ariaLive(toast: Toast): 'assertive' | 'polite' {
    return toast.tone === 'danger' ? 'assertive' : 'polite';
  }
}
