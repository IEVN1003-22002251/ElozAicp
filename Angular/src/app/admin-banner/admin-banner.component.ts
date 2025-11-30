import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BannerService, Banner } from '../services/banner.service';

@Component({
  selector: 'app-admin-banner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-banner-container">
      <header class="admin-header">
        <h1 class="admin-title">Gestión de Recados y Avisos</h1>
        <button class="btn-back" (click)="goBack()">← Volver</button>
      </header>

      <div class="admin-content">
        <!-- Formulario para crear/editar recado -->
        <div class="form-section">
          <h2>{{ editingBanner ? 'Editar Recado' : 'Nuevo Recado' }}</h2>
          <form (ngSubmit)="saveBanner()" class="banner-form">
            <div class="form-group">
              <label for="title">Título del Recado *</label>
              <input 
                type="text" 
                id="title" 
                [(ngModel)]="currentBanner.title" 
                name="title"
                required
                placeholder="Ej: Recolección de Basura">
            </div>

            <div class="form-group">
              <label for="description">Mensaje o Descripción *</label>
              <textarea 
                id="description" 
                [(ngModel)]="currentBanner.description" 
                name="description"
                required
                rows="4"
                placeholder="Ej: El jueves pasa la basura. Favor de sacar los botes antes de las 8:00 AM"></textarea>
            </div>

            <div class="form-group">
              <label for="cta_text">Texto adicional (opcional)</label>
              <input 
                type="text" 
                id="cta_text" 
                [(ngModel)]="currentBanner.cta_text" 
                name="cta_text"
                placeholder="Ej: Junta de colonos el viernes">
            </div>

            <div class="form-group">
              <label for="order">Orden de visualización</label>
              <input 
                type="number" 
                id="order" 
                [(ngModel)]="currentBanner.order" 
                name="order"
                min="0"
                placeholder="0">
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="currentBanner.is_active" 
                  name="is_active"
                  [checked]="currentBanner.is_active !== false">
                <span>Recado activo (visible para residentes)</span>
              </label>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-save">{{ editingBanner ? 'Actualizar' : 'Crear' }}</button>
              <button type="button" class="btn-cancel" (click)="cancelEdit()" *ngIf="editingBanner">Cancelar</button>
            </div>
          </form>
        </div>

        <!-- Lista de recados -->
        <div class="banners-section">
          <div class="section-header">
            <h2>Recados Existentes</h2>
            <span class="banner-count">{{ banners.length }} recado{{ banners.length !== 1 ? 's' : '' }}</span>
          </div>
          <div class="loading-state" *ngIf="loadingBanners">
            <p>Cargando recados...</p>
          </div>
          <div class="table-container" *ngIf="!loadingBanners && banners.length > 0; else noBanners">
            <table class="banners-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Texto Adicional</th>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let banner of banners; let i = index" [class.inactive-row]="!banner.is_active">
                  <td class="col-number">{{ i + 1 }}</td>
                  <td class="col-title">{{ banner.title }}</td>
                  <td class="col-description">{{ banner.description }}</td>
                  <td class="col-cta">{{ banner.cta_text || '-' }}</td>
                  <td class="col-order">{{ banner.order || 0 }}</td>
                  <td class="col-status">
                    <span class="status-badge" [class.active]="banner.is_active" [class.inactive]="!banner.is_active">
                      {{ banner.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="col-actions">
                    <button class="btn-action btn-edit" (click)="editBanner(banner)" title="Editar recado">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      class="btn-action btn-toggle" 
                      [class.activate]="!banner.is_active"
                      [class.deactivate]="banner.is_active"
                      (click)="toggleBannerStatus(banner)"
                      [title]="banner.is_active ? 'Desactivar' : 'Activar'">
                      <svg *ngIf="banner.is_active" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                      </svg>
                      <svg *ngIf="!banner.is_active" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                    <button class="btn-action btn-delete" (click)="deleteBanner(banner.id!, banner.title)" title="Eliminar recado">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #noBanners>
            <div class="empty-state" *ngIf="!loadingBanners">
              <p>No hay recados creados. Crea uno nuevo usando el formulario de arriba.</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-banner-container {
      min-height: 100vh;
      background-color: #1a1a1a;
      padding: 20px;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2a2a2a;
    }

    .admin-title {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .btn-back {
      background-color: #6c757d;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-back:hover {
      background-color: #5a6268;
    }

    .admin-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .form-section, .banners-section {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 24px;
    }

    .form-section h2,     .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .banners-section h2 {
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }

    .banner-count {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      background-color: rgba(255, 255, 255, 0.1);
      padding: 6px 12px;
      border-radius: 12px;
    }

    .banner-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-size: 14px;
      font-weight: 500;
      color: #ffffff;
    }

    .form-group input,
    .form-group textarea {
      background-color: #1a1a1a;
      border: 1px solid #3a3a3a;
      border-radius: 8px;
      padding: 12px;
      color: #ffffff;
      font-size: 14px;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #ff9800;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .checkbox-group input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .btn-save {
      background-color: #ff9800;
      color: #1a1a1a;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-save:hover {
      background-color: #fb8c00;
    }

    .btn-cancel {
      background-color: #6c757d;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-cancel:hover {
      background-color: #5a6268;
    }

    .table-container {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid #3a3a3a;
    }

    .banners-table {
      width: 100%;
      border-collapse: collapse;
      background-color: #1a1a1a;
    }

    .banners-table thead {
      background-color: #2a2a2a;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .banners-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      border-bottom: 2px solid #3a3a3a;
      white-space: nowrap;
    }

    .banners-table tbody tr {
      border-bottom: 1px solid #3a3a3a;
      transition: background-color 0.2s ease;
    }

    .banners-table tbody tr:hover {
      background-color: #252525;
    }

    .banners-table tbody tr.inactive-row {
      opacity: 0.6;
    }

    .banners-table td {
      padding: 12px 16px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      vertical-align: middle;
    }

    .col-number {
      text-align: center;
      font-weight: 600;
      color: #ff9800;
      width: 50px;
    }

    .col-title {
      font-weight: 600;
      color: #ffffff;
      min-width: 150px;
      max-width: 200px;
    }

    .col-description {
      color: rgba(255, 255, 255, 0.8);
      max-width: 300px;
      word-wrap: break-word;
      line-height: 1.4;
    }

    .col-cta {
      color: rgba(255, 255, 255, 0.7);
      font-style: italic;
      max-width: 150px;
    }

    .col-order {
      text-align: center;
      width: 80px;
    }

    .col-status {
      text-align: center;
      width: 100px;
    }

    .col-actions {
      text-align: center;
      width: 120px;
    }

    .status-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 12px;
      text-transform: uppercase;
    }

    .status-badge.active {
      background-color: #4caf50;
      color: #ffffff;
    }

    .status-badge.inactive {
      background-color: #6c757d;
      color: #ffffff;
    }

    .btn-action {
      border: none;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0 4px;
      min-width: 32px;
      height: 32px;
    }

    .btn-action svg {
      flex-shrink: 0;
    }

    .btn-action.btn-edit {
      background-color: #2196f3;
      color: #ffffff;
    }

    .btn-action.btn-edit:hover {
      background-color: #1976d2;
      transform: scale(1.1);
    }

    .btn-action.btn-toggle.activate {
      background-color: #4caf50;
      color: #ffffff;
    }

    .btn-action.btn-toggle.activate:hover {
      background-color: #45a049;
      transform: scale(1.1);
    }

    .btn-action.btn-toggle.deactivate {
      background-color: #ff9800;
      color: #ffffff;
    }

    .btn-action.btn-toggle.deactivate:hover {
      background-color: #fb8c00;
      transform: scale(1.1);
    }

    .btn-action.btn-delete {
      background-color: #f44336;
      color: #ffffff;
    }

    .btn-action.btn-delete:hover {
      background-color: #d32f2f;
      transform: scale(1.1);
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: rgba(255, 255, 255, 0.5);
    }

    .loading-state {
      text-align: center;
      padding: 40px 20px;
      color: rgba(255, 255, 255, 0.7);
    }

    .loading-state p {
      margin: 0;
      font-size: 14px;
    }

    @media (max-width: 1024px) {
      .admin-content {
        grid-template-columns: 1fr;
      }

      .table-container {
        overflow-x: scroll;
      }

      .banners-table {
        min-width: 800px;
      }

      .col-description {
        max-width: 200px;
      }
    }

    @media (max-width: 768px) {
      .banners-table th,
      .banners-table td {
        padding: 8px 12px;
        font-size: 12px;
      }

      .col-title {
        min-width: 120px;
        max-width: 150px;
      }

      .col-description {
        max-width: 150px;
      }

      .btn-action {
        padding: 4px 8px;
        min-width: 28px;
        height: 28px;
      }

      .btn-action svg {
        width: 14px;
        height: 14px;
      }
    }
  `]
})
export class AdminBannerComponent implements OnInit {
  banners: Banner[] = [];
  loadingBanners: boolean = false;
  currentBanner: Banner = {
    title: '',
    description: '',
    cta_text: '',
    is_active: true,
    order: 0
  };
  editingBanner: Banner | null = null;

  constructor(
    private bannerService: BannerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar que sea admin o guard
    const profile = this.authService.getCachedProfile();
    const role = profile?.role?.toLowerCase();
    
    if (!profile || (role !== 'admin' && role !== 'guard')) {
      // Redirigir según el rol
      if (role === 'resident') {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/dashboard']);
      }
      return;
    }

    this.loadBanners();
  }

  loadBanners(): void {
    this.loadingBanners = true;
    console.log('Cargando recados desde la BD...');
    this.bannerService.getAllBanners().subscribe({
      next: (response) => {
        console.log('Respuesta del servidor al cargar recados:', response);
        this.loadingBanners = false;
        
        if (response.exito || response.success) {
          this.banners = response.data || response.banners || [];
          console.log('Recados cargados:', this.banners.length, this.banners);
          
          // Ordenar por order, luego por id si el order es igual
          this.banners.sort((a, b) => {
            const orderA = a.order || 0;
            const orderB = b.order || 0;
            if (orderA !== orderB) {
              return orderA - orderB;
            }
            return (a.id || 0) - (b.id || 0);
          });
          
          console.log('Recados ordenados:', this.banners);
        } else {
          console.warn('Respuesta sin éxito:', response);
          this.banners = [];
        }
      },
      error: (error) => {
        this.loadingBanners = false;
        console.error('Error al cargar recados:', error);
        console.error('Error completo:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        if (error.error) {
          console.error('Mensaje del servidor:', error.error.mensaje || error.error.message);
        }
        // En caso de error, mantener array vacío
        this.banners = [];
        // Mostrar mensaje al usuario
        if (error.status === 500) {
          console.warn('Error 500: El backend tiene un problema. Revisa los logs del servidor Flask.');
        }
      }
    });
  }

  saveBanner(): void {
    if (!this.currentBanner.title || !this.currentBanner.description) {
      alert('Por favor completa el título y la descripción del recado');
      return;
    }

    // Validar que los campos requeridos no estén vacíos
    if (this.currentBanner.title.trim() === '' || this.currentBanner.description.trim() === '') {
      alert('El título y la descripción no pueden estar vacíos');
      return;
    }

    // Obtener el user_id del usuario autenticado
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      alert('Error: No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    // Preparar el objeto a enviar (eliminar campos undefined)
    const bannerToSend: any = {
      user_id: currentUser.id,  // Agregar user_id requerido por el backend
      title: this.currentBanner.title.trim(),
      description: this.currentBanner.description.trim(),
      is_active: this.currentBanner.is_active !== false,
      order: this.currentBanner.order || 0
    };

    // Agregar campos opcionales solo si tienen valor
    if (this.currentBanner.cta_text && this.currentBanner.cta_text.trim() !== '') {
      bannerToSend.cta_text = this.currentBanner.cta_text.trim();
    }
    if (this.currentBanner.cta_url && this.currentBanner.cta_url.trim() !== '') {
      bannerToSend.cta_url = this.currentBanner.cta_url.trim();
    }

    console.log('Enviando recado:', bannerToSend);

    if (this.editingBanner) {
      // Actualizar recado existente (también incluir user_id)
      this.bannerService.updateBanner(this.editingBanner.id!, bannerToSend).subscribe({
        next: (response) => {
          console.log('Respuesta al actualizar recado:', response);
          if (response.exito || response.success) {
            alert('Recado actualizado correctamente');
            // Recargar la lista para mostrar los cambios
            this.loadBanners();
            this.cancelEdit();
          } else {
            alert('Error al actualizar el recado: ' + (response.mensaje || response.message || 'Error desconocido'));
          }
        },
        error: (error) => {
          console.error('Error al actualizar recado:', error);
          const errorMsg = error.error?.mensaje || error.error?.message || error.message || 'Error de conexión';
          alert('Error al actualizar el recado: ' + errorMsg);
        }
      });
    } else {
      // Crear nuevo recado
      this.bannerService.createBanner(bannerToSend).subscribe({
        next: (response) => {
          console.log('Respuesta al crear recado:', response);
          if (response.exito || response.success) {
            alert('Recado creado correctamente');
            // Recargar la lista de recados para mostrar el nuevo
            this.loadBanners();
            // Limpiar el formulario
            this.resetForm();
          } else {
            alert('Error al crear el recado: ' + (response.mensaje || response.message || 'Error desconocido'));
          }
        },
        error: (error) => {
          console.error('Error completo al crear recado:', error);
          console.error('Status:', error.status);
          console.error('StatusText:', error.statusText);
          console.error('Error object completo:', JSON.stringify(error.error, null, 2));
          console.error('Datos enviados:', bannerToSend);
          
          let errorMsg = 'Error desconocido';
          
          if (error.status === 0) {
            errorMsg = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:5000';
          } else if (error.status === 400) {
            // Error 400: Bad Request - datos inválidos
            if (error.error) {
              errorMsg = error.error.mensaje || error.error.message || error.error.error || 'Datos inválidos. Verifica que todos los campos requeridos estén completos.';
            } else {
              errorMsg = 'Datos inválidos. El servidor rechazó la petición.';
            }
          } else if (error.status === 404) {
            errorMsg = 'El endpoint no existe. Verifica que el backend tenga implementado /api/banners';
          } else if (error.status === 500) {
            if (error.error) {
              errorMsg = error.error.mensaje || error.error.message || 'Error interno del servidor. Revisa los logs del backend';
            } else {
              errorMsg = 'Error interno del servidor. Revisa los logs del backend';
            }
          } else if (error.error) {
            errorMsg = error.error.mensaje || error.error.message || `Error ${error.status}: ${error.statusText}`;
          } else {
            errorMsg = error.message || `Error ${error.status || 'desconocido'}`;
          }
          
          alert('Error al crear el recado:\n\n' + errorMsg + '\n\nRevisa la consola del navegador (F12) para más detalles.');
        }
      });
    }
  }

  editBanner(banner: Banner): void {
    this.editingBanner = banner;
    this.currentBanner = { ...banner };
  }

  cancelEdit(): void {
    this.editingBanner = null;
    this.resetForm();
  }

  resetForm(): void {
    this.currentBanner = {
      title: '',
      description: '',
      cta_text: '',
      is_active: true,
      order: 0
    };
  }

  toggleBannerStatus(banner: Banner): void {
    const newStatus = !banner.is_active;
    this.bannerService.toggleBannerStatus(banner.id!, newStatus).subscribe({
        next: (response) => {
          console.log('Respuesta al cambiar estado:', response);
          if (response.exito || response.success) {
            banner.is_active = newStatus;
            alert(`Recado ${newStatus ? 'activado' : 'desactivado'} correctamente`);
            // Recargar para asegurar sincronización
            this.loadBanners();
          } else {
            alert('Error al cambiar el estado del recado');
          }
        },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        alert('Error al cambiar el estado del recado');
      }
    });
  }

  deleteBanner(id: number, title?: string): void {
    const bannerTitle = title ? `"${title}"` : 'este recado';
    if (!confirm(`¿Estás seguro de que quieres eliminar ${bannerTitle}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    console.log('Eliminando recado con ID:', id);
    this.bannerService.deleteBanner(id).subscribe({
      next: (response) => {
        console.log('Respuesta al eliminar:', response);
        if (response.exito || response.success) {
          alert('Recado eliminado correctamente');
          // Recargar la lista de recados
          this.loadBanners();
          // Si estaba editando este recado, cancelar la edición
          if (this.editingBanner && this.editingBanner.id === id) {
            this.cancelEdit();
          }
        } else {
          alert('Error al eliminar el recado: ' + (response.mensaje || response.message || 'Error desconocido'));
        }
      },
      error: (error) => {
        console.error('Error completo al eliminar recado:', error);
        console.error('Status:', error.status);
        console.error('Error object:', error.error);
        
        let errorMsg = 'Error desconocido';
        if (error.error) {
          errorMsg = error.error.mensaje || error.error.message || `Error ${error.status}`;
        } else {
          errorMsg = error.message || `Error ${error.status || 'desconocido'}`;
        }
        
        alert('Error al eliminar el recado:\n\n' + errorMsg);
      }
    });
  }

  goBack(): void {
    const profile = this.authService.getCachedProfile();
    const role = profile?.role?.toLowerCase();
    
    // Redirigir según el rol
    if (role === 'guard') {
      this.router.navigate(['/guard-dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
