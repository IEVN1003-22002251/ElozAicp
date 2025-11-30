import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./chat.component').then(c => c.ChatComponent)
  }
] as Routes;






