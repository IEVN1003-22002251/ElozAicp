import { Routes } from '@angular/router';
import { adminGuard } from '../guards/admin.guard';

export default [
  {
    path: '',
    loadComponent: () => import('./admin-banner.component').then(c => c.AdminBannerComponent),
    canActivate: [adminGuard]
  }
] as Routes;
