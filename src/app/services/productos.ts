import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs';

import { Producto } from '../data/productos';

const PRODUCTOS_URL = 'http://localhost:3000/productos';

@Injectable({
  providedIn: 'root',
})
export class Productos {
  private readonly http = inject(HttpClient);
  private readonly productosSubject = new BehaviorSubject<Producto[]>([]);
  private cargados = false;

  readonly productos$ = this.productosSubject.asObservable();

  obtenerProductos(): Producto[] {
    return this.productosSubject.value;
  }

  obtenerProductoPorId(id: number): Producto | undefined {
    return this.productosSubject.value.find((producto) => producto.id === id);
  }

  obtenerCategorias(): string[] {
    const categorias = new Set(this.productosSubject.value.map((producto) => producto.categoria));

    return ['Todas', ...categorias];
  }

  cargarProductos(forceRefresh = false): Observable<Producto[]> {
    if (forceRefresh) {
      this.cargados = false;
    }

    if (this.cargados) {
      return of(this.productosSubject.value);
    }

    return this.http.get<Producto[]>(PRODUCTOS_URL).pipe(
      map((productos) => (productos ?? []).map((producto) => this.normalizarProducto(producto))),
      tap((productos) => {
        this.cargados = true;
        this.productosSubject.next(productos);
      }),
      catchError((error) => {
        this.productosSubject.next([]);
        return throwError(
          () => new Error('No se pudieron cargar los productos. Intenta nuevamente.'),
        );
      }),
    );
  }

  refrescarProductos(): Observable<Producto[]> {
    return this.cargarProductos(true);
  }


  private obtenerSiguienteId(): number {
  const productos = this.productosSubject.value;

  if (productos.length === 0) {
    return 1;
  }

  const maxId = Math.max(...productos.map((producto) => producto.id));
  return maxId + 1;
}

  

  crearProducto(producto: Omit<Producto, 'id'>): Observable<Producto> {
  const siguienteId = this.obtenerSiguienteId();
  const productoConId = { ...producto, id: siguienteId };

  return this.http.post<Producto>(PRODUCTOS_URL, productoConId).pipe(
    tap((nuevoProducto) => {
      this.productosSubject.next([
        ...this.productosSubject.value,
        this.normalizarProducto(nuevoProducto),
      ]);
    }),
  );
}

  actualizarProducto(id: number, cambios: Partial<Producto>): Observable<Producto> {
    return this.http.patch<Producto>(`${PRODUCTOS_URL}/${id}`, cambios).pipe(
      tap((productoActualizado) => {
        this.productosSubject.next(
          this.productosSubject.value.map((producto) =>
            producto.id === id ? this.normalizarProducto(productoActualizado) : producto,
          ),
        );
      }),
    );
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${PRODUCTOS_URL}/${id}`).pipe(
      tap(() => {
        this.productosSubject.next(
          this.productosSubject.value.filter((producto) => producto.id !== id),
        );
      }),
    );
  }

  private normalizarProducto(producto: Producto): Producto {
    return {
      ...producto,
      id: Number(producto.id),
    };
  }
}
