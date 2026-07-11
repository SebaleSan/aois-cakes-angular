import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Productos } from './productos';

describe('Productos', () => {
  let service: Productos;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(Productos);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load products from json-server using GET', () => {
    const sample = [
      {
        id: 1,
        nombre: 'Brownie',
        categoria: 'Tradicional',
        precio: 2500,
        imagen: 'assets/img/tradicional/brownie.jpg',
        descripcion: 'Brownie con centro fudge, cobertura de nueces tostadas.',
        disponible: true,
        destacado: false
      }
    ];

    service.cargarProductos().subscribe((productos) => {
      expect(productos).toEqual(sample);
    });

    const request = httpMock.expectOne('http://localhost:3000/productos');
    expect(request.request.method).toBe('GET');
    request.flush(sample);
  });
});
