import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Banner {
  id?: number; title: string; description: string; cta_text?: string; cta_url?: string;
  icon?: string; is_active?: boolean; order?: number; created_at?: string; updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class BannerService {
  private apiUrl = `${environment.apiUrl}/banners`;

  constructor(private http: HttpClient) {}

  getActiveBanners(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/active`);
  }

  getAllBanners(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getBanner(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createBanner(banner: Banner): Observable<any> {
    return this.http.post<any>(this.apiUrl, banner);
  }

  updateBanner(id: number, banner: Banner): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, banner);
  }

  deleteBanner(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  toggleBannerStatus(id: number, isActive: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { is_active: isActive });
  }
}

