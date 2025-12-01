import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Registration {
  id?: string;
  full_name: string;
  user_name: string;
  email: string;
  password: string;
  role: string;
  fraccionamiento_id?: string;
  status: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = `${environment.apiUrl}/registrations`;

  constructor(private http: HttpClient) {}

  getPendingRegistrations(): Observable<{ success: boolean; data: Registration[] }> {
    return this.http.get<{ success: boolean; data: Registration[] }>(this.apiUrl);
  }

  getRegistration(id: string): Observable<{ success: boolean; data: Registration }> {
    return this.http.get<{ success: boolean; data: Registration }>(`${this.apiUrl}/${id}`);
  }

  createRegistration(registration: Registration): Observable<{ success?: boolean; exito?: boolean; data?: Registration; message?: string; mensaje?: string }> {
    return this.http.post<{ success?: boolean; exito?: boolean; data?: Registration; message?: string; mensaje?: string }>(this.apiUrl, registration);
  }

  approveRegistration(id: string): Observable<{ success: boolean; exito?: boolean; mensaje?: string; message?: string; data?: any }> {
    return this.http.put<{ success: boolean; exito?: boolean; mensaje?: string; message?: string; data?: any }>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectRegistration(id: string, reason?: string): Observable<{ success: boolean; exito?: boolean; mensaje?: string; message?: string }> {
    return this.http.put<{ success: boolean; exito?: boolean; mensaje?: string; message?: string }>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  getRegistrationStats(): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/stats`);
  }
}

