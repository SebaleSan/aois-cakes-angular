import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CATEGORIAS, PRODUCTOS, Producto } from '../../data/productos';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo implements OnInit {
  productos: Producto[] = PRODUCTOS;
  categorias: string[] = CATEGORIAS;
  categoriaSeleccionada: string = 'Todas';
  mostrarSoloDisponibles: boolean = false;
  busqueda: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.categoriaSeleccionada = params['categoria'] || 'Todas';
      this.mostrarSoloDisponibles = params['disponible'] === 'true';
    });
  }

  get productosFiltrados(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.productos.filter(p => {
      const cumpleBusqueda =
        texto === '' ||
        p.nombre.toLowerCase().includes(texto) ||
        p.descripcion.toLowerCase().includes(texto) ||
        p.categoria.toLowerCase().includes(texto);

      const cumpleCategoria =
        this.categoriaSeleccionada === 'Todas' ||
        p.categoria === this.categoriaSeleccionada;

      const cumpleDisponibilidad =
        !this.mostrarSoloDisponibles || p.disponible;

      return cumpleBusqueda && cumpleCategoria && cumpleDisponibilidad;
    });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoriaSeleccionada = 'Todas';
    this.mostrarSoloDisponibles = false;
  }

  formatearPrecio(precio: number): string {
    return '$' + precio.toLocaleString('es-CL');
  }
}