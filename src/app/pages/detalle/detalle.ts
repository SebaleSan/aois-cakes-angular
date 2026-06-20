import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PRODUCTOS, Producto } from '../../data/productos';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css'
})
export class Detalle implements OnInit {
  producto?: Producto;
  productosRelacionados: Producto[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.cargarProducto(id);
    });
  }

  private cargarProducto(id: number): void {
    this.producto = PRODUCTOS.find(p => p.id === id);

    if (this.producto) {
      this.productosRelacionados = PRODUCTOS
        .filter(p => p.categoria === this.producto?.categoria && p.id !== this.producto?.id)
        .slice(0, 3);
    } else {
      this.productosRelacionados = [];
    }
  }

  formatearPrecio(precio: number): string {
    return '$' + precio.toLocaleString('es-CL');
  }
}