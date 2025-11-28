import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-qr-access',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qr-access-container">
      <!-- Header con botón de regreso -->
      <div class="qr-header">
        <button class="btn-back-qr" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h1 class="qr-title">Registro Código QR</h1>
      </div>

      <!-- Bloque de información -->
      <div class="info-card">
        <p class="info-text">
          Este es tu código QR permanente como residente. No expira y podrás usarlo para entrar al fraccionamiento.
        </p>
      </div>

      <!-- Tarjeta con QR Code -->
      <div class="qr-card">
        <h2 class="qr-card-title">Código QR Permanente del Residente</h2>
        
        <div class="qr-code-wrapper">
          <img [src]="qrCodeUrl" alt="QR Code" class="qr-code-image" />
        </div>

        <div class="resident-info">
          <p class="resident-name">{{ profile?.user_name || profile?.name || 'Usuario' }}</p>
          <p class="resident-address">{{ profile?.fraccionamiento_name || 'Villas 123' }}</p>
        </div>

        <p class="scan-instruction">
          Escanea este código en la entrada para validar tu acceso
        </p>
      </div>
    </div>
  `,
  styles: [`
    .qr-access-container {
      min-height: 100vh;
      background-color: #1a1a1a;
      padding: 20px;
      padding-bottom: 40px;
    }

    /* Header */
    .qr-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .btn-back-qr {
      background-color: transparent;
      border: none;
      color: #ffffff;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }

    .btn-back-qr:hover {
      transform: translateX(-4px);
    }

    .btn-back-qr svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }

    .qr-title {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    /* Bloque de información */
    .info-card {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .info-text {
      font-size: 16px;
      color: #ffffff;
      line-height: 1.5;
      margin: 0;
    }

    /* Tarjeta con QR Code */
    .qr-card {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .qr-card-title {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 24px 0;
      text-align: center;
    }

    .qr-code-wrapper {
      background-color: #ffffff;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qr-code-image {
      width: 250px;
      height: 250px;
      max-width: 100%;
      height: auto;
    }

    .resident-info {
      text-align: center;
      margin-bottom: 16px;
      width: 100%;
    }

    .resident-name {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 8px 0;
    }

    .resident-address {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }

    .scan-instruction {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
      margin: 0;
    }

    @media (max-width: 480px) {
      .qr-access-container {
        padding: 16px;
      }

      .qr-title {
        font-size: 20px;
      }

      .qr-card-title {
        font-size: 16px;
      }

      .qr-code-image {
        width: 200px;
        height: 200px;
      }

      .resident-name {
        font-size: 18px;
      }
    }
  `]
})
export class QrAccessComponent implements OnInit {
  profile: any = null;
  qrCodeUrl: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.profile = this.authService.getCachedProfile();
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/sing-in']);
      return;
    }

    // Generar el QR code usando una API externa o datos del usuario
    this.generateQRCode();
  }

  generateQRCode(): void {
    // Generar datos para el QR (puede ser el ID del usuario, email, etc.)
    const qrData = this.profile?.id || this.profile?.user_name || 'default';
    
    // Usar una API externa para generar el QR code
    // Alternativa: usar una librería como angularx-qrcode
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
