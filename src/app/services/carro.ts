import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../data/productos';
import { AuthService } from './auth';

export interface ItemCarro {
  producto: Producto;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarroService {

  private itemsSubject = new BehaviorSubject<ItemCarro[]>([]);
  items$ = this.itemsSubject.asObservable();

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

  eliminar(productoId: number): void {
    const items = this.items.filter(i => i.producto.id !== productoId);
    this.itemsSubject.next(items);
    this.guardarCarro();
  }

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

  formatearPrecio(precio: number): string {
    return '$' + precio.toLocaleString('es-CL');
  }
}