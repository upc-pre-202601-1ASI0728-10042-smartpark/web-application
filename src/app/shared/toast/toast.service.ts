import { Injectable, signal } from '@angular/core';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface Toast {
  id: number;
  title: string;
  message: string;
  tone: ToastTone;
}

/** Servicio global de notificaciones efímeras (toasts). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(title: string, message: string, tone: ToastTone = 'info', timeoutMs = 6000): void {
    const toast: Toast = { id: this.nextId++, title, message, tone };
    this._toasts.update((list) => [...list, toast]);
    if (timeoutMs > 0) {
      setTimeout(() => this.dismiss(toast.id), timeoutMs);
    }
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
