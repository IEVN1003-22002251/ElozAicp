import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VisitorService } from '../services/visitor.service';
import { QRCanvasService } from '../services/qr-canvas.service';
import { QRHelperService } from '../services/qr-helper.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  selectedFilter: 'all' | 'visitors' | 'providers' | 'events' = 'all';
  completedRecords = 0; records: any[] = []; filteredRecords: any[] = []; loading = false; isAdmin = false;
  showQRModal = false; selectedVisitorForQR: any = null; selectedEventForQR: any = null;
  selectedVisitorQR = ''; selectedEventQR = ''; loadingQR = false;
  qrDecodedInfo: any = null; eventQRData: any = null;
  showEditEventModal = false; editingEvent: any = null; savingEvent = false; editEventError = '';

  private readonly recordTypeMap: { [key: string]: string } = {
    visitor: 'visitors', 'one-time': 'visitors', provider: 'providers', event: 'events'
  };

  private readonly typeLabels: { [key: string]: string } = {
    visitors: 'Visitante', providers: 'Proveedor', events: 'Evento'
  };

  private readonly statusMap: { [key: string]: string } = {
    active: 'Activo', dentro: 'Dentro', salió: 'Salió', salio: 'Salió', completed: 'Completado'
  };

  private readonly locationMap: { [key: string]: string } = {
    domicilio: 'Domicilio', casa_club: 'Casa club', lago: 'Lago', kiosco: 'Kiosco'
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private visitorService: VisitorService,
    private qrCanvasService: QRCanvasService,
    private qrHelper: QRHelperService
  ) {}

  ngOnInit(): void {
    const profile = this.authService.getCachedProfile();
    this.isAdmin = profile?.role === 'admin';
    this.loadRecords();
  }

  private mapVisitorToRecord(v: any): any {
    return {
      id: v.id, name: v.name, email: v.email, phone: v.phone, type: this.recordTypeMap[v.type] || 'visitors', originalType: v.type,
      status: v.status, created_at: v.created_at, created_by: v.created_by, address: v.address || null, codigo_qr: v.codigo_qr || null,
      eventDate: v.eventDate || null, eventTime: v.eventTime || null, numberOfGuests: v.numberOfGuests || null, eventLocation: v.eventLocation || null,
      updating: false, loadingQR: false, editing: false
    };
  }

  loadRecords(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    const profile = this.authService.getCachedProfile();
    if (!currentUser && !profile) { this.resetRecords(); return; }
    const params: any = this.isAdmin ? {} : { user_id: (currentUser?.id || profile?.id || '').toString() };
    if (!this.isAdmin && !params.user_id) { this.resetRecords(); return; }
    this.visitorService.getVisitors(params).subscribe({
      next: (res) => {
        this.loading = false;
        const visitors = res.visitors || res.data || [];
        this.records = visitors.map((v: any) => this.mapVisitorToRecord(v))
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        this.filterRecords();
      },
      error: () => this.resetRecords()
    });
  }

  private resetRecords(): void {
    this.loading = false;
    this.records = [];
    this.filterRecords();
  }

  setFilter(filter: typeof this.selectedFilter): void {
    this.selectedFilter = filter;
    this.filterRecords();
  }

  filterRecords(): void {
    this.filteredRecords = this.selectedFilter === 'all'
      ? this.records
      : this.records.filter(r => r.type === this.selectedFilter);
    this.completedRecords = this.filteredRecords.length;
  }

  openDatePicker(): void {
    console.log('Abrir selector de fecha');
  }

  goToAddVisitor(): void {
    this.router.navigate(['/pre-register']);
  }

  // NOTE: Duplicate implementation of goBack detected. Removing redundant function.

  getTypeLabel(type: string): string {
    return this.typeLabels[type] || 'Registro';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  getEmptyMessage(): string {
    if (this.records.length === 0) {
      return this.isAdmin
        ? 'No hay registros en el sistema aún. Los registros aparecerán aquí cuando los residentes los creen.'
        : 'No has realizado ningún registro aún. Tus registros aparecerán aquí cuando los crees.';
    }
    const messages: { [key: string]: { admin: string; user: string } } = {
      visitors: { admin: 'No hay registros de visitantes en el sistema aún.', user: 'No tienes registros de visitantes (frecuentes o solo una vez) aún.' },
      providers: { admin: 'No hay registros de proveedores en el sistema aún.', user: 'No tienes registros de proveedores aún.' },
      events: { admin: 'No hay registros de eventos en el sistema aún.', user: 'No tienes registros de eventos aún.' }
    };
    return messages[this.selectedFilter]?.[this.isAdmin ? 'admin' : 'user'] || 'No hay registros para mostrar.';
  }

  getStatusLabel(status: string): string {
    return this.statusMap[status] || status;
  }

  canChangeStatus(status: string): boolean {
    return status === 'active' || status === 'dentro';
  }

  getNextStatus(currentStatus: string): string {
    return currentStatus === 'active' ? 'dentro' : currentStatus === 'dentro' ? 'salio' : currentStatus;
  }

  getStatusButtonText(status: string): string {
    return status === 'active' ? 'Marcar como Dentro' : status === 'dentro' ? 'Marcar como Salió' : '';
  }

  changeStatus(record: any): void {
    if (record.updating) return;
    const nextStatus = this.getNextStatus(record.status);
    if (!nextStatus || nextStatus === record.status) return;
    record.updating = true;
    this.visitorService.updateVisitor(record.id, { status: nextStatus }).subscribe({
      next: (res) => {
        record.updating = false;
        if (res.exito || res.success) record.status = nextStatus;
        else alert('Error al actualizar el estado: ' + (res.mensaje || res.error || 'Error desconocido'));
      },
      error: () => {
        record.updating = false;
        alert('Error al actualizar el estado. Por favor, intenta de nuevo.');
      }
    });
  }

  viewVisitorQR(record: any): void {
    this.selectedVisitorForQR = record;
    this.qrDecodedInfo = null;
    this.loadQRForRecord(record, (qr: string) => {
      this.selectedVisitorQR = qr;
      if (this.isAdmin) this.decodeQRData(qr);
    });
  }

  private loadQRForRecord(record: any, onQRLoaded: (qr: string) => void): void {
    if (record.codigo_qr) {
      this.showQRModal = true;
      onQRLoaded(record.codigo_qr);
    } else {
      this.loadingQR = true;
      this.showQRModal = true;
      this.selectedVisitorQR = '';
      this.visitorService.getVisitor(record.id).subscribe({
        next: (res) => {
          this.loadingQR = false;
          if (res.exito && res.visitor?.codigo_qr) {
            record.codigo_qr = res.visitor.codigo_qr;
            onQRLoaded(res.visitor.codigo_qr);
          }
        },
        error: () => { this.loadingQR = false; }
      });
    }
  }

  decodeQRData(qrUrl: string): void {
    const qrData = this.qrHelper.extractQRData(qrUrl);
    if (!qrData) return;
    this.visitorService.decodeVisitorQR(JSON.stringify(qrData)).subscribe({
      next: (res) => {
        if (res.exito && res.visitor_info) this.qrDecodedInfo = res.visitor_info;
      },
      error: () => {
        this.qrDecodedInfo = {
          visitor_name: qrData.visitor_name || '', resident_name: qrData.resident_name || '', resident_address: qrData.resident_address || ''
        };
      }
    });
  }

  private updateQRInRecord(id: string, qr: string): void {
    const idx = this.records.findIndex(r => r.id === id);
    if (idx !== -1) this.records[idx].codigo_qr = qr;
  }

  generateQRForVisitor(): void {
    if (!this.selectedVisitorForQR || this.loadingQR) return;
    this.generateQR(this.selectedVisitorForQR.id, 'visitor', (qr: string) => {
      this.selectedVisitorForQR.codigo_qr = qr;
      this.selectedVisitorQR = qr;
      this.updateQRInRecord(this.selectedVisitorForQR.id, qr);
      if (this.isAdmin) this.decodeQRData(qr);
    });
  }

  generateQRForEvent(): void {
    if (!this.selectedEventForQR || this.loadingQR) return;
    this.generateQR(this.selectedEventForQR.id, 'event', (qr: string) => {
      this.selectedEventForQR.codigo_qr = qr;
      this.selectedEventQR = qr;
      this.updateQRInRecord(this.selectedEventForQR.id, qr);
    });
  }

  private generateQR(id: string, type: 'visitor' | 'event', onSuccess: (qr: string) => void): void {
    this.loadingQR = true;
    (type === 'visitor' ? this.visitorService.generateVisitorQR(id) : this.visitorService.generateEventQR(id)).subscribe({
      next: (res) => {
        this.loadingQR = false;
        if (res.exito && res.qr_code_url) onSuccess(res.qr_code_url);
        else alert('Error al generar código QR: ' + (res.mensaje || 'Error desconocido'));
      },
      error: () => { this.loadingQR = false; alert('Error al generar código QR. Por favor, intenta de nuevo.'); }
    });
  }

  viewEventQR(record: any): void {
    this.selectedEventForQR = record;
    this.selectedVisitorForQR = null;
    this.qrDecodedInfo = null;
    this.eventQRData = null;
    this.loadQRForRecord(record, (qr: string) => { this.selectedEventQR = qr; this.decodeEventQRData(qr); });
  }

  private buildEventQRData(event: any): void {
    this.eventQRData = {
      event_name: event.name || '', event_date: event.eventDate || '',
      event_time: event.eventTime || '', number_of_guests: event.numberOfGuests || '',
      event_location: event.eventLocation || event.event_location || '',
      resident_name: event.resident_name || '', resident_address: event.resident_address || ''
    };
    if (this.eventQRData.event_location === 'domicilio' && event.resident_email) {
      this.visitorService.getResidentAddress(event.resident_email).subscribe({
        next: (addrRes) => { if (addrRes.exito && addrRes.address) this.eventQRData!.resident_address = addrRes.address; },
        error: () => {}
      });
    }
  }

  decodeEventQRData(qrUrl: string): void {
    const qrData = this.qrHelper.extractQRData(qrUrl);
    if (!qrData || qrData.t !== 'event' || !qrData.id) return;
    this.visitorService.getVisitor(qrData.id).subscribe({
      next: (res) => { if (res.exito && res.visitor) this.buildEventQRData(res.visitor); },
      error: () => {}
    });
  }

  formatEventDate(dateString: string): string {
    return this.qrHelper.formatDate(dateString);
  }

  formatEventTime(timeString: string): string {
    return this.qrHelper.formatTime(timeString);
  }

  getLocationLabel(location: string): string {
    return this.qrHelper.getLocationLabel(location, this.locationMap);
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

  goBack(): void {
    this.router.navigate([this.isAdmin ? '/dashboard' : '/home']);
  }

  private getQRFileName(): string {
    return this.selectedEventForQR ? `QR-Evento-${this.selectedEventForQR?.name || 'evento'}.png` : `QR-${this.selectedVisitorForQR?.name || 'visitante'}.png`;
  }

  private getQRShareData(): { title: string; text: string } {
    return {
      title: this.selectedEventForQR ? `Código QR - ${this.selectedEventForQR?.name || 'Evento'}` : `Código QR - ${this.selectedVisitorForQR?.name || 'Visitante'}`,
      text: this.selectedEventForQR ? `Código QR para el evento ${this.selectedEventForQR?.name || ''}` : `Código QR para el acceso del visitante ${this.selectedVisitorForQR?.name || ''}`
    };
  }

  private createCanvasWithQRData(img: HTMLImageElement): HTMLCanvasElement {
    return this.qrCanvasService.createCanvasWithQR(img, this.eventQRData || undefined,
      (d: string) => this.qrHelper.formatDate(d), (t: string) => this.qrHelper.formatTime(t), (l: string) => this.qrHelper.getLocationLabel(l, this.locationMap));
  }

  private processQRImage(callback: (canvas: HTMLCanvasElement) => void, onError: () => void): void {
    const qrUrl = this.selectedVisitorQR || this.selectedEventQR;
    if (!qrUrl) { onError(); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        callback(this.createCanvasWithQRData(img));
      } catch {
        onError();
      }
    };
    img.onerror = onError;
    img.src = qrUrl;
  }

  shareQR(): void {
    this.processQRImage((canvas) => {
      canvas.toBlob((blob) => {
        if (blob && navigator.share) {
          const { title, text } = this.getQRShareData();
          navigator.share({ title, text, files: [new File([blob], this.getQRFileName(), { type: 'image/png' })] }).catch(() => this.downloadQR());
        } else {
          blob ? this.downloadQR() : this.shareQRUrl();
        }
      }, 'image/png');
    }, () => this.shareQRUrl());
  }

  shareQRUrl(): void {
    const qrUrl = this.selectedVisitorQR || this.selectedEventQR;
    if (!qrUrl) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(qrUrl).then(() => alert('URL del código QR copiada al portapapeles')).catch(() => this.downloadQR());
    } else {
      this.downloadQR();
    }
  }

  downloadQR(): void {
    const fileName = this.getQRFileName();
    const downloadFile = (url: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    this.processQRImage((canvas) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          downloadFile(url);
          URL.revokeObjectURL(url);
        } else {
          downloadFile(this.selectedVisitorQR || this.selectedEventQR || '');
        }
      }, 'image/png');
    }, () => downloadFile(this.selectedVisitorQR || this.selectedEventQR || ''));
  }

  canEditEvent(record: any): boolean {
    if (this.isAdmin) return false;
    const userId = this.authService.getCurrentUser()?.id || this.authService.getCachedProfile()?.id;
    if (!userId || !record.created_by) return false;
    return (typeof userId === 'string' ? parseInt(userId) : userId) === (typeof record.created_by === 'string' ? parseInt(record.created_by) : record.created_by);
  }

  openEditEventModal(record: any): void {
    this.visitorService.getVisitor(record.id).subscribe({
      next: (res) => {
        const event = res.visitor || (res.exito && res.visitor);
        if (event) {
          const d = event.eventDate ? new Date(event.eventDate) : null;
          this.editingEvent = {
            id: event.id, name: event.name || '',
            eventDate: d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '',
            eventTime: event.eventTime || '', numberOfGuests: event.numberOfGuests || '', eventLocation: event.eventLocation || ''
          };
          this.showEditEventModal = true;
          this.editEventError = '';
        } else {
          this.editEventError = 'No se pudo cargar la información del evento';
        }
      },
      error: () => this.editEventError = 'Error al cargar la información del evento'
    });
  }

  private regenerateQRIfNeeded(recordIdx: number, eventId: string): void {
    if (this.records[recordIdx]?.codigo_qr) {
      this.visitorService.generateEventQR(eventId).subscribe({
        next: (qrRes) => { if (qrRes.exito) this.records[recordIdx].codigo_qr = qrRes.qr_code_url; },
        error: () => {}
      });
    }
  }

  saveEventChanges(): void {
    if (!this.editingEvent?.name) {
      this.editEventError = 'El nombre del evento es requerido';
      return;
    }
    this.savingEvent = true;
    this.editEventError = '';
    const updateData: any = {
      name: this.editingEvent.name, eventDate: this.editingEvent.eventDate || null,
      eventTime: this.editingEvent.eventTime || null, numberOfGuests: this.editingEvent.numberOfGuests || null,
      eventLocation: this.editingEvent.eventLocation || null
    };
    this.visitorService.updateVisitor(this.editingEvent.id, updateData).subscribe({
      next: (res) => {
        this.savingEvent = false;
        if (res.exito || res.success) {
          const idx = this.records.findIndex(r => r.id === this.editingEvent.id);
          if (idx !== -1) {
            Object.assign(this.records[idx], updateData);
            this.regenerateQRIfNeeded(idx, this.editingEvent.id);
          }
          this.closeEditEventModal();
        } else {
          this.editEventError = res.mensaje || res.error || 'Error al guardar los cambios';
        }
      },
      error: (err) => {
        this.savingEvent = false;
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
