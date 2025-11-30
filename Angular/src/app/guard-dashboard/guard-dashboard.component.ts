import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
      background-color: #1a1a1a;
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
      background-color: #6c757d;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    
    .btn-logout:hover {
      background-color: #5a6268;
    }
    
    .guard-dashboard-content {
      padding: 40px;
      background-color: #1a1a1a;
    }
    
    .welcome-card {
      background-color: #2a2a2a;
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
      background-color: #2a2a2a;
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
      background-color: #333333;
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
export class GuardDashboardComponent implements OnInit {
  user: any = null;
  profile: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.profile = this.authService.getCachedProfile();
    
    // Verificar que el usuario es guardia
    if (!this.user || (this.profile?.role !== 'guard' && this.profile?.role !== 'admin')) {
      this.router.navigate(['/auth/sing-in']);
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

