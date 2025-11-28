import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./cameras.component').then(c => c.CamerasComponent)
  }
] as Routes;
