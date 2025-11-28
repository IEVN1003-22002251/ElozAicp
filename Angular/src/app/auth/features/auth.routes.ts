import { Routes } from '@angular/router';

export default [
  {
    path: 'sing-in',
    loadComponent: () => import('./sign-in/sign-in.component').then(c => c.SignInComponent)
  },
  {
    path: 'sing-up',
    loadComponent: () => import('./sign-up/sign-up.component').then(c => c.SignUpComponent)
  }
] as Routes;

