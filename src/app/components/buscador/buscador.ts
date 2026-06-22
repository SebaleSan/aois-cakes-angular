import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CATEGORIAS } from '../../data/productos';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador.html',
  styleUrl: './buscador.css'
})
export class Buscador {
  panelAbierto = false;

  busqueda = '';
  categoriaSeleccionada = 'Todas';

  categorias: string[] = CATEGORIAS;

  constructor(private router: Router) {}

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