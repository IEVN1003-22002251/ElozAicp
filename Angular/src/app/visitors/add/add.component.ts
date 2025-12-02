import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VisitorService } from '../../services/visitor.service';
import { AuthService } from '../../services/auth.service';
import { QRCanvasService } from '../../services/qr-canvas.service';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit {
  selectedRegistrationType = '';
  visitor: any = { name: '', email: '', phone: '', type: 'visitor', status: 'active', entryDate: '' };
  providerData: any = { company: '', serviceDate: '' };
  oneTimeData: any = { name: '', entryDate: '' };
  eventData: any = { name: '', eventDate: '', eventTime: '', numberOfGuests: '', location: '' };
  locationOptions = [
    { value: 'domicilio', label: 'Domicilio' }, { value: 'casa_club', label: 'Casa club' },
    { value: 'lago', label: 'Lago' }, { value: 'kiosco', label: 'Kiosco' }
  ];
  residentAddress = '';
  loadingAddress = false;
  loading = false;
  error = '';
  showQRModal = false;
  qrCodeUrl = '';
  eventQRData: any = null;
  createdEvent: any = null;

  constructor(
    private visitorService: VisitorService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private qrCanvasService: QRCanvasService
  ) {}

  private isResident(): boolean {
    const profile = this.authService.getCachedProfile();
    if (!profile) return false;
    const role = profile.role?.toLowerCase();
    return role === 'resident' || role === 'residente';
  }

  private getRedirectRoute(): string {
    // Si es residente, regresar a pre-register, si no, al historial
    return this.isResident() ? '/pre-register' : '/history';
  }

  ngOnInit(): void {
    // Verificar si hay un query parameter para seleccionar automáticamente el tipo
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.selectRegistrationType(params['type']);
      }
    });
    
    // Cargar la dirección del residente si es residente
    this.loadResidentAddress();
  }

  loadResidentAddress(): void {
    const profile = this.authService.getCachedProfile();
    if (!profile?.email) return;
    this.loadingAddress = true;
    this.visitorService.getResidentAddress(profile.email).subscribe({
      next: (res) => {
        this.loadingAddress = false;
        this.residentAddress = (res.exito && res.address) ? res.address : '';
      },
      error: () => { this.loadingAddress = false; this.residentAddress = ''; }
    });
  }

  onLocationChange(): void {
    if (this.eventData.location === 'domicilio' && !this.residentAddress) this.loadResidentAddress();
  }

  onSubmit(): void {
    if (!this.selectedRegistrationType) {
      this.onSubmitFrequentVisitor();
      return;
    }
    const handlers: { [key: string]: () => void } = {
      frequent: () => this.onSubmitFrequentVisitor(),
      provider: () => this.onSubmitProvider(),
      'one-time': () => this.onSubmitOneTime(),
      event: () => this.onSubmitEvent()
    };
    const handler = handlers[this.selectedRegistrationType];
    if (handler) {
      handler();
    } else {
      this.onSubmitFrequentVisitor();
    }
  }

  selectRegistrationType(type: string): void {
    this.selectedRegistrationType = type;
    this.error = '';
  }

  private createVisitor(data: any, errorMsg: string): void {
    if (this.loading) return;
    this.loading = true;
    this.error = '';
    const userId = this.authService.getCurrentUser()?.id || this.authService.getCachedProfile()?.id;
    const visitor = { ...data, created_by: userId ? parseInt(userId.toString()) : null };
    this.visitorService.createVisitor(visitor).subscribe({
      next: (res) => {
        if (res.exito) this.router.navigate([this.getRedirectRoute()]);
        else { this.error = res.mensaje || errorMsg; this.loading = false; }
      },
      error: (err) => { this.error = err.error?.mensaje || 'Error al conectar con el servidor'; this.loading = false; }
    });
  }

  onSubmitProvider(): void {
    if (!this.providerData.company) { this.error = 'El nombre de la empresa es requerido'; return; }
    this.createVisitor({
      name: this.providerData.company, email: '', phone: '', type: 'provider', status: 'active', serviceDate: this.providerData.serviceDate
    }, 'Error al registrar proveedor');
  }

  onSubmitFrequentVisitor(): void {
    if (!this.visitor.name) { this.error = 'El nombre completo es requerido'; return; }
    this.createVisitor({
      name: this.visitor.name, email: this.visitor.email || '', phone: this.visitor.phone || '',
      type: 'visitor', status: 'active', entryDate: this.visitor.entryDate || null
    }, 'Error al registrar visitante frecuente');
  }

  cancel(): void {
    if (this.selectedRegistrationType) {
      // Regresar a la vista de pre-registro
      this.router.navigate(['/pre-register']);
    } else {
      // Si es admin, regresar al historial; si es residente, al home
      const profile = this.authService.getCachedProfile();
      const isAdmin = profile?.role === 'admin';
      this.router.navigate([isAdmin ? '/history' : '/home']);
    }
  }

  get hasDate(): boolean {
    return !!this.providerData.serviceDate;
  }

  get hasEntryDate(): boolean {
    return !!this.visitor.entryDate;
  }

  onSubmitOneTime(): void {
    if (!this.oneTimeData.name) { this.error = 'El nombre completo es requerido'; return; }
    this.createVisitor({
      name: this.oneTimeData.name, email: '', phone: '', type: 'one-time', status: 'active', entryDate: this.oneTimeData.entryDate || null
    }, 'Error al registrar visitante');
  }

  get hasOneTimeDate(): boolean {
    return !!this.oneTimeData.entryDate;
  }

  onSubmitEvent(): void {
    if (!this.eventData.name) { this.error = 'El nombre del evento es requerido'; return; }
    this.loading = true;
    this.error = '';
    const userId = this.authService.getCurrentUser()?.id || this.authService.getCachedProfile()?.id;
    const eventVisitor = {
      name: this.eventData.name, email: '', phone: '', type: 'event', status: 'active',
      eventDate: this.eventData.eventDate || null, eventTime: this.eventData.eventTime || null,
      numberOfGuests: this.eventData.numberOfGuests || null, eventLocation: this.eventData.location || null,
      created_by: userId ? parseInt(userId.toString()) : null
    };
    this.visitorService.createVisitor(eventVisitor).subscribe({
      next: (res) => {
        if (res.exito) {
          this.createdEvent = res.visitor || res.data;
          if (this.createdEvent?.id) this.generateEventQR(this.createdEvent.id);
          else this.router.navigate([this.getRedirectRoute()]);
        } else {
          this.error = res.mensaje || 'Error al registrar evento';
          this.loading = false;
        }
      },
      error: (err) => { this.error = err.error?.mensaje || 'Error al conectar con el servidor'; this.loading = false; }
    });
  }

  generateEventQR(eventId: string): void {
    this.loading = true;
    this.visitorService.generateEventQR(eventId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.exito) {
          if (res.event_info) {
            this.eventQRData = JSON.parse(res.event_info);
          } else {
            this.eventQRData = res.event || {};
            if (!this.eventQRData.event_name && res.event) {
              this.eventQRData = {
                event_name: res.event.name || '', event_date: res.event.eventDate || '',
                event_time: res.event.eventTime || '', number_of_guests: res.event.numberOfGuests || '',
                event_location: res.event.eventLocation || res.event.event_location || '',
                resident_name: res.event.resident_name || '', resident_address: ''
              };
            }
          }
          this.qrCodeUrl = res.qr_code_url;
          this.showQRModal = true;
        } else {
          this.error = res.mensaje || 'Error al generar código QR';
        }
      },
      error: (err) => { this.loading = false; this.error = err.error?.mensaje || 'Error al generar código QR'; }
    });
  }

  closeQRModal(): void {
    this.showQRModal = false;
    this.qrCodeUrl = '';
    this.eventQRData = null;
    this.router.navigate([this.getRedirectRoute()]);
  }

  downloadQR(): void {
    if (!this.qrCodeUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const fileName = `QR-Evento-${this.eventData.name || this.eventQRData?.event_name || 'evento'}.png`;
    const downloadFile = (url: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.onload = () => {
      try {
        const canvas = this.qrCanvasService.createCanvasWithQR(img, this.eventQRData || undefined,
          (d: string) => this.formatDate(d), (t: string) => this.formatTime(t), (l: string) => this.getLocationLabel(l));
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            downloadFile(url);
            URL.revokeObjectURL(url);
          } else {
            downloadFile(this.qrCodeUrl);
          }
        }, 'image/png');
      } catch {
        downloadFile(this.qrCodeUrl);
      }
    };
    img.onerror = () => downloadFile(this.qrCodeUrl);
    img.src = this.qrCodeUrl;
  }

  get hasEventDate(): boolean {
    return !!this.eventData.eventDate;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  formatDateDisplay(dateString: string): string {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  getLocationLabel(location: string): string {
    if (!location) return '';
    const locationMap: { [key: string]: string } = {
      domicilio: 'Domicilio', casa_club: 'Casa club', lago: 'Lago', kiosco: 'Kiosco'
    };
    return locationMap[location] || location;
  }
}

