import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VisitorService } from '../services/visitor.service';
import { Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';

@Component({
  selector: 'app-guard-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="guard-scanner-container">
      <div class="guard-scanner-header">
        <button class="btn-back" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h1 class="scanner-title">Escanear QR - Aprobar Acceso</h1>
      </div>

      <div class="scanner-section">
        <div class="scanner-video-container">
          <div #scannerContainer id="guard-qr-reader" class="qr-reader-container" [class.hidden]="(!isScanning && !loading) || scanResult"></div>
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

        <div class="manual-input-section">
          <p class="manual-input-label">O ingresa el código QR manualmente:</p>
          <div class="input-group">
            <input 
              type="text" 
              class="qr-input" 
              placeholder="Pega aquí el código QR"
              [(ngModel)]="manualQRInput"
              (keyup.enter)="processManualInput()">
            <button class="btn-process-input" (click)="processManualInput()">
              Procesar
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="scanResult" class="scan-result">
        <div class="result-header">
          <h2 class="result-title">Resultado del Escaneo</h2>
          <button class="btn-close-result" (click)="clearResult()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div *ngIf="scanResult.type === 'visitor' || scanResult.type === 'one-time' || scanResult.type === 'event'" class="result-content">
          <div class="result-badge" [class.visitor-badge]="scanResult.type === 'visitor' || scanResult.type === 'one-time'" [class.event-badge]="scanResult.type === 'event'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {{ scanResult.type === 'event' ? 'Evento' : (scanResult.type === 'one-time' ? 'Visitante (Solo una vez)' : 'Visitante') }}
          </div>
          <div class="result-info">
            <div class="info-row">
              <span class="info-label">Nombre:</span>
              <span class="info-value">{{ scanResult.visitor_name || scanResult.event_name || 'N/A' }}</span>
            </div>
            <div class="info-row" *ngIf="scanResult.resident_name">
              <span class="info-label">Residente:</span>
              <span class="info-value">{{ scanResult.resident_name }}</span>
            </div>
            <div class="info-row" *ngIf="scanResult.resident_address">
              <span class="info-label">Domicilio:</span>
              <span class="info-value">{{ scanResult.resident_address }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Estado:</span>
              <span class="info-value status-badge" [class.status-dentro]="scanResult.status === 'dentro'" [class.status-salio]="scanResult.status === 'salio' || scanResult.status === 'salió'">
                {{ getStatusLabel(scanResult.status) }}
              </span>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn-approve" (click)="approveAccess()" *ngIf="scanResult.status !== 'dentro'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Aprobar Acceso
            </button>
            <button class="btn-exit" (click)="registerExit()" *ngIf="scanResult.status === 'dentro'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"></path>
              </svg>
              Registrar Salida
            </button>
          </div>
        </div>

        <div *ngIf="scanResult.type === 'resident'" class="result-content">
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
            <div class="info-row" *ngIf="scanResult.house_number">
              <span class="info-label">Número de Casa:</span>
              <span class="info-value">{{ scanResult.house_number }}</span>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn-approve" (click)="approveResidentAccess()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Aprobar Acceso
            </button>
          </div>
        </div>

        <div *ngIf="scanResult.type === 'invalid'" class="result-content invalid-result">
          <div class="result-badge invalid-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Código QR Inválido
          </div>
          <p class="invalid-message">{{ scanResult.message || 'Este código QR no es válido para el sistema.' }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .guard-scanner-container {
      min-height: 100vh;
      background-color: #1a1a1a;
      padding: 20px;
      padding-bottom: 40px;
    }

    .guard-scanner-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }

    .btn-back {
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

    .btn-back:hover {
      transform: scale(1.05);
      background-color: #1a9d96;
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

    #guard-qr-reader {
      width: 100% !important;
      min-height: 400px !important;
      display: block !important;
      position: relative !important;
      background-color: #1a1a1a !important;
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

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
    }

    .status-badge.status-dentro {
      background-color: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }

    .status-badge.status-salio {
      background-color: rgba(108, 117, 125, 0.2);
      color: #6c757d;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .btn-approve,
    .btn-exit {
      flex: 1;
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-approve {
      background-color: #28a745;
      color: #ffffff;
    }

    .btn-approve:hover {
      background-color: #218838;
      transform: translateY(-2px);
    }

    .btn-exit {
      background-color: #ffc107;
      color: #1a1a1a;
    }

    .btn-exit:hover {
      background-color: #e0a800;
      transform: translateY(-2px);
    }

    .invalid-message {
      color: rgba(255, 255, 255, 0.7);
      font-size: 16px;
      margin: 0;
      text-align: center;
      padding: 20px;
    }
  `]
})
export class GuardQrScannerComponent implements OnInit, OnDestroy {
  @ViewChild('scannerContainer') scannerContainer!: ElementRef<HTMLDivElement>;

  isScanning = false;
  loading = false;
  error = '';
  scanResult: any = null;
  manualQRInput = '';
  private html5QrCode: Html5Qrcode | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private visitorService: VisitorService
  ) {}

  ngOnInit(): void {
    // Verificar que el usuario es guardia
    const profile = this.authService.getCachedProfile();
    if (profile?.role !== 'guard' && profile?.role !== 'admin') {
      this.router.navigate(['/guard-dashboard']);
    }
  }

  ngOnDestroy(): void {
    this.stopScanning();
  }

  async startScanning(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.scanResult = null;
    this.isScanning = true;

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const containerId = 'guard-qr-reader';
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error('Contenedor del escáner no encontrado');
      }

      container.innerHTML = '';
      this.html5QrCode = new Html5Qrcode(containerId);

      const config = {
        fps: 30,
        qrbox: function(viewfinderWidth: number, viewfinderHeight: number) {
          const minEdgePercentage = 0.8;
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
        videoConstraints: {
          facingMode: 'environment'
        }
      };

      await this.html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText, decodedResult) => {
          this.onScanSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
          // Ignorar errores menores
        }
      );

      this.loading = false;
    } catch (err: any) {
      this.error = 'Error al iniciar el escáner: ' + (err.message || 'No se pudo acceder a la cámara');
      this.loading = false;
      this.isScanning = false;
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
    await this.stopScanning();
    this.processQRData(decodedText.trim());
  }

  processManualInput(): void {
    if (!this.manualQRInput.trim()) {
      this.error = 'Por favor ingresa un código QR';
      return;
    }
    this.error = '';
    this.loading = true;
    this.processQRData(this.manualQRInput.trim());
    this.loading = false;
  }

  processQRData(qrDataString: string): void {
    this.error = '';
    this.loading = true;
    
    try {
      let qrData: any;
      try {
        qrData = JSON.parse(qrDataString);
      } catch {
        // Intentar extraer de URL
        if (qrDataString.includes('data=')) {
          const urlMatch = qrDataString.match(/[?&]data=([^&]*)/);
          if (urlMatch && urlMatch[1]) {
            qrDataString = decodeURIComponent(urlMatch[1]);
            qrData = JSON.parse(qrDataString);
          } else {
            throw new Error('Formato inválido');
          }
        } else {
          throw new Error('Formato inválido');
        }
      }
      
      let qrType = qrData.t || qrData.type;
      let qrId = qrData.id || qrData.visitor_id || qrData.event_id;
      
      if (!qrType || !qrId) {
        this.loading = false;
        this.scanResult = {
          type: 'invalid',
          message: 'Código QR inválido: falta información'
        };
        return;
      }
      
      if (qrType === 'visitor' || qrType === 'one-time' || qrType === 'event') {
        this.processVisitorOrEventQR(qrId, qrType, qrDataString);
      } else if (qrType === 'resident') {
        this.loading = false;
        this.scanResult = {
          type: 'resident',
          name: qrData.name || qrData.user_name || '',
          user_name: qrData.user_name || qrData.name || '',
          user_id: qrId || qrData.user_id || '',
          house_number: qrData.house_number || ''
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
      this.error = 'Error al decodificar el código QR.';
      console.error('Error decoding QR:', error);
    }
  }

  processVisitorOrEventQR(id: string, type: string, qrDataString: string): void {
    this.visitorService.decodeVisitorQR(qrDataString).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.exito && response.visitor_info) {
          const info = response.visitor_info;
          if (info.visitor_type === 'event') {
            this.scanResult = {
              type: 'event',
              event_name: info.event_name || '',
              visitor_id: info.visitor_id || id,
              resident_name: info.resident_name || '',
              resident_address: info.resident_address || '',
              status: 'active'
            };
          } else {
            this.scanResult = {
              type: info.visitor_type || 'visitor',
              visitor_name: info.visitor_name || '',
              visitor_id: info.visitor_id || id,
              resident_name: info.resident_name || '',
              resident_address: info.resident_address || '',
              status: 'active'
            };
          }
        } else {
          this.getVisitorInfoDirectly(id, type);
        }
      },
      error: (err) => {
        this.getVisitorInfoDirectly(id, type);
      }
    });
  }

  getVisitorInfoDirectly(visitorId: string, type: string): void {
    this.visitorService.getVisitor(visitorId).subscribe({
      next: (response) => {
        this.loading = false;
        const visitor = response.visitor || (response.exito ? response.visitor : null);
        if (visitor) {
          if (type === 'event') {
            this.scanResult = {
              type: 'event',
              event_name: visitor.name || '',
              visitor_id: visitor.id || visitorId,
              status: visitor.status || 'active'
            };
          } else {
            this.scanResult = {
              type: visitor.type || 'visitor',
              visitor_name: visitor.name || '',
              visitor_id: visitor.id || visitorId,
              status: visitor.status || 'active'
            };
          }
        } else {
          this.scanResult = {
            type: 'invalid',
            message: 'Visitante no encontrado'
          };
        }
      },
      error: (err) => {
        this.loading = false;
        this.scanResult = {
          type: 'invalid',
          message: 'Error al obtener información'
        };
      }
    });
  }

  approveAccess(): void {
    if (!this.scanResult || !this.scanResult.visitor_id) return;
    
    const nextStatus = this.scanResult.status === 'active' || this.scanResult.status === 'salio' ? 'dentro' : 'dentro';
    
    this.visitorService.updateVisitor(this.scanResult.visitor_id, { status: nextStatus }).subscribe({
      next: (response) => {
        this.scanResult.status = nextStatus;
        alert('Acceso aprobado correctamente');
      },
      error: (err) => {
        alert('Error al aprobar acceso');
        console.error('Error:', err);
      }
    });
  }

  registerExit(): void {
    if (!this.scanResult || !this.scanResult.visitor_id) return;
    
    this.visitorService.updateVisitor(this.scanResult.visitor_id, { status: 'salio' }).subscribe({
      next: (response) => {
        this.scanResult.status = 'salio';
        alert('Salida registrada correctamente');
      },
      error: (err) => {
        alert('Error al registrar salida');
        console.error('Error:', err);
      }
    });
  }

  approveResidentAccess(): void {
    alert('Acceso de residente aprobado');
    this.clearResult();
  }

  clearResult(): void {
    this.scanResult = null;
  }

  getStatusLabel(status: string): string {
    if (!status) return 'N/A';
    const statusMap: { [key: string]: string } = {
      'active': 'Activo',
      'dentro': 'Dentro',
      'salio': 'Salió',
      'salió': 'Salió'
    };
    return statusMap[status] || status;
  }

  goBack(): void {
    this.stopScanning();
    this.router.navigate(['/guard-dashboard']);
  }
}

