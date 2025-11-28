import { Routes } from '@angular/router';

export default [
  {
    path: 'list',
    loadComponent: () => import('./list/list.component').then(c => c.ListComponent)
  },
  {
    path: 'add',
    loadComponent: () => import('./add/add.component').then(c => c.AddComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./edit/edit.component').then(c => c.EditComponent)
  }
] as Routes;

