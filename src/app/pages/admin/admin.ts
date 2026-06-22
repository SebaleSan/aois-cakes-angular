import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth';
import { Usuario } from '../../data/usuarios';
import { PRODUCTOS, Producto } from '../../data/productos';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  usuarios: Usuario[] = [];
  productos: Producto[] = PRODUCTOS;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.usuarios = this.authService.obtenerUsuarios();
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