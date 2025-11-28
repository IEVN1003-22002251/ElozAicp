import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="user-info-header">
          <div class="user-details">
            <span class="username">{{ profile?.user_name || profile?.name || 'Usuario' }}</span>
            <div class="location-info">
              <span class="location-label">Fraccionamiento</span>
              <span class="location-value">{{ profile?.fraccionamiento_name || 'Villas 123' }}</span>
            </div>
          </div>
          <div class="logo-header">
            <img src="assets/eloz-logo.png" alt="ELOZ SEGURIDAD" class="eloz-logo" />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn-visitors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </button>
          <button class="btn-personnel">
            <span>PERSONAL ACTIVADO</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
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
            <div class="card-icon blue">
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

        <!-- Promotional Banner -->
        <div class="promo-banner" (click)="contactBusiness()">
          <div class="banner-content">
            <div class="banner-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div class="banner-text">
              <div class="banner-header">
                <h4>¿Tienes una empresa?</h4>
                <span class="ad-tag">PUBLICIDAD</span>
              </div>
              <p class="banner-description">¿Quieres poner acceso privado o conoces alguna empresa que lo necesite? ¡Contáctanos!</p>
              <span class="banner-cta">Toca para contactar →</span>
            </div>
          </div>
        </div>
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
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
          </svg>
          <span>Perfil</span>
        </div>
      </nav>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
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
      gap: 8px;
    }

    .location-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }

    .location-value {
      font-size: 14px;
      font-weight: 500;
      color: #ffffff;
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
    }

    .btn-visitors {
      flex: 1;
      background-color: #dc3545;
      border: none;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-visitors:hover {
      background-color: #c82333;
    }

    .btn-personnel {
      flex: 1;
      background-color: #20c997;
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
      transition: background-color 0.3s ease;
    }

    .btn-personnel:hover {
      background-color: #1aa179;
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
      background-color: rgba(255, 255, 255, 0.05);
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
      background-color: rgba(255, 255, 255, 0.1);
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
      background-color: rgba(0, 123, 255, 0.2);
      color: #007bff;
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
      background-color: rgba(255, 255, 255, 0.05);
      border-left: 4px solid #ff9800;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .promo-banner:hover {
      background-color: rgba(255, 255, 255, 0.08);
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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.profile = this.authService.getCachedProfile();
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/sing-in']);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  contactBusiness(): void {
    // Implementar lógica de contacto
    console.log('Contactar empresa');
  }
}
