import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { Producto } from '../../data/productos';
import { Productos } from '../../services/productos';

function precioMinimo(control: AbstractControl): ValidationErrors | null {
  const valor = Number(control.value);

  if (Number.isNaN(valor) || valor <= 0) {
    return { precioInvalido: true };
  }

  return null;
}

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css'
})
export class ProductoForm implements OnInit {
  form: FormGroup;
  categorias: string[] = [];
  modoEdicion = false;
  productoId: number | null = null;
  private valoresOriginales: ProductoFormValues | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private productosService: Productos
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      categoria: ['', Validators.required],
      precio: [0, [Validators.required, precioMinimo]],
      imagen: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      disponible: [true],
      destacado: [false]
    });
  }

  ngOnInit(): void {
    this.productosService.cargarProductos().subscribe(() => {
      this.categorias = this.productosService
        .obtenerCategorias()
        .filter((categoria) => categoria !== 'Todas');

      const idParam = this.route.snapshot.paramMap.get('id');
      const productoId = idParam ? Number(idParam) : NaN;

      if (!Number.isNaN(productoId)) {
        this.modoEdicion = true;
        this.productoId = productoId;
        this.cargarProducto();
        return;
      }

      this.valoresOriginales = this.obtenerValoresIniciales();
    });
  }

  get nombre() {
    return this.form.get('nombre');
  }

  get categoria() {
    return this.form.get('categoria');
  }

  get precio() {
    return this.form.get('precio');
  }

  get imagen() {
    return this.form.get('imagen');
  }

  get descripcion() {
    return this.form.get('descripcion');
  }

  get disponible() {
    return this.form.get('disponible');
  }

  get destacado() {
    return this.form.get('destacado');
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const confirmar = window.confirm(
      this.modoEdicion
        ? '¿Quieres guardar los cambios del producto?'
        : '¿Quieres crear este producto?'
    );

    if (!confirmar) {
      return;
    }

    const valores = this.obtenerValoresFormulario();

    if (this.modoEdicion && this.productoId !== null) {
      this.productosService.actualizarProducto(this.productoId, valores).subscribe(() => {
        this.productosService.cargarProductos().subscribe(() => {
          this.router.navigate(['/admin']);
        });
      });
      return;
    }

    this.productosService.crearProducto(valores).subscribe(() => {
      this.productosService.cargarProductos().subscribe(() => {
        this.router.navigate(['/admin']);
      });
    });
  }

  cancelarCambios(): void {
    this.location.back();
  }

  recargarInfoProducto(): void {
    this.productosService.cargarProductos().subscribe(() => {
      this.categorias = this.productosService
        .obtenerCategorias()
        .filter((categoria) => categoria !== 'Todas');

      if (this.modoEdicion) {
        this.cargarProducto();
        return;
      }

      this.form.reset(this.obtenerValoresIniciales());
    });
  }

  limpiarFormulario(): void {
    this.form.reset(this.obtenerValoresIniciales());
  }

  volver(): void {
    this.router.navigate(['/admin']);
  }

  private cargarProducto(): void {
    if (this.productoId === null) {
      return;
    }

    const producto = this.productosService.obtenerProductoPorId(this.productoId);

    if (!producto) {
      window.alert('No se encontró el producto solicitado.');
      this.router.navigate(['/admin']);
      return;
    }

    this.valoresOriginales = this.convertirAValoresForm(producto);
    this.form.reset(this.valoresOriginales);
  }

  private obtenerValoresIniciales(): ProductoFormValues {
    return {
      nombre: '',
      categoria: this.categorias[0] ?? '',
      precio: 0,
      imagen: '',
      descripcion: '',
      disponible: true,
      destacado: false
    };
  }

  private obtenerValoresFormulario(): Omit<Producto, 'id'> {
    return {
      nombre: this.nombre?.value?.trim() ?? '',
      categoria: this.categoria?.value ?? '',
      precio: Number(this.precio?.value ?? 0),
      imagen: this.imagen?.value?.trim() ?? '',
      descripcion: this.descripcion?.value?.trim() ?? '',
      disponible: Boolean(this.disponible?.value),
      destacado: Boolean(this.destacado?.value)
    };
  }

  private convertirAValoresForm(producto: Producto): ProductoFormValues {
    return {
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      imagen: producto.imagen,
      descripcion: producto.descripcion,
      disponible: producto.disponible,
      destacado: producto.destacado
    };
  }
}

type ProductoFormValues = Omit<Producto, 'id'>;
