import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-guard-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="guard-dashboard-container">
      <header class="guard-dashboard-header">
        <h1 class="guard-dashboard-title">Dashboard de Guardia</h1>
        <div class="user-info">
          <span class="user-name">{{ profile?.name || profile?.user_name || user?.email || 'Guardia' }}</span>
          <button class="btn-logout" (click)="logout()">Cerrar Sesión</button>
        </div>
      </header>
      
      <main class="guard-dashboard-content">
        <!-- Emergency Alert Modal -->
        <div class="emergency-modal-overlay" *ngIf="currentEmergencyAlert" (click)="false">
          <div class="emergency-modal" (click)="$event.stopPropagation()">
            <div class="emergency-modal-header">
              <div class="emergency-modal-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h2 class="emergency-modal-title">{{ currentEmergencyAlert.title }}</h2>
              <span class="emergency-modal-time">{{ formatTime(currentEmergencyAlert.created_at) }}</span>
            </div>
            <div class="emergency-modal-body">
              <div class="emergency-modal-message">{{ currentEmergencyAlert.message }}</div>
            </div>
            <div class="emergency-modal-footer">
              <button class="btn-attended" (click)="markAlertAsAttended()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Atendido
              </button>
            </div>
          </div>
        </div>

        <div class="welcome-card">
          <h2 class="welcome-title">Bienvenido, {{ profile?.name || profile?.user_name || 'Guardia' }}</h2>
          <p class="welcome-role">Rol: Guardia de Seguridad</p>
        </div>
        
        <div class="actions-grid">
          <div class="action-card scanner-card" (click)="navigateTo('guard-qr-scanner')">
            <div class="card-icon">
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
            <h3 class="card-title">Escanear QR</h3>
            <p class="card-subtitle">Aprobar acceso de residentes y visitantes</p>
          </div>
          
          <div class="action-card history-card" (click)="navigateTo('guard-access-history')">
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 class="card-title">Historial de Accesos</h3>
            <p class="card-subtitle">Ver accesos en tiempo real</p>
          </div>
          
          <div class="action-card cameras-card" (click)="navigateTo('cameras')">
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
            <h3 class="card-title">Control de Cámaras</h3>
            <p class="card-subtitle">Sistema de vigilancia</p>
          </div>
          
          <div class="action-card report-card" (click)="navigateTo('access-report')">
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 class="card-title">Reporte de Accesos</h3>
            <p class="card-subtitle">Ver reportes estadísticos</p>
          </div>
          
          <div class="action-card incident-card" (click)="navigateTo('incident-report')">
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3 class="card-title">Reporte de Incidentes</h3>
            <p class="card-subtitle">Gestionar incidentes</p>
          </div>
          
          <div class="action-card messages-card" (click)="navigateTo('admin-banner')">
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h3 class="card-title">Recados</h3>
            <p class="card-subtitle">Gestionar recados y avisos</p>
          </div>
          
          <div class="action-card chat-card" (click)="navigateTo('chat')">
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 class="card-title">Chat</h3>
            <p class="card-subtitle">Comunicarse con residentes</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .guard-dashboard-container {
      min-height: 100vh;
      background-color: #1a1a2e;
    }
    
    .guard-dashboard-header {
      background-color: #2a2a2a;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .guard-dashboard-title {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .user-name {
      font-size: 16px;
      font-weight: 500;
      color: #ffffff;
    }
    
    .btn-logout {
      background-color: #dc3545;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    
    .btn-logout:hover {
      background-color: #c82333;
    }
    
    .guard-dashboard-content {
      padding: 40px;
      background-color: #1a1a2e;
    }
    
    .emergency-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    .emergency-modal {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(220, 53, 69, 0.6);
      animation: slideIn 0.4s ease, pulse 2s infinite;
      position: relative;
      overflow: hidden;
    }
    
    @keyframes slideIn {
      from {
        transform: scale(0.8) translateY(-50px);
        opacity: 0;
      }
      to {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 20px 60px rgba(220, 53, 69, 0.6);
      }
      50% {
        box-shadow: 0 20px 80px rgba(220, 53, 69, 0.9);
      }
    }
    
    .emergency-modal::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      animation: rotate 3s linear infinite;
    }
    
    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    
    .emergency-modal-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }
    
    .emergency-modal-icon {
      width: 80px;
      height: 80px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      animation: iconPulse 1s infinite;
    }
    
    @keyframes iconPulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }
    
    .emergency-modal-title {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      text-align: center;
    }
    
    .emergency-modal-time {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }
    
    .emergency-modal-body {
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
    }
    
    .emergency-modal-message {
      font-size: 16px;
      color: #ffffff;
      line-height: 1.8;
      white-space: pre-line;
      background-color: rgba(0, 0, 0, 0.2);
      padding: 20px;
      border-radius: 12px;
    }
    
    .emergency-modal-footer {
      display: flex;
      justify-content: center;
      position: relative;
      z-index: 1;
    }
    
    .btn-attended {
      background-color: #ffffff;
      color: #dc3545;
      border: none;
      border-radius: 12px;
      padding: 16px 32px;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .btn-attended:hover {
      background-color: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }
    
    .btn-attended:active {
      transform: translateY(0);
    }
    
    .welcome-card {
      background-color: #16213e;
      border-radius: 12px;
      padding: 40px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 800px;
    }
    
    .welcome-title {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 12px 0;
    }
    
    .welcome-role {
      font-size: 16px;
      color: #ffffff;
      margin: 0;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      max-width: 1400px;
    }
    
    .action-card {
      background-color: #16213e;
      border-radius: 12px;
      padding: 32px 24px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;
    }
    
    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 123, 255, 0.3);
      background-color: #1e2a42;
    }
    
    .card-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      margin-bottom: 8px;
    }
    
    .scanner-card .card-icon {
      background: linear-gradient(135deg, #20b2aa 0%, #1a9d96 100%);
    }
    
    .history-card .card-icon {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    }
    
    .cameras-card .card-icon {
      background: linear-gradient(135deg, #ff9800 0%, #e68900 100%);
    }
    
    .report-card .card-icon {
      background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
    }
    
    .incident-card .card-icon {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    }
    
    .messages-card .card-icon {
      background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);
    }
    
    .chat-card .card-icon {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
    }
    
    .card-title {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    
    .card-subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .guard-dashboard-content {
        padding: 20px;
      }
      
      .actions-grid {
        grid-template-columns: 1fr;
      }
      
      .welcome-title {
        font-size: 24px;
      }
    }
  `]
})
export class GuardDashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  profile: any = null;
  emergencyAlerts: any[] = [];
  currentEmergencyAlert: any = null;
  private alertsInterval: any = null;
  private audioContext: AudioContext | null = null;
  private emergencySound: HTMLAudioElement | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.profile = this.authService.getCachedProfile();
    
    // Verificar que el usuario es guardia
    if (!this.user || (this.profile?.role !== 'guard' && this.profile?.role !== 'admin')) {
      this.router.navigate(['/auth/sing-in']);
      return;
    }

    // Cargar alertas de emergencia
    this.loadEmergencyAlerts();
    
    // Recargar alertas cada 10 segundos
    this.alertsInterval = setInterval(() => {
      this.loadEmergencyAlerts();
    }, 10000);
  }

  loadEmergencyAlerts(): void {
    if (!this.user?.id) return;

    this.http.get<any>(`${environment.apiUrl}/notifications?user_id=${this.user.id}`)
      .subscribe({
        next: (response) => {
          const notifications = response.data || response.notifications || [];
          // Filtrar solo alertas de emergencia (no leídas y que contengan "ALERTA DE EMERGENCIA")
          const newAlerts = notifications.filter((n: any) => 
            !n.is_read && !n.read && n.title && n.title.includes('ALERTA DE EMERGENCIA')
          );
          
          // Si hay una nueva alerta y no hay una alerta actual mostrándose, mostrar la primera
          if (newAlerts.length > 0 && !this.currentEmergencyAlert) {
            this.currentEmergencyAlert = newAlerts[0];
            this.playEmergencySound();
          }
          
          this.emergencyAlerts = newAlerts;
        },
        error: (error) => {
          console.error('Error al cargar alertas de emergencia:', error);
        }
      });
  }

  playEmergencySound(): void {
    try {
      // Crear un sonido de alerta usando Web Audio API
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Crear un sonido de sirena/alert
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Configurar el sonido de alerta (tono agudo que sube y baja)
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
      
      // Repetir el sonido 3 veces
      setTimeout(() => {
        const oscillator2 = this.audioContext!.createOscillator();
        const gainNode2 = this.audioContext!.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(this.audioContext!.destination);
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(800, this.audioContext!.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(1200, this.audioContext!.currentTime + 0.1);
        oscillator2.frequency.exponentialRampToValueAtTime(800, this.audioContext!.currentTime + 0.2);
        gainNode2.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.2);
        oscillator2.start(this.audioContext!.currentTime);
        oscillator2.stop(this.audioContext!.currentTime + 0.2);
      }, 300);
      
      setTimeout(() => {
        const oscillator3 = this.audioContext!.createOscillator();
        const gainNode3 = this.audioContext!.createGain();
        oscillator3.connect(gainNode3);
        gainNode3.connect(this.audioContext!.destination);
        oscillator3.type = 'sine';
        oscillator3.frequency.setValueAtTime(800, this.audioContext!.currentTime);
        oscillator3.frequency.exponentialRampToValueAtTime(1200, this.audioContext!.currentTime + 0.1);
        oscillator3.frequency.exponentialRampToValueAtTime(800, this.audioContext!.currentTime + 0.2);
        gainNode3.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
        gainNode3.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.2);
        oscillator3.start(this.audioContext!.currentTime);
        oscillator3.stop(this.audioContext!.currentTime + 0.2);
      }, 600);
    } catch (error) {
      console.error('Error al reproducir sonido de emergencia:', error);
    }
  }

  markAlertAsAttended(): void {
    if (!this.currentEmergencyAlert) return;
    
    const alertId = this.currentEmergencyAlert.id;
    this.http.put<any>(`${environment.apiUrl}/notifications/${alertId}/read`, {})
      .subscribe({
        next: () => {
          // Remover la alerta actual y de la lista
          this.currentEmergencyAlert = null;
          this.emergencyAlerts = this.emergencyAlerts.filter(a => a.id !== alertId);
          
          // Si hay más alertas pendientes, mostrar la siguiente
          if (this.emergencyAlerts.length > 0) {
            this.currentEmergencyAlert = this.emergencyAlerts[0];
            this.playEmergencySound();
          }
        },
        error: (error) => {
          console.error('Error al marcar alerta como atendida:', error);
        }
      });
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Hace menos de 1 minuto';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    return date.toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  ngOnDestroy(): void {
    if (this.alertsInterval) {
      clearInterval(this.alertsInterval);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/sing-in']);
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}

