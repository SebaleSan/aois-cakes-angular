import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Producto } from '../../data/productos';
import { CarroService } from '../../services/carro';
import { AuthService } from '../../services/auth';
import { Productos } from '../../services/productos';

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
  mostrarToast: boolean = false;
  private productos: Producto[] = [];

  constructor(
    private route: ActivatedRoute,
    public carroService: CarroService,
    public authService: AuthService,
    private productosService: Productos,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const id = Number(params.get('id'));
    if (!Number.isNaN(id)) {
      this.productosService.cargarProductos().subscribe(productos => {
        this.productos = productos;
        this.cargarProducto(id);
        this.cdr.detectChanges();
      });
    }
  });
}


  private cargarProducto(id: number): void {
    this.producto = this.productos.find(p => p.id === id);

    if (this.producto) {
      this.productosRelacionados = this.productos
        .filter(p => p.categoria === this.producto?.categoria && p.id !== this.producto?.id)
        .slice(0, 3);
    } else {
      this.productosRelacionados = [];
    
    }
  }

  agregarAlCarro(producto: Producto): void {
    if (!this.authService.logueado) return;
    this.carroService.agregar(producto);
    this.mostrarToast = true;
    
    setTimeout(() => {
      this.mostrarToast = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  formatearPrecio(precio: number): string {
    return '$' + precio.toLocaleString('es-CL');
  }
}