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
 * Snapshot de una compra simulada guardada en almacenamiento local y de sesión.
 */
export interface CompraPedido {
  id: number;
  usuarioId: number;
  fechaISO: string;
  items: ItemCarro[];
  totalItems: number;
  totalPrecio: number;
}

const CLAVE_COMPRA_RECIENTE = 'aoisUltimaCompra';
const CLAVE_HISTORIAL_COMPRAS = 'aoisHistorialCompras';

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

  /**
   * @description
   * Simula la finalización de un pedido, persiste el resumen en almacenamiento
   * local y de sesión, y vacía el carrito activo.
   *
   * @returns Un snapshot de la compra realizada o `null` si no había productos.
   */
  finalizarPedido(itemsPedido: ItemCarro[] = this.items): CompraPedido | null {
    const usuario = this.authService.usuarioActual;

    if (!usuario || itemsPedido.length === 0) {
      return null;
    }

    const compra: CompraPedido = {
      id: Date.now(),
      usuarioId: usuario.id,
      fechaISO: new Date().toISOString(),
      items: itemsPedido.map(item => ({
        producto: { ...item.producto },
        cantidad: item.cantidad
      })),
      totalItems: itemsPedido.reduce((acumulado, item) => acumulado + item.cantidad, 0),
      totalPrecio: itemsPedido.reduce((acumulado, item) => acumulado + item.producto.precio * item.cantidad, 0)
    };

    this.guardarCompraReciente(compra);
    this.guardarHistorialCompras(compra);
    this.vaciar();

    return compra;
  }

  /**
   * @description
   * Recupera la última compra simulada del usuario activo desde sessionStorage.
   *
   * @returns La última compra guardada o `null` si no existe.
   */
  obtenerUltimaCompra(): CompraPedido | null {
    const usuario = this.authService.usuarioActual;

    if (!usuario) {
      return null;
    }

    return this.leerCompraReciente(usuario.id);
  }


  /**
   * @description
   * Recupera el historial completo de compras del usuario activo desde
   * localStorage, ordenado desde la más reciente a la más antigua.
   *
   * @returns Un arreglo con todas las compras realizadas por el usuario,
   * o un arreglo vacío si no hay sesión activa o no existe historial.
   * @example
   * const historial = carroService.obtenerHistorialCompras();
   */
  obtenerHistorialCompras(): CompraPedido[] {
    const usuario = this.authService.usuarioActual;

    if (!usuario) {
      return [];
    }

    return this.leerHistorialCompras(usuario.id)
      .slice()
      .sort((a, b) => b.id - a.id);
  }

  private claveStorage(): string {
    const usuario = this.authService.usuarioActual;
    return `aoisCarro_${usuario?.id}`;
  }

  private guardarCarro(): void {
    localStorage.setItem(this.claveStorage(), JSON.stringify(this.items));
  }

  private guardarCompraReciente(compra: CompraPedido): void {
    sessionStorage.setItem(
      this.claveCompraReciente(compra.usuarioId),
      JSON.stringify(compra)
    );
  }

  private guardarHistorialCompras(compra: CompraPedido): void {
    const historial = this.leerHistorialCompras(compra.usuarioId);
    localStorage.setItem(
      this.claveHistorialCompras(compra.usuarioId),
      JSON.stringify([...historial, compra])
    );
  }

  private leerCompraReciente(usuarioId: number): CompraPedido | null {
    const guardada = sessionStorage.getItem(this.claveCompraReciente(usuarioId));

    if (!guardada) {
      return null;
    }

    try {
      return JSON.parse(guardada) as CompraPedido;
    } catch {
      sessionStorage.removeItem(this.claveCompraReciente(usuarioId));
      return null;
    }
  }

  private leerHistorialCompras(usuarioId: number): CompraPedido[] {
    const guardado = localStorage.getItem(this.claveHistorialCompras(usuarioId));

    if (!guardado) {
      return [];
    }

    try {
      return JSON.parse(guardado) as CompraPedido[];
    } catch {
      localStorage.removeItem(this.claveHistorialCompras(usuarioId));
      return [];
    }
  }

  private claveCompraReciente(usuarioId: number): string {
    return `${CLAVE_COMPRA_RECIENTE}_${usuarioId}`;
  }

  private claveHistorialCompras(usuarioId: number): string {
    return `${CLAVE_HISTORIAL_COMPRAS}_${usuarioId}`;
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