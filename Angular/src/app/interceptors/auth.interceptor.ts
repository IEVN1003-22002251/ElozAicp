import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const user = inject(AuthService).getCurrentUser();
  const token = user ? (localStorage.getItem('token') || localStorage.getItem('authToken')) : null;
  let clonedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });
  return next(clonedReq);
};

