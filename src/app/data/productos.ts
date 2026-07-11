/**
 * @description
 * Modelo de un producto mostrado en el catálogo y usado por el carrito.
 */
export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  imagen: string;
  descripcion: string;
  disponible: boolean;
  destacado: boolean;
}