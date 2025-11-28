import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./access-report.component').then(c => c.AccessReportComponent)
  }
] as Routes;
