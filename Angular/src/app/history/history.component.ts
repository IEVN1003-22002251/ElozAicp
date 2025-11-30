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
        <div class="header-actions">
          <button *ngIf="isAdmin" class="btn-add-visitor" (click)="goToAddVisitor()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Agregar Visitante
          </button>
          <button class="btn-calendar" (click)="openDatePicker()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        </div>
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
              <p *ngIf="isAdmin && record.address" class="record-info record-address">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Domicilio: {{ record.address }}
              </p>
            </div>
            <div class="record-status" [class.with-button]="(isAdmin && canChangeStatus(record.status)) || (!isAdmin && record.type === 'visitors' && record.originalType === 'visitor')">
              <span class="status-badge" [class]="'status-' + record.status" *ngIf="isAdmin">
                {{ getStatusLabel(record.status) }}
              </span>
              <div class="status-actions">
                <button 
                  *ngIf="isAdmin && canChangeStatus(record.status)" 
                  class="btn-status-change"
                  [class]="'btn-' + getNextStatus(record.status)"
                  (click)="changeStatus(record)"
                  [disabled]="record.updating">
                  {{ getStatusButtonText(record.status) }}
                </button>
                <div *ngIf="!isAdmin && record.type === 'visitors' && (record.originalType === 'visitor' || record.originalType === 'one-time')" class="resident-visitor-actions">
                  <span class="status-badge" [class]="'status-' + record.status">
                    {{ getStatusLabel(record.status) }}
                  </span>
                  <button 
                    class="btn-view-qr"
                    (click)="viewVisitorQR(record)"
                    [disabled]="record.loadingQR">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="5" height="5"></rect>
                      <rect x="16" y="3" width="5" height="5"></rect>
                      <rect x="3" y="16" width="5" height="5"></rect>
                      <path d="M21 16h-3"></path>
                      <path d="M9 21h3"></path>
                      <path d="M13 21h3"></path>
                      <path d="M21 12v-1"></path>
                      <path d="M12 21v-3"></path>
                    </svg>
                    Ver QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando registros...</p>
        </div>
      </div>
      
      <!-- Modal para mostrar QR -->
      <div *ngIf="showQRModal" class="qr-modal-overlay" (click)="closeQRModal()">
        <div class="qr-modal-content" (click)="$event.stopPropagation()">
          <div class="qr-modal-header">
            <h2>Código QR - {{ selectedVisitorForQR?.name }}</h2>
            <button class="btn-close-modal" (click)="closeQRModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="qr-modal-body">
            <div *ngIf="selectedVisitorQR" class="qr-code-display">
              <img [src]="selectedVisitorQR" alt="QR Code" class="qr-image" #qrImage />
            </div>
            <div *ngIf="!selectedVisitorQR && !loadingQR" class="qr-generate-message">
              <p>No se ha generado un código QR para este visitante.</p>
              <button class="btn-generate-qr" (click)="generateQRForVisitor()">
                Generar Código QR
              </button>
            </div>
            <div *ngIf="loadingQR" class="qr-loading">
              <div class="loading-spinner"></div>
              <p>Generando código QR...</p>
            </div>
            <p *ngIf="selectedVisitorQR" class="qr-instruction">Escanea este código para validar el acceso del visitante</p>
            
            <!-- Información oculta del QR (solo visible para admin) -->
            <div *ngIf="selectedVisitorQR && isAdmin && qrDecodedInfo" class="qr-hidden-info">
              <h3 class="qr-info-title">Información del QR (Solo Admin)</h3>
              <div class="qr-info-details">
                <p><strong>Visitante:</strong> {{ qrDecodedInfo.visitor_name }}</p>
                <p><strong>Residente:</strong> {{ qrDecodedInfo.resident_name }}</p>
                <p><strong>Domicilio:</strong> {{ qrDecodedInfo.resident_address || 'No disponible' }}</p>
              </div>
            </div>
            
            <div *ngIf="selectedVisitorQR" class="qr-share-actions">
              <button class="btn-share-qr" (click)="shareQR()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Compartir QR
              </button>
              <button class="btn-download-qr" (click)="downloadQR()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Descargar QR
              </button>
            </div>
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
      gap: 16px;
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .btn-add-visitor {
      padding: 10px 20px;
      background-color: #007bff;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn-add-visitor:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
    
    .btn-add-visitor svg {
      width: 18px;
      height: 18px;
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

    .record-address {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .record-status {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .record-status.with-button {
      justify-content: space-between;
    }
    
    .status-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .resident-visitor-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .btn-view-qr {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      background-color: #20b2aa;
      color: #ffffff;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    
    .btn-view-qr:hover:not(:disabled) {
      background-color: #1a9d96;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(32, 178, 170, 0.3);
    }
    
    .btn-view-qr:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-view-qr svg {
      width: 16px;
      height: 16px;
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

    .status-dentro {
      background-color: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }

    .status-salió, .status-salio {
      background-color: rgba(108, 117, 125, 0.2);
      color: #6c757d;
    }

    .btn-status-change {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .btn-status-change:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-status-change:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-dentro {
      background-color: #ffc107;
      color: #000000;
    }

    .btn-dentro:hover:not(:disabled) {
      background-color: #ffb300;
    }

    .btn-salió, .btn-salio {
      background-color: #6c757d;
      color: #ffffff;
    }

    .btn-salió:hover:not(:disabled), .btn-salio:hover:not(:disabled) {
      background-color: #5a6268;
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

    /* QR Modal Styles */
    .qr-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    
    .qr-modal-content {
      background-color: #2a2a2a;
      border-radius: 12px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    .qr-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .qr-modal-header h2 {
      color: #ffffff;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }
    
    .btn-close-modal {
      background: transparent;
      border: none;
      color: #ffffff;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-close-modal:hover {
      opacity: 0.7;
    }
    
    .qr-modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .qr-code-display {
      background-color: #ffffff;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    
    .qr-image {
      width: 250px;
      height: 250px;
      max-width: 100%;
      height: auto;
    }
    
    .qr-instruction {
      color: rgba(255, 255, 255, 0.8);
      text-align: center;
      margin: 0 0 20px 0;
      font-size: 14px;
    }
    
    .qr-hidden-info {
      background-color: rgba(0, 123, 255, 0.1);
      border: 1px solid rgba(0, 123, 255, 0.3);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      width: 100%;
    }
    
    .qr-info-title {
      color: #007bff;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px 0;
      text-align: center;
    }
    
    .qr-info-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .qr-info-details p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin: 0;
      text-align: left;
    }
    
    .qr-info-details strong {
      color: #ffffff;
      font-weight: 600;
      margin-right: 8px;
    }
    
    .qr-generate-message {
      text-align: center;
      padding: 40px 20px;
    }
    
    .qr-generate-message p {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 20px;
    }
    
    .btn-generate-qr {
      padding: 12px 24px;
      background-color: #20b2aa;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-generate-qr:hover {
      background-color: #1a9d96;
      transform: translateY(-2px);
    }
    
    .qr-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px 20px;
    }
    
    .qr-loading p {
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }
    
    .qr-share-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      width: 100%;
    }
    
    .btn-share-qr, .btn-download-qr {
      flex: 1;
      padding: 12px 16px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .btn-share-qr {
      background-color: #007bff;
      color: #ffffff;
    }
    
    .btn-share-qr:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
    
    .btn-download-qr {
      background-color: #20b2aa;
      color: #ffffff;
    }
    
    .btn-download-qr:hover {
      background-color: #1a9d96;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(32, 178, 170, 0.3);
    }
    
    .btn-share-qr svg, .btn-download-qr svg {
      width: 18px;
      height: 18px;
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
  isAdmin: boolean = false;
  showQRModal: boolean = false;
  selectedVisitorForQR: any = null;
  selectedVisitorQR: string = '';
  loadingQR: boolean = false;
  qrDecodedInfo: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private visitorService: VisitorService
  ) {}

  ngOnInit(): void {
    const profile = this.authService.getCachedProfile();
    this.isAdmin = profile?.role === 'admin';
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

    // Verificar si el usuario es admin
    const isAdmin = profile?.role === 'admin';
    
    // Si es admin, no pasar user_id para obtener todos los registros
    // Si no es admin, obtener solo los registros del usuario
    const params: any = {};
    
    if (!isAdmin) {
      const userId = currentUser?.id || profile?.id;
      
      if (!userId) {
        this.loading = false;
        this.records = [];
        this.filterRecords();
        return;
      }

      // Convertir el ID a número si es necesario (created_by es INT en la BD)
      const userIdNumber = typeof userId === 'string' ? parseInt(userId) : userId;
      params.user_id = userIdNumber.toString();
    }

    // Cargar visitantes (todos si es admin, solo del usuario si no es admin)
    this.visitorService.getVisitors(params).subscribe({
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
            originalType: visitor.type, // Guardar el tipo original para verificar si es 'visitor'
            status: visitor.status,
            created_at: visitor.created_at,
            created_by: visitor.created_by,
            address: visitor.address || null,
            codigo_qr: visitor.codigo_qr || null, // Incluir el código QR si existe
            updating: false,
            loadingQR: false
          }));
          
          // Ordenar por fecha de creación descendente (más nuevos primero)
          this.records.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA; // Orden descendente
          });
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
    // Si es admin, regresar al dashboard; si es residente, regresar al home
    if (this.isAdmin) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  openDatePicker(): void {
    // Implementar selector de fecha
    console.log('Abrir selector de fecha');
  }

  goToAddVisitor(): void {
    this.router.navigate(['/pre-register']);
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
    const profile = this.authService.getCachedProfile();
    const isAdmin = profile?.role === 'admin';
    
    if (this.records.length === 0) {
      if (isAdmin) {
        return 'No hay registros en el sistema aún. Los registros aparecerán aquí cuando los residentes los creen.';
      }
      return 'No has realizado ningún registro aún. Tus registros aparecerán aquí cuando los crees.';
    }
    
    switch (this.selectedFilter) {
      case 'visitors':
        return isAdmin 
          ? 'No hay registros de visitantes en el sistema aún.'
          : 'No tienes registros de visitantes (frecuentes o solo una vez) aún.';
      case 'providers':
        return isAdmin
          ? 'No hay registros de proveedores en el sistema aún.'
          : 'No tienes registros de proveedores aún.';
      case 'events':
        return isAdmin
          ? 'No hay registros de eventos en el sistema aún.'
          : 'No tienes registros de eventos aún.';
      default:
        return 'No hay registros para mostrar.';
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Activo',
      'dentro': 'Dentro',
      'salió': 'Salió',
      'salio': 'Salió',
      'completed': 'Completado'
    };
    return statusMap[status] || status;
  }

  canChangeStatus(status: string): boolean {
    // Solo se puede cambiar el estado si es 'active' o 'dentro'
    return status === 'active' || status === 'dentro';
  }

  getNextStatus(currentStatus: string): string {
    if (currentStatus === 'active') {
      return 'dentro';
    } else if (currentStatus === 'dentro') {
      return 'salio'; // Usar sin tilde para consistencia en BD
    }
    return currentStatus;
  }

  getStatusButtonText(status: string): string {
    if (status === 'active') {
      return 'Marcar como Dentro';
    } else if (status === 'dentro') {
      return 'Marcar como Salió';
    }
    return '';
  }

  changeStatus(record: any): void {
    if (record.updating) return;

    const nextStatus = this.getNextStatus(record.status);
    if (!nextStatus || nextStatus === record.status) return;

    record.updating = true;

    this.visitorService.updateVisitor(record.id, { status: nextStatus }).subscribe({
      next: (response) => {
        record.updating = false;
        if (response.exito || response.success) {
          record.status = nextStatus;
        } else {
          console.error('Error al actualizar estado:', response.mensaje || response.error);
          alert('Error al actualizar el estado: ' + (response.mensaje || response.error || 'Error desconocido'));
        }
      },
      error: (err) => {
        record.updating = false;
        console.error('Error al actualizar estado:', err);
        alert('Error al actualizar el estado. Por favor, intenta de nuevo.');
      }
    });
  }

  viewVisitorQR(record: any): void {
    this.selectedVisitorForQR = record;
    this.qrDecodedInfo = null;
    
    // Si ya tiene QR, mostrarlo y decodificarlo si es admin
    if (record.codigo_qr) {
      this.selectedVisitorQR = record.codigo_qr;
      this.showQRModal = true;
      
      // Si es admin, decodificar el QR para mostrar información oculta
      if (this.isAdmin) {
        this.decodeQRData(record.codigo_qr);
      }
    } else {
      // Si no tiene QR, intentar obtenerlo del visitante
      this.loadingQR = true;
      this.showQRModal = true;
      this.selectedVisitorQR = '';
      
      // Obtener el visitante completo para ver si tiene QR
      this.visitorService.getVisitor(record.id).subscribe({
        next: (response) => {
          this.loadingQR = false;
          if (response.exito && response.visitor) {
            if (response.visitor.codigo_qr) {
              record.codigo_qr = response.visitor.codigo_qr;
              this.selectedVisitorQR = response.visitor.codigo_qr;
              
              // Si es admin, decodificar el QR
              if (this.isAdmin) {
                this.decodeQRData(response.visitor.codigo_qr);
              }
            }
          }
        },
        error: (err) => {
          this.loadingQR = false;
          console.error('Error al obtener visitante:', err);
        }
      });
    }
  }

  decodeQRData(qrUrl: string): void {
    // Extraer los datos del QR de la URL
    try {
      const url = new URL(qrUrl);
      const qrDataParam = url.searchParams.get('data');
      
      if (qrDataParam) {
        const qrDataString = decodeURIComponent(qrDataParam);
        
        // Decodificar usando el servicio
        this.visitorService.decodeVisitorQR(qrDataString).subscribe({
          next: (response) => {
            if (response.exito && response.visitor_info) {
              this.qrDecodedInfo = response.visitor_info;
            }
          },
          error: (err) => {
            console.error('Error al decodificar QR:', err);
            // Intentar decodificar directamente desde el JSON
            try {
              const qrData = JSON.parse(qrDataString);
              this.qrDecodedInfo = {
                visitor_name: qrData.visitor_name || '',
                resident_name: qrData.resident_name || '',
                resident_address: qrData.resident_address || ''
              };
            } catch (parseError) {
              console.error('Error al parsear QR:', parseError);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error al procesar URL del QR:', error);
    }
  }

  generateQRForVisitor(): void {
    if (!this.selectedVisitorForQR || this.loadingQR) return;

    this.loadingQR = true;
    this.visitorService.generateVisitorQR(this.selectedVisitorForQR.id).subscribe({
      next: (response) => {
        this.loadingQR = false;
        if (response.exito) {
          // Actualizar el registro con el código QR
          this.selectedVisitorForQR.codigo_qr = response.qr_code_url;
          this.selectedVisitorQR = response.qr_code_url;
          
          // Actualizar también en el array de records
          const recordIndex = this.records.findIndex(r => r.id === this.selectedVisitorForQR.id);
          if (recordIndex !== -1) {
            this.records[recordIndex].codigo_qr = response.qr_code_url;
          }
          
          // Si es admin, decodificar el nuevo QR
          if (this.isAdmin && response.qr_code_url) {
            this.decodeQRData(response.qr_code_url);
          }
        } else {
          alert('Error al generar código QR: ' + (response.mensaje || 'Error desconocido'));
        }
      },
      error: (err) => {
        this.loadingQR = false;
        console.error('Error al generar QR:', err);
        alert('Error al generar código QR. Por favor, intenta de nuevo.');
      }
    });
  }

  closeQRModal(): void {
    this.showQRModal = false;
    this.selectedVisitorForQR = null;
    this.selectedVisitorQR = '';
    this.loadingQR = false;
    this.qrDecodedInfo = null;
  }

  shareQR(): void {
    if (!this.selectedVisitorQR) return;

    // Intentar usar la Web Share API si está disponible
    if (navigator.share) {
      // Convertir la URL del QR a blob para compartir
      fetch(this.selectedVisitorQR)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], `QR-${this.selectedVisitorForQR?.name || 'visitante'}.png`, { type: 'image/png' });
          navigator.share({
            title: `Código QR - ${this.selectedVisitorForQR?.name || 'Visitante'}`,
            text: `Código QR para el acceso del visitante ${this.selectedVisitorForQR?.name || ''}`,
            files: [file]
          }).catch(err => {
            console.log('Error al compartir:', err);
            // Si falla, intentar descargar
            this.downloadQR();
          });
        })
        .catch(err => {
          console.error('Error al obtener la imagen:', err);
          // Si falla, intentar compartir la URL
          this.shareQRUrl();
        });
    } else {
      // Si no hay soporte para compartir, copiar URL al portapapeles o descargar
      this.shareQRUrl();
    }
  }

  shareQRUrl(): void {
    if (!this.selectedVisitorQR) return;

    // Copiar la URL al portapapeles
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.selectedVisitorQR).then(() => {
        alert('URL del código QR copiada al portapapeles');
      }).catch(err => {
        console.error('Error al copiar:', err);
        this.downloadQR();
      });
    } else {
      // Fallback: descargar
      this.downloadQR();
    }
  }

  downloadQR(): void {
    if (!this.selectedVisitorQR) return;

    // Crear una imagen para cargar el QR
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Crear un canvas para combinar el QR y el texto
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Configurar dimensiones del canvas
      const qrSize = 400; // Tamaño del QR
      const padding = 40;
      const textHeight = 120;
      const canvasWidth = qrSize + (padding * 2);
      const canvasHeight = qrSize + textHeight + (padding * 3);
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Dibujar el QR code
      ctx.drawImage(img, padding, padding, qrSize, qrSize);
      
      // Configurar el texto
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Título "Acceso"
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText('Acceso', canvasWidth / 2, qrSize + padding + 20);
      
      // Texto principal
      ctx.font = '16px Arial, sans-serif';
      const line1 = 'Escanea este código para ingresar de forma segura.';
      const line2 = 'Uso exclusivo de personal autorizado.';
      
      ctx.fillText(line1, canvasWidth / 2, qrSize + padding + 50);
      ctx.fillText(line2, canvasWidth / 2, qrSize + padding + 75);
      
      // Convertir canvas a imagen y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `QR-${this.selectedVisitorForQR?.name || 'visitante'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };
    
    img.onerror = () => {
      // Si falla, descargar directamente sin texto
      const link = document.createElement('a');
      link.href = this.selectedVisitorQR;
      link.download = `QR-${this.selectedVisitorForQR?.name || 'visitante'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    img.src = this.selectedVisitorQR;
  }
}
