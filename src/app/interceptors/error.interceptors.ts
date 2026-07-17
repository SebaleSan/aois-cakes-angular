import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificacionService } from '../services/notificacion';

/**
 * @description
 * Interceptor HTTP funcional que captura errores de cualquier petición
 * realizada conHttpClient en toda la aplicación, y las notifica de
 * forma centralizada mediante NotificacionService.
 *
 * @param req Petición HTTP saliente.
 * @param next Función que continúa la cadena de interceptores/petición real.
 * @returns El observable de la petición, re-lanzando un error legible
 * si la petición falla.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificacionService = inject(NotificacionService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const mensaje = obtenerMensajeError(error);
      notificacionService.mostrarError(mensaje);
      return throwError(() => new Error(mensaje));
    })
  );
};

function obtenerMensajeError(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión.';
  }
  if (error.status === 404) {
    return 'El recurso solicitado no existe.';
  }
  if (error.status >= 500) {
    return 'Error interno del servidor. Intenta más tarde.';
  }
  return 'Ocurrió un error al procesar la solicitud.';
}