import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VisitorService } from '../services/visitor.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  selectedFilter: 'all' | 'visitors' | 'providers' | 'events' = 'all';
  completedRecords: number = 0;
  records: any[] = [];
  filteredRecords: any[] = [];
  loading: boolean = false;
  isAdmin: boolean = false;
  showQRModal: boolean = false;
  selectedVisitorForQR: any = null;
  selectedEventForQR: any = null;
  selectedVisitorQR: string = '';
  selectedEventQR: string = '';
  loadingQR: boolean = false;
  qrDecodedInfo: any = null;
  eventQRData: any = null;
  showEditEventModal: boolean = false;
  editingEvent: any = null;
  savingEvent: boolean = false;
  editEventError: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private visitorService: VisitorService
  ) {}

  ngOnInit(): void {
    const profile = this.authService.getCachedProfile();
    this.isAdmin = profile?.role === 'admin';
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    const profile = this.authService.getCachedProfile();
    
    if (!currentUser && !profile) {
      this.loading = false;
      this.records = [];
      this.filterRecords();
      return;
    }

    // Verificar si el usuario es admin
    const isAdmin = profile?.role === 'admin';
    
    // Si es admin, no pasar user_id para obtener todos los registros
    // Si no es admin, obtener solo los registros del usuario
    const params: any = {};
    
    if (!isAdmin) {
      const userId = currentUser?.id || profile?.id;
      
      if (!userId) {
        this.loading = false;
        this.records = [];
        this.filterRecords();
        return;
      }

      // Convertir el ID a número si es necesario (created_by es INT en la BD)
      const userIdNumber = typeof userId === 'string' ? parseInt(userId) : userId;
      params.user_id = userIdNumber.toString();
    }

    // Cargar visitantes (todos si es admin, solo del usuario si no es admin)
    this.visitorService.getVisitors(params).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.visitors || response.data) {
          const visitors = response.visitors || response.data || [];
          
          // Mapear los visitantes a registros con tipo
          this.records = visitors.map((visitor: any) => ({
            id: visitor.id,
            name: visitor.name,
            email: visitor.email,
            phone: visitor.phone,
            type: this.mapVisitorTypeToRecordType(visitor.type),
            originalType: visitor.type, // Guardar el tipo original para verificar si es 'visitor'
            status: visitor.status,
            created_at: visitor.created_at,
            created_by: visitor.created_by,
            address: visitor.address || null,
            codigo_qr: visitor.codigo_qr || null, // Incluir el código QR si existe
            eventDate: visitor.eventDate || null, // Para eventos
            eventTime: visitor.eventTime || null, // Para eventos
            numberOfGuests: visitor.numberOfGuests || null, // Para eventos
            eventLocation: visitor.eventLocation || null, // Para eventos
            updating: false,
            loadingQR: false,
            editing: false
          }));
          
          // Ordenar por fecha de creación descendente (más nuevos primero)
          this.records.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA; // Orden descendente
          });
        } else {
          this.records = [];
        }
        this.filterRecords();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cargar registros:', err);
        this.records = [];
        this.filterRecords();
      }
    });
  }

  mapVisitorTypeToRecordType(visitorType: string): string {
    // Mapear tipos de visitantes a tipos de registros
    const typeMap: { [key: string]: string } = {
      'visitor': 'visitors',
      'one-time': 'visitors',
      'provider': 'providers',
      'event': 'events'
    };
    return typeMap[visitorType] || 'visitors';
  }

  setFilter(filter: 'all' | 'visitors' | 'providers' | 'events'): void {
    this.selectedFilter = filter;
    this.filterRecords();
  }

  filterRecords(): void {
    if (this.selectedFilter === 'all') {
      this.filteredRecords = this.records;
    } else {
      this.filteredRecords = this.records.filter(record => {
        if (this.selectedFilter === 'visitors') {
          // Incluir visitantes frecuentes (visitor) y solo una vez (one-time)
          return record.type === 'visitors';
        } else if (this.selectedFilter === 'providers') {
          return record.type === 'providers';
        } else if (this.selectedFilter === 'events') {
          return record.type === 'events';
        }
        return false;
      });
    }
    this.completedRecords = this.filteredRecords.length;
  }

  goBack(): void {
    // Si es admin, regresar al dashboard; si es residente, regresar al home
    if (this.isAdmin) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  openDatePicker(): void {
    // Implementar selector de fecha
    console.log('Abrir selector de fecha');
  }

  goToAddVisitor(): void {
    this.router.navigate(['/pre-register']);
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'visitors': 'Visitante',
      'providers': 'Proveedor',
      'events': 'Evento'
    };
    return labels[type] || 'Registro';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEmptyMessage(): string {
    const profile = this.authService.getCachedProfile();
    const isAdmin = profile?.role === 'admin';
    
    if (this.records.length === 0) {
      if (isAdmin) {
        return 'No hay registros en el sistema aún. Los registros aparecerán aquí cuando los residentes los creen.';
      }
      return 'No has realizado ningún registro aún. Tus registros aparecerán aquí cuando los crees.';
    }
    
    switch (this.selectedFilter) {
      case 'visitors':
        return isAdmin 
          ? 'No hay registros de visitantes en el sistema aún.'
          : 'No tienes registros de visitantes (frecuentes o solo una vez) aún.';
      case 'providers':
        return isAdmin
          ? 'No hay registros de proveedores en el sistema aún.'
          : 'No tienes registros de proveedores aún.';
      case 'events':
        return isAdmin
          ? 'No hay registros de eventos en el sistema aún.'
          : 'No tienes registros de eventos aún.';
      default:
        return 'No hay registros para mostrar.';
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Activo',
      'dentro': 'Dentro',
      'salió': 'Salió',
      'salio': 'Salió',
      'completed': 'Completado'
    };
    return statusMap[status] || status;
  }

  canChangeStatus(status: string): boolean {
    // Solo se puede cambiar el estado si es 'active' o 'dentro'
    return status === 'active' || status === 'dentro';
  }

  getNextStatus(currentStatus: string): string {
    if (currentStatus === 'active') {
      return 'dentro';
    } else if (currentStatus === 'dentro') {
      return 'salio'; // Usar sin tilde para consistencia en BD
    }
    return currentStatus;
  }

  getStatusButtonText(status: string): string {
    if (status === 'active') {
      return 'Marcar como Dentro';
    } else if (status === 'dentro') {
      return 'Marcar como Salió';
    }
    return '';
  }

  changeStatus(record: any): void {
    if (record.updating) return;

    const nextStatus = this.getNextStatus(record.status);
    if (!nextStatus || nextStatus === record.status) return;

    record.updating = true;

    this.visitorService.updateVisitor(record.id, { status: nextStatus }).subscribe({
      next: (response) => {
        record.updating = false;
        if (response.exito || response.success) {
          record.status = nextStatus;
        } else {
          console.error('Error al actualizar estado:', response.mensaje || response.error);
          alert('Error al actualizar el estado: ' + (response.mensaje || response.error || 'Error desconocido'));
        }
      },
      error: (err) => {
        record.updating = false;
        console.error('Error al actualizar estado:', err);
        alert('Error al actualizar el estado. Por favor, intenta de nuevo.');
      }
    });
  }

  viewVisitorQR(record: any): void {
    this.selectedVisitorForQR = record;
    this.qrDecodedInfo = null;
    
    // Si ya tiene QR, mostrarlo y decodificarlo si es admin
    if (record.codigo_qr) {
      this.selectedVisitorQR = record.codigo_qr;
      this.showQRModal = true;
      
      // Si es admin, decodificar el QR para mostrar información oculta
      if (this.isAdmin) {
        this.decodeQRData(record.codigo_qr);
      }
    } else {
      // Si no tiene QR, intentar obtenerlo del visitante
      this.loadingQR = true;
      this.showQRModal = true;
      this.selectedVisitorQR = '';
      
      // Obtener el visitante completo para ver si tiene QR
      this.visitorService.getVisitor(record.id).subscribe({
        next: (response) => {
          this.loadingQR = false;
          if (response.exito && response.visitor) {
            if (response.visitor.codigo_qr) {
              record.codigo_qr = response.visitor.codigo_qr;
              this.selectedVisitorQR = response.visitor.codigo_qr;
              
              // Si es admin, decodificar el QR
              if (this.isAdmin) {
                this.decodeQRData(response.visitor.codigo_qr);
              }
            }
          }
        },
        error: (err) => {
          this.loadingQR = false;
          console.error('Error al obtener visitante:', err);
        }
      });
    }
  }

  decodeQRData(qrUrl: string): void {
    // Extraer los datos del QR de la URL
    try {
      const url = new URL(qrUrl);
      const qrDataParam = url.searchParams.get('data');
      
      if (qrDataParam) {
        const qrDataString = decodeURIComponent(qrDataParam);
        
        // Decodificar usando el servicio
        this.visitorService.decodeVisitorQR(qrDataString).subscribe({
          next: (response) => {
            if (response.exito && response.visitor_info) {
              this.qrDecodedInfo = response.visitor_info;
            }
          },
          error: (err) => {
            console.error('Error al decodificar QR:', err);
            // Intentar decodificar directamente desde el JSON
            try {
              const qrData = JSON.parse(qrDataString);
              this.qrDecodedInfo = {
                visitor_name: qrData.visitor_name || '',
                resident_name: qrData.resident_name || '',
                resident_address: qrData.resident_address || ''
              };
            } catch (parseError) {
              console.error('Error al parsear QR:', parseError);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error al procesar URL del QR:', error);
    }
  }

  generateQRForVisitor(): void {
    if (!this.selectedVisitorForQR || this.loadingQR) return;

    this.loadingQR = true;
    this.visitorService.generateVisitorQR(this.selectedVisitorForQR.id).subscribe({
      next: (response) => {
        this.loadingQR = false;
        if (response.exito) {
          // Actualizar el registro con el código QR
          this.selectedVisitorForQR.codigo_qr = response.qr_code_url;
          this.selectedVisitorQR = response.qr_code_url;
          
          // Actualizar también en el array de records
          const recordIndex = this.records.findIndex(r => r.id === this.selectedVisitorForQR.id);
          if (recordIndex !== -1) {
            this.records[recordIndex].codigo_qr = response.qr_code_url;
          }
          
          // Si es admin, decodificar el nuevo QR
          if (this.isAdmin && response.qr_code_url) {
            this.decodeQRData(response.qr_code_url);
          }
        } else {
          alert('Error al generar código QR: ' + (response.mensaje || 'Error desconocido'));
        }
      },
      error: (err) => {
        this.loadingQR = false;
        console.error('Error al generar QR:', err);
        alert('Error al generar código QR. Por favor, intenta de nuevo.');
      }
    });
  }

  viewEventQR(record: any): void {
    this.selectedEventForQR = record;
    this.selectedVisitorForQR = null;
    this.qrDecodedInfo = null;
    this.eventQRData = null;
    
    // Si ya tiene QR, mostrarlo y decodificar los datos
    if (record.codigo_qr) {
      this.selectedEventQR = record.codigo_qr;
      this.showQRModal = true;
      this.decodeEventQRData(record.codigo_qr);
    } else {
      // Si no tiene QR, intentar obtenerlo del evento
      this.loadingQR = true;
      this.showQRModal = true;
      this.selectedEventQR = '';
      
      // Obtener el evento completo para ver si tiene QR
      this.visitorService.getVisitor(record.id).subscribe({
        next: (response) => {
          this.loadingQR = false;
          if (response.exito && response.visitor) {
            if (response.visitor.codigo_qr) {
              record.codigo_qr = response.visitor.codigo_qr;
              this.selectedEventQR = response.visitor.codigo_qr;
              this.decodeEventQRData(response.visitor.codigo_qr);
            }
          }
        },
        error: (err) => {
          this.loadingQR = false;
          console.error('Error al obtener evento:', err);
        }
      });
    }
  }

  decodeEventQRData(qrUrl: string): void {
    // Extraer los datos del QR de la URL
    try {
      const url = new URL(qrUrl);
      const qrDataParam = url.searchParams.get('data');
      
      if (qrDataParam) {
        const qrDataString = decodeURIComponent(qrDataParam);
        try {
          const qrData = JSON.parse(qrDataString);
          // El QR simplificado solo tiene {'t': 'event', 'id': id}
          // Necesitamos obtener la información completa del evento desde el backend
          if (qrData.t === 'event' && qrData.id) {
            // Obtener información completa del evento desde el backend
            this.visitorService.getVisitor(qrData.id).subscribe({
              next: (visitorResponse) => {
                if (visitorResponse.exito && visitorResponse.visitor) {
                  const event = visitorResponse.visitor;
                  // Construir eventQRData con la información completa
                  this.eventQRData = {
                    event_name: event.name || '',
                    event_date: event.eventDate || '',
                    event_time: event.eventTime || '',
                    number_of_guests: event.numberOfGuests || '',
                    event_location: event.eventLocation || event.event_location || '',
                    resident_name: event.resident_name || '',
                    resident_address: event.resident_address || ''
                  };
                  
                  // Si el lugar es domicilio, obtener la dirección del residente
                  if (this.eventQRData.event_location === 'domicilio' && event.resident_email) {
                    this.visitorService.getResidentAddress(event.resident_email).subscribe({
                      next: (addressResponse) => {
                        if (addressResponse.exito && addressResponse.address) {
                          this.eventQRData.resident_address = addressResponse.address;
                        }
                      },
                      error: (err) => {
                        console.error('Error al obtener dirección del residente:', err);
                      }
                    });
                  }
                }
              },
              error: (err) => {
                console.error('Error al obtener información del evento:', err);
              }
            });
          }
        } catch (parseError) {
          console.error('Error al parsear QR del evento:', parseError);
        }
      }
    } catch (error) {
      console.error('Error al procesar URL del QR del evento:', error);
    }
  }

  generateQRForEvent(): void {
    if (!this.selectedEventForQR || this.loadingQR) return;

    this.loadingQR = true;
    this.visitorService.generateEventQR(this.selectedEventForQR.id).subscribe({
      next: (response) => {
        this.loadingQR = false;
        if (response.exito) {
          // Actualizar el registro con el código QR
          this.selectedEventForQR.codigo_qr = response.qr_code_url;
          this.selectedEventQR = response.qr_code_url;
          
          // Actualizar también en el array de records
          const recordIndex = this.records.findIndex(r => r.id === this.selectedEventForQR.id);
          if (recordIndex !== -1) {
            this.records[recordIndex].codigo_qr = response.qr_code_url;
          }
          
          // Usar event_info si está disponible, de lo contrario intentar obtener del evento
          if (response.event_info) {
            try {
              this.eventQRData = JSON.parse(response.event_info);
            } catch (e) {
              console.error('Error al parsear event_info:', e);
              // Fallback: construir desde response.event
              this.buildEventQRDataFromResponse(response);
            }
          } else {
            // Fallback: construir desde response.event
            this.buildEventQRDataFromResponse(response);
          }
        } else {
          alert('Error al generar código QR: ' + (response.mensaje || 'Error desconocido'));
        }
      },
      error: (err) => {
        this.loadingQR = false;
        console.error('Error al generar QR del evento:', err);
        alert('Error al generar código QR. Por favor, intenta de nuevo.');
      }
    });
  }

  private buildEventQRDataFromResponse(response: any): void {
    if (response.event) {
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

  formatEventDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  }

  formatEventTime(timeString: string): string {
    if (!timeString) return '';
    // Formato HH:mm a formato 12 horas
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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

  closeQRModal(): void {
    this.showQRModal = false;
    this.selectedVisitorForQR = null;
    this.selectedEventForQR = null;
    this.selectedVisitorQR = '';
    this.selectedEventQR = '';
    this.loadingQR = false;
    this.qrDecodedInfo = null;
    this.eventQRData = null;
  }

  shareQR(): void {
    const qrUrl = this.selectedVisitorQR || this.selectedEventQR;
    if (!qrUrl) return;

    // Crear una imagen con la información del evento/visitante
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Crear un canvas para combinar el QR y la información
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        // Si no se puede crear canvas, usar método anterior
        this.shareQRUrl();
        return;
      }
      
      // Configurar dimensiones del canvas
      const qrSize = 400;
      const padding = 40;
      const isEvent = !!this.selectedEventForQR && !!this.eventQRData;
      const infoHeight = isEvent ? 200 : 120;
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
      
      // Si es un evento, mostrar información del evento
      if (isEvent && this.eventQRData) {
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText(this.eventQRData.event_name || 'Evento', canvasWidth / 2, yPos);
        yPos += 30;
        
        ctx.font = '14px Arial, sans-serif';
        
        if (this.eventQRData.event_date) {
          ctx.fillText(`Fecha: ${this.formatEventDate(this.eventQRData.event_date)}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.event_time) {
          ctx.fillText(`Hora: ${this.formatEventTime(this.eventQRData.event_time)}`, canvasWidth / 2, yPos);
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
        // Texto genérico para visitantes
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('Acceso', canvasWidth / 2, yPos);
        yPos += 30;
        
        ctx.font = '16px Arial, sans-serif';
        ctx.fillText('Escanea este código para ingresar de forma segura.', canvasWidth / 2, yPos);
        yPos += 20;
        ctx.fillText('Uso exclusivo de personal autorizado.', canvasWidth / 2, yPos);
      }
      
      // Convertir canvas a blob y compartir
      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = this.selectedEventForQR 
            ? `QR-Evento-${this.selectedEventForQR?.name || 'evento'}.png`
            : `QR-${this.selectedVisitorForQR?.name || 'visitante'}.png`;
          const file = new File([blob], fileName, { type: 'image/png' });
          const title = this.selectedEventForQR
            ? `Código QR - ${this.selectedEventForQR?.name || 'Evento'}`
            : `Código QR - ${this.selectedVisitorForQR?.name || 'Visitante'}`;
          const text = this.selectedEventForQR
            ? `Código QR para el evento ${this.selectedEventForQR?.name || ''}`
            : `Código QR para el acceso del visitante ${this.selectedVisitorForQR?.name || ''}`;
          
          // Intentar usar la Web Share API si está disponible
          if (navigator.share) {
            navigator.share({
              title: title,
              text: text,
              files: [file]
            }).catch(err => {
              console.log('Error al compartir:', err);
              // Si falla, intentar descargar
              this.downloadQR();
            });
          } else {
            // Si no hay soporte para compartir, descargar
            this.downloadQR();
          }
        } else {
          this.shareQRUrl();
        }
      }, 'image/png');
    };
    
    img.onerror = () => {
      // Si falla, intentar compartir la URL
      this.shareQRUrl();
    };
    
    img.src = qrUrl;
  }

  shareQRUrl(): void {
    const qrUrl = this.selectedVisitorQR || this.selectedEventQR;
    if (!qrUrl) return;

    // Copiar la URL al portapapeles
    if (navigator.clipboard) {
      navigator.clipboard.writeText(qrUrl).then(() => {
        alert('URL del código QR copiada al portapapeles');
      }).catch(err => {
        console.error('Error al copiar:', err);
        this.downloadQR();
      });
    } else {
      // Fallback: descargar
      this.downloadQR();
    }
  }

  downloadQR(): void {
    const qrUrl = this.selectedVisitorQR || this.selectedEventQR;
    if (!qrUrl) return;

    // Crear una imagen para cargar el QR
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Crear un canvas para combinar el QR y el texto
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Configurar dimensiones del canvas
      const qrSize = 400; // Tamaño del QR
      const padding = 40;
      const isEvent = !!this.selectedEventForQR && !!this.eventQRData;
      const infoHeight = isEvent ? 200 : 120; // Más espacio si hay información del evento
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
      
      // Si es un evento, mostrar información del evento
      if (isEvent && this.eventQRData) {
        // Título del evento
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText(this.eventQRData.event_name || 'Evento', canvasWidth / 2, yPos);
        yPos += 30;
        
        // Información del evento
        ctx.font = '14px Arial, sans-serif';
        
        if (this.eventQRData.event_date) {
          ctx.fillText(`Fecha: ${this.formatEventDate(this.eventQRData.event_date)}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.event_time) {
          ctx.fillText(`Hora: ${this.formatEventTime(this.eventQRData.event_time)}`, canvasWidth / 2, yPos);
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
        // Texto genérico para visitantes
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('Acceso', canvasWidth / 2, yPos);
        yPos += 30;
        
        ctx.font = '16px Arial, sans-serif';
        const line1 = 'Escanea este código para ingresar de forma segura.';
        const line2 = 'Uso exclusivo de personal autorizado.';
        
        ctx.fillText(line1, canvasWidth / 2, yPos);
        yPos += 20;
        ctx.fillText(line2, canvasWidth / 2, yPos);
      }
      
      // Convertir canvas a imagen y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const fileName = this.selectedEventForQR
            ? `QR-Evento-${this.selectedEventForQR?.name || 'evento'}.png`
            : `QR-${this.selectedVisitorForQR?.name || 'visitante'}.png`;
          link.download = fileName;
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
      link.href = qrUrl;
      const fileName = this.selectedEventForQR
        ? `QR-Evento-${this.selectedEventForQR?.name || 'evento'}.png`
        : `QR-${this.selectedVisitorForQR?.name || 'visitante'}.png`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    img.src = qrUrl;
  }

  canEditEvent(record: any): boolean {
    // Solo el residente que creó el evento puede editarlo (no admin)
    if (this.isAdmin) return false;
    
    const currentUser = this.authService.getCurrentUser();
    const profile = this.authService.getCachedProfile();
    const userId = currentUser?.id || profile?.id;
    
    if (!userId || !record.created_by) return false;
    
    // Comparar IDs (pueden ser string o number)
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const createdByIdNum = typeof record.created_by === 'string' ? parseInt(record.created_by) : record.created_by;
    
    return userIdNum === createdByIdNum;
  }

  openEditEventModal(record: any): void {
    // Obtener el evento completo para editar
    this.visitorService.getVisitor(record.id).subscribe({
      next: (response) => {
        if (response.exito && response.visitor) {
          const event = response.visitor;
          this.editingEvent = {
            id: event.id,
            name: event.name || '',
            eventDate: event.eventDate ? this.formatDateForInput(event.eventDate) : '',
            eventTime: event.eventTime || '',
            numberOfGuests: event.numberOfGuests || '',
            eventLocation: event.eventLocation || ''
          };
          this.showEditEventModal = true;
          this.editEventError = '';
        } else if (response.visitor) {
          const event = response.visitor;
          this.editingEvent = {
            id: event.id,
            name: event.name || '',
            eventDate: event.eventDate ? this.formatDateForInput(event.eventDate) : '',
            eventTime: event.eventTime || '',
            numberOfGuests: event.numberOfGuests || '',
            eventLocation: event.eventLocation || ''
          };
          this.showEditEventModal = true;
          this.editEventError = '';
        } else {
          this.editEventError = 'No se pudo cargar la información del evento';
        }
      },
      error: (err) => {
        console.error('Error al cargar evento para editar:', err);
        this.editEventError = 'Error al cargar la información del evento';
      }
    });
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Formato YYYY-MM-DD para input type="date"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  saveEventChanges(): void {
    if (!this.editingEvent || !this.editingEvent.name) {
      this.editEventError = 'El nombre del evento es requerido';
      return;
    }

    this.savingEvent = true;
    this.editEventError = '';

    const updateData: any = {
      name: this.editingEvent.name,
      eventDate: this.editingEvent.eventDate || null,
      eventTime: this.editingEvent.eventTime || null,
      numberOfGuests: this.editingEvent.numberOfGuests || null,
      eventLocation: this.editingEvent.eventLocation || null
    };

    this.visitorService.updateVisitor(this.editingEvent.id, updateData).subscribe({
      next: (response) => {
        this.savingEvent = false;
        if (response.exito || response.success) {
          // Actualizar el registro en la lista
          const recordIndex = this.records.findIndex(r => r.id === this.editingEvent.id);
          if (recordIndex !== -1) {
            this.records[recordIndex].name = updateData.name;
            this.records[recordIndex].eventDate = updateData.eventDate;
            this.records[recordIndex].eventTime = updateData.eventTime;
            this.records[recordIndex].numberOfGuests = updateData.numberOfGuests;
            this.records[recordIndex].eventLocation = updateData.eventLocation;
          }
          
          // Si el evento tiene QR, regenerarlo con la nueva información
          const record = this.records.find(r => r.id === this.editingEvent.id);
          if (record && record.codigo_qr) {
            // Regenerar QR con la nueva información
            this.visitorService.generateEventQR(this.editingEvent.id).subscribe({
              next: (qrResponse) => {
                if (qrResponse.exito && recordIndex !== -1) {
                  this.records[recordIndex].codigo_qr = qrResponse.qr_code_url;
                }
              },
              error: (qrErr) => {
                console.error('Error al regenerar QR:', qrErr);
              }
            });
          }
          
          this.closeEditEventModal();
        } else {
          this.editEventError = response.mensaje || response.error || 'Error al guardar los cambios';
        }
      },
      error: (err) => {
        this.savingEvent = false;
        console.error('Error al guardar cambios del evento:', err);
        this.editEventError = err.error?.mensaje || err.error?.error || 'Error al guardar los cambios. Por favor, intenta de nuevo.';
      }
    });
  }

  closeEditEventModal(): void {
    this.showEditEventModal = false;
    this.editingEvent = null;
    this.editEventError = '';
    this.savingEvent = false;
  }
}
