import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';
import { Usuario } from '../../data/usuarios';
import { Producto } from '../../data/productos';
import { Productos } from '../../services/productos';
import { CarroService, CompraPedido } from '../../services/carro';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  usuarios: Usuario[] = [];
  productos: Producto[] = [];
  compras: CompraPedido[] = [];

  constructor(
    public authService: AuthService,
    public carroService: CarroService,
    private productosService: Productos,
    private cdr: ChangeDetectorRef // es la unica manera que encontre para que se refresque automatico la vista
  ) {}

  ngOnInit(): void {
    this.usuarios = this.authService.obtenerUsuarios();
    this.compras = this.carroService.obtenerTodasLasCompras();

    this.productosService.cargarProductos(true).subscribe((productos) => {
      this.productos = productos;
      this.cdr.detectChanges();
    });
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  get productosDisponibles(): number {
    return this.productos.filter(p => p.disponible).length;
  }

  get totalCompras(): number {
    return this.compras.length;
  }

  nombreUsuario(usuarioId: number): string {
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.nombre : `Usuario #${usuarioId}`;
  }

  trackByCompraId(index: number, compra: CompraPedido): number {
    return compra.id;
  }

 refrescarProductos(): void {
    this.productosService.refrescarProductos().subscribe((productos) => {
      this.productos = productos;
      this.cdr.detectChanges();
    });
  }

  eliminarProducto(producto: Producto): void {
    const confirmar = window.confirm(`¿Eliminar el producto "${producto.nombre}"?`);
    if (!confirmar) return;

    this.productosService.eliminarProducto(producto.id).subscribe(() => {
      this.refrescarProductos();
    });
  }
}