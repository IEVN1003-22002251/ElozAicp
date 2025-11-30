import { Routes } from '@angular/router';

export default [
  {
    path: 'add',
    loadComponent: () => import('./add/add.component').then(m => m.AddComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./edit/edit.component').then(m => m.EditComponent)
  }
] as Routes;

