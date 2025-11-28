import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="forgot-password-container">
      <div class="forgot-password-content">
        <!-- Header con botón de retroceso -->
        <div class="header">
          <button class="back-button" (click)="goBack()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>

        <!-- Contenido -->
        <div class="content">
          <!-- Logo -->
          <div class="logo-container">
            <img src="assets/eloz-logo.png" alt="Eloz Seguridad" class="logo" />
          </div>

          <!-- Título y subtítulo -->
          <h1 class="title">Olvidé mi contraseña</h1>
          <p class="subtitle">Ingresa tu email y te enviaremos las instrucciones para recuperar tu contraseña</p>

          <!-- Mensaje de éxito -->
          <div *ngIf="success" class="success-message">
            <svg class="success-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div>
              <strong>¡Email enviado!</strong>
              <p>Revisa tu bandeja de entrada para las instrucciones de recuperación.</p>
            </div>
          </div>

          <!-- Formulario -->
          <form *ngIf="!success" (ngSubmit)="onSubmit()" #forgotPasswordForm="ngForm" class="forgot-password-form">
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
                email
                placeholder="Email"
                [disabled]="loading"
              />
            </div>

            <!-- Mensaje de error -->
            <div *ngIf="error" class="error-message">
              <svg class="error-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {{ error }}
            </div>

            <!-- Botón Enviar -->
            <button
              type="submit"
              class="btn-submit"
              [disabled]="loading || !forgotPasswordForm.valid"
            >
              <span *ngIf="!loading">Enviar instrucciones</span>
              <span *ngIf="loading">Enviando...</span>
            </button>
          </form>

          <!-- Botón Volver al login -->
          <button *ngIf="success" class="btn-back-login" (click)="goBack()">
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6e 100%);
      padding: 20px;
      padding-top: 0;
    }

    .forgot-password-content {
      max-width: 500px;
      margin: 0 auto;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      padding: 16px 0;
      position: relative;
    }

    .back-button {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .back-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-bottom: 40px;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 32px;
    }

    .logo {
      max-width: 200px;
      height: auto;
      object-fit: contain;
      filter: brightness(0) invert(1);
    }

    .title {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      text-align: center;
      margin-bottom: 12px;
    }

    .subtitle {
      font-size: 16px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.8);
      text-align: center;
      margin-bottom: 32px;
      line-height: 1.5;
      max-width: 400px;
    }

    .forgot-password-form {
      width: 100%;
      max-width: 400px;
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

    .form-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      background-color: #dc3545;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .error-icon {
      flex-shrink: 0;
    }

    .success-message {
      background-color: #28a745;
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      width: 100%;
      max-width: 400px;
    }

    .success-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .success-message div {
      flex: 1;
    }

    .success-message strong {
      display: block;
      margin-bottom: 4px;
      font-size: 16px;
    }

    .success-message p {
      margin: 0;
      font-size: 14px;
      opacity: 0.95;
    }

    .btn-submit {
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
      margin-top: 8px;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-back-login {
      width: 100%;
      max-width: 400px;
      background: transparent;
      border: 2px solid #ffffff;
      color: #ffffff;
      border-radius: 12px;
      padding: 16px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 16px;
    }

    .btn-back-login:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    @media (max-width: 480px) {
      .title {
        font-size: 24px;
      }

      .subtitle {
        font-size: 14px;
      }

      .logo {
        max-width: 150px;
      }
    }
  `]
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
