import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./forgot-password.component').then(c => c.ForgotPasswordComponent)
  }
] as Routes;
