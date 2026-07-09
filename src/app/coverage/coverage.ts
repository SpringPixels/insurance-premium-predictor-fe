import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-coverage',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './coverage.html',
  styleUrl: './coverage.css'
})
export class Coverage {}
