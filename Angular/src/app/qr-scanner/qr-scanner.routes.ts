import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./qr-scanner.component').then(m => m.QrScannerComponent)
  }
] as Routes;


