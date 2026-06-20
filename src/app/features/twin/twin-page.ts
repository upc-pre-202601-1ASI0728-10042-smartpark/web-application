import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import '@google/model-viewer';

/**
 * Visor 3D del gemelo digital: renderiza el modelo GLB del estacionamiento
 * (generado en el repo iot-simulator) con <model-viewer>. Es la vista que
 * cierra la integración del gemelo dentro del panel del operador.
 */
@Component({
  selector: 'sp-twin-page',
  templateUrl: './twin-page.html',
  styleUrl: './twin-page.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TwinPage {
  protected readonly loaded = signal(false);

  onLoad(): void {
    this.loaded.set(true);
  }
}
