import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./history.component').then(c => c.HistoryComponent)
  }
] as Routes;
