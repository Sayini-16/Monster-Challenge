import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthReady()) {
    // Firebase hasn't finished checking the session yet — wait briefly.
    // In a production app you'd show a loading spinner; here we redirect
    // and let onAuthStateChanged resolve on the login page.
    return router.createUrlTree(['/login']);
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
