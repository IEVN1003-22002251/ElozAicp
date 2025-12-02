import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  onSubmit(): void {
    if (this.loading) return;

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.success || response.exito) {
          // Obtener el perfil del usuario para verificar su rol
          const profile = this.authService.getCachedProfile();
          const userRole = profile?.role?.toLowerCase();
          
          // Si es residente, redirigir al home, de lo contrario al dashboard
          if (userRole === 'resident' || userRole === 'residente') {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.error = 'Error al iniciar sesión';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }
}

