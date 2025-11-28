import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/sing-in',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/features/auth.routes').then((m) => m.default),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.routes').then((m) => m.default),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((m) => m.default),
  },
  {
    path: 'visitors',
    loadChildren: () =>
      import('./visitors/visitors.routes').then((m) => m.default),
  },
  {
    path: 'pre-register',
    loadChildren: () =>
      import('./pre-register/pre-register.routes').then((m) => m.default),
  },
  {
    path: 'facial-register',
    loadChildren: () =>
      import('./facial-register/facial-register.routes').then((m) => m.default),
  },
  {
    path: 'history',
    loadChildren: () =>
      import('./history/history.routes').then((m) => m.default),
  },
  {
    path: 'cameras',
    loadChildren: () =>
      import('./cameras/cameras.routes').then((m) => m.default),
  },
  {
    path: 'qr-access',
    loadChildren: () =>
      import('./qr-access/qr-access.routes').then((m) => m.default),
  },
  {
    path: 'recent-visitors',
    loadChildren: () =>
      import('./recent-visitors/recent-visitors.routes').then((m) => m.default),
  },
  {
    path: 'vip-register',
    loadChildren: () =>
      import('./vip-register/vip-register.routes').then((m) => m.default),
  },
  {
    path: 'one-time-visitor',
    loadChildren: () =>
      import('./one-time-visitor/one-time-visitor.routes').then((m) => m.default),
  },
  {
    path: 'providers',
    loadChildren: () =>
      import('./providers/providers.routes').then((m) => m.default),
  },
  {
    path: 'events',
    loadChildren: () =>
      import('./events/events.routes').then((m) => m.default),
  },
  {
    path: 'visitor-qr',
    loadChildren: () =>
      import('./visitor-qr/visitor-qr.routes').then((m) => m.default),
  },
  {
    path: 'manage-visitors',
    loadChildren: () =>
      import('./manage-visitors/manage-visitors.routes').then((m) => m.default),
  },
  {
    path: 'admin-banner',
    loadChildren: () =>
      import('./admin-banner/admin-banner.routes').then((m) => m.default),
  },
  {
    path: 'access-report',
    loadChildren: () =>
      import('./access-report/access-report.routes').then((m) => m.default),
  },
  {
    path: 'incident-report',
    loadChildren: () =>
      import('./incident-report/incident-report.routes').then((m) => m.default),
  },
  {
    path: 'forgot-password',
    loadChildren: () =>
      import('./forgot-password/forgot-password.routes').then((m) => m.default),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./register/register.routes').then((m) => m.default),
  },
  {
    path: 'pending-registrations',
    loadChildren: () =>
      import('./pending-registrations/pending-registrations.routes').then((m) => m.default),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.routes').then((m) => m.default),
  },
  {
    path: 'notifications',
    loadChildren: () =>
      import('./notifications/notifications.routes').then((m) => m.default),
  },
  {
    path: '**',
    redirectTo: '/auth/sing-in'
  }
];
