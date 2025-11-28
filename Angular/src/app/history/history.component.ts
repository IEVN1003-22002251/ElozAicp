import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VisitorService } from '../services/visitor.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="history-container">
      <!-- Header -->
      <div class="history-header">
        <button class="btn-back-history" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h1 class="history-title">Historial</h1>
        <button class="btn-calendar" (click)="openDatePicker()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>
      </div>

      <!-- Summary Section -->
      <div class="summary-section">
        <p class="summary-label">Registros completados</p>
        <p class="summary-count">{{ completedRecords }}</p>
      </div>

      <!-- Filter Buttons -->
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

        <button 
          class="filter-btn filter-events" 
          [class.active]="selectedFilter === 'events'"
          (click)="setFilter('events')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Eventos</span>
        </button>
      </div>

      <!-- Main Content Area -->
      <div class="content-area">
        <div *ngIf="filteredRecords.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <p class="empty-title">Sin registros</p>
          <p class="empty-message">{{ getEmptyMessage() }}</p>
        </div>

        <div *ngIf="filteredRecords.length > 0" class="records-list">
          <div *ngFor="let record of filteredRecords" class="record-item">
            <div class="record-header">
              <div class="record-type-badge" [class]="'badge-' + record.type">
                <svg *ngIf="record.type === 'visitors'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <svg *ngIf="record.type === 'providers'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
                <svg *ngIf="record.type === 'events'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{{ getTypeLabel(record.type) }}</span>
              </div>
              <span class="record-date">{{ formatDate(record.created_at) }}</span>
            </div>
            <h3 class="record-name">{{ record.name }}</h3>
            <div class="record-details">
              <p *ngIf="record.email" class="record-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {{ record.email }}
              </p>
              <p *ngIf="record.phone" class="record-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                {{ record.phone }}
              </p>
            </div>
            <div class="record-status">
              <span class="status-badge" [class]="'status-' + record.status">
                {{ record.status === 'active' ? 'Activo' : record.status === 'completed' ? 'Completado' : record.status }}
              </span>
            </div>
          </div>
        </div>
        
        <div *ngIf="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando registros...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-container {
      min-height: 100vh;
      background-color: #1a1a1a;
      padding: 20px;
      padding-bottom: 40px;
    }

    /* Header */
    .history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }

    .btn-back-history {
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

    .btn-back-history:hover {
      transform: scale(1.05);
      background-color: #1a9d96;
    }

    .btn-back-history svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }

    .history-title {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      flex: 1;
      text-align: center;
    }

    .btn-calendar {
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

    .btn-calendar:hover {
      transform: scale(1.05);
      background-color: #4A8BC2;
    }

    .btn-calendar svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }

    /* Summary Section */
    .summary-section {
      margin-bottom: 24px;
    }

    .summary-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 8px 0;
    }

    .summary-count {
      font-size: 48px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    /* Filter Buttons */
    .filter-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    .filter-btn {
      flex: 1;
      min-width: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 12px;
      border: none;
      background-color: #2a2a2a;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-btn svg {
      width: 18px;
      height: 18px;
      stroke: currentColor;
    }

    .filter-btn.active {
      background-color: #007bff;
      color: #ffffff;
    }

    .filter-btn:not(.active):hover {
      background-color: #333333;
    }

    /* Filter button specific colors when not active */
    .filter-btn:not(.active) {
      color: rgba(255, 255, 255, 0.7);
    }

    .filter-btn:not(.active) svg {
      stroke: currentColor;
    }

    /* Colores específicos para cada botón cuando no está activo */
    .filter-visitors:not(.active) {
      color: #20b2aa;
    }

    .filter-visitors:not(.active) svg {
      stroke: #20b2aa;
    }

    .filter-providers:not(.active) {
      color: #ff9800;
    }

    .filter-providers:not(.active) svg {
      stroke: #ff9800;
    }

    .filter-events:not(.active) {
      color: #d4a574;
    }

    .filter-events:not(.active) svg {
      stroke: #d4a574;
    }

    /* Content Area */
    .content-area {
      min-height: 300px;
    }

    /* Empty State */
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

    .empty-icon svg {
      width: 80px;
      height: 80px;
      stroke: currentColor;
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
      line-height: 1.5;
      max-width: 300px;
    }

    /* Records List */
    .records-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .record-item {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 16px;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }

    .record-item:hover {
      background-color: #333333;
      transform: translateY(-2px);
    }

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .record-type-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-visitors {
      background-color: rgba(32, 178, 170, 0.2);
      color: #20b2aa;
    }

    .badge-providers {
      background-color: rgba(255, 152, 0, 0.2);
      color: #ff9800;
    }

    .badge-events {
      background-color: rgba(212, 165, 116, 0.2);
      color: #d4a574;
    }

    .record-type-badge svg {
      width: 16px;
      height: 16px;
    }

    .record-date {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }

    .record-name {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 12px 0;
    }

    .record-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .record-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }

    .record-info svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    .record-status {
      display: flex;
      justify-content: flex-end;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-active {
      background-color: rgba(40, 167, 69, 0.2);
      color: #28a745;
    }

    .status-completed {
      background-color: rgba(0, 123, 255, 0.2);
      color: #007bff;
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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-state p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      margin: 0;
    }

    @media (max-width: 480px) {
      .history-container {
        padding: 16px;
      }

      .history-title {
        font-size: 24px;
      }

      .summary-count {
        font-size: 40px;
      }

      .filter-buttons {
        gap: 8px;
      }

      .filter-btn {
        min-width: 80px;
        padding: 10px 12px;
        font-size: 12px;
      }

      .filter-btn svg {
        width: 16px;
        height: 16px;
      }
    }
  `]
})
export class HistoryComponent implements OnInit {
  selectedFilter: 'all' | 'visitors' | 'providers' | 'events' = 'all';
  completedRecords: number = 0;
  records: any[] = [];
  filteredRecords: any[] = [];
  loading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private visitorService: VisitorService
  ) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    const profile = this.authService.getCachedProfile();
    
    if (!currentUser && !profile) {
      this.loading = false;
      this.records = [];
      this.filterRecords();
      return;
    }

    // Obtener el ID del usuario (puede venir de currentUser o profile)
    const userId = currentUser?.id || profile?.id;
    
    if (!userId) {
      this.loading = false;
      this.records = [];
      this.filterRecords();
      return;
    }

    // Convertir el ID a número si es necesario (created_by es INT en la BD)
    const userIdNumber = typeof userId === 'string' ? parseInt(userId) : userId;

    // Cargar todos los visitantes del usuario usando created_by
    this.visitorService.getVisitors({ user_id: userIdNumber.toString() }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.visitors || response.data) {
          const visitors = response.visitors || response.data || [];
          
          // Mapear los visitantes a registros con tipo
          this.records = visitors.map((visitor: any) => ({
            id: visitor.id,
            name: visitor.name,
            email: visitor.email,
            phone: visitor.phone,
            type: this.mapVisitorTypeToRecordType(visitor.type),
            status: visitor.status,
            created_at: visitor.created_at,
            created_by: visitor.created_by
          }));
        } else {
          this.records = [];
        }
        this.filterRecords();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cargar registros:', err);
        this.records = [];
        this.filterRecords();
      }
    });
  }

  mapVisitorTypeToRecordType(visitorType: string): string {
    // Mapear tipos de visitantes a tipos de registros
    const typeMap: { [key: string]: string } = {
      'visitor': 'visitors',
      'one-time': 'visitors',
      'provider': 'providers',
      'event': 'events'
    };
    return typeMap[visitorType] || 'visitors';
  }

  setFilter(filter: 'all' | 'visitors' | 'providers' | 'events'): void {
    this.selectedFilter = filter;
    this.filterRecords();
  }

  filterRecords(): void {
    if (this.selectedFilter === 'all') {
      this.filteredRecords = this.records;
    } else {
      this.filteredRecords = this.records.filter(record => {
        if (this.selectedFilter === 'visitors') {
          // Incluir visitantes frecuentes (visitor) y solo una vez (one-time)
          return record.type === 'visitors';
        } else if (this.selectedFilter === 'providers') {
          return record.type === 'providers';
        } else if (this.selectedFilter === 'events') {
          return record.type === 'events';
        }
        return false;
      });
    }
    this.completedRecords = this.filteredRecords.length;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  openDatePicker(): void {
    // Implementar selector de fecha
    console.log('Abrir selector de fecha');
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'visitors': 'Visitante',
      'providers': 'Proveedor',
      'events': 'Evento'
    };
    return labels[type] || 'Registro';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEmptyMessage(): string {
    if (this.records.length === 0) {
      return 'No has realizado ningún registro aún. Tus registros aparecerán aquí cuando los crees.';
    }
    
    switch (this.selectedFilter) {
      case 'visitors':
        return 'No tienes registros de visitantes (frecuentes o solo una vez) aún.';
      case 'providers':
        return 'No tienes registros de proveedores aún.';
      case 'events':
        return 'No tienes registros de eventos aún.';
      default:
        return 'No hay registros para mostrar.';
    }
  }
}
