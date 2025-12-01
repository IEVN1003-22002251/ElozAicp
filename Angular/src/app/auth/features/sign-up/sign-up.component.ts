import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  constructor(private router: Router) {}

  goToSignIn(): void {
    this.router.navigate(['/auth/sing-in']);
  }
}

