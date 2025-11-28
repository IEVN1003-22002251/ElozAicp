import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>AICP Dashboard</h1>
        <div class="user-info">
          <span>{{ profile?.name || user?.email }}</span>
          <button class="btn btn-secondary" (click)="logout()">Cerrar Sesión</button>
        </div>
      </header>
      
      <main class="dashboard-content">
        <div class="welcome-card">
          <h2>Bienvenido, {{ profile?.name || 'Usuario' }}</h2>
          <p>Rol: {{ profile?.role || 'N/A' }}</p>
        </div>
        
        <div class="actions-grid">
          <div class="action-card" (click)="navigateTo('home')">
            <h3>Inicio</h3>
            <p>Ir a la página principal</p>
          </div>
          <!-- Más acciones aquí -->
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
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .dashboard-content {
      padding: 40px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .welcome-card {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .action-card {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 24px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }
    
    .action-card h3 {
      margin-bottom: 10px;
      color: #007bff;
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
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}

