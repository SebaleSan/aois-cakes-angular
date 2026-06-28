import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.css'
})
export class Recuperar {

  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' | '' = '';
  enviado: boolean = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  get correo() { return this.form.get('correo'); }

  /**
   * @description
   * Solicita la recuperación de contraseña para el correo ingresado.
   *
   * @usageNotes
   * Si el formulario es inválido, marca todos los campos como tocados para
   * mostrar los errores de validación.
   *
   * @return No retorna ningún valor.
   */
  recuperar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const resultado = this.authService.recuperarPassword(
      this.correo?.value ?? ''
    );

    this.mensaje = resultado.mensaje;
    this.tipoMensaje = resultado.ok ? 'success' : 'danger';

    if (resultado.ok) {
      this.enviado = true;
      this.form.reset();
    }
  }
}