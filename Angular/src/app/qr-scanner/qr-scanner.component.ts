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
        showZoomSliderIfSupported: true,
        disableFlip: false,
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
        }
      );

      this.loading = false;
    } catch (err: any) {
      this.error = 'Error al iniciar el escáner: ' + (err.message || 'No se pudo acceder a la cámara');
      this.loading = false;
      this.isScanning = false;
      console.error('Error starting QR scanner:', err);
      
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
    
    let qrDataString = decodedText.trim();
    console.log('QR escaneado (texto original):', qrDataString);
    console.log('Longitud del texto:', qrDataString.length);
    
    try {
      if (qrDataString.startsWith('http')) {
        try {
          const url = new URL(qrDataString);
          const dataParam = url.searchParams.get('data');
          if (dataParam) {
            let decoded = dataParam;
            try {
              decoded = decodeURIComponent(dataParam);
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
          console.log('Error con URL API, intentando con regex:', urlError);
          const urlMatch = qrDataString.match(/[?&]data=([^&]*)/);
          if (urlMatch && urlMatch[1]) {
            try {
              let decoded = urlMatch[1];
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
              qrDataString = urlMatch[1];
              console.log('QR extraído de URL (sin decode):', qrDataString);
            }
          } else {
            console.log('No se encontró parámetro data con regex');
          }
        }
      }
    } catch (e) {
      console.log('QR no es una URL, usando texto directo:', qrDataString);
    }
    
    this.processQRData(qrDataString);
  }

  processManualInput(): void {
    if (!this.manualQRInput.trim()) {
      this.error = 'Por favor ingresa un código QR';
      return;
    }

    this.error = '';
    this.loading = true;

    let qrDataString = this.manualQRInput.trim();

    try {
      if (qrDataString.startsWith('http')) {
        const url = new URL(qrDataString);
        const dataParam = url.searchParams.get('data');
        if (dataParam) {
          qrDataString = decodeURIComponent(dataParam);
        }
      }
    } catch (e) {
    }

    this.processQRData(qrDataString);
    this.loading = false;
  }

  processQRData(qrDataString: string): void {
    this.error = '';
    this.loading = true;
    
    console.log('=== INICIANDO PROCESAMIENTO DE QR ===');
    console.log('QR Data String recibido:', qrDataString);
    console.log('Tipo de dato:', typeof qrDataString);
    console.log('Longitud:', qrDataString?.length);
    
    try {
      let qrData: any;
      let finalQrDataString = qrDataString.trim();
      
      try {
        qrData = JSON.parse(finalQrDataString);
        console.log('QR parseado directamente como JSON:', qrData);
      } catch (parseError) {
        console.log('No es JSON directo, intentando extraer de URL...');
        
        if (finalQrDataString.includes('data=')) {
          const urlMatch = finalQrDataString.match(/[?&]data=([^&]*)/);
          if (urlMatch && urlMatch[1]) {
            try {
              finalQrDataString = decodeURIComponent(urlMatch[1]);
              qrData = JSON.parse(finalQrDataString);
              console.log('QR extraído y parseado de URL:', qrData);
            } catch (decodeError) {
              console.error('Error al decodificar JSON de URL:', decodeError);
              const idMatch = finalQrDataString.match(/id[%":\s]*([0-9]+)/i);
              const typeMatch = finalQrDataString.match(/t[%":\s]*["']?resident["']?/i);
              if (idMatch) {
                const extractedId = idMatch[1];
                console.log('ID extraído de la URL:', extractedId);
                qrData = { t: 'resident', id: parseInt(extractedId) || extractedId };
                finalQrDataString = JSON.stringify(qrData);
              } else {
                throw new Error('No se pudo extraer datos del QR. Formato inválido.');
              }
            }
          } else {
            throw new Error('No se encontró parámetro data en la URL del QR');
          }
        } else {
          console.error('Formato de QR inválido:', parseError);
          console.error('Texto recibido:', finalQrDataString);
          throw new Error('Formato de QR inválido. El QR debe contener JSON o una URL con parámetro data.');
        }
      }
      
      console.log('QR Data parsed exitosamente:', qrData);
      console.log('QR Data String original:', qrDataString);
      console.log('QR Data String final:', finalQrDataString);
      
      let qrType = qrData.t || qrData.type;
      let qrId = qrData.id || qrData.visitor_id || qrData.event_id || qrData.user_id;
      
      console.log('Tipo extraído del QR:', qrType);
      console.log('ID extraído del QR:', qrId);
      console.log('Tipo de ID:', typeof qrId);
      
      if (!qrType || !qrId) {
        this.loading = false;
        console.error('QR inválido - falta tipo o ID. Tipo:', qrType, 'ID:', qrId);
        this.scanResult = {
          type: 'invalid',
          message: 'Código QR inválido: falta información de tipo o ID'
        };
        return;
      }
      
      const typeMap: { [key: string]: string } = {
        'visitor': 'visitor',
        'one-time': 'one-time',
        'event': 'event',
        'resident': 'resident'
      };
      qrType = typeMap[qrType] || qrType;
      
      let jsonStringForBackend = finalQrDataString;
      if (typeof finalQrDataString !== 'string' || finalQrDataString.includes('http')) {
        jsonStringForBackend = JSON.stringify(qrData);
      }
      
      if (qrType === 'visitor' || qrType === 'one-time' || qrType === 'event' || qrType === 'resident') {
        this.processVisitorOrEventQR(qrId.toString(), qrType, jsonStringForBackend);
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
    if (type === 'resident') {
      let residentId: number | string = id;
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        residentId = parsedId;
      }
      
      const jsonString = JSON.stringify({ t: 'resident', id: residentId });
      
      console.log('Enviando QR data al backend (residente):', jsonString);
      console.log('ID del residente (original):', id);
      console.log('ID del residente (procesado):', residentId);
      console.log('Tipo:', type);
      
      this.visitorService.decodeVisitorQR(jsonString).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Respuesta del backend para residente:', response);
          if (response.exito && response.visitor_info) {
            const residentInfo = response.visitor_info;
            this.scanResult = {
              type: 'resident',
              name: residentInfo.visitor_name || residentInfo.resident_name || '',
              user_name: residentInfo.resident_user_name || residentInfo.resident_name || residentInfo.visitor_name || '',
              user_id: residentInfo.visitor_id || id,
              fraccionamiento_id: residentInfo.fraccionamiento_id || '',
              fraccionamiento_name: residentInfo.fraccionamiento_name || '',
              house_number: residentInfo.resident_house_number || '',
              resident_address: residentInfo.resident_address || '',
              resident_street: residentInfo.resident_street || '',
              resident_house_number: residentInfo.resident_house_number || '',
              resident_email: residentInfo.resident_email || '',
              resident_phone: residentInfo.resident_phone || '',
              role: residentInfo.role || 'resident',
              timestamp: residentInfo.timestamp || ''
            };
            console.log('Scan result configurado para residente:', this.scanResult);
          } else {
            this.loading = false;
            console.error('Error en respuesta del backend:', response);
            this.scanResult = {
              type: 'invalid',
              message: response.mensaje || 'Error al decodificar QR de residente'
            };
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al decodificar QR de residente:', err);
          console.error('Error completo:', JSON.stringify(err, null, 2));
          this.scanResult = {
            type: 'invalid',
            message: err.error?.mensaje || 'Error al conectar con el servidor para validar el QR de residente'
          };
        }
      });
      return;
    }
    
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
        
        if (type === 'event') {
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
    let nextStatus = '';
    const normalizedStatus = (currentStatus || '').toLowerCase();
    
    if (normalizedStatus === 'active' || normalizedStatus === 'activo') {
      nextStatus = 'dentro';
    } else if (normalizedStatus === 'dentro') {
      nextStatus = 'salio';
    } else if (normalizedStatus === 'salio' || normalizedStatus === 'salió') {
      nextStatus = 'dentro';
    } else {
      nextStatus = 'dentro';
    }

    this.visitorService.updateVisitor(visitorId, { status: nextStatus }).subscribe({
      next: (updateResponse) => {
        console.log('Estado del visitante actualizado:', nextStatus);
        this.displayVisitorInfo(visitorId, qrDataString, nextStatus);
      },
      error: (updateErr) => {
        console.error('Error al actualizar estado del visitante:', updateErr);
        this.displayVisitorInfo(visitorId, qrDataString, currentStatus);
      }
    });
  }

  displayVisitorInfo(visitorId: string, qrDataString: string, currentStatus: string): void {
    if (this.isAdmin) {
      this.visitorService.decodeVisitorQR(qrDataString).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.exito && response.visitor_info) {
            const info = response.visitor_info;
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
            this.getVisitorInfoDirectly(visitorId, currentStatus);
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error decoding QR from backend:', err);
          this.getVisitorInfoDirectly(visitorId, currentStatus);
        }
      });
    } else {
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

