import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Productos } from '../../services/productos';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador.html',
  styleUrl: './buscador.css'
})
export class Buscador implements OnInit {
  panelAbierto = false;

  busqueda = '';
  categoriaSeleccionada = 'Todas';

  categorias: string[] = ['Todas'];

  constructor(
    private router: Router,
    private productosService: Productos,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  this.productosService.cargarProductos().subscribe();

  this.productosService.productos$.subscribe(() => {
    this.categorias = this.productosService.obtenerCategorias();
    this.cdr.detectChanges();
  });
}

  abrir(): void {
    this.panelAbierto = true;
  }

  cerrar(): void {
    this.panelAbierto = false;
  }

  buscar(): void {
    const params: any = {
      categoria: this.categoriaSeleccionada
    };

    const texto = this.busqueda.trim();
    if (texto.length > 0) {
      params.busqueda = texto;
    }

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/catalogo'], { queryParams: params });
    });

    this.panelAbierto = false;
  }
}