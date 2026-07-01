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

/**
 * @description
 * Respuesta esperada desde la API remota que expone el catálogo de productos.
 */
export interface ProductosResponse {
  PRODUCTOS: Producto[];
}

/**
 * @description
 * Categorías disponibles para filtrar el catálogo.
 */
export const CATEGORIAS: string[] = [
  'Todas',
  'Tortas',
  'Catering',
  'Cookies',
  'Tradicional',

  


];