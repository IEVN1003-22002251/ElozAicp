import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pre-register.component').then(c => c.PreRegisterComponent)
  }
] as Routes;
