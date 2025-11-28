import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./profile.component').then(c => c.ProfileComponent)
  }
] as Routes;
