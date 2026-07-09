import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CalculatorStateService } from '../calculator/calculator-state.service';
import { AuthService } from '../auth.service';
import { ApiErrorService } from '../api-error.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    ReactiveFormsModule, 
    MatCardModule, 
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payment.html'
})
export class Payment implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private state = inject(CalculatorStateService);
  private auth = inject(AuthService);
  private apiError = inject(ApiErrorService);

  // Use a signal so it can update asynchronously
  fetchedAmount = signal(0);
  
  get amount(): number {
    return this.state.prediction()?.predicted_premium || this.fetchedAmount();
  }

  isProcessing = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(true);

  paymentForm = this.fb.group({
    cardName: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]]
  });

  ngOnInit() {
    if (this.amount > 0) {
      this.isLoading.set(false);
      return;
    }
    
    // Fetch last prediction if amount is 0
    if (typeof window !== 'undefined') {
      this.http.get<any[]>(`${environment.apiUrl}/predictions/me`).subscribe({
        next: (res) => {
          if (res && res.length > 0) {
            // Sort to get the latest prediction
            res.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            this.fetchedAmount.set(res[0].predicted_premium);
            this.isLoading.set(false);
          } else {
            // No predictions found, redirect to calculator
            this.router.navigate(['/calculator']);
          }
        },
        error: (err) => {
          console.error('Failed to fetch predictions', err);
          this.router.navigate(['/calculator']);
        }
      });
    } else {
      this.isLoading.set(false);
    }
  }

  processPayment() {
    if (this.paymentForm.valid) {
      this.isProcessing.set(true);
      this.errorMessage.set('');
      
      const payload = { amount: this.amount };
      
      this.http.post(`${environment.apiUrl}/payments/create`, payload).subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.successMessage.set('Payment successful! Redirecting...');
          this.auth.isPaid.set(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('paid', 'true');
          }
          setTimeout(() => {
            this.router.navigate(['/predictions']);
          }, 2000);
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.errorMessage.set(this.apiError.getMessage(err, 'Payment failed. Please try again.'));
          console.error(err);
        }
      });
    } else {
      this.paymentForm.markAllAsTouched();
    }
  }
}
