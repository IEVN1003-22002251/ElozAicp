import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationService } from '../services/registration.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="register-container">
      <!-- Primera Pantalla: Datos Personales -->
      <div *ngIf="step === 1" class="register-screen">
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
          <!-- Icono circular azul -->
          <div class="icon-container">
            <div class="user-icon-circle">
              <svg class="user-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <div class="plus-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
            </div>
          </div>

          <!-- Título y subtítulo -->
          <h1 class="title">Solicitar Acceso</h1>
          <p class="subtitle">Completa tus datos para solicitar acceso al sistema</p>

          <!-- Formulario -->
          <form (ngSubmit)="nextStep()" #personalForm="ngForm" class="register-form">
            <!-- Nombre completo -->
            <div class="input-group">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                type="text"
                class="form-input"
                [(ngModel)]="formData.full_name"
                name="full_name"
                required
                placeholder="Nombre completo"
              />
            </div>

            <!-- Nombre de usuario -->
            <div class="input-group">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <input
                type="text"
                class="form-input"
                [(ngModel)]="formData.user_name"
                name="user_name"
                required
                placeholder="Nombre de usuario"
              />
            </div>

            <!-- Email -->
            <div class="input-group">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                type="email"
                class="form-input"
                [(ngModel)]="formData.email"
                name="email"
                required
                placeholder="Email"
              />
            </div>

            <!-- Teléfono -->
            <div class="phone-group">
              <div class="country-selector">
                <span class="flag">🇲🇽</span>
                <span class="country-code">MX</span>
                <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div class="phone-input-group">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <input
                  type="tel"
                  class="form-input"
                  [(ngModel)]="formData.phone"
                  name="phone"
                  placeholder="+52"
                />
              </div>
            </div>

            <!-- Contraseña -->
            <div class="input-group">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                [type]="showPassword ? 'text' : 'password'"
                class="form-input"
                [(ngModel)]="formData.password"
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

            <!-- Confirmar Contraseña -->
            <div class="input-group">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                [type]="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                [(ngModel)]="formData.confirmPassword"
                name="confirmPassword"
                required
                placeholder="Confirmar contraseña"
              />
              <button
                type="button"
                class="eye-icon"
                (click)="toggleConfirmPasswordVisibility()"
                tabindex="-1"
              >
                <svg *ngIf="!showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg *ngIf="showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>

            <!-- Botón Continuar -->
            <button
              type="submit"
              class="btn-continue"
              [disabled]="!personalForm.valid || loading"
            >
              <span *ngIf="!loading">Continuar</span>
              <span *ngIf="loading">Cargando...</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Segunda Pantalla: Fraccionamiento -->
      <div *ngIf="step === 2" class="register-screen">
        <!-- Header con botón de retroceso -->
        <div class="header">
          <button class="back-button" (click)="previousStep()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>

        <!-- Contenido -->
        <div class="content">
          <!-- Título -->
          <h2 class="section-title">Fraccionamiento:</h2>

          <!-- Formulario -->
          <form (ngSubmit)="submitRegistration()" #locationForm="ngForm" class="register-form">
            <!-- Seleccionar Fraccionamiento -->
            <div class="input-group">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <select
                class="form-input"
                [(ngModel)]="formData.fraccionamiento_id"
                name="fraccionamiento_id"
                required
              >
                <option value="" disabled selected>Selecciona un fraccionamiento...</option>
                <option *ngFor="let fraccionamiento of fraccionamientos" [value]="fraccionamiento.id">
                  {{ fraccionamiento.name }}
                </option>
              </select>
              <svg class="chevron-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            <!-- Calle -->
            <div class="input-group">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <input
                type="text"
                class="form-input"
                [(ngModel)]="formData.street"
                name="street"
                required
                placeholder="Calle"
              />
            </div>

            <!-- Número de casa -->
            <div class="input-group">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <input
                type="text"
                class="form-input"
                [(ngModel)]="formData.house_number"
                name="house_number"
                required
                placeholder="Número de casa"
              />
            </div>

            <!-- Botón Enviar solicitud -->
            <button
              type="submit"
              class="btn-submit"
              [disabled]="!locationForm.valid || loading"
            >
              <svg class="paper-plane-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              <span *ngIf="!loading">Enviar solicitud</span>
              <span *ngIf="loading">Enviando...</span>
            </button>
          </form>

          <!-- Caja de información -->
          <div class="info-box">
            <div class="info-item">
              <svg class="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Tu solicitud será revisada por el administrador del fraccionamiento.</span>
            </div>
            <div class="info-item">
              <svg class="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>Recibirás un email cuando sea aprobada.</span>
            </div>
            <div class="info-item">
              <svg class="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Las solicitudes sin aprobar se eliminan automáticamente después de 30 días.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6e 100%);
      padding: 20px;
      padding-top: 0;
    }

    .register-screen {
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
      padding-bottom: 40px;
    }

    /* Primera Pantalla */
    .icon-container {
      margin-bottom: 24px;
    }

    .user-icon-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: #007bff;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin: 0 auto;
    }

    .user-icon {
      color: #ffffff;
    }

    .plus-icon {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #007bff;
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
    }

    .register-form {
      width: 100%;
      max-width: 400px;
    }

    .input-group {
      position: relative;
      margin-bottom: 16px;
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

    select.form-input {
      appearance: none;
      cursor: pointer;
    }

    .chevron-icon {
      color: #ffffff;
      margin-left: 12px;
      flex-shrink: 0;
    }

    .phone-group {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .country-selector {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0 16px;
      min-height: 56px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ffffff;
      cursor: pointer;
      min-width: 100px;
    }

    .flag {
      font-size: 20px;
    }

    .country-code {
      font-size: 14px;
      font-weight: 500;
    }

    .chevron {
      color: #ffffff;
    }

    .phone-input-group {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0 16px;
      min-height: 56px;
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

    .btn-continue {
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

    .btn-continue:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-continue:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Segunda Pantalla */
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
      text-align: center;
      margin-bottom: 24px;
      width: 100%;
      max-width: 400px;
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
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .paper-plane-icon {
      flex-shrink: 0;
    }

    .info-box {
      background-color: #ffc107;
      border-radius: 12px;
      padding: 20px;
      margin-top: 24px;
      width: 100%;
      max-width: 400px;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
      color: #1a1a1a;
      font-size: 14px;
      line-height: 1.5;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-icon {
      color: #1a1a1a;
      flex-shrink: 0;
      margin-top: 2px;
    }

    @media (max-width: 480px) {
      .title {
        font-size: 24px;
      }

      .subtitle {
        font-size: 14px;
      }

      .phone-group {
        flex-direction: column;
      }

      .country-selector {
        width: 100%;
      }
    }
  `]
})
export class RegisterComponent {
  step = 1;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  error = '';

  formData = {
    full_name: '',
    user_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    fraccionamiento_id: '',
    street: '',
    house_number: ''
  };

  fraccionamientos = [
    { id: 1, name: 'La Querencia' },
    { id: 2, name: 'Las Palmas' },
    { id: 3, name: 'Puerta Luna' },
    { id: 4, name: 'Villas del Sol' }
  ];

  constructor(
    private router: Router,
    private registrationService: RegistrationService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  nextStep(): void {
    if (this.formData.password !== this.formData.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    this.error = '';
    this.step = 2;
  }

  previousStep(): void {
    this.step = 1;
    this.error = '';
  }

  goBack(): void {
    this.router.navigate(['/auth/sing-in']);
  }

  submitRegistration(): void {
    if (this.loading) return;

    this.loading = true;
    this.error = '';

    const registrationData = {
      full_name: this.formData.full_name,
      user_name: this.formData.user_name,
      email: this.formData.email,
      password: this.formData.password,
      role: 'resident',
      fraccionamiento_id: this.formData.fraccionamiento_id,
      status: 'pending',
      phone: this.formData.phone,
      street: this.formData.street,
      house_number: this.formData.house_number
    };

    this.registrationService.createRegistration(registrationData).subscribe({
      next: (response) => {
        if (response.success || response.exito) {
          // Redirigir a una página de confirmación o al login
          this.router.navigate(['/auth/sing-in'], {
            queryParams: { registered: 'true' }
          });
        } else {
          this.error = response.message || response.mensaje || 'Error al enviar la solicitud';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.message || err.error?.mensaje || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }
}
