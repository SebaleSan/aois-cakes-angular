import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../data/productos';
import { AuthService } from './auth';

/**
 * @description
 * Representa una línea del carrito con el producto seleccionado y su cantidad.
 */
export interface ItemCarro {
  producto: Producto;
  cantidad: number;
}

/**
 * @description
 * Servicio responsable de administrar el carrito de compras del usuario autenticado.
 *
 * @usageNotes
 * Sincroniza el estado con localStorage usando una clave distinta por usuario para evitar mezclar carritos.
 */
@Injectable({
  providedIn: 'root'
})
export class CarroService {

  private itemsSubject = new BehaviorSubject<ItemCarro[]>([]);
  items$ = this.itemsSubject.asObservable();

  /**
   * @description
   * Inicializa el carrito reactivo y recarga el estado cuando cambia la sesión.
   *
   * @param authService Servicio de autenticación usado para conocer la sesión activa.
   * @usageNotes
   * Al cerrar sesión se vacía la vista del carrito; al iniciar sesión se recuperan los items guardados.
   */
  constructor(private authService: AuthService) {
    this.authService.usuarioActual$.subscribe(usuario => {
      if (usuario) {
        this.cargarCarro(usuario.id);
      } else {
        this.itemsSubject.next([]);
      }
    });
  }

  get items(): ItemCarro[] {
    return this.itemsSubject.value;
  }

  get totalItems(): number {
    return this.items.reduce((acc, item) => acc + item.cantidad, 0);
  }

  get totalPrecio(): number {
    return this.items.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  }

  /**
   * @description
   * Agrega una unidad de producto al carrito o incrementa la cantidad existente.
   *
   * @param producto Producto que se quiere sumar al carrito.
   * @returns No retorna ningún valor.
   * @example
   * carroService.agregar(producto);
   */
  agregar(producto: Producto): void {
    const items = [...this.items];
    const index = items.findIndex(i => i.producto.id === producto.id);

    if (index !== -1) {
      items[index] = { ...items[index], cantidad: items[index].cantidad + 1 };
    } else {
      items.push({ producto, cantidad: 1 });
    }

    this.itemsSubject.next(items);
    this.guardarCarro();
  }

  /**
   * @description
   * Disminuye en una unidad la cantidad de un producto o lo elimina si queda en cero.
   *
   * @param productoId Identificador del producto a reducir.
   * @returns No retorna ningún valor.
   */
  reducir(productoId: number): void {
    const items = [...this.items];
    const index = items.findIndex(i => i.producto.id === productoId);

    if (index !== -1) {
      if (items[index].cantidad > 1) {
        items[index] = { ...items[index], cantidad: items[index].cantidad - 1 };
      } else {
        items.splice(index, 1);
      }
    }

    this.itemsSubject.next(items);
    this.guardarCarro();
  }

  /**
   * @description
   * Elimina por completo un producto del carrito.
   *
   * @param productoId Identificador del producto que se eliminará.
   * @returns No retorna ningún valor.
   */
  eliminar(productoId: number): void {
    const items = this.items.filter(i => i.producto.id !== productoId);
    this.itemsSubject.next(items);
    this.guardarCarro();
  }

  /**
   * @description
   * Vacía todos los productos del carrito activo.
   *
   * @returns No retorna ningún valor.
   */
  vaciar(): void {
    this.itemsSubject.next([]);
    this.guardarCarro();
  }

  private claveStorage(): string {
    const usuario = this.authService.usuarioActual;
    return `aoisCarro_${usuario?.id}`;
  }

  private guardarCarro(): void {
    localStorage.setItem(this.claveStorage(), JSON.stringify(this.items));
  }

  private cargarCarro(usuarioId: number): void {
    const guardado = localStorage.getItem(`aoisCarro_${usuarioId}`);
    if (guardado) {
      try {
        this.itemsSubject.next(JSON.parse(guardado) as ItemCarro[]);
      } catch {
        this.itemsSubject.next([]);
      }
    } else {
      this.itemsSubject.next([]);
    }
  }

  /**
   * @description
   * Formatea un valor numérico como moneda chilena.
   *
   * @param precio Valor numérico del precio a formatear.
   * @returns Precio formateado con separador local.
   * @example
   * carroService.formatearPrecio(12000);
   */
  formatearPrecio(precio: number): string {
    return '$' + precio.toLocaleString('es-CL');
  }
}