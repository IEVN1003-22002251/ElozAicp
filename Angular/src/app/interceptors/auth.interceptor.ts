import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const user = authService.getCurrentUser();

  // Clonar la solicitud y agregar headers si es necesario
  let clonedReq = req;

  if (user) {
    // Obtener token del localStorage si existe
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (token) {
      clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  // Agregar headers comunes para todas las solicitudes
  clonedReq = clonedReq.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  return next(clonedReq);
};

