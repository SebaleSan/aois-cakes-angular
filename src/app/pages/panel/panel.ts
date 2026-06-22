import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

function passwordsIguales(form: AbstractControl): ValidationErrors | null {
  const nueva = form.get('passwordNueva')?.value;
  const confirmar = form.get('confirmarPassword')?.value;
  return nueva === confirmar ? null : { noCoinciden: true };
}

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
  mensajePassword: string = '';
  tipoMensajePassword: 'success' | 'danger' | '' = '';
  editando: boolean = false;
  editandoPassword: boolean = false;
  form: FormGroup;
  formPassword: FormGroup;

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

    this.formPassword = this.fb.group({
      passwordActual: ['', Validators.required],
      passwordNueva: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).*$/)
      ]],
      confirmarPassword: ['', Validators.required]
    }, { validators: passwordsIguales });
  }

  ngOnInit(): void {
    if (!this.authService.logueado) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarDatos();
    this.form.disable();
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
  get passwordActual() { return this.formPassword.get('passwordActual'); }
  get passwordNueva() { return this.formPassword.get('passwordNueva'); }
  get confirmarPassword() { return this.formPassword.get('confirmarPassword'); }

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

  activarCambioPassword(): void {
    this.editandoPassword = true;
    this.mensajePassword = '';
    this.formPassword.reset();
  }

  cancelarCambioPassword(): void {
    this.editandoPassword = false;
    this.formPassword.reset();
    this.mensajePassword = '';
  }

  guardarPassword(): void {
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      return;
    }

    const resultado = this.authService.cambiarPassword(
      this.passwordActual?.value ?? '',
      this.passwordNueva?.value ?? ''
    );

    this.mensajePassword = resultado.mensaje;
    this.tipoMensajePassword = resultado.ok ? 'success' : 'danger';

    if (resultado.ok) {
      this.editandoPassword = false;
      this.formPassword.reset();
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}