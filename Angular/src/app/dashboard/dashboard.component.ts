import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BannerService, Banner } from '../services/banner.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any = null;
  profile: any = null;
  banners: Banner[] = [];
  loadingBanners = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private bannerService: BannerService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.profile = this.authService.getCachedProfile();
    if (!this.user) {
      this.router.navigate(['/auth/sing-in']);
      return;
    }
    const role = this.profile?.role;
    if (role === 'guard') {
      this.router.navigate(['/guard-dashboard']);
      return;
    }
    if (role === 'resident') {
      this.router.navigate(['/home']);
      return;
    }
    if (role === 'admin') this.loadBanners();
  }

  loadBanners(): void {
    this.loadingBanners = true;
    this.bannerService.getAllBanners().subscribe({
      next: (res) => {
        this.banners = (res.success || res.exito) ? (res.data || res.banners || []) : [];
        this.loadingBanners = false;
      },
      error: (err) => {
        console.error('Error al cargar banners:', err);
        this.banners = [];
        this.loadingBanners = false;
      }
    });
  }

  editBanner(banner: Banner): void {
    this.router.navigate(['/admin-banner'], { state: { bannerToEdit: banner } });
  }

  deleteBanner(bannerId: number, bannerTitle: string): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar el recado "${bannerTitle}"?`)) return;
    this.bannerService.deleteBanner(bannerId).subscribe({
      next: (res) => {
        if (res.success || res.exito) this.loadBanners();
        else alert('Error al eliminar el recado');
      },
      error: (err) => {
        console.error('Error al eliminar banner:', err);
        alert('Error al eliminar el recado');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/sing-in']);
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}

