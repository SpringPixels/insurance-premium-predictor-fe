import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculatorStateService {
  name = signal<string>('');
  premium = signal<number | null>(null);

  setResult(name: string, premium: number) {
    this.name.set(name);
    this.premium.set(premium);
  }

  clear() {
    this.name.set('');
    this.premium.set(null);
  }
}
