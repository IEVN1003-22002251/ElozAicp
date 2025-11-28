import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./visitor-qr.component').then(c => c.VisitorQrComponent)
  }
] as Routes;
