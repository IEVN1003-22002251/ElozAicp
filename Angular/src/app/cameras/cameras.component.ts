import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  connectionType?: 'ip' | 'wifi' | 'usb';
  ipAddress?: string;
  wifiSSID?: string;
  wifiPassword?: string;
  usbDeviceName?: string;
  userId?: string;
  isCustom?: boolean;
}

@Component({
  selector: 'app-cameras',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
          *ngFor="let camera of visibleCameras" 
          class="camera-card"
          (click)="expandCamera(camera)">
          <div class="camera-badge">EN VIVO</div>
          <button class="camera-close" (click)="hideCamera(camera); $event.stopPropagation()" *ngIf="isResident">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="camera-preview">
            <!-- Video para Entrada Principal (webcam) -->
            <video 
              *ngIf="camera.id === '1' && webcamStream" 
              #webcamVideo
              [srcObject]="webcamStream"
              autoplay
              playsinline
              muted
              class="camera-video">
            </video>
            <!-- Video para cámaras personalizadas con dispositivo seleccionado -->
            <video 
              *ngIf="camera.isCustom && getCameraStream(camera)" 
              [srcObject]="getCameraStream(camera)"
              autoplay
              playsinline
              muted
              class="camera-video">
            </video>
            <!-- Placeholder para otras cámaras -->
            <div *ngIf="(camera.id !== '1' || !webcamStream) && (!camera.isCustom || !getCameraStream(camera))" class="camera-placeholder"></div>
            <!-- Mensaje de error si no se puede acceder a la webcam -->
            <div *ngIf="camera.id === '1' && webcamError" class="camera-error">
              <p>{{ webcamError }}</p>
            </div>
          </div>
          <div class="camera-info">
            <h3 class="camera-name">{{ camera.name }}</h3>
            <p class="camera-location">{{ camera.location }}</p>
            <div class="camera-status">
              <span class="status-dot" [class.online]="getCameraStatus(camera) === 'online'" [class.offline]="getCameraStatus(camera) === 'offline'"></span>
              <span class="status-text">{{ getCameraStatus(camera) === 'online' ? 'En línea' : 'Fuera de línea' }}</span>
            </div>
            <!-- Botón para seleccionar dispositivo (solo para cámaras personalizadas) -->
            <button 
              *ngIf="camera.isCustom && (camera.connectionType === 'usb' || camera.connectionType === 'ip')" 
              class="btn-select-device" 
              (click)="selectDeviceForCamera(camera); $event.stopPropagation()"
              title="Seleccionar dispositivo de video"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Seleccionar dispositivo
            </button>
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

      <!-- Device Selection Modal -->
      <div *ngIf="showDeviceSelectionModal" class="configure-modal-overlay" (click)="closeDeviceSelectionModal()">
        <div class="configure-modal-container" (click)="$event.stopPropagation()">
          <div class="configure-modal-header">
            <h2 class="configure-modal-title">Seleccionar Dispositivo de Video</h2>
            <button class="btn-close-modal" (click)="closeDeviceSelectionModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="device-selection-content">
            <p class="device-selection-info">Selecciona el dispositivo de video que deseas usar para esta cámara:</p>
            
            <div *ngIf="availableDevices.length === 0" class="no-devices">
              <p>No se encontraron dispositivos de video disponibles.</p>
            </div>

            <div class="devices-list">
              <button 
                *ngFor="let device of availableDevices" 
                class="device-item"
                (click)="selectDevice(device)"
                [class.selected]="selectedDeviceId === device.deviceId"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <div class="device-info">
                  <span class="device-name">{{ device.label || 'Dispositivo sin nombre' }}</span>
                  <span class="device-id">{{ device.deviceId.substring(0, 20) }}...</span>
                </div>
              </button>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="closeDeviceSelectionModal()">Cancelar</button>
              <button type="button" class="btn-submit" (click)="confirmDeviceSelection()" [disabled]="!selectedDeviceId">Confirmar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Configure Camera Modal -->
      <div *ngIf="showConfigureModal" class="configure-modal-overlay" (click)="closeConfigureModal()">
        <div class="configure-modal-container" (click)="$event.stopPropagation()">
          <div class="configure-modal-header">
            <h2 class="configure-modal-title">Agregar Nueva Cámara</h2>
            <button class="btn-close-modal" (click)="closeConfigureModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <form (ngSubmit)="addCamera()" class="configure-modal-form">
            <div class="form-group">
              <label class="form-label">Nombre de la Cámara</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="newCamera.name" 
                name="cameraName"
                placeholder="Ej: Cámara de mi casa"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Ubicación</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="newCamera.location" 
                name="cameraLocation"
                placeholder="Ej: Sala principal"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Tipo de Cámara</label>
              <select 
                class="form-input" 
                [(ngModel)]="newCamera.connectionType" 
                name="connectionType"
                (change)="onConnectionTypeChange()"
                required
              >
                <option value="">Selecciona el tipo</option>
                <option value="ip">IP (Inalámbrica)</option>
                <option value="wifi">WiFi</option>
                <option value="usb">USB</option>
              </select>
            </div>

            <div class="form-group" *ngIf="newCamera.connectionType === 'ip'">
              <label class="form-label">Dirección IP</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="newCamera.ipAddress" 
                name="ipAddress"
                placeholder="Ej: 192.168.1.100"
                pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
                required
              />
              <small class="form-hint">Ingresa la dirección IP de la cámara</small>
            </div>

            <div class="form-group" *ngIf="newCamera.connectionType === 'wifi'">
              <label class="form-label">Nombre de Red WiFi (SSID)</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="newCamera.wifiSSID" 
                name="wifiSSID"
                placeholder="Ej: MiRed_WiFi"
                required
              />
              <small class="form-hint">Nombre de la red WiFi a la que está conectada la cámara</small>
            </div>

            <div class="form-group" *ngIf="newCamera.connectionType === 'wifi'">
              <label class="form-label">Contraseña WiFi (Opcional)</label>
              <input 
                type="password" 
                class="form-input" 
                [(ngModel)]="newCamera.wifiPassword" 
                name="wifiPassword"
                placeholder="Contraseña de la red WiFi"
              />
            </div>

            <div class="form-group" *ngIf="newCamera.connectionType === 'usb'">
              <label class="form-label">Nombre del Dispositivo USB</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="newCamera.usbDeviceName" 
                name="usbDeviceName"
                placeholder="Ej: USB Camera Device 001"
                required
              />
              <small class="form-hint">Nombre o identificador del dispositivo USB conectado</small>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="closeConfigureModal()">Cancelar</button>
              <button type="submit" class="btn-submit" [disabled]="!isFormValid()">Agregar Cámara</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Expanded Camera View -->
      <div *ngIf="expandedCamera" class="expanded-camera-overlay" (click)="closeExpandedView()">
        <div class="expanded-camera-container" (click)="$event.stopPropagation()">
          <div class="expanded-camera-header">
            <div class="expanded-camera-info">
              <h2 class="expanded-camera-name">{{ expandedCamera.name }}</h2>
              <p class="expanded-camera-location">{{ expandedCamera.location }}</p>
            </div>
            <button class="btn-close-expanded" (click)="closeExpandedView()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="expanded-camera-preview">
            <!-- Video para Entrada Principal (webcam) -->
            <video 
              *ngIf="expandedCamera.id === '1' && webcamStream" 
              #expandedWebcamVideo
              [srcObject]="webcamStream"
              autoplay
              playsinline
              muted
              class="expanded-camera-video">
            </video>
            <!-- Video para cámaras personalizadas con dispositivo seleccionado -->
            <video 
              *ngIf="expandedCamera.isCustom && getCameraStream(expandedCamera)" 
              [srcObject]="getCameraStream(expandedCamera)"
              autoplay
              playsinline
              muted
              class="expanded-camera-video">
            </video>
            <!-- Placeholder para otras cámaras -->
            <div *ngIf="(expandedCamera.id !== '1' || !webcamStream) && (!expandedCamera.isCustom || !getCameraStream(expandedCamera))" class="expanded-camera-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <p>Vista previa no disponible</p>
            </div>
            <!-- Mensaje de error si no se puede acceder a la webcam -->
            <div *ngIf="expandedCamera.id === '1' && webcamError" class="expanded-camera-error">
              <p>{{ webcamError }}</p>
            </div>
          </div>
          <div class="expanded-camera-status">
            <span class="status-dot" [class.online]="getCameraStatus(expandedCamera) === 'online'" [class.offline]="getCameraStatus(expandedCamera) === 'offline'"></span>
            <span class="status-text">{{ getCameraStatus(expandedCamera) === 'online' ? 'En línea' : 'Fuera de línea' }}</span>
          </div>
        </div>
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

    .camera-close {
      position: absolute;
      top: 12px;
      right: 12px;
      background-color: rgba(220, 53, 69, 0.7);
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

    .camera-close:hover {
      background-color: rgba(220, 53, 69, 0.9);
    }

    .camera-close svg {
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

    .camera-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }

    .camera-error {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(220, 53, 69, 0.1);
      border-radius: 8px;
      padding: 16px;
    }

    .camera-error p {
      color: #dc3545;
      font-size: 12px;
      text-align: center;
      margin: 0;
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
      margin-bottom: 8px;
    }

    .btn-select-device {
      margin-top: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid rgba(32, 178, 170, 0.5);
      background-color: rgba(32, 178, 170, 0.1);
      color: #20b2aa;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.3s ease;
      width: 100%;
      justify-content: center;
    }

    .btn-select-device:hover {
      background-color: rgba(32, 178, 170, 0.2);
      border-color: #20b2aa;
    }

    .btn-select-device svg {
      width: 16px;
      height: 16px;
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

    /* Expanded Camera View */
    .expanded-camera-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.9);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .expanded-camera-container {
      background-color: #2a2a2a;
      border-radius: 16px;
      width: 100%;
      max-width: 1200px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .expanded-camera-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .expanded-camera-info {
      flex: 1;
    }

    .expanded-camera-name {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 4px 0;
    }

    .expanded-camera-location {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }

    .btn-close-expanded {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
      border: none;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;
    }

    .btn-close-expanded:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .btn-close-expanded svg {
      width: 24px;
      height: 24px;
    }

    .expanded-camera-preview {
      width: 100%;
      aspect-ratio: 16 / 9;
      background-color: #1a1a1a;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .expanded-camera-video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .expanded-camera-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      color: rgba(255, 255, 255, 0.5);
    }

    .expanded-camera-placeholder svg {
      width: 64px;
      height: 64px;
    }

    .expanded-camera-placeholder p {
      font-size: 14px;
      margin: 0;
    }

    .expanded-camera-error {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(220, 53, 69, 0.1);
      padding: 16px;
    }

    .expanded-camera-error p {
      color: #dc3545;
      font-size: 16px;
      text-align: center;
      margin: 0;
    }

    .expanded-camera-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .expanded-camera-status .status-dot {
      width: 12px;
      height: 12px;
    }

    .expanded-camera-status .status-text {
      font-size: 14px;
      font-weight: 500;
    }

    /* Configure Modal */
    .configure-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .configure-modal-container {
      background-color: #2a2a2a;
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .configure-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .configure-modal-title {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .btn-close-modal {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
      border: none;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;
    }

    .btn-close-modal:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .btn-close-modal svg {
      width: 20px;
      height: 20px;
    }

    .configure-modal-form {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
    }

    .form-input {
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background-color: #1a1a1a;
      color: #ffffff;
      font-size: 14px;
      outline: none;
      transition: border-color 0.3s ease;
    }

    .form-input:focus {
      border-color: #20b2aa;
    }

    .form-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .form-hint {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      margin-top: -4px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .btn-cancel {
      flex: 1;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background-color: transparent;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-cancel:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .btn-submit {
      flex: 1;
      padding: 12px 16px;
      border-radius: 8px;
      border: none;
      background-color: #20b2aa;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: #1a9d96;
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Device Selection Modal */
    .device-selection-content {
      padding: 20px;
    }

    .device-selection-info {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 20px;
    }

    .no-devices {
      text-align: center;
      padding: 40px 20px;
      color: rgba(255, 255, 255, 0.6);
    }

    .devices-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
      max-height: 300px;
      overflow-y: auto;
    }

    .device-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background-color: #1a1a1a;
      color: #ffffff;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
    }

    .device-item:hover {
      background-color: #2a2a2a;
      border-color: rgba(32, 178, 170, 0.5);
    }

    .device-item.selected {
      background-color: rgba(32, 178, 170, 0.2);
      border-color: #20b2aa;
    }

    .device-item svg {
      width: 20px;
      height: 20px;
      color: #20b2aa;
      flex-shrink: 0;
    }

    .device-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .device-name {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
    }

    .device-id {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
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
export class CamerasComponent implements OnInit, OnDestroy {
  @ViewChild('webcamVideo', { static: false }) webcamVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('expandedWebcamVideo', { static: false }) expandedWebcamVideo!: ElementRef<HTMLVideoElement>;
  
  cameras: Camera[] = [
    { id: '1', name: 'Entrada Principal', location: 'Puerta Principal', status: 'offline' },
    { id: '2', name: 'Entrada Vehicular', location: 'Portón Principal', status: 'offline' },
    { id: '3', name: 'Área Común', location: 'Zona de Recreación', status: 'offline' },
    { id: '4', name: 'Administración', location: 'Oficinas Principales', status: 'offline' }
  ];

  hiddenCameraIds: Set<string> = new Set();
  webcamStream: MediaStream | null = null;
  webcamError: string = '';
  expandedCamera: Camera | null = null;
  isResident: boolean = false;
  showConfigureModal: boolean = false;
  showDeviceSelectionModal: boolean = false;
  newCamera: Partial<Camera> = {
    name: '',
    location: '',
    connectionType: undefined,
    ipAddress: '',
    wifiSSID: '',
    wifiPassword: '',
    usbDeviceName: ''
  };
  currentUserId: string | null = null;
  availableDevices: MediaDeviceInfo[] = [];
  selectedDeviceId: string | null = null;
  cameraForDeviceSelection: Camera | null = null;
  cameraStreams: Map<string, MediaStream> = new Map();

  get totalCameras(): number {
    return this.cameras.length;
  }

  get activeCameras(): number {
    return this.cameras.filter(c => c.status === 'online').length;
  }

  get visibleCameras(): Camera[] {
    return this.cameras.filter(camera => !this.hiddenCameraIds.has(camera.id));
  }

  getCameraStatus(camera: Camera): 'online' | 'offline' {
    // La cámara "Entrada Principal" está en línea solo si hay stream de webcam
    if (camera.id === '1') {
      return this.webcamStream && !this.webcamError ? 'online' : 'offline';
    }
    // Las cámaras personalizadas están en línea si tienen un stream activo
    if (camera.isCustom) {
      return this.cameraStreams.has(camera.id) ? 'online' : 'offline';
    }
    // Las otras cámaras están fuera de línea por defecto (no tienen feed)
    return 'offline';
  }

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario es residente
    this.checkUserRole();
    
    // Conectar a la webcam para la cámara "Entrada Principal"
    this.connectWebcam();
  }

  checkUserRole(): void {
    const profile = this.authService.getCachedProfile();
    const user = this.authService.getCurrentUser();
    
    if (profile) {
      const role = profile.role?.toLowerCase();
      this.isResident = role === 'resident' || role === 'residente';
    }

    if (user) {
      this.currentUserId = user.id;
    }

    // Cargar cámaras personalizadas del residente
    if (this.isResident && this.currentUserId) {
      this.loadUserCameras();
    }
  }

  loadUserCameras(): void {
    if (!this.currentUserId) return;

    const savedCameras = localStorage.getItem(`user_cameras_${this.currentUserId}`);
    if (savedCameras) {
      try {
        const userCameras: Camera[] = JSON.parse(savedCameras);
        // Agregar las cámaras del usuario a la lista
        userCameras.forEach(camera => {
          camera.isCustom = true;
          camera.userId = this.currentUserId || undefined;
          // Generar un ID único si no existe
          if (!camera.id) {
            camera.id = `user_${this.currentUserId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          }
          this.cameras.push(camera);
        });
      } catch (error) {
        console.error('Error al cargar cámaras del usuario:', error);
      }
    }
  }

  saveUserCameras(): void {
    if (!this.currentUserId) return;

    const userCameras = this.cameras.filter(c => c.isCustom && c.userId === this.currentUserId);
    localStorage.setItem(`user_cameras_${this.currentUserId}`, JSON.stringify(userCameras));
  }

  ngOnDestroy(): void {
    // Detener el stream de la webcam al destruir el componente
    this.stopWebcam();
    // Detener todos los streams de cámaras personalizadas
    this.cameraStreams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    this.cameraStreams.clear();
  }

  async connectWebcam(): Promise<void> {
    try {
      // Solicitar acceso a la webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Para la cámara frontal, usar 'environment' para la trasera
        },
        audio: false
      });

      this.webcamStream = stream;
      this.webcamError = '';

      // Actualizar el estado de la cámara a online cuando se conecta
      const entradaPrincipal = this.cameras.find(c => c.id === '1');
      if (entradaPrincipal) {
        entradaPrincipal.status = 'online';
      }

      // Esperar a que el video esté listo y asignar el stream
      setTimeout(() => {
        if (this.webcamVideo && this.webcamVideo.nativeElement) {
          this.webcamVideo.nativeElement.srcObject = stream;
        }
        if (this.expandedWebcamVideo && this.expandedWebcamVideo.nativeElement) {
          this.expandedWebcamVideo.nativeElement.srcObject = stream;
        }
      }, 100);
    } catch (error: any) {
      console.error('Error al acceder a la webcam:', error);
      this.webcamError = 'No se pudo acceder a la webcam. Verifica los permisos.';
      
      // Actualizar el estado de la cámara a offline si hay error
      const entradaPrincipal = this.cameras.find(c => c.id === '1');
      if (entradaPrincipal) {
        entradaPrincipal.status = 'offline';
      }
    }
  }

  stopWebcam(): void {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => {
        track.stop();
      });
      this.webcamStream = null;
    }
  }

  goBack(): void {
    // Si es admin, regresar al dashboard; si es residente, regresar al home
    if (this.isResident) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  openSettings(): void {
    console.log('Abrir configuración');
  }

  viewAll(): void {
    // Mostrar todas las cámaras (limpiar la lista de cámaras ocultas)
    this.hiddenCameraIds.clear();
  }

  configure(): void {
    if (this.isResident) {
      this.showConfigureModal = true;
      // Resetear el formulario
      this.newCamera = {
        name: '',
        location: '',
        connectionType: undefined,
        ipAddress: '',
        wifiSSID: '',
        wifiPassword: ''
      };
    } else {
      console.log('Configurar cámaras (solo para administradores)');
    }
  }

  closeConfigureModal(): void {
    this.showConfigureModal = false;
    this.newCamera = {
      name: '',
      location: '',
      connectionType: undefined,
      ipAddress: '',
      wifiSSID: '',
      wifiPassword: '',
      usbDeviceName: ''
    };
  }

  onConnectionTypeChange(): void {
    // Limpiar campos cuando cambia el tipo de conexión
    this.newCamera.ipAddress = '';
    this.newCamera.wifiSSID = '';
    this.newCamera.wifiPassword = '';
    this.newCamera.usbDeviceName = '';
  }

  isFormValid(): boolean {
    if (!this.newCamera.name || !this.newCamera.location || !this.newCamera.connectionType) {
      return false;
    }

    if (this.newCamera.connectionType === 'ip') {
      return !!this.newCamera.ipAddress && this.isValidIP(this.newCamera.ipAddress);
    }

    if (this.newCamera.connectionType === 'wifi') {
      return !!this.newCamera.wifiSSID;
    }

    if (this.newCamera.connectionType === 'usb') {
      return !!this.newCamera.usbDeviceName;
    }

    return false;
  }

  isValidIP(ip: string): boolean {
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip)) {
      return false;
    }
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  addCamera(): void {
    if (!this.isFormValid() || !this.currentUserId) return;

    const newCamera: Camera = {
      id: `user_${this.currentUserId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: this.newCamera.name || '',
      location: this.newCamera.location || '',
      status: 'offline', // Inicia como offline hasta que se conecte
      connectionType: this.newCamera.connectionType,
      ipAddress: this.newCamera.ipAddress,
      wifiSSID: this.newCamera.wifiSSID,
      wifiPassword: this.newCamera.wifiPassword,
      usbDeviceName: this.newCamera.usbDeviceName,
      userId: this.currentUserId,
      isCustom: true
    };

    this.cameras.push(newCamera);
    this.saveUserCameras();
    this.closeConfigureModal();
  }

  expandCamera(camera: Camera): void {
    this.expandedCamera = camera;
    
    // Si es la cámara de Entrada Principal y hay stream, asegurar que se muestre en la vista expandida
    if (camera.id === '1' && this.webcamStream) {
      setTimeout(() => {
        if (this.expandedWebcamVideo && this.expandedWebcamVideo.nativeElement) {
          this.expandedWebcamVideo.nativeElement.srcObject = this.webcamStream;
        }
      }, 100);
    }
  }

  closeExpandedView(): void {
    this.expandedCamera = null;
  }

  hideCamera(camera: Camera): void {
    // Si es una cámara personalizada del usuario, eliminarla completamente
    if (camera.isCustom && camera.userId === this.currentUserId) {
      // Detener el stream si existe
      const stream = this.cameraStreams.get(camera.id);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        this.cameraStreams.delete(camera.id);
      }
      
      this.cameras = this.cameras.filter(c => c.id !== camera.id);
      this.saveUserCameras();
      // Si la cámara eliminada está expandida, cerrar la vista expandida
      if (this.expandedCamera?.id === camera.id) {
        this.closeExpandedView();
      }
    } else {
      // Si es una cámara general, solo ocultarla
      this.hiddenCameraIds.add(camera.id);
      // Si la cámara oculta está expandida, cerrar la vista expandida
      if (this.expandedCamera?.id === camera.id) {
        this.closeExpandedView();
      }
    }
  }

  async selectDeviceForCamera(camera: Camera): Promise<void> {
    this.cameraForDeviceSelection = camera;
    this.selectedDeviceId = null;
    
    try {
      // Obtener lista de dispositivos de video disponibles
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (this.availableDevices.length === 0) {
        alert('No se encontraron dispositivos de video disponibles.');
        return;
      }
      
      this.showDeviceSelectionModal = true;
    } catch (error) {
      console.error('Error al obtener dispositivos:', error);
      alert('Error al obtener la lista de dispositivos de video.');
    }
  }

  selectDevice(device: MediaDeviceInfo): void {
    this.selectedDeviceId = device.deviceId;
  }

  async confirmDeviceSelection(): Promise<void> {
    if (!this.selectedDeviceId || !this.cameraForDeviceSelection) return;

    try {
      // Detener stream anterior si existe
      const oldStream = this.cameraStreams.get(this.cameraForDeviceSelection.id);
      if (oldStream) {
        oldStream.getTracks().forEach(track => track.stop());
      }

      // Obtener stream del dispositivo seleccionado
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: this.selectedDeviceId }
        },
        audio: false
      });

      // Guardar el stream
      this.cameraStreams.set(this.cameraForDeviceSelection.id, stream);
      
      // Actualizar el estado de la cámara a online
      const camera = this.cameras.find(c => c.id === this.cameraForDeviceSelection?.id);
      if (camera) {
        camera.status = 'online';
      }

      this.closeDeviceSelectionModal();
    } catch (error: any) {
      console.error('Error al conectar al dispositivo:', error);
      alert('Error al conectar al dispositivo seleccionado. Verifica los permisos.');
    }
  }

  closeDeviceSelectionModal(): void {
    this.showDeviceSelectionModal = false;
    this.cameraForDeviceSelection = null;
    this.selectedDeviceId = null;
    this.availableDevices = [];
  }

  getCameraStream(camera: Camera): MediaStream | null {
    if (camera.isCustom) {
      return this.cameraStreams.get(camera.id) || null;
    }
    return null;
  }
}
