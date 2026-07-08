import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Mock auth state for demonstration
  isLoggedIn = signal<boolean>(false);
  isAdmin = signal<boolean>(false);
  
  // Example token logic
  private readonly tokenKey = 'health_guard_token';

  login(asAdmin = false) {
    this.isLoggedIn.set(true);
    this.isAdmin.set(asAdmin);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, 'mock-jwt-token-12345');
    }
  }

  logout() {
    this.isLoggedIn.set(false);
    this.isAdmin.set(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }
}
