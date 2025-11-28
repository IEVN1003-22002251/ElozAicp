import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./manage-visitors.component').then(c => c.ManageVisitorsComponent)
  }
] as Routes;
