import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VisitorService } from '../services/visitor.service';
import { QRHelperService } from '../services/qr-helper.service';
import { Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css']
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
    private visitorService: VisitorService,
    private qrHelper: QRHelperService
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
    this.isScanning = true;

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const containerId = 'qr-reader';
      
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error('Contenedor del escáner no encontrado');
      }

      container.innerHTML = '';

      this.html5QrCode = new Html5Qrcode(containerId);

      const config = {
        fps: 30,
        qrbox: (w: number, h: number) => {
          const size = Math.floor(Math.min(w, h) * 0.8);
          return { width: size, height: size };
        },
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        disableFlip: false,
        videoConstraints: { facingMode: 'environment' }
      };
      await this.html5QrCode.start({ facingMode: 'environment' }, config,
        (decodedText) => this.onScanSuccess(decodedText), () => {});

      this.loading = false;
    } catch (err: any) {
      this.error = 'Error al iniciar el escáner: ' + (err.message || 'No se pudo acceder a la cámara');
      this.loading = false;
      this.isScanning = false;
      if (this.html5QrCode) {
        try {
          await this.html5QrCode.clear();
        } catch {}
        this.html5QrCode = null;
      }
    }
  }

  async stopScanning(): Promise<void> {
    if (this.html5QrCode) {
      try {
        await this.html5QrCode.stop();
        await this.html5QrCode.clear();
      } catch {}
      this.html5QrCode = null;
    }
    this.isScanning = false;
  }

  private extractQRFromString(input: string): string {
    let qrDataString = input.trim();
    try {
      if (qrDataString.startsWith('http')) {
        try {
          const url = new URL(qrDataString);
          const dataParam = url.searchParams.get('data');
          if (dataParam) {
            let decoded = dataParam;
            try {
              decoded = decodeURIComponent(dataParam);
              if (decoded.includes('%')) decoded = decodeURIComponent(decoded);
            } catch {}
            qrDataString = decoded;
          }
        } catch {
          const urlMatch = qrDataString.match(/[?&]data=([^&]*)/);
          if (urlMatch && urlMatch[1]) {
            try {
              let decoded = urlMatch[1];
              try {
                decoded = decodeURIComponent(decoded);
                if (decoded.includes('%')) decoded = decodeURIComponent(decoded);
              } catch {}
              qrDataString = decoded;
            } catch {
              qrDataString = urlMatch[1];
            }
          }
        }
      }
    } catch {}
    return qrDataString;
  }

  async onScanSuccess(decodedText: string): Promise<void> {
    await this.stopScanning();
    this.processQRData(this.extractQRFromString(decodedText));
  }

  processManualInput(): void {
    if (!this.manualQRInput.trim()) {
      this.error = 'Por favor ingresa un código QR';
      return;
    }
    this.error = '';
    this.loading = true;
    this.processQRData(this.extractQRFromString(this.manualQRInput));
    this.loading = false;
  }

  processQRData(qrDataString: string): void {
    this.error = '';
    this.loading = true;
    try {
      let qrData: any;
      let finalQrDataString = qrDataString.trim();
      try {
        qrData = JSON.parse(finalQrDataString);
      } catch {
        if (finalQrDataString.includes('data=')) {
          const urlMatch = finalQrDataString.match(/[?&]data=([^&]*)/);
          if (urlMatch && urlMatch[1]) {
            try {
              finalQrDataString = decodeURIComponent(urlMatch[1]);
              qrData = JSON.parse(finalQrDataString);
            } catch {
              const idMatch = finalQrDataString.match(/id[%":\s]*([0-9]+)/i);
              if (idMatch) {
                qrData = { t: 'resident', id: parseInt(idMatch[1]) || idMatch[1] };
                finalQrDataString = JSON.stringify(qrData);
              } else {
                throw new Error('No se pudo extraer datos del QR. Formato inválido.');
              }
            }
          } else {
            throw new Error('No se encontró parámetro data en la URL del QR');
          }
        } else {
          throw new Error('Formato de QR inválido. El QR debe contener JSON o una URL con parámetro data.');
        }
      }
      let qrType = qrData.t || qrData.type;
      let qrId = qrData.id || qrData.visitor_id || qrData.event_id || qrData.user_id;
      if (!qrType || !qrId) {
        this.loading = false;
        this.scanResult = { type: 'invalid', message: 'Código QR inválido: falta información de tipo o ID' };
        return;
      }
      const typeMap: { [key: string]: string } = { visitor: 'visitor', 'one-time': 'one-time', event: 'event', resident: 'resident' };
      qrType = typeMap[qrType] || qrType;
      const jsonStringForBackend = (typeof finalQrDataString !== 'string' || finalQrDataString.includes('http')) ? JSON.stringify(qrData) : finalQrDataString;
      if (qrType === 'visitor' || qrType === 'one-time' || qrType === 'event' || qrType === 'resident') {
        this.processVisitorOrEventQR(qrId.toString(), qrType, jsonStringForBackend);
      } else {
        this.loading = false;
        this.scanResult = { type: 'invalid', message: 'Código QR no reconocido' };
      }
    } catch (error) {
      this.loading = false;
      this.error = 'Error al decodificar el código QR. Asegúrate de que sea un código QR válido del sistema.';
      console.error('Error decoding QR:', error);
    }
  }

  private createEventResult(visitor: any, info: any, visitorId: string): any {
    return {
      type: 'event', event_name: info.event_name || visitor.name || '',
      visitor_id: info.visitor_id || visitorId, event_id: info.visitor_id || visitor.id,
      event_date: info.event_date || visitor.eventDate || '', event_time: info.event_time || visitor.eventTime || '',
      number_of_guests: info.number_of_guests || visitor.numberOfGuests || '',
      event_location: info.event_location || visitor.eventLocation || '',
      resident_name: info.resident_name || '', resident_address: info.resident_address || '',
      timestamp: info.timestamp || visitor.created_at || ''
    };
  }

  private createResidentResult(info: any, id: string): any {
    return {
      type: 'resident', name: info.visitor_name || info.resident_name || '',
      user_name: info.resident_user_name || info.resident_name || info.visitor_name || '',
      user_id: info.visitor_id || id, fraccionamiento_id: info.fraccionamiento_id || '',
      fraccionamiento_name: info.fraccionamiento_name || '', house_number: info.resident_house_number || '',
      resident_address: info.resident_address || '', resident_street: info.resident_street || '',
      resident_house_number: info.resident_house_number || '', resident_email: info.resident_email || '',
      resident_phone: info.resident_phone || '', role: info.role || 'resident', timestamp: info.timestamp || ''
    };
  }

  private createVisitorResult(info: any, visitorId: string, currentStatus: string): any {
    return info.visitor_type === 'event' ? {
      type: 'event', event_name: info.event_name || '', visitor_id: info.visitor_id || visitorId,
      event_id: info.visitor_id || visitorId, event_date: info.event_date || '',
      event_time: info.event_time || '', number_of_guests: info.number_of_guests || '',
      event_location: info.event_location || '', resident_name: info.resident_name || '',
      resident_address: info.resident_address || '', timestamp: info.timestamp || '', status: currentStatus
    } : {
      type: info.visitor_type || 'visitor', visitor_name: info.visitor_name || '',
      visitor_id: info.visitor_id || visitorId, resident_name: info.resident_name || '',
      resident_address: info.resident_address || '', resident_street: info.resident_street || '',
      resident_house_number: info.resident_house_number || '', timestamp: info.timestamp || '', status: currentStatus
    };
  }

  processVisitorOrEventQR(id: string, type: string, qrDataString: string): void {
    if (type === 'resident') {
      const residentId = !isNaN(parseInt(id)) ? parseInt(id) : id;
      this.visitorService.decodeVisitorQR(JSON.stringify({ t: 'resident', id: residentId })).subscribe({
        next: (res) => {
          this.loading = false;
          this.scanResult = (res.exito && res.visitor_info) ? this.createResidentResult(res.visitor_info, id)
            : { type: 'invalid', message: res.mensaje || 'Error al decodificar QR de residente' };
        },
        error: (err) => {
          this.loading = false;
          this.scanResult = { type: 'invalid', message: err.error?.mensaje || 'Error al conectar con el servidor para validar el QR de residente' };
        }
      });
      return;
    }
    this.visitorService.getVisitor(id).subscribe({
      next: (res) => {
        const visitor = res.visitor || (res.exito && res.visitor);
        if (!visitor) {
          this.loading = false;
          this.scanResult = { type: 'invalid', message: 'Visitante o evento no encontrado' };
          return;
        }
        if (type === 'event') {
          this.visitorService.decodeVisitorQR(qrDataString).subscribe({
            next: (qrRes) => {
              this.loading = false;
              this.scanResult = this.createEventResult(visitor, qrRes.exito && qrRes.visitor_info ? qrRes.visitor_info : {}, id);
            },
            error: () => { this.loading = false; this.scanResult = this.createEventResult(visitor, {}, id); }
          });
          return;
        }
        this.updateVisitorStatusOnScan(id, visitor.status || 'active', qrDataString);
      },
      error: () => { this.loading = false; this.scanResult = { type: 'invalid', message: 'Error al obtener información del visitante o evento' }; }
    });
  }

  updateVisitorStatusOnScan(visitorId: string, currentStatus: string, qrDataString: string): void {
    const normalizedStatus = (currentStatus || '').toLowerCase();
    const nextStatus = (normalizedStatus === 'active' || normalizedStatus === 'activo' || normalizedStatus === 'salio' || normalizedStatus === 'salió') ? 'dentro' : 'salio';
    this.visitorService.updateVisitor(visitorId, { status: nextStatus }).subscribe({
      next: () => this.displayVisitorInfo(visitorId, qrDataString, nextStatus),
      error: () => this.displayVisitorInfo(visitorId, qrDataString, currentStatus)
    });
  }

  displayVisitorInfo(visitorId: string, qrDataString: string, currentStatus: string): void {
    if (!this.isAdmin) {
      this.getVisitorInfoDirectly(visitorId, currentStatus);
      return;
    }
    this.visitorService.decodeVisitorQR(qrDataString).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.exito && res.visitor_info) {
          this.scanResult = this.createVisitorResult(res.visitor_info, visitorId, currentStatus);
        } else {
          this.getVisitorInfoDirectly(visitorId, currentStatus);
        }
      },
      error: () => this.getVisitorInfoDirectly(visitorId, currentStatus)
    });
  }

  getVisitorInfoDirectly(visitorId: string, currentStatus: string): void {
    this.visitorService.getVisitor(visitorId).subscribe({
      next: (res) => {
        this.loading = false;
        const visitor = res.visitor || (res.exito && res.visitor);
        if (visitor) {
          this.scanResult = {
            type: visitor.type || 'visitor', visitor_name: visitor.name || '',
            visitor_id: visitor.id || visitorId, timestamp: visitor.created_at || '', status: currentStatus
          };
        } else {
          this.scanResult = { type: 'invalid', message: 'Visitante no encontrado' };
        }
      },
      error: () => {
        this.loading = false;
        this.scanResult = { type: 'invalid', message: 'Error al obtener información del visitante' };
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
      return new Date() > new Date(expiresAt);
    } catch {
      return false;
    }
  }

  formatExpirationDate(expiresAt: string): string {
    if (!expiresAt) return 'N/A';
    try {
      const timeRemaining = new Date(expiresAt).getTime() - new Date().getTime();
      if (timeRemaining <= 0) return 'Expirado';
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      return hoursRemaining > 0 ? `${hoursRemaining}h ${minutesRemaining}m restantes` : `${minutesRemaining}m restantes`;
    } catch {
      return 'N/A';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('es-ES');
    } catch {
      return dateString;
    }
  }

  formatEventDate(dateString: string): string {
    const result = this.qrHelper.formatDate(dateString);
    return result || 'N/A';
  }

  formatEventTime(timeString: string): string {
    const result = this.qrHelper.formatTime(timeString);
    return result || 'N/A';
  }

  getLocationLabel(location: string): string {
    const locationMap: { [key: string]: string } = { domicilio: 'Domicilio', casa_club: 'Casa club', lago: 'Lago', kiosco: 'Kiosco' };
    return this.qrHelper.getLocationLabel(location, locationMap);
  }

  goBack(): void {
    this.stopScanning();
    this.router.navigate(['/dashboard']);
  }
}

