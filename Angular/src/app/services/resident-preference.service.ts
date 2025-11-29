import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResidentPreference {
  user_id: string;
  accepts_visitors: boolean;
  accepts_personnel: boolean;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResidentPreferenceService {
  private apiUrl = `${environment.apiUrl}/resident-preferences`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las preferencias actuales del residente
   */
  getPreferences(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?user_id=${userId}`);
  }

  /**
   * Actualiza las preferencias del residente (acepta visitas o personal)
   */
  updatePreferences(userId: string, acceptsVisitors: boolean, acceptsPersonnel: boolean): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      user_id: userId,
      accepts_visitors: acceptsVisitors,
      accepts_personnel: acceptsPersonnel
    });
  }

  /**
   * Actualiza solo la preferencia de visitas
   */
  updateVisitorPreference(userId: string, acceptsVisitors: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/visitors`, {
      user_id: userId,
      accepts_visitors: acceptsVisitors
    });
  }

  /**
   * Actualiza solo la preferencia de personal
   */
  updatePersonnelPreference(userId: string, acceptsPersonnel: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/personnel`, {
      user_id: userId,
      accepts_personnel: acceptsPersonnel
    });
  }
}

