import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * @description
 * Tipos de notificación soportados por el toast global.
 */
export type TipoNotificacion = 'error' | 'success' | 'info';

/**
 * @description
 * Estructura de una notificación mostrada en el toast global.
 */
export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
}

const DURACION_MS = 4000;

/**
 * @description
 * Servicio centralizado para mostrar notificaciones tipo toast en toda la
 * aplicación, sin acoplar la UI de error a cada componente individual.
 *
 * @usageNotes
 * Se suscribe una única vez desde el componente `Toast` global en `app.html`.
 * Cualquier servicio o interceptor puede llamar a `mostrarError`,
 * `mostrarExito` o `mostrarInfo` desde cualquier parte de la app.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  readonly notificaciones$ = this.notificacionesSubject.asObservable();

  private siguienteId = 1;

  mostrarError(mensaje: string): void {
    this.agregar('error', mensaje);
  }

  mostrarExito(mensaje: string): void {
    this.agregar('success', mensaje);
  }

  mostrarInfo(mensaje: string): void {
    this.agregar('info', mensaje);
  }

  cerrar(id: number): void {
    this.notificacionesSubject.next(
      this.notificacionesSubject.value.filter((n) => n.id !== id)
    );
  }

  private agregar(tipo: TipoNotificacion, mensaje: string): void {
    const id = this.siguienteId++;
    const notificacion: Notificacion = { id, tipo, mensaje };

    this.notificacionesSubject.next([...this.notificacionesSubject.value, notificacion]);

    setTimeout(() => this.cerrar(id), DURACION_MS);
  }
}