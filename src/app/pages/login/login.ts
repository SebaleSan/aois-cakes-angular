import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' | '' = '';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get correo() { return this.form.get('correo'); }
  get password() { return this.form.get('password'); }

  /**
   * @description
    * Valida el formulario de acceso, intenta autenticar al usuario y redirige
    * según el rol obtenido en la sesión.
    *
    * @param correo Valor del control de correo usado para iniciar sesión.
    * @param password Valor del control de contraseña usado para iniciar sesión.
   *
   * @returns No retorna ningún valor.
   * @usageNotes
    * Si el formulario es inválido, marca los campos como tocados para mostrar
    * los errores. Cuando el login es correcto, guarda el mensaje de respuesta y
    * envía a `/admin` si el usuario es administrador o a `/inicio` en caso contrario.
    * @example
    * ingresar();
   */
  ingresar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const resultado = this.authService.login(
      this.correo?.value ?? '',
      this.password?.value ?? ''
    );

    this.mensaje = resultado.mensaje;
    this.tipoMensaje = resultado.ok ? 'success' : 'danger';

    if (resultado.ok) {
      const usuario = this.authService.usuarioActual;
      if (usuario?.rol === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/inicio']);
      }
    }
  }

  /**
   * @description
   * Carga credenciales de demostración para acelerar pruebas manuales.
   *
   * @param rol Rol de la cuenta de ejemplo que se desea usar.
   * @returns No retorna ningún valor.
   * @example
   * usarDemo('cliente');
   */
  usarDemo(rol: 'cliente' | 'admin'): void {
    if (rol === 'admin') {
      this.form.setValue({ correo: 'admin@aoiscakes.cl', password: 'Admin123' });
    } else {
      this.form.setValue({ correo: 'cliente@aoiscakes.cl', password: 'Cliente123' });
    }
  }
}