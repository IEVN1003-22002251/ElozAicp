import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  profileImage: string | null = null;
  memberSince: string = '';
  licenseExpires: string = '';
  remainingDays: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar autenticación primero
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/sing-in']);
      return;
    }

    // Obtener perfil (puede ser null pero el usuario está autenticado)
    this.profile = this.authService.getCachedProfile();
    
    // Si no hay perfil, usar valores por defecto
    if (!this.profile) {
      this.profile = {
        name: 'Usuario',
        user_name: 'Usuario',
        email: '',
        phone: '',
        fraccionamiento_name: 'Villas 123'
      };
    }

    // Calcular fecha de membresía (usando created_at del perfil si existe, sino fecha actual)
    if (this.profile?.created_at) {
      const memberDate = new Date(this.profile.created_at);
      const year = memberDate.getFullYear();
      const month = String(memberDate.getMonth() + 1).padStart(2, '0');
      const day = String(memberDate.getDate()).padStart(2, '0');
      this.memberSince = `${year}-${month}-${day}`;
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      this.memberSince = `${year}-${month}-${day}`;
    }

    // Calcular fecha de expiración de licencia (45 días desde hoy por defecto)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 45);
    this.licenseExpires = expirationDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Calcular días restantes
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    this.remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Si hay una imagen de perfil guardada
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      this.profileImage = savedImage;
    }
  }

  goBack(): void {
    // Verificar si el usuario es admin o residente
    const isAdmin = this.profile?.role === 'admin';
    
    // Si es admin, regresar al dashboard; si es residente, regresar al home
    if (isAdmin) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  openSettings(): void {
    // TODO: Implementar vista de configuración
    console.log('Abrir configuración');
  }

  changePhoto(): void {
    // TODO: Implementar cambio de foto de perfil
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.profileImage = e.target.result;
          localStorage.setItem('profileImage', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/auth/sing-in']);
    }
  }
}
