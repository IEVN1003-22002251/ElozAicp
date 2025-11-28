import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
}

@Component({
  selector: 'app-cameras',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cameras-container">
      <!-- Header -->
      <div class="cameras-header">
        <button class="btn-back-cameras" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h1 class="cameras-title">Sistema de Cámaras</h1>
        <button class="btn-settings" (click)="openSettings()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
          </svg>
        </button>
      </div>

      <!-- System Status -->
      <div class="status-section">
        <p class="status-label">Sistema de Vigilancia</p>
        <p class="status-count">{{ activeCameras }}/{{ totalCameras }}</p>
        <p class="status-subtitle">cámaras activas</p>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="action-btn" (click)="viewAll()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Ver Todas</span>
        </button>
        
        <button class="action-btn" (click)="configure()">
          <div class="config-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <span>Configurar</span>
        </button>
      </div>

      <!-- Camera Grid -->
      <div class="cameras-grid">
        <div 
          *ngFor="let camera of cameras" 
          class="camera-card"
          (click)="expandCamera(camera)">
          <div class="camera-badge">EN VIVO</div>
          <button class="camera-expand" (click)="expandCamera(camera); $event.stopPropagation()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          </button>
          <div class="camera-preview">
            <!-- Aquí iría la imagen o video de la cámara -->
            <div class="camera-placeholder"></div>
          </div>
          <div class="camera-info">
            <h3 class="camera-name">{{ camera.name }}</h3>
            <p class="camera-location">{{ camera.location }}</p>
            <div class="camera-status">
              <span class="status-dot" [class.online]="camera.status === 'online'" [class.offline]="camera.status === 'offline'"></span>
              <span class="status-text">{{ camera.status === 'online' ? 'En línea' : 'Fuera de línea' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Information Message -->
      <div class="info-message">
        <div class="info-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <p class="info-text">
          Toca cualquier cámara para expandir la vista. Las funciones de grabación y configuración estarán disponibles próximamente.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .cameras-container {
      min-height: 100vh;
      background-color: #1a1a1a;
      padding: 20px;
      padding-bottom: 40px;
    }

    /* Header */
    .cameras-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }

    .btn-back-cameras {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #20b2aa;
      border: none;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }

    .btn-back-cameras:hover {
      transform: scale(1.05);
      background-color: #1a9d96;
    }

    .btn-back-cameras svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }

    .cameras-title {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      flex: 1;
      text-align: center;
    }

    .btn-settings {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #5B9BD5;
      border: none;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }

    .btn-settings:hover {
      transform: scale(1.05);
      background-color: #4A8BC2;
    }

    .btn-settings svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }

    /* Status Section */
    .status-section {
      text-align: center;
      margin-bottom: 24px;
    }

    .status-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 8px 0;
    }

    .status-count {
      font-size: 48px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .status-subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin: 4px 0 0 0;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 12px;
      border: none;
      background-color: #2a2a2a;
      color: #ffffff;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .action-btn:hover {
      background-color: #333333;
    }

    .action-btn svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }

    .action-btn:nth-child(1) svg {
      stroke: #5B9BD5;
    }

    /* Config Icon */
    .config-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
    }

    .config-icon svg {
      stroke: #20c997;
    }

    /* Camera Grid */
    .cameras-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .camera-card {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 12px;
      position: relative;
      cursor: pointer;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }

    .camera-card:hover {
      transform: translateY(-2px);
      background-color: #333333;
    }

    .camera-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background-color: #dc3545;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      z-index: 2;
    }

    .camera-expand {
      position: absolute;
      top: 12px;
      right: 12px;
      background-color: rgba(0, 0, 0, 0.5);
      border: none;
      border-radius: 6px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      cursor: pointer;
      z-index: 2;
      transition: background-color 0.2s ease;
    }

    .camera-expand:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }

    .camera-expand svg {
      width: 18px;
      height: 18px;
      stroke: currentColor;
    }

    .camera-preview {
      width: 100%;
      aspect-ratio: 16 / 9;
      background-color: #1a1a1a;
      border-radius: 8px;
      margin-bottom: 12px;
      position: relative;
      overflow: hidden;
    }

    .camera-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .camera-info {
      padding: 0 4px;
    }

    .camera-name {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 4px 0;
    }

    .camera-location {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 8px 0;
    }

    .camera-status {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-dot.online {
      background-color: #20c997;
    }

    .status-dot.offline {
      background-color: #dc3545;
    }

    .status-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }

    /* Information Message */
    .info-message {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .info-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #007bff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;
    }

    .info-icon svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }

    .info-text {
      font-size: 14px;
      color: #ffffff;
      line-height: 1.5;
      margin: 0;
      flex: 1;
    }

    @media (max-width: 480px) {
      .cameras-container {
        padding: 16px;
      }

      .cameras-title {
        font-size: 24px;
      }

      .status-count {
        font-size: 40px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .cameras-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CamerasComponent implements OnInit {
  cameras: Camera[] = [
    { id: '1', name: 'Entrada Principal', location: 'Puerta Principal', status: 'online' },
    { id: '2', name: 'Entrada Vehicular', location: 'Portón Principal', status: 'online' },
    { id: '3', name: 'Área Común', location: 'Zona de Recreación', status: 'offline' },
    { id: '4', name: 'Administración', location: 'Oficinas Principales', status: 'online' }
  ];

  get totalCameras(): number {
    return this.cameras.length;
  }

  get activeCameras(): number {
    return this.cameras.filter(c => c.status === 'online').length;
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cargar cámaras desde el servicio si es necesario
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  openSettings(): void {
    console.log('Abrir configuración');
  }

  viewAll(): void {
    console.log('Ver todas las cámaras');
  }

  configure(): void {
    console.log('Configurar cámaras');
  }

  expandCamera(camera: Camera): void {
    console.log('Expandir cámara:', camera.name);
    // Aquí se podría navegar a una vista detallada de la cámara
  }
}
