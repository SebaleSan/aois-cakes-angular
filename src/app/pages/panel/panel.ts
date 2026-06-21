import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './panel.html',
  styleUrl: './panel.css'
})
export class Panel implements OnInit {

  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' | '' = '';
  editando: boolean = false;
  form: FormGroup;

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      direccion: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.logueado) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarDatos();
  }

  cargarDatos(): void {
    const usuario = this.authService.usuarioActual;
    this.form.patchValue({
      nombre: usuario?.nombre,
      usuario: usuario?.usuario,
      correo: usuario?.correo,
      direccion: usuario?.direccion
    });
  }

  get nombre() { return this.form.get('nombre'); }
  get usuario() { return this.form.get('usuario'); }
  get correo() { return this.form.get('correo'); }
  get direccion() { return this.form.get('direccion'); }

  activarEdicion(): void {
    this.editando = true;
    this.form.enable();
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.form.disable();
    this.cargarDatos();
    this.mensaje = '';
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const resultado = this.authService.actualizarPerfil(
      this.nombre?.value ?? '',
      this.usuario?.value ?? '',
      this.correo?.value ?? '',
      this.direccion?.value ?? ''
    );

    this.mensaje = resultado.mensaje;
    this.tipoMensaje = resultado.ok ? 'success' : 'danger';

    if (resultado.ok) {
      this.editando = false;
      this.form.disable();
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}