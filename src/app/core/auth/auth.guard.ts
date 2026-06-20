import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from './auth.models';

/** Bloquea el acceso a rutas privadas si no hay sesión activa. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  // Preserva el destino para volver tras autenticarse.
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/**
 * Restringe una ruta a uno o más roles. Se configura con
 * `data: { roles: ['Operator'] }`. Un usuario autenticado con rol incorrecto se
 * envía al dashboard (no al login) para evitar bucles.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed = (route.data['roles'] as UserRole[] | undefined) ?? [];

  const role = auth.role();
  if (role && allowed.includes(role)) {
    return true;
  }
  return router.createUrlTree([auth.isAuthenticated() ? '/dashboard' : '/login']);
};

/** Evita mostrar el login a un usuario ya autenticado. */
export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};
