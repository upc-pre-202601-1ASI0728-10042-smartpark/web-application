import { TestBed } from '@angular/core/testing';
import { OccupancyGauge } from './occupancy-gauge';

describe('OccupancyGauge', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OccupancyGauge] }).compileComponents();
  });

  it('renders the occupancy rate as a clamped percentage', () => {
    const fixture = TestBed.createComponent(OccupancyGauge);
    fixture.componentRef.setInput('rate', 0.5);
    fixture.detectChanges();

    const percent = fixture.nativeElement.querySelector('.gauge__percent') as SVGTextElement;
    expect(percent.textContent).toContain('50%');
  });

  it('clamps values above 1 to 100%', () => {
    const fixture = TestBed.createComponent(OccupancyGauge);
    fixture.componentRef.setInput('rate', 1.4);
    fixture.detectChanges();

    const percent = fixture.nativeElement.querySelector('.gauge__percent') as SVGTextElement;
    expect(percent.textContent).toContain('100%');
  });
});
