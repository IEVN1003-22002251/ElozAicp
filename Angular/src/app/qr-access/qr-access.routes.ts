import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./qr-access.component').then(c => c.QrAccessComponent)
  }
] as Routes;
