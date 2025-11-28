import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./vip-register.component').then(c => c.VipRegisterComponent)
  }
] as Routes;
