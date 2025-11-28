import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./providers.component').then(c => c.ProvidersComponent)
  }
] as Routes;
