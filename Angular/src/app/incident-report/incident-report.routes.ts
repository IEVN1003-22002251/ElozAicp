import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./incident-report.component').then(c => c.IncidentReportComponent)
  }
] as Routes;
