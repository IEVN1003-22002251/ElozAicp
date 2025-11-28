import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./register.component').then(c => c.RegisterComponent)
  }
] as Routes;
