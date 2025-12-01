import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  error = '';
  success = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    if (this.loading) return;

    this.loading = true;
    this.error = '';
    this.success = false;

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success || response.exito) {
          this.success = true;
        } else {
          this.error = response.message || response.mensaje || 'Error al enviar el email';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || err.error?.message || err.error?.mensaje || 'Error al conectar con el servidor';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/auth/sing-in']);
  }
}
