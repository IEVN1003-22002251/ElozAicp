import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./facial-register.component').then(c => c.FacialRegisterComponent)
  }
] as Routes;
