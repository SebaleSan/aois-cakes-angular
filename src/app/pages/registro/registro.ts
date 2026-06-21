import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { RolUsuario } from '../../data/usuarios';

function passwordsIguales(form: AbstractControl): ValidationErrors | null {
  const password = form.get('password')?.value;
  const confirmar = form.get('confirmarPassword')?.value;
  return password === confirmar ? null : { noCoinciden: true };
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {

  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' | '' = '';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      direccion: [''],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(18),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).*$/)
      ]],
      confirmarPassword: ['', Validators.required]
    }, { validators: passwordsIguales });
  }

  get nombre() { return this.form.get('nombre'); }
  get usuario() { return this.form.get('usuario'); }
  get correo() { return this.form.get('correo'); }
  get direccion() { return this.form.get('direccion'); }
  get password() { return this.form.get('password'); }
  get confirmarPassword() { return this.form.get('confirmarPassword'); }

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const resultado = this.authService.registrar(
      this.nombre?.value ?? '',
      this.usuario?.value ?? '',
      this.correo?.value ?? '',
      this.direccion?.value ?? '',
      this.password?.value ?? '',
      'cliente' as RolUsuario
    );

    this.mensaje = resultado.mensaje;
    this.tipoMensaje = resultado.ok ? 'success' : 'danger';

    if (resultado.ok) {
      this.form.reset();
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 900);
    }
  }
}