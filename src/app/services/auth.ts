import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RolUsuario, Usuario, USUARIOS } from '../data/usuarios';

const CLAVE_USUARIOS = 'aoisCakesUsuarios';
const CLAVE_SESION = 'aoisCakesSesion';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuarios: Usuario[] = this.cargarUsuarios();

  private usuarioActualSubject = new BehaviorSubject<Usuario | null>(
    this.cargarSesion()
  );

  usuarioActual$ = this.usuarioActualSubject.asObservable();

  get usuarioActual(): Usuario | null {
    return this.usuarioActualSubject.value;
  }

  get logueado(): boolean {
    return this.usuarioActual !== null;
  }

  get esAdmin(): boolean {
    return this.usuarioActual?.rol === 'admin';
  }

  obtenerUsuarios(): Usuario[] {
    return [...this.usuarios];
  }

  registrar(nombre: string, usuario: string, correo: string, direccion: string, password: string, fechaNacimiento: string, rol: RolUsuario): { ok: boolean; mensaje: string } {
    const nombreLimpio = nombre.trim();
    const usuarioLimpio = usuario.trim();
    const correoLimpio = correo.trim().toLowerCase();
    const passwordLimpia = password.trim();

    if (!nombreLimpio || !usuarioLimpio || !correoLimpio || !passwordLimpia) {
      return { ok: false, mensaje: 'Completa todos los campos obligatorios.' };
    }

    const existeCorreo = this.usuarios.some(u => u.correo.toLowerCase() === correoLimpio);
    if (existeCorreo) {
      return { ok: false, mensaje: 'Ya existe una cuenta con ese correo.' };
    }

    const existeUsuario = this.usuarios.some(u => u.usuario === usuarioLimpio);
    if (existeUsuario) {
      return { ok: false, mensaje: 'Ese nombre de usuario ya está en uso.' };
    }

    const nuevoUsuario: Usuario = {
      id: Date.now(),
      nombre: nombreLimpio,
      usuario: usuarioLimpio,
      correo: correoLimpio,
      direccion: direccion.trim(),
      password: passwordLimpia,
      fechaNacimiento,
      rol
    };

    this.usuarios = [...this.usuarios, nuevoUsuario];
    this.guardarUsuarios();

    return { ok: true, mensaje: 'Cuenta creada correctamente. Ahora puedes iniciar sesión.' };
  }

  login(correo: string, password: string): { ok: boolean; mensaje: string } {
    const correoLimpio = correo.trim().toLowerCase();
    const passwordLimpia = password.trim();

    const usuario = this.usuarios.find(
      u => u.correo.toLowerCase() === correoLimpio && u.password === passwordLimpia
    );

    if (!usuario) {
      return { ok: false, mensaje: 'Correo o contraseña incorrectos.' };
    }

    this.guardarSesion(usuario);
    return { ok: true, mensaje: 'Inicio de sesión correcto.' };
  }

  logout(): void {
    sessionStorage.removeItem(CLAVE_SESION);
    this.usuarioActualSubject.next(null);
  }

  private cargarUsuarios(): Usuario[] {
    const guardados = localStorage.getItem(CLAVE_USUARIOS);
    if (!guardados) {
      localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(USUARIOS));
      return USUARIOS;
    }
    try {
      return JSON.parse(guardados) as Usuario[];
    } catch {
      localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(USUARIOS));
      return USUARIOS;
    }
  }

  private guardarUsuarios(): void {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(this.usuarios));
  }

  private cargarSesion(): Usuario | null {
    const sesion = sessionStorage.getItem(CLAVE_SESION);
    if (!sesion) return null;
    try {
      return JSON.parse(sesion) as Usuario;
    } catch {
      sessionStorage.removeItem(CLAVE_SESION);
      return null;
    }
  }

  private guardarSesion(usuario: Usuario): void {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
    this.usuarioActualSubject.next(usuario);
  }

  actualizarPerfil(nombre: string, usuario: string, correo: string, direccion: string): { ok: boolean; mensaje: string } {
  const usuarioActual = this.usuarioActual;
  if (!usuarioActual) {
    return { ok: false, mensaje: 'No hay sesión activa.' };
  }

  const correoLimpio = correo.trim().toLowerCase();
  const existeCorreo = this.usuarios.some(
    u => u.correo.toLowerCase() === correoLimpio && u.id !== usuarioActual.id
  );

  if (existeCorreo) {
    return { ok: false, mensaje: 'Ese correo ya está en uso por otra cuenta.' };
  }

  const usuarioActualizado = {
    ...usuarioActual,
    nombre: nombre.trim(),
    usuario: usuario.trim(),
    correo: correoLimpio,
    direccion: direccion.trim()
  };

  this.usuarios = this.usuarios.map(u =>
    u.id === usuarioActual.id ? usuarioActualizado : u
  );

  this.guardarUsuarios();
  this.guardarSesion(usuarioActualizado);

  return { ok: true, mensaje: 'Perfil actualizado correctamente.' };
}
}