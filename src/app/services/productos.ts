import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs';

import { Producto, ProductosResponse } from '../data/productos';

const PRODUCTOS_URL = 'https://raw.githubusercontent.com/SebaleSan/product-api/refs/heads/main/productos.json';

@Injectable({
	providedIn: 'root'
})
export class Productos {
	private readonly http = inject(HttpClient);
	private readonly productosSubject = new BehaviorSubject<Producto[]>([]);
	private cargados = false;

	readonly productos$ = this.productosSubject.asObservable();

	obtenerProductos(): Producto[] {
		return this.productosSubject.value;
	}

	cargarProductos(): Observable<Producto[]> {
		if (this.cargados) {
			return of(this.productosSubject.value);
		}

		return this.http.get<ProductosResponse>(PRODUCTOS_URL).pipe(
			map((respuesta) => respuesta.PRODUCTOS ?? []),
			tap((productos) => {
				this.cargados = true;
				this.productosSubject.next(productos);
			}),
			catchError(() => {
				this.productosSubject.next([]);
				return of([]);
			})
		);
	}
}
