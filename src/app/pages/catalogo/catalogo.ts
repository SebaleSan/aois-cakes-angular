import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../data/productos';
import { Productos } from '../../services/productos';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo implements OnInit {
  productos: Producto[] = [];
  categorias: string[] = ['Todas'];

  categoriaSeleccionada: string = 'Todas';
  mostrarSoloDisponibles: boolean = false;
  busqueda: string = '';

  constructor(
    private route: ActivatedRoute,
    private productosService: Productos,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.categoriaSeleccionada = params['categoria'] || 'Todas';
      this.mostrarSoloDisponibles = params['disponible'] === 'true';
      this.busqueda = params['busqueda'] || '';
      this.cdr.detectChanges();
    });

    this.productosService.cargarProductos().subscribe((productos) => {
      this.productos = productos;
      this.categorias = this.productosService.obtenerCategorias();
      this.cdr.detectChanges();
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