import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Carro } from './carro';
import { AuthService } from '../../services/auth';
import { CarroService } from '../../services/carro';

describe('Carro', () => {
  let component: Carro;
  let fixture: ComponentFixture<Carro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carro],
      providers: [
        provideRouter([]),
        AuthService,
        {
          provide: CarroService,
          useValue: {
            items$: of([]),
            vaciar: () => {},
            formatearPrecio: (precio: number) => '$' + precio.toLocaleString('es-CL'),
            totalItems: 0,
            totalPrecio: 0
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Carro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
