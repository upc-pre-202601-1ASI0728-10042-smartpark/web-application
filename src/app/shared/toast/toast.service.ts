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
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly durations = new Map<number, number>();

  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(title: string, message: string, tone: ToastTone = 'info', timeoutMs = 6000): void {
    const toast: Toast = { id: this.nextId++, title, message, tone };
    this._toasts.update((list) => [...list, toast]);
    if (timeoutMs > 0) {
      this.durations.set(toast.id, timeoutMs);
      this.schedule(toast.id, timeoutMs);
    }
  }

  dismiss(id: number): void {
    this.clear(id);
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  /** Pausa el auto-cierre (al pasar el cursor / enfocar). */
  pause(id: number): void {
    this.clear(id);
  }

  /** Reanuda el auto-cierre al salir el cursor. */
  resume(id: number): void {
    const ms = this.durations.get(id);
    if (ms && !this.timers.has(id)) this.schedule(id, ms);
  }

  private schedule(id: number, ms: number): void {
    this.timers.set(id, setTimeout(() => this.dismiss(id), ms));
  }

  private clear(id: number): void {
    const t = this.timers.get(id);
    if (t) clearTimeout(t);
    this.timers.delete(id);
  }
}
