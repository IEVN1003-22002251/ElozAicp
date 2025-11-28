import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
        <div *ngIf="filteredRecords.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <p class="empty-title">Sin registros completados</p>
          <p class="empty-message">No hay visitantes que hayan salido en la fecha seleccionada</p>
        </div>

        <div *ngIf="filteredRecords.length > 0" class="records-list">
          <!-- Aquí se mostrarían los registros cuando haya datos -->
          <div *ngFor="let record of filteredRecords" class="record-item">
            <!-- Contenido del registro -->
          </div>
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    // Aquí se cargarían los registros desde el servicio
    // Por ahora, dejamos vacío para mostrar el estado vacío
    this.records = [];
    this.filterRecords();
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
          return record.type === 'visitor' || record.type === 'one-time';
        } else if (this.selectedFilter === 'providers') {
          return record.type === 'provider';
        } else if (this.selectedFilter === 'events') {
          return record.type === 'event';
        }
        return false;
      });
    }
    this.completedRecords = this.filteredRecords.length;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  openDatePicker(): void {
    // Implementar selector de fecha
    console.log('Abrir selector de fecha');
  }
}
