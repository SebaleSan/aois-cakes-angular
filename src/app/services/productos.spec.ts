import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

import { Productos } from './productos';
import { Producto } from '../data/productos';

const PRODUCTOS_URL = 'http://localhost:3000/productos';

const crearProductoMock = (overrides: Partial<Producto> = {}): Producto => ({
  id: 1,
  nombre: 'Brownie',
  categoria: 'Tradicional',
  precio: 2500,
  imagen: 'assets/img/tradicional/brownie.jpg',
  descripcion: 'Brownie con centro fudge, cobertura de nueces tostadas.',
  disponible: true,
  destacado: false,
  ...overrides,
});

describe('Productos', () => {
  let service: Productos;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Productos);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  describe('obtenerProductos', () => {
    it('debería devolver un arreglo vacío cuando aún no se han cargado productos', () => {
      expect(service.obtenerProductos()).toEqual([]);
    });

    it('debería devolver los productos actuales después de cargarlos', () => {
      const mock = [crearProductoMock()];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(mock);

      expect(service.obtenerProductos()).toEqual(mock);
    });
  });

  describe('obtenerProductoPorId', () => {
    it('debería devolver el producto correspondiente al id indicado', () => {
      const mock = [crearProductoMock({ id: 1 }), crearProductoMock({ id: 2, nombre: 'Alfajor' })];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(mock);

      expect(service.obtenerProductoPorId(2)).toEqual(mock[1]);
    });

    it('debería devolver undefined cuando el id no existe', () => {
      const mock = [crearProductoMock({ id: 1 })];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(mock);

      expect(service.obtenerProductoPorId(99)).toBeUndefined();
    });
  });

  describe('obtenerCategorias', () => {
    it('debería devolver "Todas" junto con las categorías únicas de los productos', () => {
      const mock = [
        crearProductoMock({ id: 1, categoria: 'Tradicional' }),
        crearProductoMock({ id: 2, categoria: 'tradicional' }),
        crearProductoMock({ id: 3, categoria: 'Tradicional' }),
      ];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(mock);

      expect(service.obtenerCategorias()).toEqual(['Todas', 'Tradicional', 'tradicional']);
    });

    it('debería devolver solo "Todas" cuando no hay productos cargados', () => {
      expect(service.obtenerCategorias()).toEqual(['Todas']);
    });
  });

  describe('cargarProductos', () => {
    it('debería realizar una petición GET a la URL de productos', () => {
      const mock = [crearProductoMock()];

      service.cargarProductos().subscribe((productos) => {
        expect(productos).toEqual(mock);
      });

      const request = httpMock.expectOne(PRODUCTOS_URL);
      expect(request.request.method).toBe('GET');
      request.flush(mock);
    });

    it('debería normalizar los productos convirtiendo el id a número', () => {
      const mock = [{ ...crearProductoMock(), id: '5' as unknown as number }];

      service.cargarProductos().subscribe((productos) => {
        expect(productos[0].id).toBe(5);
        expect(typeof productos[0].id).toBe('number');
      });

      httpMock.expectOne(PRODUCTOS_URL).flush(mock);
    });

    it('debería devolver un arreglo vacío cuando la API responde null', () => {
      service.cargarProductos().subscribe((productos) => {
        expect(productos).toEqual([]);
      });

      httpMock.expectOne(PRODUCTOS_URL).flush(null as unknown as Producto[]);
    });

    it('debería usar la caché en cargas posteriores sin volver a llamar al backend', () => {
      const mock = [crearProductoMock()];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(mock);

      service.cargarProductos().subscribe((productos) => {
        expect(productos).toEqual(mock);
      });

      httpMock.expectNone(PRODUCTOS_URL);
    });

    it('debería forzar la recarga cuando forceRefresh es true', () => {
      const mockInicial = [crearProductoMock()];
      const mockActualizado = [crearProductoMock({ nombre: 'Brownie Actualizado' })];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(mockInicial);

      service.cargarProductos(true).subscribe((productos) => {
        expect(productos).toEqual(mockActualizado);
      });

      httpMock.expectOne(PRODUCTOS_URL).flush(mockActualizado);
    });

    it('debería vaciar el listado y emitir un error controlado cuando la petición falla', () => {
      service.cargarProductos().subscribe({
        next: () => {
          throw new Error('No debería emitir un valor exitoso');
        },
        error: (error: Error) => {
          expect(error.message).toBe('No se pudieron cargar los productos. Intenta nuevamente.');
        },
      });

      httpMock.expectOne(PRODUCTOS_URL).flush('error', { status: 500, statusText: 'Server Error' });

      expect(service.obtenerProductos()).toEqual([]);
    });
  });

  describe('refrescarProductos', () => {
    it('debería forzar la recarga de productos ignorando la caché', () => {
      const mockInicial = [crearProductoMock()];
      const mockRefrescado = [crearProductoMock({ nombre: 'Brownie Nuevo' })];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(mockInicial);

      service.refrescarProductos().subscribe((productos) => {
        expect(productos).toEqual(mockRefrescado);
      });

      httpMock.expectOne(PRODUCTOS_URL).flush(mockRefrescado);
    });
  });

  describe('crearProducto', () => {
    it('debería asignar id 1 cuando no hay productos previos', () => {
      const nuevoProducto = {
        nombre: 'Alfajor',
        categoria: 'Tradional',
        precio: 1800,
        imagen: 'assets/img/tradicional/alfajor.jpg',
        descripcion: 'Alfajor bañado en chocolate.',
        disponible: true,
        destacado: true,
      };

      service.crearProducto(nuevoProducto).subscribe((producto) => {
        expect(producto.id).toBe(1);
      });

      const request = httpMock.expectOne(PRODUCTOS_URL);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({ ...nuevoProducto, id: 1 });
      request.flush({ ...nuevoProducto, id: 1 });
    });

    it('debería asignar el siguiente id disponible cuando ya existen productos', () => {
      const existentes = [crearProductoMock({ id: 1 }), crearProductoMock({ id: 3 })];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(existentes);

      const nuevoProducto = {
        nombre: 'Alfajor',
        categoria: 'Tradicional',
        precio: 1800,
        imagen: 'assets/img/tradicional/alfajor.jpg',
        descripcion: 'Alfajor bañado en chocolate.',
        disponible: true,
        destacado: true,
      };

      service.crearProducto(nuevoProducto).subscribe((producto) => {
        expect(producto.id).toBe(4);
      });

      const request = httpMock.expectOne(PRODUCTOS_URL);
      expect(request.request.body).toEqual({ ...nuevoProducto, id: 4 });
      request.flush({ ...nuevoProducto, id: 4 });
    });

    it('debería agregar el producto creado a la lista existente', () => {
      const existentes = [crearProductoMock({ id: 1 })];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(existentes);

      const nuevoProducto = {
        nombre: 'Alfajor',
        categoria: 'Tradicional',
        precio: 1800,
        imagen: 'assets/img/tradicional/alfajor.jpg',
        descripcion: 'Alfajor bañado en chocolate.',
        disponible: true,
        destacado: true,
      };

      service.crearProducto(nuevoProducto).subscribe();

      httpMock.expectOne(PRODUCTOS_URL).flush({ ...nuevoProducto, id: 2 });

      expect(service.obtenerProductos()).toEqual([existentes[0], { ...nuevoProducto, id: 2 }]);
    });
  });

  describe('actualizarProducto', () => {
    it('debería actualizar un producto existente mediante PATCH', () => {
      const existentes = [crearProductoMock({ id: 1, nombre: 'Brownie' })];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(existentes);

      service.actualizarProducto(1, { precio: 3000 }).subscribe((producto) => {
        expect(producto.precio).toBe(3000);
      });

      const request = httpMock.expectOne(`${PRODUCTOS_URL}/1`);
      expect(request.request.method).toBe('PATCH');
      expect(request.request.body).toEqual({ precio: 3000 });
      request.flush({ ...existentes[0], precio: 3000 });
    });

    it('debería reflejar el producto actualizado en la lista interna', () => {
      const existentes = [crearProductoMock({ id: 1, precio: 2500 })];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(existentes);

      service.actualizarProducto(1, { precio: 3000 }).subscribe();
      httpMock.expectOne(`${PRODUCTOS_URL}/1`).flush({ ...existentes[0], precio: 3000 });

      expect(service.obtenerProductoPorId(1)?.precio).toBe(3000);
    });

    it('debería normalizar el id en la lista interna aunque la API devuelva el id como string', () => {
      const existentes = [crearProductoMock({ id: 1 })];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(existentes);

      service.actualizarProducto(1, { nombre: 'Brownie Nuevo' }).subscribe();

      httpMock
        .expectOne(`${PRODUCTOS_URL}/1`)
        .flush({ ...existentes[0], id: '1' as unknown as number, nombre: 'Brownie Nuevo' });

      const productoGuardado = service.obtenerProductoPorId(1);
      expect(productoGuardado?.id).toBe(1);
      expect(typeof productoGuardado?.id).toBe('number');
    });
  });

  describe('eliminarProducto', () => {
    it('debería eliminar un producto mediante DELETE', () => {
      const existentes = [crearProductoMock({ id: 1 })];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(existentes);

      service.eliminarProducto(1).subscribe();

      const request = httpMock.expectOne(`${PRODUCTOS_URL}/1`);
      expect(request.request.method).toBe('DELETE');
      request.flush(null);
    });

    it('debería quitar el producto eliminado de la lista interna', () => {
      const existentes = [crearProductoMock({ id: 1 }), crearProductoMock({ id: 2, nombre: 'Alfajor' })];

      service.cargarProductos().subscribe();
      httpMock.expectOne(PRODUCTOS_URL).flush(existentes);

      service.eliminarProducto(1).subscribe();
      httpMock.expectOne(`${PRODUCTOS_URL}/1`).flush(null);

      expect(service.obtenerProductos()).toEqual([existentes[1]]);
    });
  });
});