import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth';
import { Usuario } from '../../data/usuarios';
import { Producto } from '../../data/productos';
import { Productos } from '../../services/productos';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  usuarios: Usuario[] = [];
  productos: Producto[] = [];

  constructor(
    public authService: AuthService,
    private productosService: Productos
  ) {}

  ngOnInit(): void {
    this.usuarios = this.authService.obtenerUsuarios();
    this.productosService.cargarProductos().subscribe((productos) => {
      this.productos = productos;
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
}