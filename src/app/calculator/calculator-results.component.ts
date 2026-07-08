import { Component, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CalculatorStateService } from './calculator-state.service';

@Component({
  selector: 'app-calculator-results',
  imports: [CommonModule, RouterModule, DecimalPipe, MatCardModule, MatButtonModule],
  templateUrl: './calculator-results.html'
})
export class CalculatorResultsComponent {
  private state = inject(CalculatorStateService);
  private router = inject(Router);

  name = this.state.name;
  premium = this.state.premium;

  recalculate() {
    this.state.clear();
    this.router.navigate(['/calculator']);
  }
}
