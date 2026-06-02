import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from './auth.models';

/** Bloquea el acceso a rutas privadas si no hay sesión activa. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

/**
 * Restringe una ruta a uno o más roles. Se configura con
 * `data: { roles: ['Operator'] }`.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed = (route.data['roles'] as UserRole[] | undefined) ?? [];

  const role = auth.role();
  if (role && allowed.includes(role)) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
