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
  loadingBanners = false;
  currentBanner: Banner = { title: '', description: '', cta_text: '', is_active: true, order: 0 };
  editingBanner: Banner | null = null;

  constructor(
    private bannerService: BannerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const profile = this.authService.getCachedProfile();
    const role = profile?.role?.toLowerCase();
    if (!profile || (role !== 'admin' && role !== 'guard')) {
      this.router.navigate([role === 'resident' ? '/home' : '/dashboard']);
      return;
    }
    const bannerToEdit = this.router.getCurrentNavigation()?.extras?.state?.['bannerToEdit'];
    if (bannerToEdit) this.editBanner(bannerToEdit);
    this.loadBanners();
  }

  loadBanners(): void {
    this.loadingBanners = true;
    this.bannerService.getAllBanners().subscribe({
      next: (res) => {
        this.loadingBanners = false;
        if (res.exito || res.success) {
          this.banners = (res.data || res.banners || []).sort((a: any, b: any) => {
            const orderA = a.order || 0;
            const orderB = b.order || 0;
            return orderA !== orderB ? orderA - orderB : (a.id || 0) - (b.id || 0);
          });
        } else {
          this.banners = [];
        }
      },
      error: (err) => {
        this.loadingBanners = false;
        console.error('Error al cargar recados:', err);
        this.banners = [];
      }
    });
  }

  saveBanner(): void {
    if (!this.currentBanner.title?.trim() || !this.currentBanner.description?.trim()) {
      alert('Por favor completa el título y la descripción del recado');
      return;
    }
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      alert('Error: No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.');
      return;
    }
    const bannerToSend: any = {
      user_id: currentUser.id, title: this.currentBanner.title.trim(),
      description: this.currentBanner.description.trim(), is_active: this.currentBanner.is_active !== false,
      order: this.currentBanner.order || 0
    };
    if (this.currentBanner.cta_text?.trim()) bannerToSend.cta_text = this.currentBanner.cta_text.trim();
    if (this.currentBanner.cta_url?.trim()) bannerToSend.cta_url = this.currentBanner.cta_url.trim();
    if (this.editingBanner) {
      this.bannerService.updateBanner(this.editingBanner.id!, bannerToSend).subscribe({
        next: (res) => {
          if (res.exito || res.success) {
            alert('Recado actualizado correctamente');
            this.loadBanners();
            this.cancelEdit();
          } else {
            alert('Error al actualizar el recado: ' + (res.mensaje || res.message || 'Error desconocido'));
          }
        },
        error: (err) => {
          console.error('Error al actualizar recado:', err);
          alert('Error al actualizar el recado: ' + (err.error?.mensaje || err.error?.message || err.message || 'Error de conexión'));
        }
      });
    } else {
      this.bannerService.createBanner(bannerToSend).subscribe({
        next: (res) => {
          if (res.exito || res.success) {
            alert('Recado creado correctamente');
            this.loadBanners();
            this.resetForm();
          } else {
            alert('Error al crear el recado: ' + (res.mensaje || res.message || 'Error desconocido'));
          }
        },
        error: (err) => {
          console.error('Error al crear recado:', err);
          const errMsg = err.error?.mensaje || err.error?.message || this.getErrorMessage(err);
          alert('Error al crear el recado:\n\n' + errMsg);
        }
      });
    }
  }

  private getErrorMessage(err: any): string {
    if (err.status === 0) return 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
    if (err.status === 400) return err.error?.mensaje || err.error?.message || 'Datos inválidos.';
    if (err.status === 404) return 'El endpoint no existe.';
    if (err.status === 500) return err.error?.mensaje || err.error?.message || 'Error interno del servidor.';
    return err.message || `Error ${err.status || 'desconocido'}`;
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
    this.currentBanner = { title: '', description: '', cta_text: '', is_active: true, order: 0 };
  }

  toggleBannerStatus(banner: Banner): void {
    const newStatus = !banner.is_active;
    this.bannerService.toggleBannerStatus(banner.id!, newStatus).subscribe({
      next: (res) => {
        if (res.exito || res.success) {
          banner.is_active = newStatus;
          alert(`Recado ${newStatus ? 'activado' : 'desactivado'} correctamente`);
          this.loadBanners();
        } else {
          alert('Error al cambiar el estado del recado');
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        alert('Error al cambiar el estado del recado');
      }
    });
  }

  deleteBanner(id: number, title?: string): void {
    const bannerTitle = title ? `"${title}"` : 'este recado';
    if (!confirm(`¿Estás seguro de que quieres eliminar ${bannerTitle}?\n\nEsta acción no se puede deshacer.`)) return;
    this.bannerService.deleteBanner(id).subscribe({
      next: (res) => {
        if (res.exito || res.success) {
          alert('Recado eliminado correctamente');
          this.loadBanners();
          if (this.editingBanner?.id === id) this.cancelEdit();
        } else {
          alert('Error al eliminar el recado: ' + (res.mensaje || res.message || 'Error desconocido'));
        }
      },
      error: (err) => {
        console.error('Error al eliminar recado:', err);
        const errMsg = err.error?.mensaje || err.error?.message || err.message || `Error ${err.status || 'desconocido'}`;
        alert('Error al eliminar el recado:\n\n' + errMsg);
      }
    });
  }

  goBack(): void {
    const role = this.authService.getCachedProfile()?.role?.toLowerCase();
    this.router.navigate([role === 'guard' ? '/guard-dashboard' : '/dashboard']);
  }
}
