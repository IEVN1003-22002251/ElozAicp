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
  templateUrl: './guard-qr-scanner.component.html',
  styleUrls: ['./guard-qr-scanner.component.css']
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

