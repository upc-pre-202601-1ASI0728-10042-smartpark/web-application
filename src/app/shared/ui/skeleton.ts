import { Component, input } from '@angular/core';

/** Bloque de carga con shimmer. Configurable por ancho/alto/radio. */
@Component({
  selector: 'sp-skeleton',
  template: '<span class="sp-skeleton" [style.width]="width()" [style.height]="height()" [style.border-radius]="radius()"></span>',
  styles: [':host { display: block; } .sp-skeleton { display: block; }'],
})
export class Skeleton {
  readonly width = input('100%');
  readonly height = input('1rem');
  readonly radius = input('var(--sp-radius-sm)');
}
