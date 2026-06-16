import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PRODUCTOS, Producto } from '../../data/productos';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo {
  productos: Producto[] = PRODUCTOS;

  formatearPrecio(precio: number): string {
    return '$' + precio.toLocaleString('es-CL');
  }
}