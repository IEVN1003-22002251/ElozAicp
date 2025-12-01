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
  templateUrl: './admin-banner.component.html',
  styleUrls: ['./admin-banner.component.css']
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

    // Verificar si hay un banner para editar desde el estado de navegación
    const navigation = this.router.getCurrentNavigation();
    const bannerToEdit = navigation?.extras?.state?.['bannerToEdit'];
    
    if (bannerToEdit) {
      this.editBanner(bannerToEdit);
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
