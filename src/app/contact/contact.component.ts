import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { form, FormField, required, email, pattern, FormRoot } from '@angular/forms/signals';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../environments/environment';

interface ContactData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormField,
    FormRoot,
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactComponent {
  private http = inject(HttpClient);

  contactModel = signal<ContactData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  isSubmitting = signal<boolean>(false);
  submitError = signal<string>('');

  readonly contactForm = form(this.contactModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Please enter a valid email' });
    required(schemaPath.phone, { message: 'Phone number is required' });
    pattern(schemaPath.phone, /^(?:\+91[-\s]?)?[0]?(91)?[6789]\d{9}$/, { message: 'Please enter a valid Indian phone number' });
    required(schemaPath.subject, { message: 'Subject is required' });
    required(schemaPath.message, { message: 'Message is required' });
  });

  onSubmit() {
    if (this.contactForm().valid()) {
      this.isSubmitting.set(true);
      this.submitError.set('');

      const { name, email, phone, subject, message } = this.contactModel();

      this.http.post(`${environment.apiUrl}/contact-us`, {
        name,
        email,
        phone_no: phone,
        subject,
        message
      }).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          alert('Thank you for contacting us! We will get back to you shortly.');
          this.contactModel.set({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
          });
        },
        error: () => {
          this.isSubmitting.set(false);
          this.submitError.set('There was an error sending your message. Please try again later.');
        }
      });
    }
  }
}
