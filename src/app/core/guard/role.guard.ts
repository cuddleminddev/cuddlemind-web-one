import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../interceptor/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser();
  const allowedRoles = route.data['roles'] as string[];

  if (user && allowedRoles.includes(user.role)) {
    return true;
  }

  router.navigate(['/not-found']);
  return false;
};
