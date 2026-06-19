import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

/** Contenedor flotante que renderiza los toasts activos. */
@Component({
  selector: 'sp-toast-container',
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);
}
