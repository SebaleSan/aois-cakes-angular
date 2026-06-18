import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PRODUCTOS, CATEGORIAS, Producto } from '../../data/productos';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador.html',
  styleUrl: './buscador.css'
})
export class Buscador {
  panelAbierto: boolean = false;
  busqueda: string = '';
  categoriaSeleccionada: string = 'Todas';
  categorias: string[] = CATEGORIAS;

  constructor(private router: Router) {}

  abrir(): void {
    this.panelAbierto = true;
  }

  cerrar(): void {
    this.panelAbierto = false;
    this.busqueda = '';
    this.categoriaSeleccionada = 'Todas';
  }

  buscar(): void {
    this.router.navigate(['/catalogo'], {
      queryParams: {
        busqueda: this.busqueda,
        categoria: this.categoriaSeleccionada
      }
    });
    this.cerrar();
  }
}