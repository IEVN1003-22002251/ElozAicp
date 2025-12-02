import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { ResidentPreferenceService } from '../services/resident-preference.service';
import { BannerCarouselComponent } from '../components/banner-carousel/banner-carousel.component';
import { environment } from '../../environments/environment';

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

        <!-- Emergency Button -->
        <div class="emergency-section">
          <button 
            class="emergency-btn" 
            [class.pressing]="isPressingEmergency"
            [class.disabled]="isEmergencyDisabled"
            (mousedown)="startEmergencyPress()"
            (mouseup)="stopEmergencyPress()"
            (mouseleave)="stopEmergencyPress()"
            (touchstart)="startEmergencyPress()"
            (touchend)="stopEmergencyPress()"
            (touchcancel)="stopEmergencyPress()">
            <div class="emergency-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <span class="emergency-text">Mantén presionado por 3 segundos</span>
            <div class="emergency-progress" [style.width.%]="emergencyProgress"></div>
          </button>
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Perfil</span>
        </div>
      </nav>
    </div>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  profile: any = null;
  isPersonnelActive = true;
  isVisitorsActive = false;
  isPressingEmergency = false;
  isEmergencyDisabled = false;
  emergencyProgress = 0;
  private emergencyPressInterval: any = null;
  private emergencyPressStartTime = 0;
  private readonly EMERGENCY_PRESS_DURATION = 3000;

  getButtonStates() {
    return { visitors: this.isVisitorsActive, personnel: this.isPersonnelActive };
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private preferenceService: ResidentPreferenceService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.profile = this.authService.getCachedProfile();
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/sing-in']);
      return;
    }
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.authService.getProfile(currentUser.id).subscribe({
        next: (res) => {
          if (res.exito && res.profile) {
            this.profile = res.profile;
            localStorage.setItem('profile', JSON.stringify(res.profile));
          }
        },
        error: (err) => console.error('Error al cargar el perfil:', err)
      });
      this.loadPreferences(currentUser.id);
    }
  }

  loadPreferences(userId: string): void {
    this.preferenceService.getPreferences(userId).subscribe({
      next: (res) => {
        if (res.exito || res.success) {
          const prefs = res.data || res.preferences || res;
          if (prefs) {
            this.isVisitorsActive = prefs.accepts_visitors === true || prefs.accepts_visitors === 1;
            this.isPersonnelActive = prefs.accepts_personnel === true || prefs.accepts_personnel === 1;
          }
        }
      },
      error: () => {}
    });
  }

  togglePersonnel(): void {
    this.isPersonnelActive = !this.isPersonnelActive;
    this.savePreferenceToDatabase('personnel', this.isPersonnelActive);
  }

  toggleVisitors(): void {
    this.isVisitorsActive = !this.isVisitorsActive;
    this.savePreferenceToDatabase('visitors', this.isVisitorsActive);
  }

  private savePreferenceToDatabase(type: 'visitors' | 'personnel', value: boolean): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return;
    const service = type === 'visitors'
      ? this.preferenceService.updateVisitorPreference(userId, value)
      : this.preferenceService.updatePersonnelPreference(userId, value);
    service.subscribe({
      next: (res) => {
        if (!(res.exito || res.success)) {
          console.warn('Respuesta del servidor sin éxito:', res.mensaje || res.message);
        }
      },
      error: (err) => console.error('Error al guardar preferencia:', err)
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  startEmergencyPress(): void {
    if (this.isEmergencyDisabled) return;
    this.isPressingEmergency = true;
    this.emergencyPressStartTime = Date.now();
    this.emergencyProgress = 0;
    this.emergencyPressInterval = setInterval(() => {
      const elapsed = Date.now() - this.emergencyPressStartTime;
      this.emergencyProgress = Math.min((elapsed / this.EMERGENCY_PRESS_DURATION) * 100, 100);
      if (elapsed >= this.EMERGENCY_PRESS_DURATION) {
        this.triggerEmergency();
        this.stopEmergencyPress();
      }
    }, 50);
  }

  stopEmergencyPress(): void {
    if (this.emergencyPressInterval) {
      clearInterval(this.emergencyPressInterval);
      this.emergencyPressInterval = null;
    }
    this.isPressingEmergency = false;
    this.emergencyProgress = 0;
  }

  triggerEmergency(): void {
    if (this.isEmergencyDisabled || !this.profile?.id) return;
    this.isEmergencyDisabled = true;
    this.http.post<any>(`${environment.apiUrl}/emergency/alert`, { resident_id: this.profile.id }).subscribe({
      next: (res) => {
        alert((res.success || res.exito)
          ? '🚨 Alerta de emergencia enviada. Los guardias han sido notificados.'
          : 'Error al enviar la alerta. Por favor intenta nuevamente.');
        setTimeout(() => this.isEmergencyDisabled = false, 5000);
      },
      error: (err) => {
        console.error('Error al enviar alerta de emergencia:', err);
        alert('Error al enviar la alerta. Por favor intenta nuevamente.');
        setTimeout(() => this.isEmergencyDisabled = false, 5000);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopEmergencyPress();
  }

}
