import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RolUsuario, Usuario, USUARIOS } from '../data/usuarios';

const CLAVE_USUARIOS = 'aoisCakesUsuarios';
const CLAVE_SESION = 'aoisCakesSesion';



/**
 * @description
 * Servicio encargado de gestionar la autenticación y la sesión de usuarios
 * de la aplicación.
 *
 * Este servicio centraliza las operaciones relacionadas con:
 * - inicio de sesión,
 * - registro de usuarios,
 * - actualización de perfil,
 * - recuperación de contraseña,
 * - cambio de contraseña,
 * - lectura del estado de autenticación,
 * - cierre de sesión.
 *
 * @usageNotes
 * El servicio carga y persiste usuarios en `localStorage` usando una lista
 * inicial tomada desde `USUARIOS` cuando no existe información guardada.
 * La sesión activa se mantiene en `sessionStorage` y se expone mediante un
 * `BehaviorSubject` para permitir que la interfaz reaccione a cambios de estado.
 */
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

  /**
   * @description
   * Devuelve una copia superficial de los usuarios cargados en memoria.
   *
   * @returns Copia del listado de usuarios registrados.
   * @example
   * const usuarios = authService.obtenerUsuarios();
   *
   * @usageNotes
   * La copia evita que una vista o componente muten el arreglo interno del servicio.
   */
  obtenerUsuarios(): Usuario[] {
    return [...this.usuarios];
  }

  /**
   * @description
   * Registra una nueva cuenta de usuario y la persiste en almacenamiento local.
   *
   * @param nombre Nombre visible del usuario.
   * @param usuario Alias o nombre de acceso único.
   * @param correo Correo electrónico de la cuenta.
   * @param fechaNacimiento Fecha de nacimiento en formato ISO.
   * @param direccion Dirección postal o de despacho.
   * @param password Contraseña inicial de la cuenta.
   * @param rol Rol asignado al usuario dentro de la aplicación.
   * @returns Objeto con el estado de la operación y un mensaje para la UI.
   * @example
   * authService.registrar('Ana', 'ana01', 'ana@correo.cl', '1998-01-01', '', 'Clave123!', 'cliente');
   *
   * @usageNotes
   * Valida campos obligatorios, correo único y nombre de usuario único antes de guardar.
   */
  registrar(nombre: string, usuario: string, correo: string, fechaNacimiento: string, direccion: string, password: string, rol: RolUsuario): { ok: boolean; mensaje: string } {
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

  /**
   * @description
   * Autentica a un usuario con su correo y contraseña.
   *
   * @param correo Correo utilizado como credencial de acceso.
   * @param password Contraseña ingresada por el usuario.
   * @returns Resultado de la autenticación y mensaje para mostrar.
   * @example
   * authService.login('cliente@aoiscakes.cl', 'Cliente123');
   *
   * @usageNotes
   * Si la autenticación es correcta, la sesión queda persistida en sessionStorage.
   */
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

  /**
   * @description
   * Actualiza los datos básicos del perfil del usuario autenticado.
   *
   * @param nombre Nuevo nombre visible.
   * @param usuario Nuevo nombre de usuario.
   * @param correo Nuevo correo electrónico.
   * @param direccion Nueva dirección registrada.
   * @returns Resultado de la actualización y mensaje de feedback.
   * @example
   * authService.actualizarPerfil('Ana Pérez', 'ana', 'ana@correo.cl', 'Chile 123');
   *
   * @usageNotes
   * Requiere una sesión activa y evita duplicar correos en otras cuentas.
   */
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

  /**
   * @description
   * Genera una contraseña temporal para una cuenta registrada.
   *
   * @param correo Correo asociado a la cuenta que solicita recuperación.
   * @returns Resultado del proceso y la contraseña temporal generada.
   * @example
   * authService.recuperarPassword('cliente@aoiscakes.cl');
   *
   * @usageNotes
   * La contraseña temporal se persiste en el almacenamiento local y debe ser cambiada luego del ingreso.
   */
  recuperarPassword(correo: string): { ok: boolean; mensaje: string } {
    const correoLimpio = correo.trim().toLowerCase();

    const usuario = this.usuarios.find(
      u => u.correo.toLowerCase() === correoLimpio
    );

    if (!usuario) {
      return { ok: false, mensaje: 'No existe una cuenta registrada con ese correo.' };
    }

    const passwordTemporal = 'Temp' + Math.random().toString(36).slice(-4).toUpperCase() + '1!';

    this.usuarios = this.usuarios.map(u =>
      u.id === usuario.id ? { ...u, password: passwordTemporal } : u
    );

    this.guardarUsuarios();

    return {
      ok: true,
      mensaje: `Contraseña temporal generada: ${passwordTemporal} — Inicia sesión y cámbiala desde tu perfil.`
    };
  }

  /**
   * @description
   * Cambia la contraseña del usuario autenticado.
   *
   * @param passwordActual Contraseña actual de la sesión activa.
   * @param passwordNueva Nueva contraseña que reemplazará a la anterior.
   * @returns Resultado del cambio y mensaje de feedback.
   * @example
   * authService.cambiarPassword('ClaveActual1!', 'ClaveNueva1!');
   *
   * @usageNotes
   * Verifica que la contraseña actual coincida antes de persistir el cambio.
   */
  cambiarPassword(passwordActual: string, passwordNueva: string): { ok: boolean; mensaje: string } {
    const usuario = this.usuarioActual;
    if (!usuario) {
      return { ok: false, mensaje: 'No hay sesión activa.' };
    }

    if (usuario.password !== passwordActual.trim()) {
      return { ok: false, mensaje: 'La contraseña actual es incorrecta.' };
    }

    const usuarioActualizado = { ...usuario, password: passwordNueva.trim() };
    this.usuarios = this.usuarios.map(u =>
      u.id === usuario.id ? usuarioActualizado : u
    );

    this.guardarUsuarios();
    this.guardarSesion(usuarioActualizado);

    return { ok: true, mensaje: 'Contraseña actualizada correctamente.' };
  }



}