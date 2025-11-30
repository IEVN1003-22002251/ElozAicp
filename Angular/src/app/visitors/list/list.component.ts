import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VisitorService } from '../../services/visitor.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header-section">
        <h1>Lista de Visitantes</h1>
        <div class="header-buttons">
          <button class="btn btn-back" (click)="goBack()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {{ isResident ? 'Regresar al Home' : 'Regresar al Dashboard' }}
          </button>
          <button class="btn btn-primary" (click)="goToAdd()">Agregar Visitante</button>
        </div>
      </div>
      
      <div *ngIf="loading" class="loading">Cargando...</div>
      
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="visitors && visitors.length > 0" class="visitors-list">
        <div *ngFor="let visitor of visitors" class="visitor-card">
          <h3>{{ visitor.name }}</h3>
          <p>Email: {{ visitor.email || 'N/A' }}</p>
          <p>Tipo: {{ visitor.type }}</p>
          <p>Estado: {{ visitor.status }}</p>
          <p class="address" [class.no-address]="!visitor.address">
            Domicilio: {{ visitor.address || 'No disponible' }}
          </p>
          <div class="card-actions">
            <button class="btn btn-secondary" (click)="editVisitor(visitor.id)">Editar</button>
            <button 
              *ngIf="isResident && visitor.type === 'visitor'" 
              class="btn btn-qr" 
              (click)="generateQR(visitor)"
              [disabled]="visitor.generatingQR">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="5" height="5"></rect>
                <rect x="16" y="3" width="5" height="5"></rect>
                <rect x="3" y="16" width="5" height="5"></rect>
                <path d="M21 16h-3"></path>
                <path d="M9 21h3"></path>
                <path d="M13 21h3"></path>
                <path d="M21 12v-1"></path>
                <path d="M12 21v-3"></path>
              </svg>
              {{ visitor.codigo_qr ? 'Ver QR' : 'Generar QR' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Modal para mostrar QR -->
      <div *ngIf="showQRModal" class="qr-modal-overlay" (click)="closeQRModal()">
        <div class="qr-modal-content" (click)="$event.stopPropagation()">
          <div class="qr-modal-header">
            <h2>Código QR - {{ selectedVisitor?.name }}</h2>
            <button class="btn-close-modal" (click)="closeQRModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="qr-modal-body">
            <div class="qr-code-display">
              <img [src]="selectedVisitorQR" alt="QR Code" class="qr-image" />
            </div>
            <p class="qr-instruction">Escanea este código para validar el acceso del visitante</p>
            <div *ngIf="selectedVisitorQR" class="qr-share-actions">
              <button class="btn-share-qr" (click)="shareQR()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Compartir QR
              </button>
              <button class="btn-download-qr" (click)="downloadQR()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Descargar QR
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="visitors && visitors.length === 0" class="no-data">
        No hay visitantes registrados
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .visitors-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .visitor-card {
      background-color: #2a2a2a;
      padding: 20px;
      border-radius: 8px;
    }
    
    .visitor-card .address {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .visitor-card .address.no-address {
      color: rgba(255, 255, 255, 0.5);
      font-weight: 400;
    }
    
    .loading, .error, .no-data {
      text-align: center;
      padding: 20px;
      margin-top: 20px;
    }
    
    .error {
      color: #dc3545;
    }
    
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .header-buttons {
      display: flex;
      gap: 12px;
    }
    
    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: #ffffff;
    }
    
    .btn-primary:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
    
    .btn-back {
      background-color: transparent;
      color: #ffffff;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }
    
    .btn-back:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }
    
    .btn-back svg {
      width: 16px;
      height: 16px;
    }
    
    .btn-secondary {
      background-color: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      margin-top: 12px;
    }
    
    .btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .card-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    
    .btn-qr {
      background-color: #20b2aa;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .btn-qr:hover:not(:disabled) {
      background-color: #1a9d96;
    }
    
    .btn-qr:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .qr-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    
    .qr-modal-content {
      background-color: #2a2a2a;
      border-radius: 12px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    .qr-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .qr-modal-header h2 {
      color: #ffffff;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }
    
    .btn-close-modal {
      background: transparent;
      border: none;
      color: #ffffff;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-close-modal:hover {
      opacity: 0.7;
    }
    
    .qr-modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .qr-code-display {
      background-color: #ffffff;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    
    .qr-image {
      width: 250px;
      height: 250px;
      max-width: 100%;
      height: auto;
    }
    
    .qr-instruction {
      color: rgba(255, 255, 255, 0.8);
      text-align: center;
      margin: 0 0 20px 0;
      font-size: 14px;
    }
    
    .qr-share-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      width: 100%;
    }
    
    .btn-share-qr, .btn-download-qr {
      flex: 1;
      padding: 12px 16px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .btn-share-qr {
      background-color: #007bff;
      color: #ffffff;
    }
    
    .btn-share-qr:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
    
    .btn-download-qr {
      background-color: #20b2aa;
      color: #ffffff;
    }
    
    .btn-download-qr:hover {
      background-color: #1a9d96;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(32, 178, 170, 0.3);
    }
    
    .btn-share-qr svg, .btn-download-qr svg {
      width: 18px;
      height: 18px;
    }
    
    @media (max-width: 768px) {
      .header-section {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .header-buttons {
        width: 100%;
        flex-direction: column;
      }
      
      .header-buttons .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
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

