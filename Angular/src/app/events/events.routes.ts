import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./events.component').then(c => c.EventsComponent)
  }
] as Routes;
