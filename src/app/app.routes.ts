import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'flight-form',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./flight-form/flight-form.component').then((m) => m.FlightFormComponent),
  },
  { path: '', redirectTo: 'flight-form', pathMatch: 'full' },
  { path: '**', redirectTo: 'flight-form' },
];
