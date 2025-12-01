import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VisitorService } from '../services/visitor.service';

@Component({
  selector: 'app-guard-access-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="guard-history-container">
      <header class="guard-history-header">
        <h1 class="history-title">Historial de Accesos en Tiempo Real</h1>
        <div class="header-actions">
          <div class="refresh-indicator" [class.refreshing]="loading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Actualizando cada 5 segundos</span>
          </div>
          <button class="btn-back" (click)="goBack()">← Volver</button>
        </div>
      </header>

      <div class="filter-buttons">
        <button 
          class="filter-btn" 
          [class.active]="selectedFilter === 'all'"
          (click)="setFilter('all')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Todos</span>
        </button>
        
        <button 
          class="filter-btn filter-residents" 
          [class.active]="selectedFilter === 'residents'"
          (click)="setFilter('residents')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Residentes</span>
        </button>
        
        <button 
          class="filter-btn filter-visitors" 
          [class.active]="selectedFilter === 'visitors'"
          (click)="setFilter('visitors')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Visitantes</span>
        </button>
        
        <button 
          class="filter-btn filter-providers" 
          [class.active]="selectedFilter === 'providers'"
          (click)="setFilter('providers')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
          <span>Proveedores</span>
        </button>
      </div>

      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon stat-icon-total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-info">
            <p class="stat-label">Total</p>
            <p class="stat-value">{{ totalAccesses }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon stat-icon-dentro">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <div class="stat-info">
            <p class="stat-label">Dentro</p>
            <p class="stat-value">{{ dentroCount }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon stat-icon-salio">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </div>
          <div class="stat-info">
            <p class="stat-label">Salió</p>
            <p class="stat-value">{{ salioCount }}</p>
          </div>
        </div>
      </div>

      <div class="content-area">
        <div *ngIf="filteredAccesses.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <p class="empty-title">No hay accesos registrados</p>
          <p class="empty-message">Los accesos aparecerán aquí cuando se registren en el sistema.</p>
        </div>

        <div *ngIf="loading && filteredAccesses.length === 0" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando accesos...</p>
        </div>

        <div *ngIf="filteredAccesses.length > 0" class="accesses-list">
          <div 
            *ngFor="let access of filteredAccesses" 
            class="access-item"
            [class.access-dentro]="access.status === 'dentro'"
            [class.access-salio]="access.status === 'salio' || access.status === 'salió'">
            <div class="access-type-badge" [class]="'badge-' + access.type">
              <svg *ngIf="access.type === 'resident'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <svg *ngIf="access.type === 'visitor' || access.type === 'one-time'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <svg *ngIf="access.type === 'provider'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
              <span>{{ getTypeLabel(access.type) }}</span>
            </div>
            
            <div class="access-info">
              <h3 class="access-name">{{ access.name || access.visitor_name || 'N/A' }}</h3>
              <p class="access-details" *ngIf="access.resident_name">
                Residente: {{ access.resident_name }}
              </p>
              <p class="access-details" *ngIf="access.resident_address">
                Domicilio: {{ access.resident_address }}
              </p>
              <p class="access-time">{{ formatDate(access.created_at || access.timestamp) }}</p>
            </div>
            
            <div class="access-status">
              <span class="status-badge" 
                    [class.status-dentro]="access.status === 'dentro'"
                    [class.status-salio]="access.status === 'salio' || access.status === 'salió'"
                    [class.status-active]="access.status === 'active' || access.status === 'activo'">
                {{ getStatusLabel(access.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .guard-history-container {
      min-height: 100vh;
      background-color: #1a1a2e;
    }

    .guard-history-header {
      background-color: #2a2a2a;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      margin-bottom: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-back {
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

    .btn-back:hover {
      background-color: #c82333;
    }

    .history-title {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .refresh-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }

    .refresh-indicator.refreshing svg {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .filter-buttons {
      display: flex;
      gap: 12px;
      margin: 40px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 10px 20px;
      border-radius: 8px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      background-color: #16213e;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .filter-btn:hover {
      background-color: #1e2a42;
      border-color: #007bff;
      color: #ffffff;
    }

    .filter-btn.active {
      background-color: #007bff;
      border-color: #007bff;
      color: #ffffff;
    }

    .filter-residents:not(.active) {
      color: #20b2aa;
      border-color: rgba(32, 178, 170, 0.3);
    }

    .filter-visitors:not(.active) {
      color: #007bff;
      border-color: rgba(0, 123, 255, 0.3);
    }

    .filter-providers:not(.active) {
      color: #ff9800;
      border-color: rgba(255, 152, 0, 0.3);
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 0 40px 24px 40px;
    }

    .stat-card {
      background-color: #16213e;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    }

    .stat-icon-total {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    }

    .stat-icon-dentro {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
    }

    .stat-icon-salio {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    }

    .stat-info {
      flex: 1;
    }

    .stat-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 4px 0;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .content-area {
      background-color: #16213e;
      border-radius: 12px;
      padding: 24px;
      margin: 0 40px;
    }

    .accesses-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .access-item {
      background-color: #1a1a2e;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-left: 4px solid transparent;
      transition: all 0.3s ease;
    }

    .access-item.access-dentro {
      border-left-color: #ffc107;
    }

    .access-item.access-salio {
      border-left-color: #6c757d;
    }

    .access-item:hover {
      background-color: #1e2a42;
      transform: translateX(4px);
    }

    .access-type-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-resident {
      background-color: rgba(32, 178, 170, 0.2);
      color: #20b2aa;
    }

    .badge-visitor,
    .badge-one-time {
      background-color: rgba(0, 123, 255, 0.2);
      color: #007bff;
    }

    .badge-provider {
      background-color: rgba(255, 152, 0, 0.2);
      color: #ff9800;
    }

    .access-info {
      flex: 1;
    }

    .access-name {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 8px 0;
    }

    .access-details {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin: 4px 0;
    }

    .access-time {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      margin: 8px 0 0 0;
    }

    .access-status {
      display: flex;
      align-items: center;
    }

    .status-badge {
      padding: 6px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
    }

    .status-badge.status-dentro {
      background-color: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }

    .status-badge.status-salio {
      background-color: rgba(108, 117, 125, 0.2);
      color: #6c757d;
    }

    .status-badge.status-active {
      background-color: rgba(40, 167, 69, 0.2);
      color: #28a745;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      color: rgba(255, 255, 255, 0.3);
    }

    .empty-title {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 12px 0;
    }

    .empty-message {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top-color: #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .guard-history-container {
        padding: 16px;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .access-item {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class GuardAccessHistoryComponent implements OnInit, OnDestroy {
  selectedFilter: 'all' | 'residents' | 'visitors' | 'providers' = 'all';
  allAccesses: any[] = [];
  filteredAccesses: any[] = [];
  loading = false;
  totalAccesses = 0;
  dentroCount = 0;
  salioCount = 0;
  private refreshInterval: any;
  private readonly REFRESH_INTERVAL_MS = 5000; // 5 segundos

  constructor(
    private router: Router,
    private authService: AuthService,
    private visitorService: VisitorService
  ) {}

  ngOnInit(): void {
    // Verificar que el usuario es guardia
    const profile = this.authService.getCachedProfile();
    if (profile?.role !== 'guard' && profile?.role !== 'admin') {
      this.router.navigate(['/guard-dashboard']);
    }
    
    this.loadAccesses();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.loadAccesses();
    }, this.REFRESH_INTERVAL_MS);
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  loadAccesses(): void {
    this.loading = true;
    
    // Cargar todos los visitantes (incluye visitantes, proveedores, eventos)
    this.visitorService.getVisitors().subscribe({
      next: (response) => {
        const visitors = response.visitors || [];
        
        // Mapear visitantes a formato de acceso
        this.allAccesses = visitors.map((visitor: any) => ({
          id: visitor.id,
          name: visitor.name,
          visitor_name: visitor.name,
          type: visitor.type === 'provider' ? 'provider' : (visitor.type === 'event' ? 'visitor' : 'visitor'),
          status: visitor.status || 'active',
          resident_name: visitor.resident_name || '',
          resident_address: visitor.resident_address || '',
          created_at: visitor.created_at,
          timestamp: visitor.created_at
        }));
        
        this.updateStats();
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading accesses:', error);
        this.loading = false;
      }
    });
  }

  updateStats(): void {
    this.totalAccesses = this.allAccesses.length;
    this.dentroCount = this.allAccesses.filter(a => a.status === 'dentro').length;
    this.salioCount = this.allAccesses.filter(a => a.status === 'salio' || a.status === 'salió').length;
  }

  setFilter(filter: 'all' | 'residents' | 'visitors' | 'providers'): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedFilter === 'all') {
      this.filteredAccesses = [...this.allAccesses];
    } else if (this.selectedFilter === 'residents') {
      // Los residentes se obtendrían de otra fuente, por ahora mostrar vacío
      this.filteredAccesses = [];
    } else if (this.selectedFilter === 'visitors') {
      this.filteredAccesses = this.allAccesses.filter(a => a.type === 'visitor' || a.type === 'one-time');
    } else if (this.selectedFilter === 'providers') {
      this.filteredAccesses = this.allAccesses.filter(a => a.type === 'provider');
    }
    
    // Ordenar por fecha más reciente
    this.filteredAccesses.sort((a, b) => {
      const dateA = new Date(a.created_at || a.timestamp || 0).getTime();
      const dateB = new Date(b.created_at || b.timestamp || 0).getTime();
      return dateB - dateA;
    });
  }

  getTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'resident': 'Residente',
      'visitor': 'Visitante',
      'one-time': 'Visitante (Una vez)',
      'provider': 'Proveedor',
      'event': 'Evento'
    };
    return typeMap[type] || type;
  }

  getStatusLabel(status: string): string {
    if (!status) return 'N/A';
    const statusMap: { [key: string]: string } = {
      'active': 'Activo',
      'activo': 'Activo',
      'dentro': 'Dentro',
      'salio': 'Salió',
      'salió': 'Salió'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  goBack(): void {
    this.router.navigate(['/guard-dashboard']);
  }
}

