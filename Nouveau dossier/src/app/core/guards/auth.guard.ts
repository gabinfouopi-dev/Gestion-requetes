import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../enums/role.enum';

/**
 * authGuard — vérifie qu'un token JWT est présent.
 * Redirige vers /login sinon.
 */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login']);
};

/**
 * roleGuard — vérifie que l'utilisateur possède l'un des rôles autorisés.
 * Usage dans les routes : canActivate: [authGuard, roleGuard(['ADMIN'])]
 */
export const roleGuard = (allowedRoles: Role[]): CanActivateFn => () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const role   = auth.userRole();

  if (role && allowedRoles.includes(role)) return true;

  // Rediriger vers le dashboard du rôle courant ou /login
  return router.createUrlTree([auth.getRedirectRoute()]);
};
