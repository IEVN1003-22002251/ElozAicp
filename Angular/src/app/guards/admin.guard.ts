import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/sing-in']);
    return false;
  }

  const profile = authService.getCachedProfile();
  const role = profile?.role?.toLowerCase();
  
  // Permitir acceso a admin y guard
  if (!profile || (role !== 'admin' && role !== 'guard')) {
    // Redirigir según el rol
    if (role === 'resident') {
      router.navigate(['/home']);
    } else {
      router.navigate(['/dashboard']);
    }
    return false;
  }

  return true;
};

