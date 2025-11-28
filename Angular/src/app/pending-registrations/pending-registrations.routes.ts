import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pending-registrations.component').then(c => c.PendingRegistrationsComponent)
  }
] as Routes;
