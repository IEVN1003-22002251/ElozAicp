import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/history`;

  constructor(private http: HttpClient) {}

  getHistory(userId?: string, fraccionamientoId?: string): Observable<any> {
    let httpParams = new HttpParams();
    
    if (userId) {
      httpParams = httpParams.set('user_id', userId);
    }
    
    if (fraccionamientoId) {
      httpParams = httpParams.set('fraccionamiento_id', fraccionamientoId);
    }

    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  getHistoryByUser(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?user_id=${userId}`);
  }
}






