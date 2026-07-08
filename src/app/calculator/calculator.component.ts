import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { form, FormField, required, min, FormRoot } from '@angular/forms/signals';
import { CalculatorStateService } from './calculator-state.service';

interface CalculatorData {
  name: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  incomeLpa: number | null;
  isSmoker: string; // 'yes' or 'no'
  city: string;
  occupation: string;
}

@Component({
  selector: 'app-calculator',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatDividerModule,
    FormField,
    FormRoot,
  ],
  templateUrl: './calculator.html',
  styleUrl: './calculator.css',
})
export class CalculatorComponent {
  private router = inject(Router);
  private state = inject(CalculatorStateService);

  cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Other Tier 1', 'Tier 2/3 City'];
  occupations = ['Salaried Professional', 'Self-Employed / Business', 'Hazardous Work (Mining, Construction)', 'Student', 'Retired'];

  calcModel = signal<CalculatorData>({
    name: '',
    age: null,
    weight: null,
    height: null,
    incomeLpa: null,
    isSmoker: '',
    city: '',
    occupation: '',
  });

  readonly calcForm = form(this.calcModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });

    required(schemaPath.age, { message: 'Age is required' });
    min(schemaPath.age, 18, { message: 'Must be at least 18' });

    required(schemaPath.weight, { message: 'Weight is required' });
    min(schemaPath.weight, 30, { message: 'Invalid weight' });

    required(schemaPath.height, { message: 'Height is required' });
    min(schemaPath.height, 1, { message: 'Invalid height' });

    required(schemaPath.incomeLpa, { message: 'Income is required' });
    min(schemaPath.incomeLpa, 0, { message: 'Cannot be negative' });

    required(schemaPath.isSmoker, { message: 'Please specify smoking habits' });
    required(schemaPath.city, { message: 'City is required' });
    required(schemaPath.occupation, { message: 'Occupation is required' });
  });

  calculate() {
    window.alert("yo")
    if (this.calcForm().valid()) {
      const data = this.calcModel();

      let premium = 5000;

      if (data.age && data.age > 30) premium += (data.age - 30) * 150;
      if (data.age && data.age > 50) premium += 2000;

      if (data.weight && data.height) {
        const bmi = data.weight / (data.height * data.height);
        if (bmi > 25) premium += 1500;
        if (bmi > 30) premium += 2500;
      }

      if (data.isSmoker === 'yes') {
        premium *= 1.5;
      }

      if (data.occupation.includes('Hazardous')) {
        premium += 5000;
      }

      this.state.setResult(data.name, Math.round(premium));
      this.router.navigate(['/calculator/results']);
    }
  }
}

