import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { Producto } from '../../data/productos';
import { Productos } from '../../services/productos';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, NgFor],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly productosService = inject(Productos);
  private autoplayId: ReturnType<typeof setInterval> | null = null;

  destacados: Producto[] = [];
  readonly visiblesDesktop = 4;
  readonly visiblesMobile = 1;
  readonly intervaloAutoplayMs = 5000;

  indiceActual = 0;

  ngOnInit(): void {
    this.iniciarAutoplay();

    this.productosService.cargarProductos().subscribe((productos) => {
      this.destacados = this.obtenerDestacados(productos);
    });
  }

  ngOnDestroy(): void {
    this.detenerAutoplay();
  }

  get esMobile(): boolean {
    return window.innerWidth < 768;
  }

  get cantidadVisible(): number {
    return this.esMobile ? this.visiblesMobile : this.visiblesDesktop;
  }

  get destacadosVisibles(): Producto[] {
    const total = this.destacados.length;
    const visibles = this.cantidadVisible;

    if (total < visibles) {
      return this.destacados;
    }

    const resultado: Producto[] = [];
    for (let i = 0; i < visibles; i += 1) {
      resultado.push(this.destacados[(this.indiceActual + i) % total]);
    }

    return resultado;
  }

  anterior(): void {
    if (this.destacados.length <= 1) {
      return;
    }

    this.indiceActual =
      (this.indiceActual - 1 + this.destacados.length) % this.destacados.length;
  }

  siguiente(): void {
    if (this.destacados.length <= 1) {
      return;
    }

    this.indiceActual = (this.indiceActual + 1) % this.destacados.length;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  }

  seleccionarCategoria(categoria: string): void {
    this.router.navigate(['/catalogo'], {
      queryParams: { categoria } });
  }

  trackByProductId(index: number, producto: Producto): number {
    return producto.id;
  }

  private obtenerDestacados(productos: Producto[]): Producto[] {
    const marcados = productos.filter((producto) => producto.destacado);

    if (marcados.length > 0) {
      return marcados;
    }

    return productos.slice(0, this.visiblesDesktop);
  }

  private iniciarAutoplay(): void {
    this.detenerAutoplay();

    this.autoplayId = setInterval(() => {
      if (this.esMobile) {
        this.siguiente();
      }
    }, this.intervaloAutoplayMs);
  }

  private detenerAutoplay(): void {
    if (this.autoplayId !== null) {
      clearInterval(this.autoplayId);
      this.autoplayId = null;
    }
  }
}