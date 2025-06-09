import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  currentRoute: string = '';
  currentLabel: string = '';
  user!:any;

  private routeLabels: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/list': 'Users',
    '/bookings': 'Bookings',
    '/plans': 'Cuddle Plans',
    '/chat': 'Chat'
  };

  constructor(private router: Router) {
    this.currentRoute = this.router.url;

    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setCurrentLabel(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    this.user = userString ? JSON.parse(userString) : null;    
  }

  setCurrentLabel(url: string) {
    const matchedPath = Object.keys(this.routeLabels).find(path => url.startsWith(path));
    this.currentLabel = matchedPath ? this.routeLabels[matchedPath] : '';
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(){
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    this.navigateTo('/login')
  }
}
