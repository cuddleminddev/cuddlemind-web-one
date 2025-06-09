import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './core/guard/auth.guard';
import { LayoutComponent } from './layout/layout.component';

const loadDashboardComponent = () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent);
const loadPlansComponent = () => import('./components/plans/plans.component').then(m => m.PlansComponent);
const loadChatComponent = () => import('./components/chat/chat.component').then(m => m.ChatComponent);
const loadListComponent = () => import('./components/list/list.component').then(m => m.ListComponent);
const loadBookingsComponent = () => import('./components/bookings/bookings.component').then(m => m.BookingsComponent);
const loadNotFoundComponent = () => import('./shared//components/not-found/not-found.component').then(m => m.NotFoundComponent);

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },

    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', loadComponent: loadDashboardComponent },
            { path: 'plans', loadComponent: loadPlansComponent },
            { path: 'chat', loadComponent: loadChatComponent },
            { path: 'list', loadComponent: loadListComponent },
            { path: 'bookings', loadComponent: loadBookingsComponent },
            { path: '**', loadComponent: loadNotFoundComponent }
        ]
    }
];
