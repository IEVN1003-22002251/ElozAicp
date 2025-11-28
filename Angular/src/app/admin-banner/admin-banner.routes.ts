import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./admin-banner.component').then(c => c.AdminBannerComponent)
  }
] as Routes;
