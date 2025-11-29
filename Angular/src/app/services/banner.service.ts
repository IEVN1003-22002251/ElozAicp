import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Banner {
  id?: number;
  title: string;
  description: string;
  cta_text?: string;
  cta_url?: string;
  icon?: string;
  is_active?: boolean;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiUrl = `${environment.apiUrl}/banners`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los banners activos (para mostrar en el carrusel)
   */
  getActiveBanners(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/active`);
  }

  /**
   * Obtiene todos los banners (admin)
   */
  getAllBanners(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  /**
   * Obtiene un banner por ID
   */
  getBanner(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo banner
   */
  createBanner(banner: Banner): Observable<any> {
    return this.http.post<any>(this.apiUrl, banner);
  }

  /**
   * Actualiza un banner existente
   */
  updateBanner(id: number, banner: Banner): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, banner);
  }

  /**
   * Elimina un banner
   */
  deleteBanner(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Activa/desactiva un banner
   */
  toggleBannerStatus(id: number, isActive: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { is_active: isActive });
  }
}

