import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VisitorService } from '../../services/visitor.service';
import { AuthService } from '../../services/auth.service';

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
    private authService: AuthService
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

    // Intentar usar la Web Share API si está disponible
    if (navigator.share) {
      // Convertir la URL del QR a blob para compartir
      fetch(this.selectedVisitorQR)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], `QR-${this.selectedVisitor?.name || 'visitante'}.png`, { type: 'image/png' });
          navigator.share({
            title: `Código QR - ${this.selectedVisitor?.name || 'Visitante'}`,
            text: `Código QR para el acceso del visitante ${this.selectedVisitor?.name || ''}`,
            files: [file]
          }).catch(err => {
            console.log('Error al compartir:', err);
            // Si falla, intentar descargar
            this.downloadQR();
          });
        })
        .catch(err => {
          console.error('Error al obtener la imagen:', err);
          // Si falla, intentar compartir la URL
          this.shareQRUrl();
        });
    } else {
      // Si no hay soporte para compartir, copiar URL al portapapeles o descargar
      this.shareQRUrl();
    }
  }

  shareQRUrl(): void {
    if (!this.selectedVisitorQR) return;

    // Copiar la URL al portapapeles
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.selectedVisitorQR).then(() => {
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
    if (!this.selectedVisitorQR || !this.selectedVisitor) return;

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
      const textHeight = 120;
      const canvasWidth = qrSize + (padding * 2);
      const canvasHeight = qrSize + textHeight + (padding * 3);
      
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
      
      // Título "Acceso"
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText('Acceso', canvasWidth / 2, qrSize + padding + 20);
      
      // Texto principal
      ctx.font = '16px Arial, sans-serif';
      const line1 = 'Escanea este código para ingresar de forma segura.';
      const line2 = 'Uso exclusivo de personal autorizado.';
      
      ctx.fillText(line1, canvasWidth / 2, qrSize + padding + 50);
      ctx.fillText(line2, canvasWidth / 2, qrSize + padding + 75);
      
      // Convertir canvas a imagen y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `QR-${this.selectedVisitor?.name || 'visitante'}.png`;
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
      link.href = this.selectedVisitorQR;
      link.download = `QR-${this.selectedVisitor?.name || 'visitante'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    img.src = this.selectedVisitorQR;
  }
}

