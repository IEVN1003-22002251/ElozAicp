import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VisitorService } from '../../services/visitor.service';
import { AuthService } from '../../services/auth.service';
import { QRCanvasService } from '../../services/qr-canvas.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  visitors: any[] = [];
  loading = false;
  error = '';
  isResident = false;
  showQRModal = false;
  selectedVisitor: any = null;
  selectedVisitorQR = '';

  constructor(
    private visitorService: VisitorService,
    private router: Router,
    private authService: AuthService,
    private qrCanvasService: QRCanvasService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario es residente
    const profile = this.authService.getCachedProfile();
    this.isResident = profile?.role === 'resident' || profile?.role !== 'admin';
    this.loadVisitors();
  }

  loadVisitors(): void {
    this.loading = true;
    this.error = '';
    
    // Si es residente, solo cargar sus visitantes
    const params: any = {};
    if (this.isResident) {
      const currentUser = this.authService.getCurrentUser();
      const profile = this.authService.getCachedProfile();
      const userId = currentUser?.id || profile?.id;
      if (userId) {
        const userIdNumber = typeof userId === 'string' ? parseInt(userId) : userId;
        params.user_id = userIdNumber.toString();
      }
    }
    
    this.visitorService.getVisitors(params).subscribe({
      next: (response) => {
        if (response.exito) {
          this.visitors = response.visitors || [];
          
          // Ordenar por fecha de creación descendente (más nuevos primero)
          this.visitors.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA; // Orden descendente
          });
          
          // Debug: verificar que las direcciones se estén recibiendo
          console.log('Visitantes cargados:', this.visitors);
          this.visitors.forEach(v => {
            if (v.address) {
              console.log(`Visitante ${v.name} tiene dirección: ${v.address}`);
            }
          });
        } else {
          this.error = response.mensaje || 'Error al cargar visitantes';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al conectar con el servidor';
        this.loading = false;
        console.error('Error al cargar visitantes:', err);
      }
    });
  }

  goToAdd(): void {
    this.router.navigate(['/visitors/add']);
  }

  editVisitor(id: string): void {
    this.router.navigate(['/visitors/edit', id]);
  }

  goBack(): void {
    // Si es residente, regresar al home; si es admin, regresar al dashboard
    if (this.isResident) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  generateQR(visitor: any): void {
    // Si ya tiene QR, solo mostrarlo
    if (visitor.codigo_qr) {
      this.selectedVisitor = visitor;
      this.selectedVisitorQR = visitor.codigo_qr;
      this.showQRModal = true;
      return;
    }

    // Generar nuevo QR
    visitor.generatingQR = true;
    this.visitorService.generateVisitorQR(visitor.id).subscribe({
      next: (response) => {
        visitor.generatingQR = false;
        if (response.exito) {
          // Actualizar el visitante con el código QR
          visitor.codigo_qr = response.qr_code_url;
          // Mostrar el modal con el QR
          this.selectedVisitor = visitor;
          this.selectedVisitorQR = response.qr_code_url;
          this.showQRModal = true;
        } else {
          this.error = response.mensaje || 'Error al generar código QR';
        }
      },
      error: (err) => {
        visitor.generatingQR = false;
        this.error = err.error?.mensaje || 'Error al conectar con el servidor';
        console.error('Error al generar QR:', err);
      }
    });
  }

  closeQRModal(): void {
    this.showQRModal = false;
    this.selectedVisitor = null;
    this.selectedVisitorQR = '';
  }

  shareQR(): void {
    if (!this.selectedVisitorQR || !this.selectedVisitor) return;
    if (navigator.share) {
      fetch(this.selectedVisitorQR)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], `QR-${this.selectedVisitor?.name || 'visitante'}.png`, { type: 'image/png' });
          navigator.share({
            title: `Código QR - ${this.selectedVisitor?.name || 'Visitante'}`,
            text: `Código QR para el acceso del visitante ${this.selectedVisitor?.name || ''}`,
            files: [file]
          }).catch(() => this.downloadQR());
        })
        .catch(() => this.shareQRUrl());
    } else {
      this.shareQRUrl();
    }
  }

  shareQRUrl(): void {
    if (!this.selectedVisitorQR) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.selectedVisitorQR).then(() => alert('URL del código QR copiada al portapapeles')).catch(() => this.downloadQR());
    } else {
      this.downloadQR();
    }
  }

  downloadQR(): void {
    if (!this.selectedVisitorQR || !this.selectedVisitor) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const fileName = `QR-${this.selectedVisitor?.name || 'visitante'}.png`;
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
        const canvas = this.qrCanvasService.createCanvasWithQR(img);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            downloadFile(url);
            URL.revokeObjectURL(url);
          } else {
            downloadFile(this.selectedVisitorQR);
          }
        }, 'image/png');
      } catch {
        downloadFile(this.selectedVisitorQR);
      }
    };
    img.onerror = () => downloadFile(this.selectedVisitorQR);
    img.src = this.selectedVisitorQR;
  }
}

