import { Component, inject } from '@angular/core';
import { CommonModule, PercentPipe, KeyValuePipe, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CalculatorStateService } from './calculator-state.service';

@Component({
  selector: 'app-calculator-results',
  imports: [CommonModule, RouterModule, PercentPipe, KeyValuePipe, CurrencyPipe, MatCardModule, MatButtonModule],
  templateUrl: './calculator-results.html'
})
export class CalculatorResultsComponent {
  private state = inject(CalculatorStateService);
  private router = inject(Router);

  name = this.state.name;
  prediction = this.state.prediction;

  get premiumAmount(): number {
    const cat = this.prediction()?.predicted_category;
    if (cat === 'Low') return 8000;
    if (cat === 'Medium') return 12000;
    if (cat === 'High') return 18000;
    if (cat === 'Very High') return 25000;
    return 0;
  }

  recalculate() {
    this.state.clear();
    this.router.navigate(['/calculator']);
  }
}
