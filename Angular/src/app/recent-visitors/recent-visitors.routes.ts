import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./recent-visitors.component').then(c => c.RecentVisitorsComponent)
  }
] as Routes;
