import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VisitorService } from '../services/visitor.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="history-container">
      <!-- Header -->
      <header class="history-header">
        <h1 class="history-title">Historial</h1>
        <div class="header-actions">
          <button *ngIf="isAdmin" class="btn-add-visitor" (click)="goToAddVisitor()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Agregar Visitante
          </button>
          <button class="btn-calendar" (click)="openDatePicker()" title="Filtrar por fecha">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
          <button class="btn-back-history" (click)="goBack()">← Volver</button>
        </div>
      </header>

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
            <div class="record-status" [class.with-button]="(isAdmin && canChangeStatus(record.status)) || (!isAdmin && record.type === 'visitors' && record.originalType === 'visitor') || record.type === 'events' || (!isAdmin && record.type === 'providers')">
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
                <div *ngIf="!isAdmin && record.type === 'providers'" class="resident-provider-status">
                  <span class="status-badge" [class]="'status-' + record.status">
                    {{ getStatusLabel(record.status) }}
                  </span>
                </div>
                <div *ngIf="record.type === 'events'" class="event-actions">
                  <button 
                    *ngIf="canEditEvent(record)"
                    class="btn-edit-event"
                    (click)="openEditEventModal(record)"
                    [disabled]="record.editing">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Editar
                  </button>
                  <button 
                    class="btn-view-qr btn-view-qr-event"
                    (click)="viewEventQR(record)"
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
      
      <!-- Modal para editar evento -->
      <div *ngIf="showEditEventModal" class="edit-modal-overlay" (click)="closeEditEventModal()">
        <div class="edit-modal-content" (click)="$event.stopPropagation()">
          <div class="edit-modal-header">
            <h2>Editar Evento</h2>
            <button class="btn-close-modal" (click)="closeEditEventModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="edit-modal-body">
            <div *ngIf="editingEvent" class="edit-form">
              <div class="form-group">
                <label class="form-label">Nombre del Evento *</label>
                <input
                  type="text"
                  class="form-input"
                  [(ngModel)]="editingEvent.name"
                  placeholder="Nombre del evento"
                  [disabled]="savingEvent">
              </div>
              
              <div class="form-group">
                <label class="form-label">Fecha del Evento</label>
                <input
                  type="date"
                  class="form-input"
                  [(ngModel)]="editingEvent.eventDate"
                  [disabled]="savingEvent">
              </div>
              
              <div class="form-group">
                <label class="form-label">Hora del Evento</label>
                <input
                  type="time"
                  class="form-input"
                  [(ngModel)]="editingEvent.eventTime"
                  [disabled]="savingEvent">
              </div>
              
              <div class="form-group">
                <label class="form-label">Número de Invitados</label>
                <input
                  type="number"
                  class="form-input"
                  [(ngModel)]="editingEvent.numberOfGuests"
                  placeholder="Número de invitados"
                  min="1"
                  [disabled]="savingEvent">
              </div>
              
              <div class="form-group">
                <label class="form-label">Lugar</label>
                <select
                  class="form-input form-select"
                  [(ngModel)]="editingEvent.eventLocation"
                  [disabled]="savingEvent">
                  <option value="">Seleccionar lugar</option>
                  <option value="domicilio">Domicilio</option>
                  <option value="casa_club">Casa club</option>
                  <option value="lago">Lago</option>
                  <option value="kiosco">Kiosco</option>
                </select>
              </div>
              
              <div *ngIf="editEventError" class="error-message">
                {{ editEventError }}
              </div>
              
              <div class="edit-modal-actions">
                <button 
                  class="btn-cancel-edit"
                  (click)="closeEditEventModal()"
                  [disabled]="savingEvent">
                  Cancelar
                </button>
                <button 
                  class="btn-save-edit"
                  (click)="saveEventChanges()"
                  [disabled]="savingEvent || !editingEvent.name">
                  <span *ngIf="!savingEvent">Guardar Cambios</span>
                  <span *ngIf="savingEvent">Guardando...</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para mostrar QR -->
      <div *ngIf="showQRModal" class="qr-modal-overlay" (click)="closeQRModal()">
        <div class="qr-modal-content" (click)="$event.stopPropagation()">
          <div class="qr-modal-header">
            <h2>Código QR - {{ selectedVisitorForQR?.name || selectedEventForQR?.name }}</h2>
            <button class="btn-close-modal" (click)="closeQRModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="qr-modal-body">
            <div *ngIf="selectedVisitorQR || selectedEventQR" class="qr-code-display">
              <img [src]="selectedVisitorQR || selectedEventQR" alt="QR Code" class="qr-image" #qrImage />
            </div>
            <div *ngIf="!selectedVisitorQR && !selectedEventQR && !loadingQR && selectedVisitorForQR" class="qr-generate-message">
              <p>No se ha generado un código QR para este visitante.</p>
              <button class="btn-generate-qr" (click)="generateQRForVisitor()">
                Generar Código QR
              </button>
            </div>
            <div *ngIf="!selectedVisitorQR && !selectedEventQR && !loadingQR && selectedEventForQR" class="qr-generate-message">
              <p>No se ha generado un código QR para este evento.</p>
              <button class="btn-generate-qr" (click)="generateQRForEvent()">
                Generar Código QR
              </button>
            </div>
            <div *ngIf="loadingQR" class="qr-loading">
              <div class="loading-spinner"></div>
              <p>Generando código QR...</p>
            </div>
            <p *ngIf="selectedVisitorQR" class="qr-instruction">Escanea este código para validar el acceso del visitante</p>
            <p *ngIf="selectedEventQR" class="qr-instruction">Comparte este código con los invitados del evento</p>
            
            <!-- Información General del Evento (para compartir con invitados) -->
            <div *ngIf="selectedEventForQR && eventQRData" class="qr-event-summary">
              <h3 class="qr-summary-title">Información del Evento</h3>
              <div class="qr-summary-content">
                <p class="qr-summary-item" *ngIf="eventQRData.event_name">
                  <strong>Evento:</strong> {{ eventQRData.event_name }}
                </p>
                <p class="qr-summary-item" *ngIf="eventQRData.event_date">
                  <strong>Fecha:</strong> {{ formatEventDate(eventQRData.event_date) }}
                </p>
                <p class="qr-summary-item" *ngIf="eventQRData.event_time">
                  <strong>Hora:</strong> {{ formatEventTime(eventQRData.event_time) }}
                </p>
                <p class="qr-summary-item" *ngIf="eventQRData.number_of_guests">
                  <strong>Invitados esperados:</strong> {{ eventQRData.number_of_guests }}
                </p>
                <p class="qr-summary-item" *ngIf="eventQRData.resident_name">
                  <strong>Anfitrión:</strong> {{ eventQRData.resident_name }}
                </p>
                <p class="qr-summary-item" *ngIf="eventQRData.event_location === 'domicilio' && eventQRData.resident_address">
                  <strong>Lugar:</strong> {{ eventQRData.resident_address }}
                </p>
                <p class="qr-summary-item" *ngIf="eventQRData.event_location && eventQRData.event_location !== 'domicilio'">
                  <strong>Lugar:</strong> {{ getLocationLabel(eventQRData.event_location) }}
                </p>
                <p class="qr-summary-item" *ngIf="!eventQRData.event_location">
                  <strong>Lugar:</strong> No especificado
                </p>
              </div>
            </div>
            
            <!-- Información oculta del QR (solo visible para admin) -->
            <div *ngIf="selectedVisitorQR && isAdmin && qrDecodedInfo" class="qr-hidden-info">
              <h3 class="qr-info-title">Información del QR (Solo Admin)</h3>
              <div class="qr-info-details">
                <p><strong>Visitante:</strong> {{ qrDecodedInfo.visitor_name }}</p>
                <p><strong>Residente:</strong> {{ qrDecodedInfo.resident_name }}</p>
                <p><strong>Domicilio:</strong> {{ qrDecodedInfo.resident_address || 'No disponible' }}</p>
              </div>
            </div>
            
            <div *ngIf="selectedVisitorQR || selectedEventQR" class="qr-share-actions">
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
      background-color: #1a1a2e;
    }

    /* Header */
    .history-header {
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

    .btn-back-history:hover {
      background-color: #c82333;
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
      margin: 40px;
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
      margin: 0 40px 32px 40px;
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
      background-color: #16213e;
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
      background-color: #1e2a42;
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
      margin: 0 40px;
    }

    .record-item {
      background-color: #16213e;
      border-radius: 12px;
      padding: 16px;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }

    .record-item:hover {
      background-color: #1e2a42;
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

    .resident-provider-status {
      display: flex;
      align-items: center;
      gap: 8px;
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

    .event-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn-view-qr-event {
      background-color: #d4a574;
    }

    .btn-view-qr-event:hover:not(:disabled) {
      background-color: #c49564;
      box-shadow: 0 4px 8px rgba(212, 165, 116, 0.3);
    }

    .btn-edit-event {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      background-color: #007bff;
      color: #ffffff;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-edit-event:hover:not(:disabled) {
      background-color: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }

    .btn-edit-event:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-edit-event svg {
      width: 16px;
      height: 16px;
    }

    /* Edit Event Modal Styles */
    .edit-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
      padding: 20px;
    }

    .edit-modal-content {
      background-color: #2a2a2a;
      border-radius: 12px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .edit-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .edit-modal-header h2 {
      color: #ffffff;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .edit-modal-body {
      padding: 24px;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      color: #ffffff;
      font-size: 14px;
      font-weight: 500;
    }

    .form-input {
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background-color: #1a1a1a;
      color: #ffffff;
      font-size: 14px;
      outline: none;
      transition: border-color 0.3s ease;
    }

    .form-input:focus {
      border-color: #007bff;
    }

    .form-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-select {
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background-color: #1a1a1a;
      color: #ffffff;
      font-size: 14px;
      outline: none;
      transition: border-color 0.3s ease;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
    }

    .form-select:focus {
      border-color: #007bff;
    }

    .form-select:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-select option {
      background-color: #1a1a1a;
      color: #ffffff;
      padding: 12px;
    }

    .error-message {
      padding: 12px;
      background-color: rgba(220, 53, 69, 0.1);
      border: 1px solid rgba(220, 53, 69, 0.3);
      border-radius: 8px;
      color: #dc3545;
      font-size: 14px;
    }

    .edit-modal-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .btn-cancel-edit,
    .btn-save-edit {
      flex: 1;
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-cancel-edit {
      background-color: #6c757d;
      color: #ffffff;
    }

    .btn-cancel-edit:hover:not(:disabled) {
      background-color: #5a6268;
    }

    .btn-save-edit {
      background-color: #007bff;
      color: #ffffff;
    }

    .btn-save-edit:hover:not(:disabled) {
      background-color: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }

    .btn-cancel-edit:disabled,
    .btn-save-edit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Información general del evento (para compartir con invitados) */
    .qr-event-summary {
      background-color: rgba(212, 165, 116, 0.15);
      border: 1px solid rgba(212, 165, 116, 0.3);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      width: 100%;
    }

    .qr-summary-title {
      font-size: 18px;
      font-weight: 700;
      color: #d4a574;
      margin: 0 0 16px 0;
      text-align: center;
    }

    .qr-summary-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .qr-summary-item {
      font-size: 14px;
      color: #ffffff;
      margin: 0;
      line-height: 1.6;
      text-align: center;
    }

    .qr-summary-item strong {
      color: #d4a574;
      font-weight: 600;
      margin-right: 8px;
    }

    .qr-event-info {
      background-color: rgba(212, 165, 116, 0.1);
      border: 1px solid rgba(212, 165, 116, 0.3);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      width: 100%;
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
  selectedEventForQR: any = null;
  selectedVisitorQR: string = '';
  selectedEventQR: string = '';
  loadingQR: boolean = false;
  qrDecodedInfo: any = null;
  eventQRData: any = null;
  showEditEventModal: boolean = false;
  editingEvent: any = null;
  savingEvent: boolean = false;
  editEventError: string = '';

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
            eventDate: visitor.eventDate || null, // Para eventos
            eventTime: visitor.eventTime || null, // Para eventos
            numberOfGuests: visitor.numberOfGuests || null, // Para eventos
            eventLocation: visitor.eventLocation || null, // Para eventos
            updating: false,
            loadingQR: false,
            editing: false
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

  viewEventQR(record: any): void {
    this.selectedEventForQR = record;
    this.selectedVisitorForQR = null;
    this.qrDecodedInfo = null;
    this.eventQRData = null;
    
    // Si ya tiene QR, mostrarlo y decodificar los datos
    if (record.codigo_qr) {
      this.selectedEventQR = record.codigo_qr;
      this.showQRModal = true;
      this.decodeEventQRData(record.codigo_qr);
    } else {
      // Si no tiene QR, intentar obtenerlo del evento
      this.loadingQR = true;
      this.showQRModal = true;
      this.selectedEventQR = '';
      
      // Obtener el evento completo para ver si tiene QR
      this.visitorService.getVisitor(record.id).subscribe({
        next: (response) => {
          this.loadingQR = false;
          if (response.exito && response.visitor) {
            if (response.visitor.codigo_qr) {
              record.codigo_qr = response.visitor.codigo_qr;
              this.selectedEventQR = response.visitor.codigo_qr;
              this.decodeEventQRData(response.visitor.codigo_qr);
            }
          }
        },
        error: (err) => {
          this.loadingQR = false;
          console.error('Error al obtener evento:', err);
        }
      });
    }
  }

  decodeEventQRData(qrUrl: string): void {
    // Extraer los datos del QR de la URL
    try {
      const url = new URL(qrUrl);
      const qrDataParam = url.searchParams.get('data');
      
      if (qrDataParam) {
        const qrDataString = decodeURIComponent(qrDataParam);
        try {
          const qrData = JSON.parse(qrDataString);
          // El QR simplificado solo tiene {'t': 'event', 'id': id}
          // Necesitamos obtener la información completa del evento desde el backend
          if (qrData.t === 'event' && qrData.id) {
            // Obtener información completa del evento desde el backend
            this.visitorService.getVisitor(qrData.id).subscribe({
              next: (visitorResponse) => {
                if (visitorResponse.exito && visitorResponse.visitor) {
                  const event = visitorResponse.visitor;
                  // Construir eventQRData con la información completa
                  this.eventQRData = {
                    event_name: event.name || '',
                    event_date: event.eventDate || '',
                    event_time: event.eventTime || '',
                    number_of_guests: event.numberOfGuests || '',
                    event_location: event.eventLocation || event.event_location || '',
                    resident_name: event.resident_name || '',
                    resident_address: event.resident_address || ''
                  };
                  
                  // Si el lugar es domicilio, obtener la dirección del residente
                  if (this.eventQRData.event_location === 'domicilio' && event.resident_email) {
                    this.visitorService.getResidentAddress(event.resident_email).subscribe({
                      next: (addressResponse) => {
                        if (addressResponse.exito && addressResponse.address) {
                          this.eventQRData.resident_address = addressResponse.address;
                        }
                      },
                      error: (err) => {
                        console.error('Error al obtener dirección del residente:', err);
                      }
                    });
                  }
                }
              },
              error: (err) => {
                console.error('Error al obtener información del evento:', err);
              }
            });
          }
        } catch (parseError) {
          console.error('Error al parsear QR del evento:', parseError);
        }
      }
    } catch (error) {
      console.error('Error al procesar URL del QR del evento:', error);
    }
  }

  generateQRForEvent(): void {
    if (!this.selectedEventForQR || this.loadingQR) return;

    this.loadingQR = true;
    this.visitorService.generateEventQR(this.selectedEventForQR.id).subscribe({
      next: (response) => {
        this.loadingQR = false;
        if (response.exito) {
          // Actualizar el registro con el código QR
          this.selectedEventForQR.codigo_qr = response.qr_code_url;
          this.selectedEventQR = response.qr_code_url;
          
          // Actualizar también en el array de records
          const recordIndex = this.records.findIndex(r => r.id === this.selectedEventForQR.id);
          if (recordIndex !== -1) {
            this.records[recordIndex].codigo_qr = response.qr_code_url;
          }
          
          // Usar event_info si está disponible, de lo contrario intentar obtener del evento
          if (response.event_info) {
            try {
              this.eventQRData = JSON.parse(response.event_info);
            } catch (e) {
              console.error('Error al parsear event_info:', e);
              // Fallback: construir desde response.event
              this.buildEventQRDataFromResponse(response);
            }
          } else {
            // Fallback: construir desde response.event
            this.buildEventQRDataFromResponse(response);
          }
        } else {
          alert('Error al generar código QR: ' + (response.mensaje || 'Error desconocido'));
        }
      },
      error: (err) => {
        this.loadingQR = false;
        console.error('Error al generar QR del evento:', err);
        alert('Error al generar código QR. Por favor, intenta de nuevo.');
      }
    });
  }

  private buildEventQRDataFromResponse(response: any): void {
    if (response.event) {
      this.eventQRData = {
        event_name: response.event.name || '',
        event_date: response.event.eventDate || '',
        event_time: response.event.eventTime || '',
        number_of_guests: response.event.numberOfGuests || '',
        event_location: response.event.eventLocation || response.event.event_location || '',
        resident_name: response.event.resident_name || '',
        resident_address: ''
      };
    }
  }

  formatEventDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  }

  formatEventTime(timeString: string): string {
    if (!timeString) return '';
    // Formato HH:mm a formato 12 horas
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  getLocationLabel(location: string): string {
    if (!location) return '';
    const locationMap: { [key: string]: string } = {
      'domicilio': 'Domicilio',
      'casa_club': 'Casa club',
      'lago': 'Lago',
      'kiosco': 'Kiosco'
    };
    return locationMap[location] || location;
  }

  closeQRModal(): void {
    this.showQRModal = false;
    this.selectedVisitorForQR = null;
    this.selectedEventForQR = null;
    this.selectedVisitorQR = '';
    this.selectedEventQR = '';
    this.loadingQR = false;
    this.qrDecodedInfo = null;
    this.eventQRData = null;
  }

  shareQR(): void {
    const qrUrl = this.selectedVisitorQR || this.selectedEventQR;
    if (!qrUrl) return;

    // Crear una imagen con la información del evento/visitante
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Crear un canvas para combinar el QR y la información
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        // Si no se puede crear canvas, usar método anterior
        this.shareQRUrl();
        return;
      }
      
      // Configurar dimensiones del canvas
      const qrSize = 400;
      const padding = 40;
      const isEvent = !!this.selectedEventForQR && !!this.eventQRData;
      const infoHeight = isEvent ? 200 : 120;
      const canvasWidth = qrSize + (padding * 2);
      const canvasHeight = qrSize + infoHeight + (padding * 3);
      
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
      
      let yPos = qrSize + padding + 20;
      
      // Si es un evento, mostrar información del evento
      if (isEvent && this.eventQRData) {
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText(this.eventQRData.event_name || 'Evento', canvasWidth / 2, yPos);
        yPos += 30;
        
        ctx.font = '14px Arial, sans-serif';
        
        if (this.eventQRData.event_date) {
          ctx.fillText(`Fecha: ${this.formatEventDate(this.eventQRData.event_date)}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.event_time) {
          ctx.fillText(`Hora: ${this.formatEventTime(this.eventQRData.event_time)}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.number_of_guests) {
          ctx.fillText(`Invitados: ${this.eventQRData.number_of_guests}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.resident_name) {
          ctx.fillText(`Anfitrión: ${this.eventQRData.resident_name}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.resident_address && this.eventQRData.event_location === 'domicilio') {
          ctx.fillText(`Dirección: ${this.eventQRData.resident_address}`, canvasWidth / 2, yPos);
          yPos += 20;
        } else if (this.eventQRData.event_location && this.eventQRData.event_location !== 'domicilio') {
          ctx.fillText(`Lugar: ${this.getLocationLabel(this.eventQRData.event_location)}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
      } else {
        // Texto genérico para visitantes
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('Acceso', canvasWidth / 2, yPos);
        yPos += 30;
        
        ctx.font = '16px Arial, sans-serif';
        ctx.fillText('Escanea este código para ingresar de forma segura.', canvasWidth / 2, yPos);
        yPos += 20;
        ctx.fillText('Uso exclusivo de personal autorizado.', canvasWidth / 2, yPos);
      }
      
      // Convertir canvas a blob y compartir
      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = this.selectedEventForQR 
            ? `QR-Evento-${this.selectedEventForQR?.name || 'evento'}.png`
            : `QR-${this.selectedVisitorForQR?.name || 'visitante'}.png`;
          const file = new File([blob], fileName, { type: 'image/png' });
          const title = this.selectedEventForQR
            ? `Código QR - ${this.selectedEventForQR?.name || 'Evento'}`
            : `Código QR - ${this.selectedVisitorForQR?.name || 'Visitante'}`;
          const text = this.selectedEventForQR
            ? `Código QR para el evento ${this.selectedEventForQR?.name || ''}`
            : `Código QR para el acceso del visitante ${this.selectedVisitorForQR?.name || ''}`;
          
          // Intentar usar la Web Share API si está disponible
          if (navigator.share) {
            navigator.share({
              title: title,
              text: text,
              files: [file]
            }).catch(err => {
              console.log('Error al compartir:', err);
              // Si falla, intentar descargar
              this.downloadQR();
            });
          } else {
            // Si no hay soporte para compartir, descargar
            this.downloadQR();
          }
        } else {
          this.shareQRUrl();
        }
      }, 'image/png');
    };
    
    img.onerror = () => {
      // Si falla, intentar compartir la URL
      this.shareQRUrl();
    };
    
    img.src = qrUrl;
  }

  shareQRUrl(): void {
    const qrUrl = this.selectedVisitorQR || this.selectedEventQR;
    if (!qrUrl) return;

    // Copiar la URL al portapapeles
    if (navigator.clipboard) {
      navigator.clipboard.writeText(qrUrl).then(() => {
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
    const qrUrl = this.selectedVisitorQR || this.selectedEventQR;
    if (!qrUrl) return;

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
      const isEvent = !!this.selectedEventForQR && !!this.eventQRData;
      const infoHeight = isEvent ? 200 : 120; // Más espacio si hay información del evento
      const canvasWidth = qrSize + (padding * 2);
      const canvasHeight = qrSize + infoHeight + (padding * 3);
      
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
      
      let yPos = qrSize + padding + 20;
      
      // Si es un evento, mostrar información del evento
      if (isEvent && this.eventQRData) {
        // Título del evento
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText(this.eventQRData.event_name || 'Evento', canvasWidth / 2, yPos);
        yPos += 30;
        
        // Información del evento
        ctx.font = '14px Arial, sans-serif';
        
        if (this.eventQRData.event_date) {
          ctx.fillText(`Fecha: ${this.formatEventDate(this.eventQRData.event_date)}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.event_time) {
          ctx.fillText(`Hora: ${this.formatEventTime(this.eventQRData.event_time)}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.number_of_guests) {
          ctx.fillText(`Invitados: ${this.eventQRData.number_of_guests}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.resident_name) {
          ctx.fillText(`Anfitrión: ${this.eventQRData.resident_name}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
        
        if (this.eventQRData.resident_address && this.eventQRData.event_location === 'domicilio') {
          ctx.fillText(`Dirección: ${this.eventQRData.resident_address}`, canvasWidth / 2, yPos);
          yPos += 20;
        } else if (this.eventQRData.event_location && this.eventQRData.event_location !== 'domicilio') {
          ctx.fillText(`Lugar: ${this.getLocationLabel(this.eventQRData.event_location)}`, canvasWidth / 2, yPos);
          yPos += 20;
        }
      } else {
        // Texto genérico para visitantes
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('Acceso', canvasWidth / 2, yPos);
        yPos += 30;
        
        ctx.font = '16px Arial, sans-serif';
        const line1 = 'Escanea este código para ingresar de forma segura.';
        const line2 = 'Uso exclusivo de personal autorizado.';
        
        ctx.fillText(line1, canvasWidth / 2, yPos);
        yPos += 20;
        ctx.fillText(line2, canvasWidth / 2, yPos);
      }
      
      // Convertir canvas a imagen y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const fileName = this.selectedEventForQR
            ? `QR-Evento-${this.selectedEventForQR?.name || 'evento'}.png`
            : `QR-${this.selectedVisitorForQR?.name || 'visitante'}.png`;
          link.download = fileName;
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
      link.href = qrUrl;
      const fileName = this.selectedEventForQR
        ? `QR-Evento-${this.selectedEventForQR?.name || 'evento'}.png`
        : `QR-${this.selectedVisitorForQR?.name || 'visitante'}.png`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    img.src = qrUrl;
  }

  canEditEvent(record: any): boolean {
    // Solo el residente que creó el evento puede editarlo (no admin)
    if (this.isAdmin) return false;
    
    const currentUser = this.authService.getCurrentUser();
    const profile = this.authService.getCachedProfile();
    const userId = currentUser?.id || profile?.id;
    
    if (!userId || !record.created_by) return false;
    
    // Comparar IDs (pueden ser string o number)
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const createdByIdNum = typeof record.created_by === 'string' ? parseInt(record.created_by) : record.created_by;
    
    return userIdNum === createdByIdNum;
  }

  openEditEventModal(record: any): void {
    // Obtener el evento completo para editar
    this.visitorService.getVisitor(record.id).subscribe({
      next: (response) => {
        if (response.exito && response.visitor) {
          const event = response.visitor;
          this.editingEvent = {
            id: event.id,
            name: event.name || '',
            eventDate: event.eventDate ? this.formatDateForInput(event.eventDate) : '',
            eventTime: event.eventTime || '',
            numberOfGuests: event.numberOfGuests || '',
            eventLocation: event.eventLocation || ''
          };
          this.showEditEventModal = true;
          this.editEventError = '';
        } else if (response.visitor) {
          const event = response.visitor;
          this.editingEvent = {
            id: event.id,
            name: event.name || '',
            eventDate: event.eventDate ? this.formatDateForInput(event.eventDate) : '',
            eventTime: event.eventTime || '',
            numberOfGuests: event.numberOfGuests || '',
            eventLocation: event.eventLocation || ''
          };
          this.showEditEventModal = true;
          this.editEventError = '';
        } else {
          this.editEventError = 'No se pudo cargar la información del evento';
        }
      },
      error: (err) => {
        console.error('Error al cargar evento para editar:', err);
        this.editEventError = 'Error al cargar la información del evento';
      }
    });
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Formato YYYY-MM-DD para input type="date"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  saveEventChanges(): void {
    if (!this.editingEvent || !this.editingEvent.name) {
      this.editEventError = 'El nombre del evento es requerido';
      return;
    }

    this.savingEvent = true;
    this.editEventError = '';

    const updateData: any = {
      name: this.editingEvent.name,
      eventDate: this.editingEvent.eventDate || null,
      eventTime: this.editingEvent.eventTime || null,
      numberOfGuests: this.editingEvent.numberOfGuests || null,
      eventLocation: this.editingEvent.eventLocation || null
    };

    this.visitorService.updateVisitor(this.editingEvent.id, updateData).subscribe({
      next: (response) => {
        this.savingEvent = false;
        if (response.exito || response.success) {
          // Actualizar el registro en la lista
          const recordIndex = this.records.findIndex(r => r.id === this.editingEvent.id);
          if (recordIndex !== -1) {
            this.records[recordIndex].name = updateData.name;
            this.records[recordIndex].eventDate = updateData.eventDate;
            this.records[recordIndex].eventTime = updateData.eventTime;
            this.records[recordIndex].numberOfGuests = updateData.numberOfGuests;
            this.records[recordIndex].eventLocation = updateData.eventLocation;
          }
          
          // Si el evento tiene QR, regenerarlo con la nueva información
          const record = this.records.find(r => r.id === this.editingEvent.id);
          if (record && record.codigo_qr) {
            // Regenerar QR con la nueva información
            this.visitorService.generateEventQR(this.editingEvent.id).subscribe({
              next: (qrResponse) => {
                if (qrResponse.exito && recordIndex !== -1) {
                  this.records[recordIndex].codigo_qr = qrResponse.qr_code_url;
                }
              },
              error: (qrErr) => {
                console.error('Error al regenerar QR:', qrErr);
              }
            });
          }
          
          this.closeEditEventModal();
        } else {
          this.editEventError = response.mensaje || response.error || 'Error al guardar los cambios';
        }
      },
      error: (err) => {
        this.savingEvent = false;
        console.error('Error al guardar cambios del evento:', err);
        this.editEventError = err.error?.mensaje || err.error?.error || 'Error al guardar los cambios. Por favor, intenta de nuevo.';
      }
    });
  }

  closeEditEventModal(): void {
    this.showEditEventModal = false;
    this.editingEvent = null;
    this.editEventError = '';
    this.savingEvent = false;
  }
}
