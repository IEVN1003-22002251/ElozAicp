import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Incident {
  id?: string;
  incident_type: string;
  description?: string;
  location?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'in_progress' | 'resolved' | 'closed';
  reported_by?: string;
  reported_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at?: string;
  updated_at?: string;
  fraccionamiento_id?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private apiUrl = `${environment.apiUrl}/incidents`;

  constructor(private http: HttpClient) {}

  getIncidents(params?: {
    status?: string;
    incident_type?: string;
    severity?: string;
    fraccionamiento_id?: string;
    start_date?: string;
    end_date?: string;
  }): Observable<{ success: boolean; data: Incident[] }> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params]) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!);
        }
      });
    }

    return this.http.get<{ success: boolean; data: Incident[] }>(this.apiUrl, { params: httpParams });
  }

  getIncident(id: string): Observable<{ success: boolean; data: Incident }> {
    return this.http.get<{ success: boolean; data: Incident }>(`${this.apiUrl}/${id}`);
  }

  createIncident(incident: Incident): Observable<{ success: boolean; data: Incident }> {
    return this.http.post<{ success: boolean; data: Incident }>(this.apiUrl, incident);
  }

  updateIncident(id: string, incident: Partial<Incident>): Observable<{ success: boolean; data: Incident }> {
    return this.http.put<{ success: boolean; data: Incident }>(`${this.apiUrl}/${id}`, incident);
  }

  deleteIncident(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
  }

  getIncidentsByType(): Observable<{ success: boolean; data: { incident_type: string; count: number }[] }> {
    return this.http.get<{ success: boolean; data: { incident_type: string; count: number }[] }>(`${this.apiUrl}/stats/by-type`);
  }

  getIncidentStats(): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/stats`);
  }
}

