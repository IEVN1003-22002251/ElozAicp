import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/sing-in']);
    return false;
  }
  const profile = authService.getCachedProfile();
  const role = profile?.role?.toLowerCase();
  if (!profile || (role !== 'admin' && role !== 'guard')) {
    router.navigate([role === 'resident' ? '/home' : '/dashboard']);
    return false;
  }
  return true;
};

