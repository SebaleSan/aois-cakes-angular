import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Detalle } from './detalle';
import { Productos } from '../../services/productos';
import { CarroService } from '../../services/carro';
import { AuthService } from '../../services/auth';
import { Producto } from '../../data/productos';

describe('Detalle', () => {
  let component: Detalle;
  let fixture: ComponentFixture<Detalle>;

  const productos: Producto[] = [
    {
      id: 1,
      nombre: 'Brownie',
      categoria: 'Tradicional',
      precio: 2500,
      imagen: 'brownie.jpg',
      descripcion: 'Brownie con centro fudge.',
      disponible: true,
      destacado: false
    },
    {
      id: 2,
      nombre: 'Lemon Pie',
      categoria: 'Tradicional',
      precio: 14600,
      imagen: 'lemon.jpg',
      descripcion: 'Base crumble con crema de limón.',
      disponible: true,
      destacado: true
    },
    {
      id: 3,
      nombre: 'Empolvados',
      categoria: 'Tradicional',
      precio: 1000,
      imagen: 'empolvados.jpg',
      descripcion: 'Empolvados chilenos con manjar.',
      disponible: true,
      destacado: false
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detalle],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '2' })),
            snapshot: {
              paramMap: convertToParamMap({ id: '2' })
            }
          }
        },
        {
          provide: Productos,
          useValue: {
            cargarProductos: () => of(productos)
          }
        },
        {
          provide: CarroService,
          useValue: {
            agregar: () => undefined
          }
        },
        {
          provide: AuthService,
          useValue: {
            logueado: true
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Detalle);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('deberia crear', () => {
    expect(component).toBeTruthy();
  });

  it('deberia cargar el producto segun id', () => {
    expect(component.producto?.id).toBe(2);
    expect(component.producto?.nombre).toBe('Lemon Pie');
    expect(component.productosRelacionados.length).toBe(2);
  });
});