import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VisitorService } from '../../services/visitor.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit {
  selectedRegistrationType: string = '';
  
  // Datos para visitante frecuente
  visitor: any = {
    name: '',
    email: '',
    phone: '',
    type: 'visitor',
    status: 'active',
    entryDate: ''
  };
  
  // Datos para proveedor
  providerData: any = {
    company: '',
    serviceDate: ''
  };
  
  // Datos para registro solo una vez
  oneTimeData: any = {
    name: '',
    entryDate: ''
  };
  
  // Datos para registro de eventos
  eventData: any = {
    name: '',
    eventDate: '',
    eventTime: '',
    numberOfGuests: '',
    location: ''
  };
  
  // Opciones de lugar para eventos
  locationOptions = [
    { value: 'domicilio', label: 'Domicilio' },
    { value: 'casa_club', label: 'Casa club' },
    { value: 'lago', label: 'Lago' },
    { value: 'kiosco', label: 'Kiosco' }
  ];
  
  // Dirección del residente
  residentAddress: string = '';
  loadingAddress: boolean = false;
  
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
    private authService: AuthService
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
    if (!profile || !profile.email) return;
    
    this.loadingAddress = true;
    this.visitorService.getResidentAddress(profile.email).subscribe({
      next: (response) => {
        this.loadingAddress = false;
        if (response.exito && response.address) {
          this.residentAddress = response.address;
        } else {
          this.residentAddress = '';
        }
      },
      error: (err) => {
        this.loadingAddress = false;
        console.error('Error al cargar dirección del residente:', err);
        this.residentAddress = '';
      }
    });
  }

  onLocationChange(): void {
    // Cuando se selecciona "Domicilio", asegurarse de que la dirección esté cargada
    if (this.eventData.location === 'domicilio' && !this.residentAddress) {
      this.loadResidentAddress();
    }
  }

  onSubmit(): void {
    // Método genérico que redirige según el tipo seleccionado
    if (!this.selectedRegistrationType) {
      // Si no hay tipo seleccionado, usar el formulario de visitante frecuente por defecto
      this.onSubmitFrequentVisitor();
      return;
    }

    switch (this.selectedRegistrationType) {
      case 'frequent':
        this.onSubmitFrequentVisitor();
        break;
      case 'provider':
        this.onSubmitProvider();
        break;
      case 'one-time':
        this.onSubmitOneTime();
        break;
      case 'event':
        this.onSubmitEvent();
        break;
      default:
        this.onSubmitFrequentVisitor();
    }
  }

  selectRegistrationType(type: string): void {
    this.selectedRegistrationType = type;
    this.error = '';
  }

  onSubmitProvider(): void {
    if (this.loading) return;
    
    if (!this.providerData.company) {
      this.error = 'El nombre de la empresa es requerido';
      return;
    }

    this.loading = true;
    this.error = '';

    // Obtener el ID del usuario actual
    const currentUser = this.authService.getCurrentUser();
    const profile = this.authService.getCachedProfile();
    const userId = currentUser?.id || profile?.id;

    // Preparar datos del proveedor
    const providerVisitor = {
      name: this.providerData.company,
      email: '',
      phone: '',
      type: 'provider',
      status: 'active',
      serviceDate: this.providerData.serviceDate,
      created_by: userId ? parseInt(userId.toString()) : null
    };

    this.visitorService.createVisitor(providerVisitor).subscribe({
      next: (response) => {
        if (response.exito) {
          this.router.navigate([this.getRedirectRoute()]);
        } else {
          this.error = response.mensaje || 'Error al registrar proveedor';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  onSubmitFrequentVisitor(): void {
    if (this.loading) return;

    if (!this.visitor.name) {
      this.error = 'El nombre completo es requerido';
      return;
    }

    this.loading = true;
    this.error = '';

    // Obtener el ID del usuario actual
    const currentUser = this.authService.getCurrentUser();
    const profile = this.authService.getCachedProfile();
    const userId = currentUser?.id || profile?.id;

    const frequentVisitor = {
      name: this.visitor.name,
      email: this.visitor.email || '',
      phone: this.visitor.phone || '',
      type: 'visitor',
      status: 'active',
      entryDate: this.visitor.entryDate || null,
      created_by: userId ? parseInt(userId.toString()) : null
    };

    this.visitorService.createVisitor(frequentVisitor).subscribe({
      next: (response) => {
        if (response.exito) {
          this.router.navigate([this.getRedirectRoute()]);
        } else {
          this.error = response.mensaje || 'Error al registrar visitante frecuente';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
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
    if (this.loading) return;

    if (!this.oneTimeData.name) {
      this.error = 'El nombre completo es requerido';
      return;
    }

    this.loading = true;
    this.error = '';

    // Obtener el ID del usuario actual
    const currentUser = this.authService.getCurrentUser();
    const profile = this.authService.getCachedProfile();
    const userId = currentUser?.id || profile?.id;

    const oneTimeVisitor = {
      name: this.oneTimeData.name,
      email: '',
      phone: '',
      type: 'one-time',
      status: 'active',
      entryDate: this.oneTimeData.entryDate || null,
      created_by: userId ? parseInt(userId.toString()) : null
    };

    this.visitorService.createVisitor(oneTimeVisitor).subscribe({
      next: (response) => {
        if (response.exito) {
          this.router.navigate([this.getRedirectRoute()]);
        } else {
          this.error = response.mensaje || 'Error al registrar visitante';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  get hasOneTimeDate(): boolean {
    return !!this.oneTimeData.entryDate;
  }

  onSubmitEvent(): void {
    if (this.loading) return;

    if (!this.eventData.name) {
      this.error = 'El nombre del evento es requerido';
      return;
    }

    this.loading = true;
    this.error = '';

    // Obtener el ID del usuario actual
    const currentUser = this.authService.getCurrentUser();
    const profile = this.authService.getCachedProfile();
    const userId = currentUser?.id || profile?.id;

    // Preparar datos del evento
    const eventVisitor = {
      name: this.eventData.name,
      email: '',
      phone: '',
      type: 'event',
      status: 'active',
      eventDate: this.eventData.eventDate || null,
      eventTime: this.eventData.eventTime || null,
      numberOfGuests: this.eventData.numberOfGuests || null,
      eventLocation: this.eventData.location || null,
      created_by: userId ? parseInt(userId.toString()) : null
    };

    this.visitorService.createVisitor(eventVisitor).subscribe({
      next: (response) => {
        if (response.exito) {
          this.createdEvent = response.visitor || response.data;
          // Generar QR automáticamente después de crear el evento
          if (this.createdEvent?.id) {
            this.generateEventQR(this.createdEvent.id);
          } else {
            this.router.navigate([this.getRedirectRoute()]);
          }
        } else {
          this.error = response.mensaje || 'Error al registrar evento';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  generateEventQR(eventId: string): void {
    this.loading = true;
    this.visitorService.generateEventQR(eventId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.exito) {
          // Usar event_info si está disponible, de lo contrario parsear qr_data
          if (response.event_info) {
            this.eventQRData = JSON.parse(response.event_info);
          } else {
            // Fallback: intentar obtener información del evento desde la respuesta
            this.eventQRData = response.event || {};
            // Si no hay event_info, crear un objeto básico
            if (!this.eventQRData.event_name && response.event) {
              this.eventQRData = {
                event_name: response.event.name || '',
                event_date: response.event.eventDate || '',
                event_time: response.event.eventTime || '',
                number_of_guests: response.event.numberOfGuests || '',
                event_location: response.event.eventLocation || response.event.event_location || '',
                resident_name: response.event.resident_name || '',
                resident_address: ''
              };
            }
          }
          this.qrCodeUrl = response.qr_code_url;
          this.showQRModal = true;
        } else {
          this.error = response.mensaje || 'Error al generar código QR';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.mensaje || 'Error al generar código QR';
      }
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

    // Crear una imagen para cargar el QR
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Crear un canvas para combinar el QR y la información del evento
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Configurar dimensiones del canvas
      const qrSize = 400; // Tamaño del QR
      const padding = 40;
      const infoHeight = this.eventQRData ? 200 : 120; // Más espacio si hay información del evento
      const canvasWidth = qrSize + (padding * 2);
      const canvasHeight = qrSize + infoHeight + (padding * 3);
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Dibujar el QR code
      ctx.drawImage(img, padding, padding, qrSize, qrSize);
      
      // Configurar el texto
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      let yPos = qrSize + padding + 20;
      
      // Si hay información del evento, mostrar información del evento
      if (this.eventQRData) {
        // Título del evento
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText(this.eventQRData.event_name || 'Evento', canvasWidth / 2, yPos);
        yPos += 30;
        
        // Información del evento
        ctx.font = '14px Arial, sans-serif';
        
        if (this.eventQRData.event_date) {
          ctx.fillText(`Fecha: ${this.formatDate(this.eventQRData.event_date)}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.event_time) {
          ctx.fillText(`Hora: ${this.formatTime(this.eventQRData.event_time)}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.number_of_guests) {
          ctx.fillText(`Invitados: ${this.eventQRData.number_of_guests}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.resident_name) {
          ctx.fillText(`Anfitrión: ${this.eventQRData.resident_name}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.resident_address && this.eventQRData.event_location === 'domicilio') {
          ctx.fillText(`Dirección: ${this.eventQRData.resident_address}`, canvasWidth / 2, yPos);
          yPos += 20;
        } else if (this.eventQRData.event_location && this.eventQRData.event_location !== 'domicilio') {
          ctx.fillText(`Lugar: ${this.getLocationLabel(this.eventQRData.event_location)}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
      } else {
        // Texto genérico si no hay información del evento
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('Acceso', canvasWidth / 2, yPos);
        yPos += 30;
        
        ctx.font = '16px Arial, sans-serif';
        ctx.fillText('Escanea este código para ingresar de forma segura.', canvasWidth / 2, yPos);
        yPos += 20;
        ctx.fillText('Uso exclusivo de personal autorizado.', canvasWidth / 2, yPos);
      }
      
      // Convertir canvas a imagen y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `QR-Evento-${this.eventData.name || this.eventQRData?.event_name || 'evento'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };
    
    img.onerror = () => {
      // Si falla, descargar directamente sin texto
      const link = document.createElement('a');
      link.href = this.qrCodeUrl;
      link.download = `QR-Evento-${this.eventData.name || 'evento'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    img.src = this.qrCodeUrl;
  }

  get hasEventDate(): boolean {
    return !!this.eventData.eventDate;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    // Formato HH:mm a formato 12 horas
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  formatDateDisplay(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Formato: DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
}

