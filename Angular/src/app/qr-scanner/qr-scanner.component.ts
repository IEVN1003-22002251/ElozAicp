import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VisitorService } from '../services/visitor.service';
import { Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="scanner-container">
      <!-- Header -->
      <div class="scanner-header">
        <button class="btn-back-scanner" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h1 class="scanner-title">Escanear Código QR</h1>
      </div>

      <!-- Scanner Section -->
      <div class="scanner-section">
        <div class="scanner-video-container">
          <div #scannerContainer id="qr-reader" class="qr-reader-container" [class.hidden]="(!isScanning && !loading) || scanResult"></div>
          <div *ngIf="!isScanning && !loading && !scanResult" class="scanner-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="5" height="5"></rect>
              <rect x="16" y="3" width="5" height="5"></rect>
              <rect x="3" y="16" width="5" height="5"></rect>
              <path d="M21 16h-3"></path>
              <path d="M9 21h3"></path>
              <path d="M13 21h3"></path>
              <path d="M21 12v-1"></path>
              <path d="M12 21v-3"></path>
            </svg>
            <p>Presiona el botón para iniciar el escáner</p>
          </div>
          <div *ngIf="error" class="scanner-error">
            <p>{{ error }}</p>
          </div>
        </div>

        <div class="scanner-controls">
          <button 
            *ngIf="!isScanning" 
            class="btn-start-scan" 
            (click)="startScanning()"
            [disabled]="loading">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Iniciar Escáner
          </button>
          <button 
            *ngIf="isScanning" 
            class="btn-stop-scan" 
            (click)="stopScanning()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="6" y="6" width="12" height="12"></rect>
            </svg>
            Detener Escáner
          </button>
        </div>

        <!-- Manual QR Input -->
        <div class="manual-input-section">
          <p class="manual-input-label">O ingresa el código QR manualmente:</p>
          <div class="input-group">
            <input 
              type="text" 
              class="qr-input" 
              placeholder="Pega aquí el código QR o la URL del QR"
              [(ngModel)]="manualQRInput"
              (keyup.enter)="processManualInput()"
              #qrInput>
            <button class="btn-process-input" (click)="processManualInput()">
              Procesar
            </button>
          </div>
        </div>
      </div>

      <!-- Scan Result -->
      <div *ngIf="scanResult" class="scan-result">
        <div class="result-header">
          <h2 class="result-title">Código QR Escaneado</h2>
          <button class="btn-close-result" (click)="clearResult()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Visitor QR Result -->
        <div *ngIf="scanResult.type === 'visitor' || scanResult.type === 'one-time'" class="result-content visitor-result">
          <div class="result-badge visitor-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {{ scanResult.type === 'one-time' ? 'Visitante (Solo una vez)' : 'Visitante' }}
          </div>
          <div class="result-info">
            <div class="info-row">
              <span class="info-label">Nombre del Visitante:</span>
              <span class="info-value">{{ scanResult.visitor_name || 'N/A' }}</span>
            </div>
            <div class="info-row" *ngIf="isAdmin && (scanResult.resident_name || scanResult.resident_address)">
              <span class="info-label">Residente:</span>
              <span class="info-value">{{ scanResult.resident_name || 'N/A' }}</span>
            </div>
            <div class="info-row" *ngIf="isAdmin && scanResult.resident_address">
              <span class="info-label">Domicilio:</span>
              <span class="info-value">{{ scanResult.resident_address || 'No disponible' }}</span>
            </div>
            <div class="info-row" *ngIf="scanResult.resident_street && scanResult.resident_house_number">
              <span class="info-label">Calle y Número:</span>
              <span class="info-value">{{ scanResult.resident_street }}, {{ scanResult.resident_house_number }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ID del Visitante:</span>
              <span class="info-value">{{ scanResult.visitor_id || 'N/A' }}</span>
            </div>
            <div class="info-row" *ngIf="scanResult.timestamp">
              <span class="info-label">Fecha de Registro:</span>
              <span class="info-value">{{ formatDate(scanResult.timestamp) }}</span>
            </div>
            <div class="info-row" *ngIf="scanResult.status">
              <span class="info-label">Estado Actual:</span>
              <span class="info-value status-badge-display" [class]="'status-' + scanResult.status">
                {{ getStatusLabel(scanResult.status) }}
              </span>
            </div>
            <div class="info-row" *ngIf="scanResult.type === 'one-time' && scanResult.expires_at">
              <span class="info-label">Expira:</span>
              <span class="info-value" [class.expired]="isQRExpired(scanResult.expires_at)">
                {{ formatExpirationDate(scanResult.expires_at) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Resident QR Result -->
        <div *ngIf="scanResult.type === 'resident'" class="result-content resident-result">
          <div class="result-badge resident-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Residente
          </div>
          <div class="result-info">
            <div class="info-row">
              <span class="info-label">Nombre:</span>
              <span class="info-value">{{ scanResult.name || scanResult.user_name || 'N/A' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Fraccionamiento:</span>
              <span class="info-value">{{ scanResult.fraccionamiento_id || 'N/A' }}</span>
            </div>
            <div class="info-row" *ngIf="scanResult.house_number">
              <span class="info-label">Número de Casa:</span>
              <span class="info-value">{{ scanResult.house_number }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ID de Usuario:</span>
              <span class="info-value">{{ scanResult.user_id || 'N/A' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Fecha:</span>
              <span class="info-value">{{ formatDate(scanResult.timestamp) }}</span>
            </div>
          </div>
        </div>

        <!-- Event QR Result -->
        <div *ngIf="scanResult.type === 'event'" class="result-content event-result">
          <div class="result-badge event-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Evento
          </div>
          <div class="result-info">
            <div class="info-row">
              <span class="info-label">Nombre del Evento:</span>
              <span class="info-value">{{ scanResult.event_name || 'N/A' }}</span>
            </div>
            <div class="info-row" *ngIf="scanResult.event_date">
              <span class="info-label">Fecha:</span>
              <span class="info-value">{{ formatEventDate(scanResult.event_date) }}</span>
            </div>
            <div class="info-row" *ngIf="scanResult.event_time">
              <span class="info-label">Hora:</span>
              <span class="info-value">{{ formatEventTime(scanResult.event_time) }}</span>
            </div>
            <div class="info-row" *ngIf="scanResult.number_of_guests">
              <span class="info-label">Número de Invitados:</span>
              <span class="info-value">{{ scanResult.number_of_guests }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Lugar:</span>
              <span class="info-value">
                <span *ngIf="scanResult.event_location === 'domicilio' && scanResult.resident_address">
                  {{ scanResult.resident_address }}
                </span>
                <span *ngIf="scanResult.event_location === 'domicilio' && !scanResult.resident_address">
                  {{ getLocationLabel(scanResult.event_location) }}
                </span>
                <span *ngIf="scanResult.event_location && scanResult.event_location !== 'domicilio'">
                  {{ getLocationLabel(scanResult.event_location) }}
                </span>
                <span *ngIf="!scanResult.event_location">No especificado</span>
              </span>
            </div>
            <div class="info-row" *ngIf="scanResult.resident_name">
              <span class="info-label">Anfitrión:</span>
              <span class="info-value">{{ scanResult.resident_name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ID del Evento:</span>
              <span class="info-value">{{ scanResult.visitor_id || scanResult.event_id || 'N/A' }}</span>
            </div>
            <div class="info-row" *ngIf="scanResult.timestamp">
              <span class="info-label">Fecha de Registro:</span>
              <span class="info-value">{{ formatDate(scanResult.timestamp) }}</span>
            </div>
          </div>
        </div>

        <!-- Invalid QR -->
        <div *ngIf="scanResult.type !== 'visitor' && scanResult.type !== 'resident' && scanResult.type !== 'event' && scanResult.type !== 'one-time'" class="result-content invalid-result">
          <div class="result-badge invalid-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Código QR Inválido
          </div>
          <p class="invalid-message">Este código QR no es válido para el sistema AICP.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scanner-container {
      min-height: 100vh;
      background-color: #1a1a1a;
      padding: 20px;
      padding-bottom: 40px;
    }

    .scanner-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }

    .btn-back-scanner {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #20b2aa;
      border: none;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }

    .btn-back-scanner:hover {
      transform: scale(1.05);
      background-color: #1a9d96;
    }

    .btn-back-scanner svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }

    .scanner-title {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      flex: 1;
    }

    .scanner-section {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .scanner-video-container {
      position: relative;
      width: 100%;
      max-width: 600px;
      margin: 0 auto 24px;
      background-color: #1a1a1a;
      border-radius: 12px;
      overflow: visible;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .qr-reader-container {
      width: 100%;
      min-height: 400px;
      position: relative;
      z-index: 1;
      display: block;
    }

    .qr-reader-container.hidden {
      display: none !important;
    }

    /* Estilos para html5-qrcode */
    #qr-reader {
      width: 100% !important;
      min-height: 400px !important;
      display: block !important;
      position: relative !important;
      background-color: #1a1a1a !important;
    }

    #qr-reader__dashboard {
      padding: 0 !important;
      background-color: transparent !important;
      border: none !important;
    }

    #qr-reader__dashboard_section_csr {
      margin-bottom: 0 !important;
    }

    #qr-reader__camera_selection {
      display: none !important;
    }

    #qr-reader__scan_region {
      border-radius: 12px !important;
      width: 100% !important;
      position: relative !important;
    }

    #qr-reader__dashboard_section_swaplink {
      display: none !important;
    }

    #qr-reader video {
      width: 100% !important;
      height: auto !important;
      max-height: 500px !important;
      border-radius: 12px !important;
      object-fit: cover !important;
      display: block !important;
    }

    #qr-reader__camera_permission_button {
      background-color: #20c997 !important;
      color: #ffffff !important;
      border: none !important;
      padding: 12px 24px !important;
      border-radius: 8px !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
    }

    #qr-reader__status {
      color: #ffffff !important;
      background-color: rgba(0, 0, 0, 0.5) !important;
      padding: 8px 12px !important;
      border-radius: 4px !important;
    }

    #qr-reader__scan_region video {
      width: 100% !important;
      height: auto !important;
    }

    .scanner-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      color: rgba(255, 255, 255, 0.5);
      padding: 40px;
    }

    .scanner-placeholder svg {
      width: 64px;
      height: 64px;
    }

    .scanner-placeholder p {
      font-size: 16px;
      margin: 0;
      text-align: center;
    }

    .scanner-error {
      padding: 20px;
      background-color: rgba(220, 53, 69, 0.1);
      border-radius: 8px;
      color: #dc3545;
      text-align: center;
    }

    .scanner-controls {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .btn-start-scan,
    .btn-stop-scan {
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-start-scan {
      background-color: #20c997;
      color: #ffffff;
    }

    .btn-start-scan:hover:not(:disabled) {
      background-color: #1aa179;
      transform: translateY(-2px);
    }

    .btn-stop-scan {
      background-color: #dc3545;
      color: #ffffff;
    }

    .btn-stop-scan:hover {
      background-color: #c82333;
      transform: translateY(-2px);
    }

    .btn-start-scan:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .manual-input-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .manual-input-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 12px 0;
      text-align: center;
    }

    .input-group {
      display: flex;
      gap: 12px;
    }

    .qr-input {
      flex: 1;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background-color: #1a1a1a;
      color: #ffffff;
      font-size: 14px;
      outline: none;
      transition: border-color 0.3s ease;
    }

    .qr-input:focus {
      border-color: #20b2aa;
    }

    .qr-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .btn-process-input {
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      background-color: #20b2aa;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-process-input:hover {
      background-color: #1a9d96;
    }

    .scan-result {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 24px;
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .result-title {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .btn-close-result {
      background: transparent;
      border: none;
      color: #ffffff;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close-result:hover {
      opacity: 0.7;
    }

    .result-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .result-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      width: fit-content;
    }

    .visitor-badge {
      background-color: rgba(0, 123, 255, 0.2);
      color: #007bff;
    }

    .resident-badge {
      background-color: rgba(32, 178, 170, 0.2);
      color: #20b2aa;
    }

    .event-badge {
      background-color: rgba(212, 165, 116, 0.2);
      color: #d4a574;
    }

    .invalid-badge {
      background-color: rgba(220, 53, 69, 0.2);
      color: #dc3545;
    }

    .result-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
    }

    .info-value {
      font-size: 16px;
      color: #ffffff;
      font-weight: 600;
      text-align: right;
    }

    .status-badge-display {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
    }

    .status-badge-display.status-active {
      background-color: rgba(40, 167, 69, 0.2);
      color: #28a745;
    }

    .status-badge-display.status-dentro {
      background-color: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }

    .status-badge-display.status-salio,
    .status-badge-display.status-salió {
      background-color: rgba(108, 117, 125, 0.2);
      color: #6c757d;
    }

    .info-value.expired {
      color: #dc3545;
      font-weight: 700;
    }

    .invalid-message {
      color: rgba(255, 255, 255, 0.7);
      font-size: 16px;
      margin: 0;
      text-align: center;
      padding: 20px;
    }

    @media (max-width: 480px) {
      .scanner-container {
        padding: 16px;
      }

      .scanner-title {
        font-size: 24px;
      }

      .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .info-value {
        text-align: left;
      }
    }
  `]
})
export class QrScannerComponent implements OnInit, OnDestroy {
  @ViewChild('scannerContainer') scannerContainer!: ElementRef<HTMLDivElement>;

  isScanning = false;
  loading = false;
  error = '';
  scanResult: any = null;
  isAdmin = false;
  manualQRInput = '';
  private html5QrCode: Html5Qrcode | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private visitorService: VisitorService
  ) {}

  ngOnInit(): void {
    const profile = this.authService.getCachedProfile();
    this.isAdmin = profile?.role === 'admin';
  }

  ngOnDestroy(): void {
    this.stopScanning();
  }

  async startScanning(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.scanResult = null;
    this.isScanning = true; // Establecer antes para que el contenedor sea visible

    try {
      // Esperar un momento para que el DOM se actualice y el contenedor sea visible
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const containerId = 'qr-reader';
      
      // Verificar que el elemento existe
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error('Contenedor del escáner no encontrado');
      }

      // Limpiar cualquier contenido previo
      container.innerHTML = '';

      this.html5QrCode = new Html5Qrcode(containerId);

      // Configuración para el escáner
      const config = {
        fps: 30, // Aumentar frames por segundo para mejor detección
        qrbox: function(viewfinderWidth: number, viewfinderHeight: number) {
          // Calcular el tamaño del área de escaneo (más grande para mejor detección)
          const minEdgePercentage = 0.8; // Aumentar el área de escaneo
          const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
          return {
            width: qrboxSize,
            height: qrboxSize
          };
        },
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        disableFlip: false, // Permitir rotación para mejor detección
        videoConstraints: {
          facingMode: 'environment' // Preferir cámara trasera
        }
      };

      // Iniciar el escáner
      await this.html5QrCode.start(
        { facingMode: 'environment' }, // Preferir cámara trasera en móviles
        config,
        (decodedText, decodedResult) => {
          // QR code escaneado exitosamente
          this.onScanSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
          // Error durante el escaneo (ignorar errores menores)
          // No mostrar errores menores para no saturar la UI
        }
      );

      // isScanning ya se estableció antes, solo actualizar loading
      this.loading = false;
    } catch (err: any) {
      this.error = 'Error al iniciar el escáner: ' + (err.message || 'No se pudo acceder a la cámara');
      this.loading = false;
      this.isScanning = false;
      console.error('Error starting QR scanner:', err);
      
      // Limpiar si hay error
      if (this.html5QrCode) {
        try {
          await this.html5QrCode.clear();
        } catch (clearErr) {
          console.error('Error clearing scanner:', clearErr);
        }
        this.html5QrCode = null;
      }
    }
  }

  async stopScanning(): Promise<void> {
    if (this.html5QrCode) {
      try {
        await this.html5QrCode.stop();
        await this.html5QrCode.clear();
      } catch (err) {
        console.error('Error stopping QR scanner:', err);
      }
      this.html5QrCode = null;
    }
    this.isScanning = false;
  }

  async onScanSuccess(decodedText: string, decodedResult: any): Promise<void> {
    // Detener el escáner cuando se detecta un QR
    await this.stopScanning();
    
    // Extraer los datos del QR (puede venir como URL o JSON directo)
    let qrDataString = decodedText.trim();
    console.log('QR escaneado (texto original):', qrDataString);
    console.log('Longitud del texto:', qrDataString.length);
    
    // Si es una URL de QR (como la generada por la API), extraer el parámetro data
    try {
      if (qrDataString.startsWith('http')) {
        // Intentar extraer usando URL API
        try {
          const url = new URL(qrDataString);
          const dataParam = url.searchParams.get('data');
          if (dataParam) {
            // Intentar decodificar múltiples veces si es necesario
            let decoded = dataParam;
            try {
              decoded = decodeURIComponent(dataParam);
              // Si aún contiene %XX, decodificar de nuevo
              if (decoded.includes('%')) {
                decoded = decodeURIComponent(decoded);
              }
            } catch (e) {
              console.log('Error en decodeURIComponent, usando valor original');
            }
            qrDataString = decoded;
            console.log('QR extraído de URL (URL API):', qrDataString);
          } else {
            console.log('No se encontró parámetro data en la URL');
          }
        } catch (urlError) {
          // Si falla con URL API, intentar con regex (más robusto)
          console.log('Error con URL API, intentando con regex:', urlError);
          // Buscar el parámetro data en la URL (puede estar al inicio o en medio)
          const urlMatch = qrDataString.match(/[?&]data=([^&]*)/);
          if (urlMatch && urlMatch[1]) {
            try {
              let decoded = urlMatch[1];
              // Intentar decodificar múltiples veces
              try {
                decoded = decodeURIComponent(decoded);
                if (decoded.includes('%')) {
                  decoded = decodeURIComponent(decoded);
                }
              } catch (e) {
                console.log('Error en decodeURIComponent con regex');
              }
              qrDataString = decoded;
              console.log('QR extraído de URL (regex):', qrDataString);
            } catch (decodeError) {
              // Si falla el decode, usar el valor tal cual
              qrDataString = urlMatch[1];
              console.log('QR extraído de URL (sin decode):', qrDataString);
            }
          } else {
            console.log('No se encontró parámetro data con regex');
          }
        }
      }
    } catch (e) {
      // Si no es una URL válida, usar el texto directamente
      console.log('QR no es una URL, usando texto directo:', qrDataString);
    }
    
    // Procesar el código QR escaneado
    this.processQRData(qrDataString);
  }

  processManualInput(): void {
    if (!this.manualQRInput.trim()) {
      this.error = 'Por favor ingresa un código QR';
      return;
    }

    this.error = '';
    this.loading = true;

    // Intentar extraer datos del QR desde la URL si es una URL de QR
    let qrDataString = this.manualQRInput.trim();

    // Si es una URL de QR (como la generada por la API), extraer el parámetro data
    try {
      if (qrDataString.startsWith('http')) {
        const url = new URL(qrDataString);
        const dataParam = url.searchParams.get('data');
        if (dataParam) {
          qrDataString = decodeURIComponent(dataParam);
        }
      }
    } catch (e) {
      // Si no es una URL válida, usar el texto directamente
    }

    // Procesar los datos del QR
    this.processQRData(qrDataString);
    this.loading = false;
  }

  processQRData(qrDataString: string): void {
    this.error = '';
    this.loading = true;
    
    try {
      // Intentar parsear como JSON
      let qrData: any;
      let finalQrDataString = qrDataString.trim();
      
      // Primero intentar parsear directamente como JSON
      try {
        qrData = JSON.parse(finalQrDataString);
        console.log('QR parseado directamente como JSON:', qrData);
      } catch (parseError) {
        console.log('No es JSON directo, intentando extraer de URL...');
        
        // Si falla el parse, puede ser que el QR contenga una URL
        // Intentar extraer el parámetro data de la URL
        if (finalQrDataString.includes('data=')) {
          // Intentar extraer usando regex (más robusto)
          const urlMatch = finalQrDataString.match(/[?&]data=([^&]*)/);
          if (urlMatch && urlMatch[1]) {
            let extractedData = urlMatch[1];
            console.log('Datos extraídos del parámetro data:', extractedData);
            
            // Intentar múltiples métodos de decodificación
            const decodeAttempts = [
              // Intento 1: Decodificar normalmente
              () => {
                let decoded = decodeURIComponent(extractedData);
                if (decoded.includes('%')) {
                  decoded = decodeURIComponent(decoded);
                }
                return decoded;
              },
              // Intento 2: Sin decodificar
              () => extractedData,
              // Intento 3: Reemplazar caracteres codificados manualmente
              () => {
                return extractedData
                  .replace(/%22/g, '"')
                  .replace(/%7B/g, '{')
                  .replace(/%7D/g, '}')
                  .replace(/%3A/g, ':')
                  .replace(/%2C/g, ',')
                  .replace(/%5B/g, '[')
                  .replace(/%5D/g, ']')
                  .replace(/%20/g, ' ')
                  .replace(/%27/g, "'")
                  .replace(/%2F/g, '/');
              }
            ];
            
            let parsed = false;
            for (let i = 0; i < decodeAttempts.length && !parsed; i++) {
              try {
                finalQrDataString = decodeAttempts[i]();
                qrData = JSON.parse(finalQrDataString);
                console.log(`QR extraído y parseado (método ${i + 1}):`, qrData);
                parsed = true;
              } catch (attemptError) {
                console.log(`Intento ${i + 1} falló:`, attemptError);
                if (i === decodeAttempts.length - 1) {
                  // Si todos los intentos fallan
                  console.error('Error completo al procesar QR:', {
                    original: qrDataString,
                    extracted: extractedData,
                    attempts: i + 1
                  });
                  throw new Error('No se pudo extraer datos del QR después de múltiples intentos. Formato inválido.');
                }
              }
            }
          } else {
            throw new Error('No se encontró parámetro data en la URL del QR');
          }
        } else {
          // Si no es una URL, puede ser que el JSON esté mal formateado
          console.error('Formato de QR inválido:', parseError);
          console.error('Texto recibido:', finalQrDataString);
          throw new Error('Formato de QR inválido. El QR debe contener JSON o una URL con parámetro data.');
        }
      }
      
      console.log('QR Data parsed exitosamente:', qrData);
      console.log('QR Data String original:', qrDataString);
      console.log('QR Data String final:', finalQrDataString);
      
      // Normalizar formato simplificado a formato completo
      // El nuevo formato simplificado usa 't' (tipo) e 'id' (ID)
      let qrType = qrData.t || qrData.type; // 't' es el formato simplificado
      let qrId = qrData.id || qrData.visitor_id || qrData.event_id; // 'id' es el formato simplificado
      
      // Si no hay tipo o ID, el QR es inválido
      if (!qrType || !qrId) {
        this.loading = false;
        this.scanResult = {
          type: 'invalid',
          message: 'Código QR inválido: falta información de tipo o ID'
        };
        return;
      }
      
      // Mapear tipos abreviados a tipos completos
      const typeMap: { [key: string]: string } = {
        'visitor': 'visitor',
        'one-time': 'one-time',
        'event': 'event',
        'resident': 'resident'
      };
      qrType = typeMap[qrType] || qrType;
      
      // Si es un visitante o evento, obtener información completa desde el backend
      if (qrType === 'visitor' || qrType === 'one-time' || qrType === 'event') {
        // Usar el ID para obtener información completa
        this.processVisitorOrEventQR(qrId, qrType, finalQrDataString);
      } else if (qrType === 'resident') {
        this.loading = false;
        this.scanResult = {
          type: 'resident',
          name: qrData.name || qrData.user_name || '',
          user_name: qrData.user_name || qrData.name || '',
          user_id: qrId || qrData.user_id || '',
          fraccionamiento_id: qrData.fraccionamiento_id || '',
          house_number: qrData.house_number || '',
          timestamp: qrData.timestamp || ''
        };
      } else {
        this.loading = false;
        this.scanResult = {
          type: 'invalid',
          message: 'Código QR no reconocido'
        };
      }
    } catch (error) {
      this.loading = false;
      this.error = 'Error al decodificar el código QR. Asegúrate de que sea un código QR válido del sistema.';
      console.error('Error decoding QR:', error);
      console.log('QR Data String:', qrDataString);
    }
  }

  processVisitorOrEventQR(id: string, type: string, qrDataString: string): void {
    // Obtener información completa del visitante/evento desde el backend
    this.visitorService.getVisitor(id).subscribe({
      next: (visitorResponse) => {
        let visitor: any = null;
        if (visitorResponse.exito && visitorResponse.visitor) {
          visitor = visitorResponse.visitor;
        } else if (visitorResponse.visitor) {
          visitor = visitorResponse.visitor;
        }
        
        if (!visitor) {
          this.loading = false;
          this.scanResult = {
            type: 'invalid',
            message: 'Visitante o evento no encontrado'
          };
          return;
        }
        
        // Si es un evento, mostrar información del evento
        if (type === 'event') {
          // Para eventos, usar decodeVisitorQR para obtener información completa (incluyendo dirección si es domicilio)
          this.visitorService.decodeVisitorQR(qrDataString).subscribe({
            next: (response) => {
              this.loading = false;
              if (response.exito && response.visitor_info) {
                const eventInfo = response.visitor_info;
                this.scanResult = {
                  type: 'event',
                  event_name: eventInfo.event_name || visitor.name || '',
                  visitor_id: eventInfo.visitor_id || visitor.id,
                  event_id: eventInfo.visitor_id || visitor.id,
                  event_date: eventInfo.event_date || visitor.eventDate || '',
                  event_time: eventInfo.event_time || visitor.eventTime || '',
                  number_of_guests: eventInfo.number_of_guests || visitor.numberOfGuests || '',
                  event_location: eventInfo.event_location || visitor.eventLocation || '',
                  resident_name: eventInfo.resident_name || '',
                  resident_address: eventInfo.resident_address || '',
                  timestamp: eventInfo.timestamp || visitor.created_at || ''
                };
              } else {
                // Fallback si no se puede decodificar
                this.loading = false;
                this.scanResult = {
                  type: 'event',
                  event_name: visitor.name || '',
                  event_id: visitor.id,
                  visitor_id: visitor.id,
                  event_date: visitor.eventDate || '',
                  event_time: visitor.eventTime || '',
                  number_of_guests: visitor.numberOfGuests || '',
                  event_location: visitor.eventLocation || '',
                  timestamp: visitor.created_at || ''
                };
              }
            },
            error: (err) => {
              this.loading = false;
              console.error('Error al decodificar QR de evento:', err);
              // Fallback con datos básicos
              this.scanResult = {
                type: 'event',
                event_name: visitor.name || '',
                event_id: visitor.id,
                visitor_id: visitor.id,
                event_date: visitor.eventDate || '',
                event_time: visitor.eventTime || '',
                number_of_guests: visitor.numberOfGuests || '',
                event_location: visitor.eventLocation || '',
                timestamp: visitor.created_at || ''
              };
            }
          });
          return;
        }
        
        // Si es un visitante, actualizar estado y mostrar información
        let currentStatus = visitor.status || 'active';
        this.updateVisitorStatusOnScan(id, currentStatus, qrDataString);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al obtener visitante/evento:', err);
        this.scanResult = {
          type: 'invalid',
          message: 'Error al obtener información del visitante o evento'
        };
      }
    });
  }

  updateVisitorStatusOnScan(visitorId: string, currentStatus: string, qrDataString: string): void {
    // Determinar el siguiente estado - ciclo continuo para visitantes frecuentes
    let nextStatus = '';
    const normalizedStatus = (currentStatus || '').toLowerCase();
    
    if (normalizedStatus === 'active' || normalizedStatus === 'activo') {
      // Si está activo, cambiar a dentro
      nextStatus = 'dentro';
    } else if (normalizedStatus === 'dentro') {
      // Si está dentro, cambiar a salio
      nextStatus = 'salio';
    } else if (normalizedStatus === 'salio' || normalizedStatus === 'salió') {
      // Si está salio, cambiar a dentro (ciclo continuo)
      nextStatus = 'dentro';
    } else {
      // Para cualquier otro estado, iniciar en dentro
      nextStatus = 'dentro';
    }

    // Actualizar el estado del visitante
    this.visitorService.updateVisitor(visitorId, { status: nextStatus }).subscribe({
      next: (updateResponse) => {
        console.log('Estado del visitante actualizado:', nextStatus);
        // Continuar con la visualización de datos con el nuevo estado
        this.displayVisitorInfo(visitorId, qrDataString, nextStatus);
      },
      error: (updateErr) => {
        console.error('Error al actualizar estado del visitante:', updateErr);
        // Continuar con la visualización aunque falle la actualización
        this.displayVisitorInfo(visitorId, qrDataString, currentStatus);
      }
    });
  }

  displayVisitorInfo(visitorId: string, qrDataString: string, currentStatus: string): void {
    // Si es admin, intentar obtener información completa del backend
    if (this.isAdmin) {
      // Usar el string JSON final para decodificar
      this.visitorService.decodeVisitorQR(qrDataString).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.exito && response.visitor_info) {
            const info = response.visitor_info;
            // Si es un evento, incluir información del evento
            if (info.visitor_type === 'event') {
              this.scanResult = {
                type: 'event',
                event_name: info.event_name || '',
                visitor_id: info.visitor_id || visitorId,
                event_id: info.visitor_id || visitorId,
                event_date: info.event_date || '',
                event_time: info.event_time || '',
                number_of_guests: info.number_of_guests || '',
                event_location: info.event_location || '',
                resident_name: info.resident_name || '',
                resident_address: info.resident_address || '',
                timestamp: info.timestamp || '',
                status: currentStatus
              };
            } else {
              // Si es un visitante
              this.scanResult = {
                type: info.visitor_type || 'visitor',
                visitor_name: info.visitor_name || '',
                visitor_id: info.visitor_id || visitorId,
                resident_name: info.resident_name || '',
                resident_address: info.resident_address || '',
                resident_street: info.resident_street || '',
                resident_house_number: info.resident_house_number || '',
                timestamp: info.timestamp || '',
                status: currentStatus
              };
            }
          } else {
            // Si falla el decode, obtener directamente el visitante
            this.getVisitorInfoDirectly(visitorId, currentStatus);
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error decoding QR from backend:', err);
          // Si falla, obtener directamente el visitante
          this.getVisitorInfoDirectly(visitorId, currentStatus);
        }
      });
    } else {
      // Si no es admin, obtener información básica
      this.getVisitorInfoDirectly(visitorId, currentStatus);
    }
  }

  getVisitorInfoDirectly(visitorId: string, currentStatus: string): void {
    this.visitorService.getVisitor(visitorId).subscribe({
      next: (response) => {
        this.loading = false;
        const visitor = response.visitor || (response.exito ? response.visitor : null);
        if (visitor) {
          this.scanResult = {
            type: visitor.type || 'visitor',
            visitor_name: visitor.name || '',
            visitor_id: visitor.id || visitorId,
            timestamp: visitor.created_at || '',
            status: currentStatus
          };
        } else {
          this.scanResult = {
            type: 'invalid',
            message: 'Visitante no encontrado'
          };
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al obtener visitante:', err);
        this.scanResult = {
          type: 'invalid',
          message: 'Error al obtener información del visitante'
        };
      }
    });
  }

  clearResult(): void {
    this.scanResult = null;
  }

  getStatusLabel(status: string): string {
    if (!status) return 'N/A';
    const statusMap: { [key: string]: string } = {
      'active': 'Activo',
      'Activo': 'Activo',
      'dentro': 'Dentro',
      'Dentro': 'Dentro',
      'salio': 'Salió',
      'salió': 'Salió',
      'Salió': 'Salió'
    };
    return statusMap[status] || status;
  }

  isQRExpired(expiresAt: string): boolean {
    if (!expiresAt) return false;
    try {
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      return now > expirationDate;
    } catch {
      return false;
    }
  }

  formatExpirationDate(expiresAt: string): string {
    if (!expiresAt) return 'N/A';
    try {
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      const timeRemaining = expirationDate.getTime() - now.getTime();
      
      if (timeRemaining <= 0) {
        return 'Expirado';
      }
      
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hoursRemaining > 0) {
        return `${hoursRemaining}h ${minutesRemaining}m restantes`;
      } else {
        return `${minutesRemaining}m restantes`;
      }
    } catch {
      return 'N/A';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES');
    } catch {
      return dateString;
    }
  }

  formatEventDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  }

  formatEventTime(timeString: string): string {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  }

  getLocationLabel(location: string): string {
    if (!location) return '';
    const locationMap: { [key: string]: string } = {
      'domicilio': 'Domicilio',
      'casa_club': 'Casa club',
      'lago': 'Lago',
      'kiosco': 'Kiosco'
    };
    return locationMap[location] || location;
  }

  goBack(): void {
    this.stopScanning();
    this.router.navigate(['/dashboard']);
  }
}

