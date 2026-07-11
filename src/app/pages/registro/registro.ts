import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { RolUsuario } from '../../data/usuarios';

/**
 * @description
 * Comprueba que las dos contraseñas del formulario de registro coincidan.
 *
 * @param form Grupo reactivo con los campos password y confirmarPassword.
 * @returns Error `noCoinciden` cuando los valores difieren; en caso contrario `null`.
 */
function passwordsIguales(form: AbstractControl): ValidationErrors | null {
  const password = form.get('password')?.value;
  const confirmar = form.get('confirmarPassword')?.value;
  return password === confirmar ? null : { noCoinciden: true };
}


function mayorDe13(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const hoy = new Date();
  const nacimiento = new Date(control.value);
  const edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesesDiferencia = hoy.getMonth() - nacimiento.getMonth();
  const edadReal = mesesDiferencia < 0 ||
    (mesesDiferencia === 0 && hoy.getDate() < nacimiento.getDate())
    ? edad - 1
    : edad;

  return edadReal >= 13 ? null : { menorDeEdad: true };
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
      correo: ['', [
    Validators.required,
    Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  ]],
      fechaNacimiento: ['', [Validators.required, mayorDe13]],
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
  get fechaNacimiento() { return this.form.get('fechaNacimiento'); }
  get direccion() { return this.form.get('direccion'); }
  get password() { return this.form.get('password'); }
  get confirmarPassword() { return this.form.get('confirmarPassword'); }

  /**
   * @description
   * Ejecuta el registro de un nuevo cliente con los datos del formulario y envia a authService para guardar en localStorage.
   *
   * @returns No retorna ningún valor.
   * @usageNotes
   * Si el registro es exitoso, limpia el formulario y vuelve al login tras un breve retraso visual.
   */
  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const resultado = this.authService.registrar(
      this.nombre?.value ?? '',
      this.usuario?.value ?? '',
      this.correo?.value ?? '',
      this.fechaNacimiento?.value ?? '',
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