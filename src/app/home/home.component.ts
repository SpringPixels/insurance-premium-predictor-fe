import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  authService = inject(AuthService);
  router = inject(Router);

  onCalculateClick(event: Event) {
    event.preventDefault();

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/register']);
    } else if (this.authService.isAdmin()) {
      window.alert('Admin dashboard is coming soon! Admins do not need to calculate premiums.');
    } else {
      this.router.navigate(['/calculator']);
    }
  }
}
