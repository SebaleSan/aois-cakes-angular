import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { Productos } from './productos';
import { Producto } from '../data/productos';

// Ajusta la ruta de import de "Productos" y "Producto" según la ubicación real
// de tu servicio y tu interfaz en el proyecto.

const PRODUCTOS_URL = 'http://localhost:3000/productos';

const crearProductoMock = (overrides: Partial<Producto> = {}): Producto =>
  ({
    id: 1,
    nombre: 'Producto de prueba',
    categoria: 'Categoria A',
    precio: 100,
    ...overrides,
  }) as Producto;

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

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('obtenerProductos() debería devolver un arreglo vacío inicialmente', () => {
    expect(service.obtenerProductos()).toEqual([]);
  });

  it('obtenerProductoPorId() debería devolver undefined si no hay productos cargados', () => {
    expect(service.obtenerProductoPorId(1)).toBeUndefined();
  });

  it('obtenerCategorias() debería devolver solo "Todas" cuando no hay productos', () => {
    expect(service.obtenerCategorias()).toEqual(['Todas']);
  });

  it('cargarProductos() debería hacer la petición HTTP, normalizar y emitir los productos', () => {
    const productosMock = [
      crearProductoMock({ id: '1' as unknown as number, categoria: 'Ropa' }),
      crearProductoMock({ id: '2' as unknown as number, categoria: 'Calzado' }),
    ];

    let resultado: Producto[] | undefined;
    service.cargarProductos().subscribe((productos) => (resultado = productos));

    const req = httpMock.expectOne((r) => r.url.startsWith(`${PRODUCTOS_URL}?_=`));
    expect(req.request.method).toBe('GET');
    req.flush(productosMock);

    expect(resultado).toEqual([
      { id: 1, nombre: 'Producto de prueba', categoria: 'Ropa', precio: 100 },
      { id: 2, nombre: 'Producto de prueba', categoria: 'Calzado', precio: 100 },
    ]);
    expect(service.obtenerProductos()).toEqual(resultado);
    expect(service.obtenerCategorias()).toEqual(['Todas', 'Ropa', 'Calzado']);
  });

  it('cargarProductos() no debería volver a llamar al HTTP si ya están cargados', () => {
    const productosMock = [crearProductoMock()];

    service.cargarProductos().subscribe();
    const req = httpMock.expectOne((r) => r.url.startsWith(`${PRODUCTOS_URL}?_=`));
    req.flush(productosMock);

    let segundaRespuesta: Producto[] | undefined;
    service.cargarProductos().subscribe((productos) => (segundaRespuesta = productos));

    httpMock.expectNone((r) => r.url.startsWith(`${PRODUCTOS_URL}?_=`));
    expect(segundaRespuesta).toEqual(productosMock);
  });

  it('cargarProductos(true) / refrescarProductos() debería forzar una nueva petición HTTP', () => {
    service.cargarProductos().subscribe();
    httpMock.expectOne((r) => r.url.startsWith(`${PRODUCTOS_URL}?_=`)).flush([crearProductoMock()]);

    service.refrescarProductos().subscribe();
    const segundaReq = httpMock.expectOne((r) => r.url.startsWith(`${PRODUCTOS_URL}?_=`));
    expect(segundaReq.request.method).toBe('GET');
    segundaReq.flush([crearProductoMock({ id: 5 })]);

    expect(service.obtenerProductoPorId(5)).toBeTruthy();
  });

  it('cargarProductos() debería manejar errores, vaciar el estado y emitir un error personalizado', () => {
    let errorRecibido: Error | undefined;

    service.cargarProductos().subscribe({
      next: () => {
        throw new Error('No debería emitir un valor exitoso');
      },
      error: (err) => (errorRecibido = err),
    });

    const req = httpMock.expectOne((r) => r.url.startsWith(`${PRODUCTOS_URL}?_=`));
    req.flush('fallo', { status: 500, statusText: 'Server Error' });

    expect(errorRecibido?.message).toBe('No se pudieron cargar los productos. Intenta nuevamente.');
    expect(service.obtenerProductos()).toEqual([]);
  });

  it('crearProducto() debería asignar el siguiente id y agregar el producto al estado', () => {
    service.cargarProductos().subscribe();
    httpMock
      .expectOne((r) => r.url.startsWith(`${PRODUCTOS_URL}?_=`))
      .flush([crearProductoMock({ id: 3 }), crearProductoMock({ id: 7 })]);

    const nuevoProducto = { nombre: 'Gorra', categoria: 'Accesorios', precio: 20 } as Omit<
      Producto,
      'id'
    >;

    let creado: Producto | undefined;
    service.crearProducto(nuevoProducto).subscribe((producto) => (creado = producto));

    const req = httpMock.expectOne(PRODUCTOS_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.id).toBe(8); 

    req.flush({ ...req.request.body });

    expect(creado?.id).toBe(8);
    expect(service.obtenerProductoPorId(8)).toBeTruthy();
    expect(service.obtenerProductos().length).toBe(3);
  });

  it('crearProducto() debería asignar id = 1 cuando no hay productos previos', () => {
    const nuevoProducto = { nombre: 'Único', categoria: 'Nueva', precio: 10 } as Omit<
      Producto,
      'id'
    >;

    service.crearProducto(nuevoProducto).subscribe();

    const req = httpMock.expectOne(PRODUCTOS_URL);
    expect(req.request.body.id).toBe(1);
    req.flush({ ...req.request.body });
  });

  it('actualizarProducto() debería hacer PATCH y actualizar el producto correspondiente en el estado', () => {
    service.cargarProductos().subscribe();
    httpMock
      .expectOne((r) => r.url.startsWith(`${PRODUCTOS_URL}?_=`))
      .flush([crearProductoMock({ id: 1, nombre: 'Original' })]);

    let actualizado: Producto | undefined;
    service
      .actualizarProducto(1, { nombre: 'Modificado' })
      .subscribe((producto) => (actualizado = producto));

    const req = httpMock.expectOne(`${PRODUCTOS_URL}/1`);
    expect(req.request.method).toBe('PATCH');
    req.flush(crearProductoMock({ id: 1, nombre: 'Modificado' }));

    expect(actualizado?.nombre).toBe('Modificado');
    expect(service.obtenerProductoPorId(1)?.nombre).toBe('Modificado');
  });

  it('eliminarProducto() debería hacer DELETE y quitar el producto del estado', () => {
    service.cargarProductos().subscribe();
    httpMock
      .expectOne((r) => r.url.startsWith(`${PRODUCTOS_URL}?_=`))
      .flush([crearProductoMock({ id: 1 }), crearProductoMock({ id: 2 })]);

    let eliminado = false;
    service.eliminarProducto(1).subscribe(() => (eliminado = true));

    const req = httpMock.expectOne(`${PRODUCTOS_URL}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(eliminado).toBe(true);
    expect(service.obtenerProductoPorId(1)).toBeUndefined();
    expect(service.obtenerProductos().length).toBe(1);
  });
});