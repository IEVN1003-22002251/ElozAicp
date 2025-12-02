import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerService, Banner } from '../../services/banner.service';

@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="banner-carousel-container" *ngIf="banners.length > 0">
      <div class="carousel-wrapper">
        <div class="carousel-track" [style.transform]="'translateX(-' + currentIndex * 100 + '%)'">
          <div 
            class="banner-slide" 
            *ngFor="let banner of banners; let i = index"
            [class.active]="i === currentIndex"
            [style.border-left-color]="getBannerColor(i)"
            (click)="handleBannerClick(banner)">
            <div class="banner-content">
              <div class="banner-icon" *ngIf="banner.icon" [style.color]="getBannerColor(i)">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path [attr.d]="banner.icon"></path>
                </svg>
              </div>
              <div class="banner-icon" *ngIf="!banner.icon" [style.color]="getBannerColor(i)">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div class="banner-text">
                <div class="banner-header">
                  <h4>{{ banner.title }}</h4>
                  <span class="ad-tag" [style.background-color]="getBannerColor(i)">AVISO</span>
                </div>
                <p class="banner-description">{{ banner.description }}</p>
                <span class="banner-cta" *ngIf="banner.cta_text" [style.color]="getBannerColor(i)">{{ banner.cta_text }} →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Indicadores -->
      <div class="carousel-indicators" *ngIf="banners.length > 1">
        <button
          *ngFor="let banner of banners; let i = index"
          class="indicator"
          [class.active]="i === currentIndex"
          [style.background-color]="i === currentIndex ? getBannerColor(i) : 'rgba(255, 255, 255, 0.3)'"
          [attr.aria-label]="'Banner ' + (i + 1)">
        </button>
      </div>
    </div>
  `,
  styles: [`
    .banner-carousel-container {
      position: relative;
      margin-bottom: 24px;
      overflow: hidden;
    }

    .carousel-wrapper {
      position: relative;
      overflow: hidden;
      border-radius: 12px;
    }

    .carousel-track {
      display: flex;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform;
    }

    .banner-slide {
      min-width: 100%;
      background-color: rgba(255, 255, 255, 0.05);
      border-left: 4px solid;
      border-radius: 12px;
      padding: 16px;
      cursor: default;
      transition: background-color 0.3s ease;
      flex-shrink: 0;
    }

    .banner-slide:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }

    .banner-content {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .banner-icon {
      flex-shrink: 0;
      transition: color 0.3s ease;
    }

    .banner-text {
      flex: 1;
    }

    .banner-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .banner-header h4 {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }

    .ad-tag {
      color: #1a1a1a;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 12px;
      text-transform: uppercase;
      transition: background-color 0.3s ease;
    }

    .banner-description {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .banner-cta {
      font-size: 14px;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .carousel-indicators {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 12px;
    }

    .indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: none;
      background-color: rgba(255, 255, 255, 0.3);
      cursor: default;
      transition: all 0.3s ease;
      padding: 0;
      pointer-events: none;
    }

    .indicator.active {
      width: 24px;
      border-radius: 4px;
    }


    @media (max-width: 480px) {
      .banner-slide {
        padding: 12px;
      }

      .banner-header h4 {
        font-size: 14px;
      }

      .banner-description {
        font-size: 12px;
      }

    }
  `]
})
export class BannerCarouselComponent implements OnInit, OnDestroy {
  banners: Banner[] = [];
  currentIndex = 0;
  private autoSlideInterval: any;
  private readonly bannerColors: string[] = [
    '#ff9800', '#2196f3', '#4caf50', '#9c27b0', '#f44336', '#00bcd4',
    '#ffc107', '#e91e63', '#3f51b5', '#ff5722', '#009688', '#673ab7'
  ];

  constructor(private bannerService: BannerService) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  loadBanners(): void {
    this.bannerService.getActiveBanners().subscribe({
      next: (res) => {
        if (res.exito || res.success) {
          this.banners = (res.data || res.banners || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          if (this.banners.length > 1) this.startAutoSlide();
        }
      },
      error: () => this.banners = []
    });
  }

  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    this.resetAutoSlide();
  }

  resetAutoSlide(): void {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
    if (this.banners.length > 1) this.startAutoSlide();
  }

  handleBannerClick(banner: Banner): void {
    if (banner.cta_url) window.open(banner.cta_url, '_blank');
  }

  getBannerColor(index: number): string {
    return this.bannerColors[index % this.bannerColors.length];
  }

  getActiveIndicatorColor(): string {
    return this.getBannerColor(this.currentIndex);
  }
}
