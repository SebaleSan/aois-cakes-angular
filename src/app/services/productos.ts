import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs';

import { Producto } from '../data/productos';

const PRODUCTOS_URL = 'http://localhost:3000/productos';

/**
 * Servicio central para la gestión de productos consumidos desde la API REST.
 *
 * @remarks
 * Este servicio utiliza un {@link BehaviorSubject} como fuente única de verdad
 * (single source of truth) para el estado de los productos en memoria. Esto permite:
 * - Que múltiples componentes se suscriban a productos$ y reciban actualizaciones
 *   automáticas cada vez que la lista cambia (crear, actualizar, eliminar).
 * - Evitar llamadas HTTP redundantes mediante un flag de caché (cargados).
 * - Forzar la actualización de las vistas sin necesidad de recargar el componente,
 *   ya que cualquier .next() sobre el subject notifica a todos los suscriptores.
 *
 * @example
 * ```typescript
 * export class ProductosListComponent {
 *   private readonly productosService = inject(Productos);
 *   productos$ = this.productosService.productos$;
 *
 *   ngOnInit(): void {
 *     this.productosService.cargarProductos().subscribe();
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class Productos {
  private readonly http = inject(HttpClient);

  /**
   * Fuente de estado interna y privada. Solo el propio servicio puede
   * emitir nuevos valores (.next()) para garantizar que el estado
   * se modifique únicamente a través de los métodos públicos controlados.
   */
  private readonly productosSubject = new BehaviorSubject<Producto[]>([]);

  /**
   * Bandera de caché. Evita repetir la petición HTTP a la API si los
   * productos ya fueron cargados previamente, salvo que se solicite
   * explícitamente un refresco (forceRefresh).
   */
  private cargados = false;

  /**
   * Observable de solo lectura derivado del BehaviorSubject.
   *
   * @remarks
   * Se expone como Observable (no como Subject) para que los componentes
   * consumidores no puedan emitir valores directamente, solo suscribirse.
   * Al ser un BehaviorSubject internamente, cualquier componente que se
   * suscriba recibirá inmediatamente el último valor emitido, incluso si
   * se suscribe después de que la carga inicial ya ocurrió.
   */
  readonly productos$ = this.productosSubject.asObservable();

  /**
   * Devuelve de forma síncrona el snapshot actual de productos en memoria.
   *
   * @returns El arreglo de productos actualmente almacenado en el BehaviorSubject.
   *
   * @remarks
   * Útil cuando se necesita el valor actual sin suscribirse (por ejemplo,
   * dentro de otro método del servicio). No dispara ninguna petición HTTP;
   * si los productos aún no se han cargado, devolverá un arreglo vacío.
   */
  obtenerProductos(): Producto[] {
    return this.productosSubject.value;
  }

  /**
   * Busca un producto por su identificador dentro del estado actual en memoria.
   *
   * @param id - Identificador numérico del producto a buscar.
   * @returns El producto encontrado, o undefined si no existe en el estado actual.
   */
  obtenerProductoPorId(id: number): Producto | undefined {
    return this.productosSubject.value.find((producto) => producto.id === id);
  }

  /**
   * Obtiene la lista de categorías únicas presentes en los productos cargados,
   * incluyendo la opción 'Todas' al inicio para su uso en filtros de UI.
   *
   * @returns Un arreglo de strings con las categorías disponibles, precedido por 'Todas'.
   */
  obtenerCategorias(): string[] {
    const categorias = new Set(this.productosSubject.value.map((producto) => producto.categoria));

    return ['Todas', ...categorias];
  }

  /**
   * Carga los productos desde la API y actualiza el estado compartido (productosSubject).
   *
   * @param forceRefresh - Si es true, ignora la caché interna y fuerza una
   * nueva petición HTTP aunque los productos ya hayan sido cargados anteriormente.
   * @returns Un Observable que emite el arreglo de productos normalizado.
   *
   * @remarks
   * Comportamiento clave para el manejo de estado con BehaviorSubject:
   * - Si cargados es true y no se fuerza el refresco, retorna el valor
   *   en caché envuelto en of() sin hacer petición HTTP, evitando llamadas
   *   innecesarias a la API.
   * - Si hace la petición, normaliza cada producto ({@link normalizarProducto})
   *   y emite el nuevo arreglo mediante productosSubject.next(), lo cual
   *   notifica automáticamente a todos los componentes suscritos a productos$.
   * - En caso de error, limpia el estado (next([])) y relanza un error
   *   controlado con un mensaje amigable para el usuario.
   *
   * @throws Error Si la petición HTTP falla, se emite un error con el mensaje
   * 'No se pudieron cargar los productos. Intenta nuevamente.'
   */
  cargarProductos(forceRefresh = false): Observable<Producto[]> {
    if (forceRefresh) {
      this.cargados = false;
    }

    if (this.cargados) {
      return of(this.productosSubject.value);
    }

    return this.http.get<Producto[]>(`${PRODUCTOS_URL}?_=${Date.now()}`).pipe(
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

  /**
   * Fuerza una recarga completa de los productos desde la API, ignorando la caché.
   *
   * @returns Un Observable que emite el arreglo de productos actualizado.
   *
   * @remarks
   * Es un atajo semántico equivalente a cargarProductos(true), pensado para
   * usarse tras acciones externas que puedan haber modificado los datos en el
   * backend.
   */
  refrescarProductos(): Observable<Producto[]> {
    return this.cargarProductos(true);
  }

  /**
   * Calcula el siguiente ID disponible para un nuevo producto, basado en el
   * ID máximo actualmente presente en el estado en memoria.
   *
   * @returns El siguiente ID numérico disponible (1 si no hay productos aún).
   *
   * @remarks
   *  Esta estrategia de generación de ID es local y asume que la API
   * respeta el ID enviado desde el cliente. Es adecuada para entornos de
   * desarrollo tipo json-server, pero no debería usarse en producción,
   * donde el ID debería generarse en el backend para evitar problemas.
   */
  private obtenerSiguienteId(): number {
    const productos = this.productosSubject.value;

    if (productos.length === 0) {
      return 1;
    }

    const maxId = Math.max(...productos.map((producto) => producto.id));
    return maxId + 1;
  }

  /**
   * Crea un nuevo producto en la API y lo agrega al estado local.
   *
   * @param producto - Datos del nuevo producto, sin incluir el id
   * (se genera automáticamente mediante {@link obtenerSiguienteId}).
   * @returns Un Observable que emite el producto recién creado (ya normalizado).
   *
   * @remarks
   * Tras la creación exitosa, el nuevo producto se agrega de forma inmutable
   * al arreglo existente y se emite el nuevo estado con productosSubject.next(),
   * lo que actualiza automáticamente cualquier vista suscrita a productos$
   * sin necesidad de volver a llamar a cargarProductos().
   */
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

  /**
   * Actualiza parcialmente un producto existente, tanto en la API como en el estado local.
   *
   * @param id - Identificador del producto a actualizar.
   * @param cambios - Objeto parcial con los campos a modificar.
   * @returns Un Observable que emite el producto actualizado (ya normalizado).
   *
   * @remarks
   * Utiliza PATCH para modificar solo los campos indicados. Al recibir la
   * respuesta, reemplaza el producto correspondiente dentro del arreglo local
   *  y emite el nuevo estado, propagando el
   * cambio a todas las vistas suscritas.
   */
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

  /**
   * Elimina un producto tanto de la API como del estado local.
   *
   * @param id - Identificador del producto a eliminar.
   * @returns Un Observable<void> que se completa cuando la eliminación es exitosa.
   *
   * @remarks
   * Tras confirmar la eliminación en el backend, filtra el producto eliminado
   * del arreglo local y emite el nuevo estado, actualizando
   * automáticamente las vistas suscritas sin necesidad de recargar la lista completa.
   */
  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${PRODUCTOS_URL}/${id}`).pipe(
      tap(() => {
        this.productosSubject.next(
          this.productosSubject.value.filter((producto) => producto.id !== id),
        );
      }),
    );
  }

  /**
   * Normaliza un producto recibido desde la API, asegurando que el campo id
   * sea siempre de tipo number.
   *
   * @param producto - Producto recibido desde la API.
   * @returns Una copia del producto con el id normalizado a tipo number.
   *
   * @remarks
   * Es necesario porque algunas respuestas de la API (o de json-server)
   * pueden devolver el id como string, lo que rompería comparaciones
   * estrictas como producto.id === id en otros métodos del servicio.
   */
  private normalizarProducto(producto: Producto): Producto {
    return {
      ...producto,
      id: Number(producto.id),
    };
  }
}