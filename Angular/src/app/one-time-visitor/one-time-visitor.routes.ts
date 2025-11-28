import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./one-time-visitor.component').then(c => c.OneTimeVisitorComponent)
  }
] as Routes;
