import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

/**
 * @description
 * Protege rutas reservadas y permite el acceso solo a usuarios con rol administrador.
 *
 * @returns `true` cuando la sesión actual pertenece a un administrador; de lo contrario redirige al inicio y retorna `false`.
 * @usageNotes
 * Se usa en rutas que no deben ser visibles para usuarios clientes.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.esAdmin) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
