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
      <header class="qr-header">
        <h1 class="qr-title">Registro Código QR</h1>
        <button class="btn-back-qr" (click)="goBack()">← Volver</button>
      </header>

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
      background-color: #1a1a2e;
    }

    /* Header */
    .qr-header {
      background-color: #2a2a2a;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      margin-bottom: 0;
    }

    .btn-back-qr {
      background-color: #dc3545;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-back-qr:hover {
      background-color: #c82333;
    }

    .qr-title {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    /* Bloque de información */
    .info-card {
      background-color: #16213e;
      border-radius: 12px;
      padding: 20px;
      margin: 40px;
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
      background-color: #16213e;
      border-radius: 12px;
      padding: 24px;
      margin: 0 40px;
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
      .qr-header {
        padding: 16px 20px;
      }

      .info-card,
      .qr-card {
        margin: 20px;
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

    // Cargar perfil actualizado si es necesario
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.authService.getProfile(currentUser.id).subscribe({
        next: (response) => {
          if (response.exito && response.profile) {
            this.profile = response.profile;
            localStorage.setItem('profile', JSON.stringify(response.profile));
          }
          // Generar el QR code único para este residente
          this.generateQRCode();
        },
        error: (error) => {
          console.error('Error al cargar perfil:', error);
          // Generar QR con datos disponibles
          this.generateQRCode();
        }
      });
    } else {
      this.generateQRCode();
    }
  }

  generateQRCode(): void {
    // Obtener el ID único del usuario (es el identificador único en la BD)
    const userId = this.profile?.id || this.authService.getCurrentUser()?.id;
    
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario para generar el QR');
      this.qrCodeUrl = '';
      return;
    }

    // Crear un objeto con información única del residente
    const qrDataObject = {
      type: 'resident',
      user_id: userId,
      name: this.profile?.user_name || this.profile?.name || '',
      fraccionamiento_id: this.profile?.fraccionamiento_id || '',
      house_number: this.profile?.house_number || '',
      timestamp: new Date().toISOString()
    };

    // Convertir a JSON string para el QR
    const qrDataString = JSON.stringify(qrDataObject);
    
    console.log('Generando QR único para residente ID:', userId);
    console.log('Datos del QR:', qrDataObject);

    // Generar el QR code usando una API externa
    // El QR contiene un JSON con información única del residente
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrDataString)}`;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
