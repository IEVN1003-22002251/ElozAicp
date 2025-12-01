import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { BannerService, Banner } from '../services/banner.service';
import { environment } from '../../environments/environment';

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
  loadingBanners: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private bannerService: BannerService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.profile = this.authService.getCachedProfile();
    
    if (!this.user) {
      this.router.navigate(['/auth/sing-in']);
      return;
    }
    
    if (this.profile?.role === 'guard') {
      this.router.navigate(['/guard-dashboard']);
      return;
    }
    
    if (this.profile?.role === 'resident') {
      this.router.navigate(['/home']);
      return;
    }

    if (this.profile?.role === 'admin') {
      this.loadBanners();
    }
  }

  loadBanners(): void {
    this.loadingBanners = true;
    this.bannerService.getAllBanners().subscribe({
      next: (response) => {
        if (response.success || response.exito) {
          this.banners = response.data || response.banners || [];
        } else {
          this.banners = [];
        }
        this.loadingBanners = false;
      },
      error: (error) => {
        console.error('Error al cargar banners:', error);
        this.banners = [];
        this.loadingBanners = false;
      }
    });
  }

  editBanner(banner: Banner): void {
    this.router.navigate(['/admin-banner'], { 
      state: { bannerToEdit: banner } 
    });
  }

  deleteBanner(bannerId: number, bannerTitle: string): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar el recado "${bannerTitle}"?`)) {
      return;
    }

    this.bannerService.deleteBanner(bannerId).subscribe({
      next: (response) => {
        if (response.success || response.exito) {
          this.loadBanners();
        } else {
          alert('Error al eliminar el recado');
        }
      },
      error: (error) => {
        console.error('Error al eliminar banner:', error);
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

