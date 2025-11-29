import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1 class="dashboard-title">AICP Dashboard</h1>
        <div class="user-info">
          <span class="user-name">{{ profile?.name || profile?.user_name || user?.email || 'Usuario' }}</span>
          <button class="btn-logout" (click)="logout()">Cerrar Sesión</button>
        </div>
      </header>
      
      <main class="dashboard-content">
        <div class="welcome-card">
          <h2 class="welcome-title">Bienvenido, {{ profile?.name || profile?.user_name || 'Usuario' }}</h2>
          <p class="welcome-role">Rol: {{ profile?.role || 'N/A' }}</p>
        </div>
        
        <div class="actions-grid">
          <div class="action-card" (click)="navigateTo('visitors/list')">
            <h3 class="card-title">Visitantes</h3>
            <p class="card-subtitle">Gestionar visitantes</p>
          </div>
          
          <div class="action-card" (click)="navigateTo('pending-registrations')">
            <h3 class="card-title">Registros Pendientes</h3>
            <p class="card-subtitle">Revisar solicitudes</p>
          </div>
          
          <div class="action-card" (click)="navigateTo('history')">
            <h3 class="card-title">Historial</h3>
            <p class="card-subtitle">Ver registros</p>
          </div>
          
          <div class="action-card" (click)="navigateTo('cameras')">
            <h3 class="card-title">Cámaras</h3>
            <p class="card-subtitle">Sistema de vigilancia</p>
          </div>
          
          <div class="action-card" (click)="navigateTo('access-report')">
            <h3 class="card-title">Reporte de Accesos</h3>
            <p class="card-subtitle">Ver reportes</p>
          </div>
          
          <div class="action-card" (click)="navigateTo('incident-report')">
            <h3 class="card-title">Reporte de Incidentes</h3>
            <p class="card-subtitle">Gestionar incidentes</p>
          </div>
          
          <div class="action-card" (click)="navigateTo('admin-banner')">
            <h3 class="card-title">Banner Admin</h3>
            <p class="card-subtitle">Gestionar banners</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background-color: #1a1a1a;
    }
    
    .dashboard-header {
      background-color: #2a2a2a;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .dashboard-title {
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
    
    .dashboard-content {
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
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      max-width: 1200px;
    }
    
    .action-card {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 24px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
      background-color: #333333;
    }
    
    .card-title {
      font-size: 20px;
      font-weight: 700;
      color: #007bff;
      margin: 0 0 8px 0;
    }
    
    .card-subtitle {
      font-size: 14px;
      color: #ffffff;
      margin: 0;
    }
  `]
})
export class DashboardComponent implements OnInit {
  user: any = null;
  profile: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.profile = this.authService.getCachedProfile();
    
    if (!this.user) {
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

