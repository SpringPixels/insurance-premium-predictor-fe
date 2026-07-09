import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Coverage } from './coverage/coverage';
import { guestGuard, loggedInGuard, calculatorResultsGuard, adminGuard, paidGuard } from './app.guards';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'coverage', component: Coverage },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./register/register').then(m => m.Register), canActivate: [guestGuard] },
  { path: 'contact', loadComponent: () => import('./contact/contact').then(m => m.Contact) },
  { path: 'calculator', loadComponent: () => import('./calculator/calculator').then(m => m.Calculator), canActivate: [loggedInGuard] },
  { path: 'calculator/results', loadComponent: () => import('./calculator/calculator-results').then(m => m.CalculatorResults), canActivate: [calculatorResultsGuard, loggedInGuard] },
  { path: 'predictions', loadComponent: () => import('./predictions/predictions').then(m => m.Predictions), canActivate: [loggedInGuard] },
  { path: 'activities', loadComponent: () => import('./activities/activities').then(m => m.Activities), canActivate: [loggedInGuard, paidGuard] },
  { path: 'payment', loadComponent: () => import('./payment/payment').then(m => m.Payment), canActivate: [loggedInGuard] },
  { 
    path: 'admin', 
    loadComponent: () => import('./admin/admin').then(m => m.Admin), 
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./admin/admin-dashboard').then(m => m.AdminDashboard) },
      { path: 'users', loadComponent: () => import('./admin/admin-users').then(m => m.AdminUsers) },
      { path: 'predictions', loadComponent: () => import('./admin/admin-predictions').then(m => m.AdminPredictions) },
      { path: 'contact-us', loadComponent: () => import('./admin/admin-contact').then(m => m.AdminContact) }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
