import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './core/guard/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { roleGuard } from './core/guard/role.guard';

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
            { path: 'dashboard', loadComponent: loadDashboardComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
            { path: 'plans', loadComponent: loadPlansComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
            { path: 'chat', loadComponent: loadChatComponent, canActivate: [roleGuard], data: { roles: ['admin', 'staff', 'client'] } },
            { path: 'list', loadComponent: loadListComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
            { path: 'bookings', loadComponent: loadBookingsComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
            // { path: '**', loadComponent: loadNotFoundComponent, canActivate: [roleGuard], data: { roles: ['admin', 'staff', 'client', 'doctor'] } }
        ]
    },
    {
        path: '**',
        loadComponent: loadNotFoundComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'staff', 'client', 'doctor'] }
    }
];
