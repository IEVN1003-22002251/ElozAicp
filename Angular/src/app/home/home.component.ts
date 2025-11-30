import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ResidentPreferenceService } from '../services/resident-preference.service';
import { BannerCarouselComponent } from '../components/banner-carousel/banner-carousel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BannerCarouselComponent],
  template: `
    <div class="home-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="user-info-header">
          <div class="user-details">
            <span class="username">{{ profile?.name || profile?.user_name || 'Usuario' }}</span>
            <div class="location-info" *ngIf="profile?.fraccionamiento_name || profile?.street || profile?.house_number">
              <span class="location-value">
                <span *ngIf="profile?.fraccionamiento_name">{{ profile.fraccionamiento_name }}</span>
                <span *ngIf="profile?.street"> {{ profile.street }}</span>
                <span *ngIf="profile?.house_number"> Casa {{ profile.house_number }}</span>
              </span>
            </div>
          </div>
          <div class="logo-header">
            <img src="assets/eloz-logo.png" alt="ELOZ SEGURIDAD" class="eloz-logo" />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn-visitors" [class.active]="isVisitorsActive" (click)="toggleVisitors()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>{{ isVisitorsActive ? 'VISITAS ACTIVADO' : 'VISITAS DESACTIVADO' }}</span>
          </button>
          <button class="btn-personnel" [class.active]="isPersonnelActive" (click)="togglePersonnel()">
            <span>{{ isPersonnelActive ? 'PERSONAL ACTIVADO' : 'PERSONAL DESACTIVADO' }}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">

        <!-- Functional Cards Grid -->
        <div class="cards-grid">
          <!-- Pre-registro Card -->
          <div class="function-card" (click)="navigateTo('pre-register')">
            <div class="card-icon blue">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
                <line x1="16" y1="11" x2="22" y2="11"></line>
                <line x1="19" y1="8" x2="19" y2="14"></line>
              </svg>
            </div>
            <h3 class="card-title">Pre-registro</h3>
            <p class="card-subtitle">Registrar nuevo visitante</p>
          </div>

          <!-- QR Code Card -->
          <div class="function-card" (click)="navigateTo('qr-access')">
            <div class="card-icon green">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="5" height="5"></rect>
                <rect x="16" y="3" width="5" height="5"></rect>
                <rect x="3" y="16" width="5" height="5"></rect>
                <path d="M21 16h-3"></path>
                <path d="M9 21h3"></path>
                <path d="M13 21h3"></path>
                <path d="M21 12v-1"></path>
                <path d="M12 21v-3"></path>
              </svg>
            </div>
            <h3 class="card-title">Registro Código QR</h3>
            <p class="card-subtitle">Ver tu código QR permanente</p>
          </div>

          <!-- Historial Card -->
          <div class="function-card" (click)="navigateTo('history')">
            <div class="card-icon yellow">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 class="card-title">Historial</h3>
            <p class="card-subtitle">Ver registros</p>
          </div>

          <!-- Cámaras Card -->
          <div class="function-card" (click)="navigateTo('cameras')">
            <div class="card-icon blue">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
            <h3 class="card-title">Cámaras</h3>
            <p class="card-subtitle">Sistema de vigilancia</p>
          </div>
        </div>

        <!-- Banner Carousel -->
        <app-banner-carousel></app-banner-carousel>
      </div>

      <!-- Bottom Navigation -->
      <nav class="bottom-nav">
        <div class="nav-item active" (click)="navigateTo('home')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Inicio</span>
        </div>
        <div class="nav-item" (click)="navigateTo('chat')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Chat</span>
        </div>
        <div class="nav-item" (click)="navigateTo('notifications')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span>Notificaciones</span>
        </div>
        <div class="nav-item" (click)="navigateTo('profile')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Perfil</span>
        </div>
      </nav>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      background-color: #1a1a2e;
      padding-bottom: 80px;
    }

    /* Header Section */
    .header-section {
      padding: 16px 20px;
    }

    .user-info-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .user-details {
      flex: 1;
    }

    .username {
      display: block;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .location-info {
      display: flex;
      align-items: center;
      margin-top: 4px;
    }

    .location-value {
      font-size: 14px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.4;
    }

    .logo-header {
      flex-shrink: 0;
    }

    .eloz-logo {
      height: 40px;
      width: auto;
      filter: brightness(0) invert(1);
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      position: relative;
      width: 100%;
      justify-content: space-between;
    }

    .btn-visitors {
      flex: 0 0 auto;
      width: 60px;
      max-width: 50%;
      background-color: #dc3545 !important;
      border: none;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: right center;
      overflow: hidden;
      position: relative;
    }

    .btn-visitors:hover {
      width: 50%;
      flex: 1;
      transform: scaleX(1);
    }

    .btn-visitors:not(.active) {
      background-color: #dc3545 !important;
    }

    .btn-visitors:not(.active):hover {
      background-color: #c82333 !important;
    }

    .btn-visitors.active {
      background-color: #20b2aa !important;
    }

    .btn-visitors.active:hover {
      background-color: #1a9d96 !important;
    }

    .btn-visitors span {
      white-space: nowrap;
      opacity: 0;
      width: 0;
      overflow: hidden;
      transition: opacity 0.3s ease 0.1s, width 0.3s ease 0.1s;
      pointer-events: none;
    }

    .btn-visitors:hover span {
      opacity: 1;
      width: auto;
    }

    .btn-personnel {
      flex: 0 0 auto;
      width: 60px;
      max-width: 50%;
      background-color: #dc3545 !important;
      border: none;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: left center;
      overflow: hidden;
      position: relative;
    }

    .btn-personnel:hover {
      width: 50%;
      flex: 1;
      transform: scaleX(1);
    }

    .btn-personnel:not(.active) {
      background-color: #dc3545 !important;
    }

    .btn-personnel:not(.active):hover {
      background-color: #c82333 !important;
    }

    .btn-personnel.active {
      background-color: #20b2aa !important;
    }

    .btn-personnel.active:hover {
      background-color: #1a9d96 !important;
    }

    .btn-personnel span {
      white-space: nowrap;
      opacity: 0;
      width: 0;
      overflow: hidden;
      transition: opacity 0.3s ease 0.1s, width 0.3s ease 0.1s;
      pointer-events: none;
    }

    .btn-personnel:hover span {
      opacity: 1;
      width: auto;
    }

    /* Main Content */
    .main-content {
      padding: 0 20px 20px;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .function-card {
      background-color: #16213e;
      border-radius: 16px;
      padding: 20px;
      cursor: pointer;
      transition: transform 0.2s ease, background-color 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .function-card:hover {
      transform: translateY(-4px);
      background-color: #1e2a42;
    }

    .card-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    .card-icon.blue {
      background-color: rgba(100, 181, 246, 0.2);
      color: #64b5f6;
    }

    .card-icon.green {
      background-color: rgba(76, 175, 80, 0.2);
      color: #4caf50;
    }

    .card-icon.yellow {
      background-color: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .card-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }

    /* Promotional Banner */
    .promo-banner {
      background-color: #2a2a2a;
      border-left: 4px solid #ff9800;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .promo-banner:hover {
      background-color: #333333;
    }

    .banner-content {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .banner-icon {
      color: #ff9800;
      flex-shrink: 0;
    }

    .banner-text {
      flex: 1;
    }

    .banner-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .banner-header h4 {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }

    .ad-tag {
      background-color: #ff9800;
      color: #1a1a1a;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 12px;
      text-transform: uppercase;
    }

    .banner-description {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .banner-cta {
      font-size: 14px;
      color: #ff9800;
      font-weight: 600;
    }

    /* Bottom Navigation */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #2a2a2a;
      display: flex;
      justify-content: space-around;
      padding: 12px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      transition: color 0.3s ease;
      padding: 4px 16px;
    }

    .nav-item.active {
      color: #007bff;
    }

    .nav-item:hover {
      color: #ffffff;
    }

    .nav-item span {
      font-size: 12px;
      font-weight: 500;
    }

    @media (max-width: 480px) {
      .cards-grid {
        gap: 12px;
      }

      .function-card {
        padding: 16px;
      }

      .card-icon {
        width: 56px;
        height: 56px;
      }

      .card-title {
        font-size: 14px;
      }

      .card-subtitle {
        font-size: 11px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  profile: any = null;
  isPersonnelActive: boolean = true;
  isVisitorsActive: boolean = false;

  // Método para debug - verificar estado actual
  getButtonStates() {
    return {
      visitors: this.isVisitorsActive,
      personnel: this.isPersonnelActive
    };
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private preferenceService: ResidentPreferenceService
  ) {}

  ngOnInit(): void {
    this.profile = this.authService.getCachedProfile();
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/sing-in']);
      return;
    }

    // Recargar el perfil desde el backend para obtener información actualizada
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.authService.getProfile(currentUser.id).subscribe({
        next: (response) => {
          if (response.exito && response.profile) {
            this.profile = response.profile;
            // Actualizar el cache con el perfil actualizado
            localStorage.setItem('profile', JSON.stringify(response.profile));
          }
        },
        error: (error) => {
          console.error('Error al cargar el perfil:', error);
        }
      });

      // Cargar las preferencias del residente desde la BD
      this.loadPreferences(currentUser.id);
    }
  }

  /**
   * Carga las preferencias del residente desde la base de datos
   */
  loadPreferences(userId: string): void {
    console.log('Cargando preferencias para usuario:', userId);
    this.preferenceService.getPreferences(userId).subscribe({
      next: (response) => {
        console.log('Respuesta al cargar preferencias:', response);
        if (response.exito || response.success) {
          const preferences = response.data || response.preferences || response;
          if (preferences) {
            this.isVisitorsActive = preferences.accepts_visitors === true || preferences.accepts_visitors === 1;
            this.isPersonnelActive = preferences.accepts_personnel === true || preferences.accepts_personnel === 1;
            console.log('Preferencias cargadas:', {
              visits: this.isVisitorsActive,
              personnel: this.isPersonnelActive
            });
          }
        } else {
          console.log('No se encontraron preferencias, usando valores por defecto');
        }
      },
      error: (error) => {
        console.warn('⚠️ Error al cargar preferencias (usando valores por defecto):', error);
        // Si no existen preferencias o hay error, usar valores por defecto
        // Los valores por defecto ya están establecidos en las propiedades
        console.log('Valores por defecto:', {
          visits: this.isVisitorsActive,
          personnel: this.isPersonnelActive
        });
      }
    });
  }

  togglePersonnel(): void {
    console.log('Toggle PERSONAL - Estado anterior:', this.isPersonnelActive);
    this.isPersonnelActive = !this.isPersonnelActive;
    console.log('Toggle PERSONAL - Estado nuevo:', this.isPersonnelActive);
    this.savePreferenceToDatabase('personnel', this.isPersonnelActive);
  }

  toggleVisitors(): void {
    console.log('Toggle VISITAS - Estado anterior:', this.isVisitorsActive);
    this.isVisitorsActive = !this.isVisitorsActive;
    console.log('Toggle VISITAS - Estado nuevo:', this.isVisitorsActive);
    this.savePreferenceToDatabase('visitors', this.isVisitorsActive);
  }

  /**
   * Guarda la preferencia del residente en la base de datos
   */
  private savePreferenceToDatabase(type: 'visitors' | 'personnel', value: boolean): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      console.error('No se puede guardar la preferencia: usuario no autenticado');
      return;
    }

    const userId = currentUser.id;
    console.log(`Guardando preferencia ${type} para usuario ${userId}:`, value);
    
    if (type === 'visitors') {
      this.preferenceService.updateVisitorPreference(userId, value).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor (visitas):', response);
          if (response.exito || response.success) {
            console.log('✅ Preferencia de visitas actualizada correctamente:', value);
          } else {
            console.warn('⚠️ Respuesta del servidor sin éxito:', response.mensaje || response.message);
            // No revertir, mantener el cambio visual aunque el backend no responda correctamente
          }
        },
        error: (error) => {
          console.error('❌ Error al guardar preferencia de visitas:', error);
          console.error('Detalles del error:', error.error || error.message);
          // NO revertir el cambio - mantener el estado visual aunque falle el backend
          // Esto permite que funcione en modo offline o si el backend no está disponible
        }
      });
    } else if (type === 'personnel') {
      this.preferenceService.updatePersonnelPreference(userId, value).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor (personal):', response);
          if (response.exito || response.success) {
            console.log('✅ Preferencia de personal actualizada correctamente:', value);
          } else {
            console.warn('⚠️ Respuesta del servidor sin éxito:', response.mensaje || response.message);
            // No revertir, mantener el cambio visual
          }
        },
        error: (error) => {
          console.error('❌ Error al guardar preferencia de personal:', error);
          console.error('Detalles del error:', error.error || error.message);
          // NO revertir el cambio - mantener el estado visual aunque falle el backend
        }
      });
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

}
