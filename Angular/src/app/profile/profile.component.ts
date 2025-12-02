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
  memberSince = '';
  licenseExpires = '';
  remainingDays = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/sing-in']);
      return;
    }
    this.profile = this.authService.getCachedProfile() || {
      name: 'Usuario', user_name: 'Usuario', email: '', phone: '', fraccionamiento_name: 'Villas 123'
    };
    const memberDate = this.profile?.created_at ? new Date(this.profile.created_at) : new Date();
    this.memberSince = `${memberDate.getFullYear()}-${String(memberDate.getMonth() + 1).padStart(2, '0')}-${String(memberDate.getDate()).padStart(2, '0')}`;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 45);
    this.licenseExpires = expirationDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    this.remainingDays = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) this.profileImage = savedImage;
  }

  goBack(): void {
    const isAdmin = this.profile?.role === 'admin';
    this.router.navigate([isAdmin ? '/dashboard' : '/home']);
  }

  openSettings(): void {
    console.log('Abrir configuración');
  }

  changePhoto(): void {
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

  getResidentAddress(): string {
    if (!this.profile) return '';
    if (this.profile.address) return this.profile.address;
    const addressParts: string[] = [];
    if (this.profile.street) addressParts.push(this.profile.street);
    if (this.profile.house_number) addressParts.push(`Casa ${this.profile.house_number}`);
    return addressParts.length > 0 ? addressParts.join(', ') : (this.profile.fraccionamiento_name || 'Villas 123');
  }
}
