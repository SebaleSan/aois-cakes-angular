import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarroService, CompraPedido } from '../../services/carro';

/**
 * @description
 * Componente que muestra el historial de compras realizadas por el
 * usuario autenticado, obtenidas desde localStorage a través de
 * {@link CarroService.obtenerHistorialCompras}.
 */
@Component({
  selector: 'app-historial-compras',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historial-compras.html',
  styleUrl: './historial-compras.css'
})
export class HistorialCompras implements OnInit {

  compras: CompraPedido[] = [];

  constructor(public carroService: CarroService) {}

  ngOnInit(): void {
    this.compras = this.carroService.obtenerHistorialCompras();
  }

  trackByCompraId(index: number, compra: CompraPedido): number {
    return compra.id;
  }

  trackByProductoId(index: number, item: { producto: { id: number } }): number {
    return item.producto.id;
  }
}