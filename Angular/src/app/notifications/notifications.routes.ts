import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./notifications.component').then(c => c.NotificationsComponent)
  }
] as Routes;
