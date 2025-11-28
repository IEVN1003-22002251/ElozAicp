import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-content">
        <!-- Logo -->
        <div class="logo-container">
          <img src="assets/eloz-logo.png" alt="Eloz Seguridad" class="logo" />
        </div>

        <!-- Mensaje de bienvenida -->
        <div class="welcome-section">
          <h1 class="welcome-title">Bienvenido</h1>
          <p class="welcome-subtitle">Inicia sesión para continuar</p>
        </div>

        <!-- Formulario -->
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="login-form">
          <!-- Campo Email -->
          <div class="input-group">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <input
              type="email"
              class="form-input"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="Email"
            />
          </div>

          <!-- Campo Contraseña -->
          <div class="input-group">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input
              [type]="showPassword ? 'text' : 'password'"
              class="form-input"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="Contraseña"
            />
            <button
              type="button"
              class="eye-icon"
              (click)="togglePasswordVisibility()"
              tabindex="-1"
            >
              <svg *ngIf="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg *ngIf="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>

          <!-- Mensaje de error -->
          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>

          <!-- Botón Iniciar sesión -->
          <button
            type="submit"
            class="btn-login"
            [disabled]="loading || !loginForm.valid"
          >
            <span *ngIf="!loading">Iniciar sesión</span>
            <span *ngIf="loading">Cargando...</span>
          </button>
        </form>

        <!-- Link Olvidaste tu contraseña -->
        <a class="forgot-password" (click)="router.navigate(['/forgot-password'])">
          ¿Olvidaste tu contraseña?
        </a>

        <!-- Botón Nuevo residente -->
        <button class="btn-new-resident" (click)="router.navigate(['/register'])">
          <svg class="person-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>¿Nuevo residente? Solicitar acceso</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6e 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .login-content {
      width: 100%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 40px;
    }

    .logo {
      max-width: 250px;
      height: auto;
      object-fit: contain;
      filter: brightness(0) invert(1);
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 40px;
      width: 100%;
    }

    .welcome-title {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
      line-height: 1.2;
    }

    .welcome-subtitle {
      font-size: 16px;
      font-weight: 400;
      color: #ffffff;
      opacity: 0.9;
    }

    .login-form {
      width: 100%;
      margin-bottom: 20px;
    }

    .input-group {
      position: relative;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0 16px;
      min-height: 56px;
    }

    .input-icon {
      color: #ffffff;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .form-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 16px;
      padding: 0;
      outline: none;
    }

    .form-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .eye-icon {
      background: none;
      border: none;
      color: #ffffff;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .eye-icon:focus {
      outline: none;
    }

    .error-message {
      background-color: #dc3545;
      color: white;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
      font-size: 14px;
    }

    .btn-login {
      width: 100%;
      background-color: #007bff;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 16px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
      margin-bottom: 20px;
    }

    .btn-login:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .forgot-password {
      color: #ffffff;
      text-decoration: none;
      font-size: 14px;
      cursor: pointer;
      margin-bottom: 24px;
      text-align: center;
      display: block;
      transition: opacity 0.3s ease;
    }

    .forgot-password:hover {
      opacity: 0.8;
    }

    .btn-new-resident {
      width: 100%;
      background: transparent;
      border: 2px solid #28a745;
      color: #28a745;
      border-radius: 12px;
      padding: 16px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .btn-new-resident:hover {
      background-color: rgba(40, 167, 69, 0.1);
    }

    .person-icon {
      flex-shrink: 0;
    }

    @media (max-width: 480px) {
      .welcome-title {
        font-size: 28px;
      }

      .logo {
        max-width: 200px;
      }
    }
  `]
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

  onSubmit(): void {
    if (this.loading) return;

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
<<<<<<< Updated upstream
        if (response.success) {
          this.router.navigate(['/dashboard']);
=======
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
>>>>>>> Stashed changes
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

