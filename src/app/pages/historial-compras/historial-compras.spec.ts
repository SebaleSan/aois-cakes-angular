import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HistorialCompras } from './historial-compras';

describe('HistorialCompras', () => {
  let component: HistorialCompras;
  let fixture: ComponentFixture<HistorialCompras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialCompras],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialCompras);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});